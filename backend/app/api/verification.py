import uuid
import qrcode
import io
import base64
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.schemas import Claim, Proof, ProofVerificationRequest
from app.services.twilio_service import twilio_service

router = APIRouter(prefix="/api/verification", tags=["verification"])

@router.get("/qr/{claim_id}")
def generate_delivery_qr(claim_id: str, db: Session = Depends(get_db)):
    """
    Generates a QR code data URL that field agents scan to open the verification flow.
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    payload = f"grantpool://verify?claim_id={claim_id}&vendor={claim.vendor_name}&amount={claim.invoice_amount}"

    qr = qrcode.QRCode(
        version=1,
        box_size=8,
        border=2
    )
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()

    return {
        "claim_id": claim_id,
        "qr_payload": payload,
        "qr_image_data_url": f"data:image/png;base64,{img_str}"
    }

@router.post("/send-otp")
def send_otp(phone_number: str = Body(..., embed=True)):
    """
    Sends OTP to beneficiary phone. Returns auto-fill demo code if in demo mode.
    """
    res = twilio_service.send_verification_otp(phone_number)
    return res

@router.post("/verify-proof")
def verify_proof_submission(payload: ProofVerificationRequest, db: Session = Depends(get_db)):
    """
    Verifies beneficiary OTP, records confirmed goods & delivery photo, and marks proof valid.
    """
    claim = db.query(Claim).filter(Claim.id == payload.claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Verify code
    verify_res = twilio_service.verify_otp(payload.beneficiary_phone, payload.otp_code)
    if not verify_res.get("success"):
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter the valid 6-digit code.")

    # Record or update proof in DB
    existing_proof = db.query(Proof).filter(Proof.claim_id == payload.claim_id).first()
    if existing_proof:
        existing_proof.beneficiary_name = payload.beneficiary_name
        existing_proof.beneficiary_phone = payload.beneficiary_phone
        existing_proof.otp_verified = True
        existing_proof.confirmed_items = payload.confirmed_items
        existing_proof.confirmed_value = payload.confirmed_value
        existing_proof.delivery_photo_url = payload.delivery_photo_url
        proof_id = existing_proof.id
    else:
        proof_id = f"PRF-{uuid.uuid4().hex[:8].upper()}"
        new_proof = Proof(
            id=proof_id,
            claim_id=payload.claim_id,
            beneficiary_name=payload.beneficiary_name,
            beneficiary_phone=payload.beneficiary_phone,
            otp_code=payload.otp_code,
            otp_verified=True,
            confirmed_items=payload.confirmed_items,
            confirmed_value=payload.confirmed_value,
            delivery_photo_url=payload.delivery_photo_url
        )
        db.add(new_proof)

    claim.status = "VERIFIED_AWAITING_AUDIT"
    db.commit()

    return {
        "success": True,
        "proof_id": proof_id,
        "claim_id": payload.claim_id,
        "confirmed_value": payload.confirmed_value,
        "message": f"Beneficiary proof verified successfully via OTP. Ground-truth value: ${payload.confirmed_value:.2f}."
    }
