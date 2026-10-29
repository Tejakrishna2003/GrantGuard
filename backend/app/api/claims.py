import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from app.models.database import get_db
from app.models.schemas import Claim, Milestone, Campaign
from app.core.config import UPLOAD_DIR

router = APIRouter(prefix="/api/claims", tags=["claims"])

@router.get("")
def list_claims(db: Session = Depends(get_db)):
    return db.query(Claim).all()

@router.get("/{claim_id}")
def get_claim(claim_id: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.post("/submit")
async def submit_vendor_claim(
    milestone_id: str = Form(...),
    vendor_name: str = Form(...),
    vendor_paypal_email: str = Form(...),
    invoice_number: str = Form(...),
    invoice_amount: float = Form(...),
    invoice_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf", ".webp"}
    MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB

    file_url = None
    if invoice_file and invoice_file.filename:
        ext = os.path.splitext(invoice_file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Allowed: PNG, JPG, JPEG, PDF, WEBP."
            )
        content = await invoice_file.read()
        if len(content) > MAX_FILE_BYTES:
            raise HTTPException(
                status_code=400,
                detail="Invoice file size exceeds 10MB limit."
            )
        safe_filename = f"{uuid.uuid4().hex[:8]}_{os.path.basename(invoice_file.filename)}"
        dest_path = UPLOAD_DIR / safe_filename
        with open(dest_path, "wb") as buffer:
            buffer.write(content)
        file_url = str(dest_path)

    claim_id = f"CLM-{uuid.uuid4().hex[:8].upper()}"
    new_claim = Claim(
        id=claim_id,
        milestone_id=milestone_id,
        vendor_name=vendor_name,
        vendor_paypal_email=vendor_paypal_email,
        invoice_number=invoice_number,
        invoice_amount=invoice_amount,
        invoice_file_url=file_url or invoice_number,
        status="PENDING_VERIFICATION"
    )

    milestone.status = "IN_REVIEW"
    db.add(new_claim)
    db.commit()

    return {
        "success": True,
        "claim_id": claim_id,
        "milestone_id": milestone_id,
        "message": f"Claim {claim_id} submitted for ${invoice_amount:.2f}. Awaiting beneficiary proof & agent audit."
    }
