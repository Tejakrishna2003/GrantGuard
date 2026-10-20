from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON, create_engine
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from pydantic import BaseModel, Field

Base = declarative_base()

# ==============================================================================
# SQLAlchemy ORM Models
# ==============================================================================

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default="Disaster Relief")
    target_amount = Column(Float, default=1000.0)
    current_pooled = Column(Float, default=0.0)
    disbursed_amount = Column(Float, default=0.0)
    protected_fraud_amount = Column(Float, default=0.0)
    status = Column(String, default="ACTIVE")  # ACTIVE, COMPLETED, FROZEN
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    milestones = relationship("Milestone", back_populates="campaign", cascade="all, delete-orphan")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String, primary_key=True, index=True)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    title = Column(String, nullable=False)
    allocated_amount = Column(Float, default=0.0)
    vendor_name = Column(String, nullable=True)
    vendor_paypal_email = Column(String, nullable=True)
    status = Column(String, default="PENDING_CLAIM")  # PENDING_CLAIM, IN_REVIEW, RECONCILED, FLAGGED, OVERRIDDEN
    created_at = Column(DateTime, default=datetime.utcnow)

    campaign = relationship("Campaign", back_populates="milestones")
    claims = relationship("Claim", back_populates="milestone", cascade="all, delete-orphan")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, index=True)
    milestone_id = Column(String, ForeignKey("milestones.id"), nullable=False)
    vendor_name = Column(String, nullable=False)
    vendor_paypal_email = Column(String, nullable=False)
    invoice_number = Column(String, nullable=True)
    invoice_amount = Column(Float, default=0.0)
    invoice_file_url = Column(String, nullable=True)
    extracted_items = Column(JSON, default=list)  # list of {description, qty, unit_price, total}
    status = Column(String, default="PENDING_VERIFICATION")
    created_at = Column(DateTime, default=datetime.utcnow)

    milestone = relationship("Milestone", back_populates="claims")
    proofs = relationship("Proof", back_populates="claim", cascade="all, delete-orphan")
    ledger_entries = relationship("LedgerTransaction", back_populates="claim")


class Proof(Base):
    __tablename__ = "proofs"

    id = Column(String, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False)
    beneficiary_name = Column(String, default="Community Field Coordinator")
    beneficiary_phone = Column(String, default="+15550192834")
    otp_code = Column(String, default="482910")
    otp_verified = Column(Boolean, default=False)
    delivery_photo_url = Column(String, nullable=True)
    confirmed_items = Column(JSON, default=list)
    confirmed_value = Column(Float, default=0.0)
    gps_lat = Column(Float, default=12.9716)
    gps_lng = Column(Float, default=77.5946)
    created_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("Claim", back_populates="proofs")


class LedgerTransaction(Base):
    __tablename__ = "ledger_transactions"

    id = Column(String, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=True)
    campaign_title = Column(String, nullable=False)
    milestone_title = Column(String, nullable=False)
    vendor_name = Column(String, nullable=False)
    billed_amount = Column(Float, default=0.0)
    market_ref_amount = Column(Float, default=0.0)
    confirmed_amount = Column(Float, default=0.0)
    variance_amount = Column(Float, default=0.0)
    inflation_pct = Column(Float, default=0.0)
    status = Column(String, default="PENDING")  # RECONCILED, FLAGGED, PENDING, OVERRIDDEN
    ai_summary = Column(Text, nullable=True)
    flag_reasons = Column(JSON, default=list)
    paypal_payout_id = Column(String, nullable=True)
    paypal_batch_status = Column(String, nullable=True)  # SUCCESS, UNCLAIMED, HELD
    created_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("Claim", back_populates="ledger_entries")


class AgentThoughtLog(Base):
    __tablename__ = "agent_thought_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_id = Column(String, index=True)
    step_index = Column(Integer, default=0)
    log_type = Column(String, default="THINK")  # THINK, ALERT, DECIDE, ACTION
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ==============================================================================
# Pydantic DTOs & Request / Response Schemas
# ==============================================================================

class LineItemDTO(BaseModel):
    item_description: str
    quantity: float
    unit_price: float
    total_price: float

class InvoiceExtractionDTO(BaseModel):
    vendor_name: str
    invoice_number: str
    line_items: List[LineItemDTO]
    subtotal: float
    tax: float
    total_amount: float

class DonationRequest(BaseModel):
    campaign_id: str
    amount: float
    donor_name: Optional[str] = "Anonymous Community Funder"
    donor_email: Optional[str] = "donor@community.org"
    paypal_order_id: Optional[str] = None

class ClaimCreateRequest(BaseModel):
    milestone_id: str
    vendor_name: str
    vendor_paypal_email: str
    invoice_amount: float
    line_items: List[LineItemDTO]
    invoice_file_url: Optional[str] = None

class ProofVerificationRequest(BaseModel):
    claim_id: str
    beneficiary_name: str
    beneficiary_phone: str
    otp_code: str
    confirmed_items: List[Dict[str, Any]]
    confirmed_value: float
    delivery_photo_url: Optional[str] = None

class DisputeOverrideRequest(BaseModel):
    transaction_id: str
    organizer_name: str
    justification: str
    override_action: str  # APPROVE or REJECT

class CampaignResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    target_amount: float
    current_pooled: float
    disbursed_amount: float
    protected_fraud_amount: float
    status: str
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LedgerResponse(BaseModel):
    id: str
    claim_id: Optional[str]
    campaign_title: str
    milestone_title: str
    vendor_name: str
    billed_amount: float
    market_ref_amount: float
    confirmed_amount: float
    variance_amount: float
    inflation_pct: float
    status: str
    ai_summary: Optional[str]
    flag_reasons: List[str]
    paypal_payout_id: Optional[str]
    paypal_batch_status: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
