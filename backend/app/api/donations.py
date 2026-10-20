import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.schemas import Campaign, DonationRequest
from app.services.paypal_agent_service import paypal_agent_service

router = APIRouter(prefix="/api/donations", tags=["donations"])

@router.post("/capture")
async def capture_community_donation(payload: DonationRequest, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == payload.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Capture order via PayPal service
    res = await paypal_agent_service.capture_donation(
        order_id=payload.paypal_order_id or f"ORD-{uuid.uuid4().hex[:8].upper()}",
        amount=payload.amount
    )

    if res.get("success"):
        campaign.current_pooled += payload.amount
        db.commit()

        return {
            "success": True,
            "message": f"Successfully contributed ${payload.amount:.2f} to {campaign.title}",
            "capture_id": res.get("capture_id"),
            "current_pooled": campaign.current_pooled,
            "campaign_id": campaign.id
        }
    else:
        raise HTTPException(status_code=400, detail="Failed to capture PayPal donation")
