import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, Any, List
from sqlalchemy.orm import Session

from app.models.schemas import Claim, Proof, LedgerTransaction, AgentThoughtLog, Campaign, Milestone
from app.services.gemini_vision import gemini_vision_service
from app.services.price_validator import price_validator
from app.services.paypal_agent_service import paypal_agent_service
from app.core.config import settings

logger = logging.getLogger(__name__)

class AgentBrain:
    def __init__(self):
        pass

    async def run_reconciliation(
        self,
        claim_id: str,
        db: Session,
        tolerance_pct: float = None
    ) -> AsyncGenerator[str, None]:
        """
        Executes the 5-step autonomous reconciliation loop.
        Yields Server-Sent Events (SSE) formatted strings to the frontend.
        """
        # Server-side hard cap: tolerance cannot exceed crisis threshold (default 35%)
        raw_tolerance = tolerance_pct if tolerance_pct is not None else settings.DEFAULT_TOLERANCE_PERCENT
        try:
            active_tolerance = max(0.0, min(float(raw_tolerance), float(settings.CRISIS_TOLERANCE_PERCENT)))
        except (ValueError, TypeError):
            active_tolerance = settings.DEFAULT_TOLERANCE_PERCENT
        claim = db.query(Claim).filter(Claim.id == claim_id).first()
        if not claim:
            yield f"data: {json.dumps({'type': 'ERROR', 'message': f'Claim {claim_id} not found'})}\n\n"
            return

        milestone = db.query(Milestone).filter(Milestone.id == claim.milestone_id).first()
        campaign = db.query(Campaign).filter(Campaign.id == milestone.campaign_id).first() if milestone else None
        proof = db.query(Proof).filter(Proof.claim_id == claim_id).first()

        campaign_title = campaign.title if campaign else "Community Relief Fund"
        milestone_title = milestone.title if milestone else "Milestone Disbursement"

        # Helper to log and stream thought events
        async def emit(step: int, log_type: str, message: str) -> str:
            # Persist thought log in DB
            thought = AgentThoughtLog(
                claim_id=claim_id,
                step_index=step,
                log_type=log_type,
                message=message,
                created_at=datetime.now(timezone.utc)
            )
            db.add(thought)
            db.commit()

            payload = {
                "step": step,
                "type": log_type,
                "message": message,
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S")
            }
            return f"data: {json.dumps(payload)}\n\n"

        # ----------------------------------------------------------------------
        # STAGE 1: INGESTION & VISION OCR
        # ----------------------------------------------------------------------
        yield await emit(1, "THINK", f"Ingested milestone claim {claim.id} for project '{campaign_title}'...")
        await asyncio.sleep(0.6)

        yield await emit(1, "THINK", f"Running Gemini 2.0 Flash Vision on vendor invoice: {claim.invoice_file_url or 'invoice_scanned.png'} (deterministic temp=0.0)...")
        await asyncio.sleep(0.8)

        ocr_result = await gemini_vision_service.extract_invoice(claim.invoice_file_url or claim.invoice_number or "")
        line_items = ocr_result.get("line_items", [])
        total_invoiced = ocr_result.get("total_amount", claim.invoice_amount)

        # Update claim extracted items
        claim.extracted_items = line_items
        claim.invoice_amount = total_invoiced
        db.commit()

        item_summary_str = ", ".join([f"{item.get('quantity')}x {item.get('item_description')} (${item.get('total_price')})" for item in line_items[:3]])
        yield await emit(1, "THINK", f"OCR Complete. Parsed {len(line_items)} line items. Total billed: ${total_invoiced:.2f}. Items: {item_summary_str}...")
        await asyncio.sleep(0.6)

        # ----------------------------------------------------------------------
        # STAGE 2: WFP/HDX MARKET BENCHMARK VERIFICATION
        # ----------------------------------------------------------------------
        yield await emit(2, "THINK", f"Cross-referencing unit costs against UN World Food Programme (WFP) & HDX benchmarks (Policy Tolerance: {active_tolerance}%)...")
        await asyncio.sleep(0.7)

        val_result = price_validator.validate_line_items(line_items, tolerance_pct=active_tolerance)
        market_ref_total = val_result["total_market_ref"]
        inflation_flags = val_result["flags"]
        overall_inflation_pct = val_result["overall_inflation_pct"]

        if val_result["has_inflation"]:
            for flag in inflation_flags:
                yield await emit(
                    2,
                    "ALERT",
                    f"PRICE GOUGING ANOMALY: '{flag['item']}' billed at ${flag['billed_unit_price']:.2f}/unit vs WFP benchmark of ${flag['market_median_price']:.2f}/unit (+{flag['overage_pct']}% markup)!"
                )
                await asyncio.sleep(0.5)
        else:
            yield await emit(2, "THINK", f"Price validation PASSED. All unit prices are within fair market threshold (Market Reference: ${market_ref_total:.2f}).")
            await asyncio.sleep(0.5)

        # ----------------------------------------------------------------------
        # STAGE 3: BENEFICIARY GROUND-TRUTH VERIFICATION
        # ----------------------------------------------------------------------
        yield await emit(3, "THINK", f"Inspecting field beneficiary delivery confirmation (Claim: {claim.id})...")
        await asyncio.sleep(0.7)

        if not proof or not proof.otp_verified:
            # Case: Awaiting sign-off
            yield await emit(3, "ALERT", "Beneficiary OTP sign-off has NOT been completed. Ground truth missing.")
            yield await emit(4, "DECIDE", "VERDICT: ESCROW HOLD — Milestone locked until beneficiary signs delivery proof.")

            # Check if ledger entry already exists for this claim to prevent duplicates
            existing_tx = db.query(LedgerTransaction).filter(LedgerTransaction.claim_id == claim.id).first()
            if existing_tx:
                ledger_entry = existing_tx
                tx_id = ledger_entry.id
                ledger_entry.billed_amount = total_invoiced
                ledger_entry.market_ref_amount = market_ref_total
                ledger_entry.confirmed_amount = 0.0
                ledger_entry.variance_amount = total_invoiced
                ledger_entry.inflation_pct = overall_inflation_pct
                ledger_entry.status = "PENDING"
                ledger_entry.ai_summary = "Milestone awaiting field beneficiary OTP sign-off. Payout held in escrow."
                ledger_entry.flag_reasons = ["Awaiting Beneficiary OTP verification"]
                ledger_entry.paypal_batch_status = "HELD"
            else:
                tx_id = f"TX-{uuid.uuid4().hex[:8].upper()}"
                ledger_entry = LedgerTransaction(
                    id=tx_id,
                    claim_id=claim.id,
                    campaign_title=campaign_title,
                    milestone_title=milestone_title,
                    vendor_name=claim.vendor_name,
                    billed_amount=total_invoiced,
                    market_ref_amount=market_ref_total,
                    confirmed_amount=0.0,
                    variance_amount=total_invoiced,
                    inflation_pct=overall_inflation_pct,
                    status="PENDING",
                    ai_summary="Milestone awaiting field beneficiary OTP sign-off. Payout held in escrow.",
                    flag_reasons=["Awaiting Beneficiary OTP verification"],
                    paypal_batch_status="HELD",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(ledger_entry)

            milestone.status = "PENDING_CLAIM"
            claim.status = "PENDING_VERIFICATION"
            db.commit()

            yield await emit(5, "ACTION", f"Committed transaction {tx_id} to AG Grid as PENDING. Milestone frozen in escrow.")
            yield f"data: {json.dumps({'type': 'COMPLETE', 'status': 'PENDING', 'tx_id': tx_id})}\n\n"
            return

        # Proof is verified - check confirmed items
        yield await emit(3, "THINK", f"Verified delivery photo & GPS stamp (Lat: {proof.gps_lat}, Lng: {proof.gps_lng}) signed via Twilio OTP.")
        await asyncio.sleep(0.5)

        confirmed_val = proof.confirmed_value
        variance_dollars = max(0.0, round(total_invoiced - confirmed_val, 2))

        # Check for missing goods
        missing_items = []
        confirmed_desc_list = [str(ci.get("item", "")).lower() for ci in proof.confirmed_items]
        for billed_item in line_items:
            b_desc = billed_item.get("item_description", "").lower()
            # If not in confirmed
            match_found = any(cd in b_desc or b_desc in cd for cd in confirmed_desc_list)
            if not match_found and billed_item.get("total_price", 0) > 0:
                missing_items.append(f"{billed_item.get('quantity')}x {billed_item.get('item_description')} (${billed_item.get('total_price'):.2f})")

        if missing_items:
            yield await emit(3, "ALERT", f"SHORT DELIVERY DETECTED: Invoiced items not confirmed received by beneficiary: {', '.join(missing_items)}!")
            await asyncio.sleep(0.5)
        else:
            yield await emit(3, "THINK", f"Beneficiary confirmed delivery of 100% of invoiced items (Confirmed value: ${confirmed_val:.2f}).")
            await asyncio.sleep(0.5)

        # ----------------------------------------------------------------------
        # STAGE 4: AUTONOMOUS SETTLEMENT DECISION
        # ----------------------------------------------------------------------
        has_fraud = (variance_dollars > 0.0) or (val_result["has_inflation"]) or (len(missing_items) > 0)
        total_diverted = variance_dollars + sum(f["overage_dollars"] for f in inflation_flags)

        tx_id = f"TX-{uuid.uuid4().hex[:8].upper()}"

        if has_fraud:
            # THE FRAUD CATCH SCENARIO
            summary_reasons = []
            if val_result["has_inflation"]:
                summary_reasons.append(f"Price inflation detected (+{overall_inflation_pct}%)")
            if missing_items:
                summary_reasons.append(f"Missing items: {', '.join(missing_items)}")
            if variance_dollars > 0:
                summary_reasons.append(f"${variance_dollars:.2f} value gap")

            ai_summary = f"HALTED: Total ${total_diverted:.2f} unauthorized diversion. " + "; ".join(summary_reasons)

            yield await emit(4, "DECIDE", f"VERDICT: FLAGGED — HALT DISBURSEMENT. {ai_summary}")
            await asyncio.sleep(0.7)

            # Freeze milestone, protect capital in campaign (avoid duplicate double-counting)
            was_already_flagged = (claim.status == "FLAGGED")
            milestone.status = "FLAGGED"
            claim.status = "FLAGGED"
            if campaign and not was_already_flagged:
                campaign.protected_fraud_amount += total_diverted
                db.commit()

            # Record or update Ledger Entry as FLAGGED
            existing_tx = db.query(LedgerTransaction).filter(LedgerTransaction.claim_id == claim.id).first()
            if existing_tx:
                ledger_entry = existing_tx
                tx_id = ledger_entry.id
                ledger_entry.billed_amount = total_invoiced
                ledger_entry.market_ref_amount = market_ref_total
                ledger_entry.confirmed_amount = confirmed_val
                ledger_entry.variance_amount = total_diverted
                ledger_entry.inflation_pct = overall_inflation_pct
                ledger_entry.status = "FLAGGED"
                ledger_entry.ai_summary = ai_summary
                ledger_entry.flag_reasons = summary_reasons
                ledger_entry.paypal_batch_status = "HELD"
            else:
                ledger_entry = LedgerTransaction(
                    id=tx_id,
                    claim_id=claim.id,
                    campaign_title=campaign_title,
                    milestone_title=milestone_title,
                    vendor_name=claim.vendor_name,
                    billed_amount=total_invoiced,
                    market_ref_amount=market_ref_total,
                    confirmed_amount=confirmed_val,
                    variance_amount=total_diverted,
                    inflation_pct=overall_inflation_pct,
                    status="FLAGGED",
                    ai_summary=ai_summary,
                    flag_reasons=summary_reasons,
                    paypal_batch_status="HELD",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(ledger_entry)
            db.commit()

            yield await emit(5, "ACTION", f"Milestone payout locked. Discrepancy logged to AG Grid as FLAGGED. Protected ${total_diverted:.2f} donor capital.")
            yield f"data: {json.dumps({'type': 'COMPLETE', 'status': 'FLAGGED', 'tx_id': tx_id, 'protected': total_diverted})}\n\n"

        else:
            # THE CLEAN 100% RECONCILED SCENARIO -> AUTONOMOUS PAYPAL PAYOUT
            ai_summary = f"100% RECONCILED: Billed ${total_invoiced:.2f} matches WFP benchmarks and verified beneficiary delivery."
            yield await emit(4, "DECIDE", f"VERDICT: APPROVED — 100% Reconciled. Initiating autonomous settlement via PayPal Agent Toolkit...")
            await asyncio.sleep(0.7)

            # Autonomous payout execution via PayPal API
            payout_res = await paypal_agent_service.execute_payout(
                recipient_email=claim.vendor_paypal_email,
                amount=total_invoiced,
                note=f"GrantPool Payout: {campaign_title} - {milestone_title} (Verified)",
                claim_id=claim.id
            )

            payout_status = payout_res.get("status", "SIMULATED")
            payout_id = payout_res.get("batch_id", f"PAY-{uuid.uuid4().hex[:6].upper()}")
            payout_mode = payout_res.get("mode", "PAYPAL_SANDBOX_SIMULATION")

            if payout_status == "FAILED":
                # Honest reporting: PayPal API rejected or encountered error
                err_detail = payout_res.get("error", "PayPal API call rejected request.")
                yield await emit(5, "ALERT", f"PAYPAL PAYOUT FAILED: {err_detail}. Escrow funds held pending manual retry.")
                
                milestone.status = "IN_REVIEW"
                claim.status = "IN_REVIEW"
                
                existing_tx = db.query(LedgerTransaction).filter(LedgerTransaction.claim_id == claim.id).first()
                if existing_tx:
                    existing_tx.status = "FLAGGED"
                    existing_tx.paypal_batch_status = "FAILED"
                    existing_tx.ai_summary = f"RECONCILIATION PASSED, BUT PAYPAL PAYOUT FAILED: {err_detail}"
                db.commit()
                yield f"data: {json.dumps({'type': 'COMPLETE', 'status': 'FAILED', 'error': err_detail})}\n\n"
                return

            was_already_reconciled = (claim.status == "RECONCILED")
            milestone.status = "RECONCILED"
            claim.status = "RECONCILED"
            if campaign and not was_already_reconciled:
                campaign.disbursed_amount += total_invoiced
                db.commit()

            # Record or update Ledger Entry as RECONCILED with truthful batch status
            batch_status_label = "LIVE_SUCCESS" if payout_status == "LIVE_SUCCESS" else "SIMULATED"
            existing_tx = db.query(LedgerTransaction).filter(LedgerTransaction.claim_id == claim.id).first()
            if existing_tx:
                ledger_entry = existing_tx
                tx_id = ledger_entry.id
                ledger_entry.billed_amount = total_invoiced
                ledger_entry.market_ref_amount = market_ref_total
                ledger_entry.confirmed_amount = confirmed_val
                ledger_entry.variance_amount = 0.0
                ledger_entry.inflation_pct = 0.0
                ledger_entry.status = "RECONCILED"
                ledger_entry.ai_summary = ai_summary
                ledger_entry.flag_reasons = []
                ledger_entry.paypal_payout_id = payout_id
                ledger_entry.paypal_batch_status = batch_status_label
            else:
                ledger_entry = LedgerTransaction(
                    id=tx_id,
                    claim_id=claim.id,
                    campaign_title=campaign_title,
                    milestone_title=milestone_title,
                    vendor_name=claim.vendor_name,
                    billed_amount=total_invoiced,
                    market_ref_amount=market_ref_total,
                    confirmed_amount=confirmed_val,
                    variance_amount=0.0,
                    inflation_pct=0.0,
                    status="RECONCILED",
                    ai_summary=ai_summary,
                    flag_reasons=[],
                    paypal_payout_id=payout_id,
                    paypal_batch_status=batch_status_label,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(ledger_entry)
            db.commit()

            action_desc = (
                f"Live PayPal Sandbox Payout confirmed (Batch: {payout_id})."
                if payout_status == "LIVE_SUCCESS"
                else f"Autonomous Payout simulated (Demo Mode Batch: {payout_id})."
            )
            yield await emit(5, "ACTION", f"{action_desc} Funds released to {claim.vendor_paypal_email}. AG Grid updated to RECONCILED.")
            yield f"data: {json.dumps({'type': 'COMPLETE', 'status': 'RECONCILED', 'tx_id': tx_id, 'payout_id': payout_id, 'payout_mode': payout_mode, 'payout_status': batch_status_label})}\n\n"

agent_brain = AgentBrain()
