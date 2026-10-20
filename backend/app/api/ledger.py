import io
import csv
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.schemas import (
    LedgerTransaction, Claim, Proof, Milestone, Campaign,
    LedgerResponse, DisputeOverrideRequest
)
from app.services.paypal_agent_service import paypal_agent_service

router = APIRouter(prefix="/api/ledger", tags=["ledger"])

@router.get("", response_model=List[LedgerResponse])
def get_ledger_transactions(db: Session = Depends(get_db)):
    """
    Returns all audited transactions for AG Grid.
    """
    return db.query(LedgerTransaction).order_by(LedgerTransaction.created_at.desc()).all()

@router.get("/detail/{transaction_id}")
@router.get("/{transaction_id}")
def get_transaction_inspection_detail(transaction_id: str, db: Session = Depends(get_db)):
    """
    Returns side-by-side inspection data for MasterDetailDrawer.tsx.
    """
    tx = db.query(LedgerTransaction).filter(LedgerTransaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    claim = db.query(Claim).filter(Claim.id == tx.claim_id).first() if tx.claim_id else None
    proof = db.query(Proof).filter(Proof.claim_id == tx.claim_id).first() if tx.claim_id else None

    return {
        "transaction": tx,
        "claim": claim,
        "proof": proof,
        "invoice_items": claim.extracted_items if claim else [],
        "confirmed_items": proof.confirmed_items if proof else [],
        "delivery_photo_url": proof.delivery_photo_url if proof else None,
        "otp_verified": proof.otp_verified if proof else False,
        "beneficiary_phone": proof.beneficiary_phone if proof else None,
        "gps": {"lat": proof.gps_lat, "lng": proof.gps_lng} if proof else None
    }

@router.post("/override")
async def override_dispute(payload: DisputeOverrideRequest, db: Session = Depends(get_db)):
    """
    Human-in-the-Loop Dispute Override.
    Allows an authorized organizer to review vendor justification and manually release or uphold freeze.
    """
    tx = db.query(LedgerTransaction).filter(LedgerTransaction.id == payload.transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    claim = db.query(Claim).filter(Claim.id == tx.claim_id).first() if tx.claim_id else None

    if payload.override_action.upper() == "APPROVE":
        # Execute payout with manual override note
        recipient_email = claim.vendor_paypal_email if claim else "vendor@partner.org"
        payout_res = await paypal_agent_service.execute_payout(
            recipient_email=recipient_email,
            amount=tx.billed_amount,
            note=f"MANUAL COMMUNITY OVERRIDE by {payload.organizer_name}: {payload.justification}",
            claim_id=tx.claim_id
        )

        payout_id = payout_res.get("batch_id", "OVERRIDE-BATCH")
        tx.status = "OVERRIDDEN"
        tx.paypal_payout_id = payout_id
        tx.paypal_batch_status = "SUCCESS"
        tx.ai_summary = f"OVERRIDDEN by {payload.organizer_name} ({payload.justification}). Payout released."

        if claim:
            claim.status = "OVERRIDDEN"

        db.commit()

        return {
            "success": True,
            "status": "OVERRIDDEN",
            "message": f"Transaction {tx.id} approved via community override. Funds released.",
            "paypal_payout_id": payout_id
        }
    else:
        tx.status = "FLAGGED"
        tx.ai_summary = f"REJECTED & CONFIRMED FRAUD by {payload.organizer_name}: {payload.justification}"
        db.commit()

        return {
            "success": True,
            "status": "FLAGGED",
            "message": f"Transaction {tx.id} dispute rejected. Capital permanently retained in grant pool."
        }

@router.get("/export/csv")
def export_ledger_csv(db: Session = Depends(get_db)):
    """
    Forensic CSV export for auditors and donors.
    """
    transactions = db.query(LedgerTransaction).order_by(LedgerTransaction.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Transaction ID", "Campaign", "Milestone", "Vendor Name",
        "Billed Amount ($)", "Market Benchmark ($)", "Beneficiary Confirmed ($)",
        "Variance ($)", "Inflation %", "Audit Status", "PayPal Payout Batch", "AI Summary", "Timestamp UTC"
    ])

    for tx in transactions:
        writer.writerow([
            tx.id, tx.campaign_title, tx.milestone_title, tx.vendor_name,
            f"{tx.billed_amount:.2f}", f"{tx.market_ref_amount:.2f}", f"{tx.confirmed_amount:.2f}",
            f"{tx.variance_amount:.2f}", f"{tx.inflation_pct:.1f}%", tx.status,
            tx.paypal_payout_id or "HELD", tx.ai_summary or "", tx.created_at.isoformat()
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=grantpool_audit_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"}
    )
