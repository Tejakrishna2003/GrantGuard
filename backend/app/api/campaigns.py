from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.database import get_db
from app.models.schemas import Campaign, Milestone, CampaignResponse

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])

@router.get("", response_model=List[CampaignResponse])
def get_campaigns(db: Session = Depends(get_db)):
    return db.query(Campaign).all()

@router.get("/metrics")
def get_global_metrics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    campaigns = db.query(Campaign).all()
    total_pooled = sum(c.current_pooled for c in campaigns)
    total_disbursed = sum(c.disbursed_amount for c in campaigns)
    total_protected = sum(c.protected_fraud_amount for c in campaigns)
    active_count = len(campaigns)

    return {
        "total_pooled": round(total_pooled, 2),
        "total_disbursed": round(total_disbursed, 2),
        "total_protected": round(total_protected, 2),
        "active_campaigns": active_count,
        "discrepancy_prevention_rate": round((total_protected / max(1.0, total_pooled)) * 100.0, 1)
    }

@router.get("/{campaign_id}")
def get_campaign_detail(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    milestones = db.query(Milestone).filter(Milestone.campaign_id == campaign_id).all()
    return {
        "campaign": campaign,
        "milestones": milestones
    }
