import json
import pytest
from app.models.database import SessionLocal, init_db
from app.models.schemas import Claim, Milestone, Campaign, Proof, LedgerTransaction
from app.services.agent_brain import agent_brain
from app.services.paypal_agent_service import paypal_agent_service
from app.services.price_validator import price_validator
from seed import run_seed

@pytest.fixture(autouse=True)
def setup_database():
    """Reset the database to pre-seeded state before each test."""
    run_seed()

@pytest.mark.asyncio
async def test_clean_claim_approved_and_settled():
    """
    Scenario 1: Clean claim with verified delivery and fair market price.
    Should result in RECONCILED verdict and payout execution (simulated or live).
    """
    db = SessionLocal()
    try:
        events = []
        async for sse_msg in agent_brain.run_reconciliation("CLM-WATER-02", db):
            if sse_msg.startswith("data: "):
                payload = json.loads(sse_msg[6:].strip())
                events.append(payload)

        complete_event = next((e for e in events if e.get("type") == "COMPLETE"), None)
        assert complete_event is not None
        assert complete_event.get("status") == "RECONCILED"

        # Check ledger record
        tx = db.query(LedgerTransaction).filter(LedgerTransaction.claim_id == "CLM-WATER-02").first()
        assert tx is not None
        assert tx.status == "RECONCILED"
        assert tx.variance_amount == 0.0
        assert tx.inflation_pct == 0.0
        assert tx.paypal_batch_status in ("SIMULATED", "LIVE_SUCCESS")
    finally:
        db.close()

@pytest.mark.asyncio
async def test_inflated_price_and_missing_items_halted():
    """
    Scenario 3 (Hero Demo): Claim with 56.3% price markup and 25 missing blankets.
    Should immediately HALT payout, freeze $600 in escrow, and flag transaction.
    """
    db = SessionLocal()
    try:
        events = []
        async for sse_msg in agent_brain.run_reconciliation("CLM-FLOOD-01", db):
            if sse_msg.startswith("data: "):
                payload = json.loads(sse_msg[6:].strip())
                events.append(payload)

        complete_event = next((e for e in events if e.get("type") == "COMPLETE"), None)
        assert complete_event is not None
        assert complete_event.get("status") == "FLAGGED"
        assert complete_event.get("protected") == 600.0

        # Check ledger record
        tx = db.query(LedgerTransaction).filter(LedgerTransaction.claim_id == "CLM-FLOOD-01").first()
        assert tx is not None
        assert tx.status == "FLAGGED"
        assert tx.variance_amount == 600.0
        assert tx.paypal_batch_status == "HELD"
        assert tx.inflation_pct > 20.0
        assert "600.00 unauthorized diversion" in tx.ai_summary
    finally:
        db.close()

@pytest.mark.asyncio
async def test_unverified_beneficiary_otp_holds_escrow():
    """
    Scenario 2: Claim without beneficiary OTP sign-off.
    Must hold funds in escrow as PENDING without releasing payment.
    """
    db = SessionLocal()
    try:
        # Create unverified claim
        events = []
        async for sse_msg in agent_brain.run_reconciliation("CLM-TECH-03", db):
            if sse_msg.startswith("data: "):
                payload = json.loads(sse_msg[6:].strip())
                events.append(payload)

        complete_event = next((e for e in events if e.get("type") == "COMPLETE"), None)
        assert complete_event is not None
        assert complete_event.get("status") == "PENDING"

        tx = db.query(LedgerTransaction).filter(LedgerTransaction.claim_id == "CLM-TECH-03").first()
        assert tx is not None
        assert tx.status == "PENDING"
        assert tx.paypal_batch_status == "HELD"
    finally:
        db.close()

@pytest.mark.asyncio
async def test_tolerance_hard_cap_prevents_client_bypass():
    """
    Security check: Caller cannot pass ?tolerance=999% to weaken fraud detection.
    Backend must cap tolerance to crisis ceiling (35%).
    """
    db = SessionLocal()
    try:
        events = []
        # Attempt to pass 500% tolerance to bypass 56.3% markup
        async for sse_msg in agent_brain.run_reconciliation("CLM-FLOOD-01", db, tolerance_pct=500.0):
            if sse_msg.startswith("data: "):
                payload = json.loads(sse_msg[6:].strip())
                events.append(payload)

        complete_event = next((e for e in events if e.get("type") == "COMPLETE"), None)
        assert complete_event is not None
        # Must STILL be FLAGGED because 56.3% exceeds the 35% hard ceiling!
        assert complete_event.get("status") == "FLAGGED"
    finally:
        db.close()

@pytest.mark.asyncio
async def test_idempotent_reconciliation_no_duplicate_ledger():
    """
    Audit integrity: Running reconciliation multiple times on the same claim
    must NOT duplicate ledger entries or double-count payouts.
    """
    db = SessionLocal()
    try:
        # Run first time
        async for _ in agent_brain.run_reconciliation("CLM-WATER-02", db):
            pass

        count_first = db.query(LedgerTransaction).filter(LedgerTransaction.claim_id == "CLM-WATER-02").count()
        assert count_first == 1

        # Run second time
        async for _ in agent_brain.run_reconciliation("CLM-WATER-02", db):
            pass

        count_second = db.query(LedgerTransaction).filter(LedgerTransaction.claim_id == "CLM-WATER-02").count()
        assert count_second == 1, "Idempotency failed: duplicate ledger transaction created!"
    finally:
        db.close()

@pytest.mark.asyncio
async def test_truthful_payment_failure_reporting(monkeypatch):
    """
    Payment integrity: A failed PayPal API call must NEVER return SUCCESS.
    It must be reported as FAILED with the error reason preserved.
    """
    async def mock_execute_payout(*args, **kwargs):
        return {
            "success": False,
            "status": "FAILED",
            "error": "PayPal Sandbox Error 401: Unauthorized",
            "mode": "PAYPAL_API_ERROR"
        }

    monkeypatch.setattr(paypal_agent_service, "execute_payout", mock_execute_payout)

    db = SessionLocal()
    try:
        events = []
        async for sse_msg in agent_brain.run_reconciliation("CLM-WATER-02", db):
            if sse_msg.startswith("data: "):
                payload = json.loads(sse_msg[6:].strip())
                events.append(payload)

        complete_event = next((e for e in events if e.get("type") == "COMPLETE"), None)
        assert complete_event is not None
        # Must be reported as FAILED, not SUCCESS!
        assert complete_event.get("status") == "FAILED"
        assert "401" in complete_event.get("error", "")
    finally:
        db.close()
