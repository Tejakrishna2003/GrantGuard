import sys
from pathlib import Path

# Add backend to sys.path
sys.path.append(str(Path(__file__).resolve().parent))

from datetime import datetime, timedelta
from app.models.database import SessionLocal, init_db
from app.models.schemas import (
    Campaign, Milestone, Claim, Proof, LedgerTransaction, AgentThoughtLog
)

def run_seed():
    print("Initializing SQLite database tables...")
    init_db()

    db = SessionLocal()
    try:
        # Clear existing data for fresh seed
        db.query(AgentThoughtLog).delete()
        db.query(LedgerTransaction).delete()
        db.query(Proof).delete()
        db.query(Claim).delete()
        db.query(Milestone).delete()
        db.query(Campaign).delete()
        db.commit()

        print("Seeding Campaigns and Milestones...")

        # ----------------------------------------------------------------------
        # CAMPAIGN 1: Flood Relief Emergency Food Distribution
        # ----------------------------------------------------------------------
        c1 = Campaign(
            id="CAMP-FLOOD-01",
            title="Flood Relief Emergency Food Distribution",
            description="Providing immediate high-nutrition food staples and emergency thermal blankets to 200 displaced families across the river valley district.",
            category="Disaster Relief",
            target_amount=5000.0,
            current_pooled=3500.0,
            disbursed_amount=0.0,
            protected_fraud_amount=600.0,
            status="ACTIVE",
            image_url="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
            created_at=datetime.utcnow() - timedelta(days=5)
        )
        db.add(c1)

        m1 = Milestone(
            id="MS-FLOOD-01",
            campaign_id="CAMP-FLOOD-01",
            title="Milestone 1: 50x Rice Bags & 25x Thermal Blankets",
            allocated_amount=1000.0,
            vendor_name="QuickSupplies Relief Logistics Ltd",
            vendor_paypal_email="quicksupplies-vendor@example.com",
            status="FLAGGED",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(m1)

        cl1 = Claim(
            id="CLM-FLOOD-01",
            milestone_id="MS-FLOOD-01",
            vendor_name="QuickSupplies Relief Logistics Ltd",
            vendor_paypal_email="quicksupplies-vendor@example.com",
            invoice_number="INV-2026-FL03",
            invoice_amount=1000.0,
            invoice_file_url="invoice_food_relief_fl03.png",
            extracted_items=[
                {"item_description": "White Rice (5kg Bag)", "quantity": 50.0, "unit_price": 12.50, "total_price": 625.0},
                {"item_description": "High Thermal Winter Blanket", "quantity": 25.0, "unit_price": 15.00, "total_price": 375.0}
            ],
            status="FLAGGED",
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(cl1)

        p1 = Proof(
            id="PRF-FLOOD-01",
            claim_id="CLM-FLOOD-01",
            beneficiary_name="Elena Rostova (District Volunteer Lead)",
            beneficiary_phone="+15550192834",
            otp_code="482910",
            otp_verified=True,
            delivery_photo_url="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
            confirmed_items=[
                {"item": "White Rice (5kg Bag)", "quantity": 50.0, "received": True}
            ],
            confirmed_value=625.0,
            gps_lat=12.9716,
            gps_lng=77.5946,
            created_at=datetime.utcnow() - timedelta(hours=14)
        )
        db.add(p1)

        tx1 = LedgerTransaction(
            id="TX-FLAGGED-001",
            claim_id="CLM-FLOOD-01",
            campaign_title="Flood Relief Emergency Food Distribution",
            milestone_title="Milestone 1: 50x Rice Bags & 25x Thermal Blankets",
            vendor_name="QuickSupplies Relief Logistics Ltd",
            billed_amount=1000.0,
            market_ref_amount=775.0,
            confirmed_amount=625.0,
            variance_amount=600.0,
            inflation_pct=56.3,
            status="FLAGGED",
            ai_summary="HALTED: Total $600.00 unauthorized diversion. Rice marked up +56.3% above WFP baseline ($12.50 vs $8.00); 25 blankets invoiced ($375) not delivered.",
            flag_reasons=["Rice unit rate +56.3% markup vs WFP median", "25 winter blankets missing from beneficiary delivery"],
            paypal_batch_status="HELD",
            created_at=datetime.utcnow() - timedelta(hours=12)
        )
        db.add(tx1)

        # ----------------------------------------------------------------------
        # CAMPAIGN 2: Clean Water Well Drilling Project (SCENARIO 1: CLEAN PASS)
        # ----------------------------------------------------------------------
        c2 = Campaign(
            id="CAMP-WATER-02",
            title="Clean Water Community Well Drilling",
            description="Constructing a deep-bore solar-assisted clean water well supplying safe drinking water to 450 village residents.",
            category="WASH Infrastructure",
            target_amount=4000.0,
            current_pooled=4000.0,
            disbursed_amount=1200.0,
            protected_fraud_amount=0.0,
            status="ACTIVE",
            image_url="https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80",
            created_at=datetime.utcnow() - timedelta(days=8)
        )
        db.add(c2)

        m2 = Milestone(
            id="MS-WATER-02",
            campaign_id="CAMP-WATER-02",
            title="Milestone 2: Submersible Pump & High-Pressure Piping",
            allocated_amount=1200.0,
            vendor_name="HydroSys Water Engineering Ltd",
            vendor_paypal_email="hydrosys-vendor@example.com",
            status="RECONCILED",
            created_at=datetime.utcnow() - timedelta(days=4)
        )
        db.add(m2)

        cl2 = Claim(
            id="CLM-WATER-02",
            milestone_id="MS-WATER-02",
            vendor_name="HydroSys Water Engineering Ltd",
            vendor_paypal_email="hydrosys-vendor@example.com",
            invoice_number="INV-2026-WP01",
            invoice_amount=1200.0,
            invoice_file_url="invoice_water_pump_wp01.png",
            extracted_items=[
                {"item_description": "Submersible Clean Water Pump (1 HP)", "quantity": 1.0, "unit_price": 800.0, "total_price": 800.0},
                {"item_description": "High-Pressure PVC Well Piping Kit (100m)", "quantity": 1.0, "unit_price": 400.0, "total_price": 400.0}
            ],
            status="RECONCILED",
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        db.add(cl2)

        p2 = Proof(
            id="PRF-WATER-02",
            claim_id="CLM-WATER-02",
            beneficiary_name="Marcus Vance (Community Council Chair)",
            beneficiary_phone="+15550293847",
            otp_code="482910",
            otp_verified=True,
            delivery_photo_url="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80",
            confirmed_items=[
                {"item": "Submersible Clean Water Pump (1 HP)", "quantity": 1.0, "received": True},
                {"item": "High-Pressure PVC Well Piping Kit (100m)", "quantity": 1.0, "received": True}
            ],
            confirmed_value=1200.0,
            gps_lat=12.9800,
            gps_lng=77.6000,
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(p2)

        tx2 = LedgerTransaction(
            id="TX-PASSED-002",
            claim_id="CLM-WATER-02",
            campaign_title="Clean Water Community Well Drilling",
            milestone_title="Milestone 2: Submersible Pump & High-Pressure Piping",
            vendor_name="HydroSys Water Engineering Ltd",
            billed_amount=1200.0,
            market_ref_amount=1200.0,
            confirmed_amount=1200.0,
            variance_amount=0.0,
            inflation_pct=0.0,
            status="RECONCILED",
            ai_summary="100% RECONCILED: Billed $1,200.00 matches WFP benchmarks and verified beneficiary delivery. Payout auto-released via PayPal Agent Toolkit.",
            flag_reasons=[],
            paypal_payout_id="GP-PAYOUT-7892AF12",
            paypal_batch_status="SUCCESS",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(tx2)

        # ----------------------------------------------------------------------
        # CAMPAIGN 3: Community School Digital Literacy Drive (SCENARIO 2: PENDING)
        # ----------------------------------------------------------------------
        c3 = Campaign(
            id="CAMP-TECH-03",
            title="Community School Digital Literacy Drive",
            description="Equipping rural middle school classrooms with laptops and interactive learning resources for 120 students.",
            category="Education",
            target_amount=6000.0,
            current_pooled=4200.0,
            disbursed_amount=0.0,
            protected_fraud_amount=0.0,
            status="ACTIVE",
            image_url="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
            created_at=datetime.utcnow() - timedelta(days=10)
        )
        db.add(c3)

        m3 = Milestone(
            id="MS-TECH-03",
            campaign_id="CAMP-TECH-03",
            title="Milestone 1: 10x Education-Grade Chromebooks",
            allocated_amount=3000.0,
            vendor_name="TechEdu Innovations Supply Co",
            vendor_paypal_email="techedu-vendor@example.com",
            status="PENDING_CLAIM",
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        db.add(m3)

        cl3 = Claim(
            id="CLM-TECH-03",
            milestone_id="MS-TECH-03",
            vendor_name="TechEdu Innovations Supply Co",
            vendor_paypal_email="techedu-vendor@example.com",
            invoice_number="INV-2026-LP10",
            invoice_amount=3000.0,
            invoice_file_url="invoice_chromebooks_lp10.png",
            extracted_items=[
                {"item_description": "Education-Grade Chromebook Laptop (11.6\")", "quantity": 10.0, "unit_price": 300.0, "total_price": 3000.0}
            ],
            status="PENDING_VERIFICATION",
            created_at=datetime.utcnow() - timedelta(hours=6)
        )
        db.add(cl3)

        tx3 = LedgerTransaction(
            id="TX-PENDING-003",
            claim_id="CLM-TECH-03",
            campaign_title="Community School Digital Literacy Drive",
            milestone_title="Milestone 1: 10x Education-Grade Chromebooks",
            vendor_name="TechEdu Innovations Supply Co",
            billed_amount=3000.0,
            market_ref_amount=3000.0,
            confirmed_amount=0.0,
            variance_amount=3000.0,
            inflation_pct=0.0,
            status="PENDING",
            ai_summary="Milestone awaiting field beneficiary OTP sign-off. Payout held in escrow.",
            flag_reasons=["Awaiting Beneficiary OTP verification"],
            paypal_batch_status="HELD",
            created_at=datetime.utcnow() - timedelta(hours=5)
        )
        db.add(tx3)

        db.commit()
        print("[SUCCESS] Database successfully seeded with 3 realistic scenarios!")
        print("  - Scenario 1 (Clean Pass): Well Drilling (TX-PASSED-002, $1,200, RECONCILED)")
        print("  - Scenario 2 (Pending Sign-off): School Laptops (TX-PENDING-003, $3,000, PENDING)")
        print("  - Scenario 3 (Fraud Catch): Flood Relief (TX-FLAGGED-001, $1,000 claimed, $600 frozen, FLAGGED)")

    except Exception as e:
        print(f"[ERROR] Error during seed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
