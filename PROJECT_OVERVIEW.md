# GrantPool AI — Comprehensive Project Overview & Technical Architecture

> **PayPal AI Hackathon Submission**  
> **Categories Targeted:** Best Use of Agentic Commerce | Most Impactful | Best Use of AG Grid  
> **Repository:** `GrantGuard`  
> **License:** MIT License  

---

## 📌 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [The Core Problem: The $40B "Middleman Black Box"](#2-the-core-problem-the-40b-middleman-black-box)
3. [The Core Idea & Solution](#3-the-core-idea--solution)
4. [End-to-End System Architecture](#4-end-to-end-system-architecture)
5. [The 6-Stage Execution Pipeline](#5-the-6-stage-execution-pipeline)
6. [Interactive Pre-Seeded Demonstration Scenarios](#6-interactive-pre-seeded-demonstration-scenarios)
7. [Comprehensive Codebase & Component Inventory](#7-comprehensive-codebase--component-inventory)
8. [Backend Security Policies & Guardrails](#8-backend-security-policies--guardrails)
9. [Automated Verification Test Suite (6/6 Passing)](#9-automated-verification-test-suite-66-passing)
10. [Evaluator Quickstart & Testing Guide](#10-evaluator-quickstart--testing-guide)
11. [Future Roadmap](#11-future-roadmap)

---

## 1. Executive Summary

**GrantPool AI** is an autonomous anti-diversion financial escrow agent and forensic audited ledger designed to safeguard community relief funds, municipal disaster grants, and grassroots mutual-aid initiatives.

Instead of unmonitored bank transfers into personal accounts, GrantPool AI locks donated capital into a programmatic escrow-style pool. Milestone funds are **only disbursed autonomously via the PayPal Payouts REST API** once an AI agent proves via a **4-way cross-reconciliation flow** that:
1. The contractor's invoiced line items match fair market reference prices (cross-referenced against UN World Food Programme and HDX commodity baselines via Gemini 2.0 Flash Vision OCR).
2. The beneficiary has verified physical delivery on the ground through Dual-Factor Ground Truth (SMS OTP + timestamped delivery photos and GPS stamps).

If price gouging or missing goods are detected, the agent **instantly freezes the funds in escrow, halts payout, and flags the transaction** on an **AG Grid forensic auditing ledger**.

---

## 2. The Core Problem: The $40B "Middleman Black Box"

Every year, over **$40 Billion** is contributed to emergency relief, mutual aid funds, and community improvement projects worldwide. Despite massive generosity, donors, grantors, and community members face a systemic lack of trust:

* **The Intermediary Overhead Trap:** Traditional platforms (GoFundMe, Kickstarter, standard bank transfers) deposit 100% of collected funds into an organizer's personal bank account with zero spending controls or milestone gates.
* **15% to 30% Capital Diversion:** A substantial fraction of relief funding is lost to unexplained contractor price inflation, phantom delivery invoices, and unauthorized administrative skimming before aid ever reaches the ground.
* **Lack of Independent Ground Verification:** Donors have no way of knowing whether 100 bags of rice or 10 water filtration units were actually delivered, or if only half arrived while the full budget was billed.
* **Audit Infeasibility for Small NGOs:** Grassroots relief organizations and mutual-aid collectives cannot afford dedicated forensic accounting teams to scrutinize every contractor receipt.

---

## 3. The Core Idea & Solution

### The Core Hypothesis
> *"What if community grant funds were held in a programmatic release gate, and money only moved when an AI agent mathematically verified that goods were actually delivered at fair market rates?"*

### The 4-Way Cross-Reconciliation Model
GrantPool AI connects all four participants in an aid lifecycle:
* **Donor:** Contributes directly to transparent community pools via PayPal Smart Buttons.
* **Contractor / Vendor:** Submits milestone invoices, receipts, and line items.
* **Beneficiary / Volunteer:** Confirms ground-truth delivery via Twilio SMS OTP and on-site geotagged photos.
* **Autonomous AI Agent:** Compares invoice rates against UN WFP commodity benchmarks and verifies field delivery before triggering PayPal Payouts.

---

## 4. End-to-End System Architecture

```
   [1. Inbound Donation]                [2. Contractor Claim]          [3. Beneficiary Field Proof]
 PayPal Smart Buttons / Orders            Itemized Invoice PDF            Photo Proof + SMS OTP (Twilio)
           │                                      │                                 │
           ▼                                      └──────────────┬──────────────────┘
[Escrow Capital Pool]                                            │
           │                                                     ▼
           │                                       [4. Autonomous Agent Brain]
           │                                        • Gemini 2.0 Flash Vision (Deterministic OCR)
           │                                        • UN WFP Benchmark Catalog (Anti-Price Gouging)
           │                                        • Line-Item & Quantity Match Engine
           │                                                     │
           │                                      ┌──────────────┴──────────────┐
           │                                [100% Match]                 [Discrepancy / Markup]
           │                                      │                               │
           └──────── (Autonomous Action) ─────────┼───────────────────────────────┼──────────┐
                                                  ▼                               ▼          ▼
                                       [5. PayPal Payouts API]               [HALT PAYOUT] [FREEZE ESCROW]
                                        Vendor Paid Autonomously                  │
                                                  │                               │
                                                  └───────────────┬───────────────┘
                                                                  ▼
                                                   [6. AG Grid Audited Ledger]
                                                    • 🟢 Reconciled | 🔴 Flagged Anomaly
                                                    • Live Cell Flashing & Master-Detail Drawer
                                                    • Human-in-the-Loop Community Dispute Override
```

---

## 5. The 6-Stage Execution Pipeline

### Stage 1: Inbound Capital Pooling (PayPal Donations SDK)
* **Implementation:** `frontend/src/components/PayPalDonationBtn.tsx` & `backend/app/api/donations.py`
* **Flow:** Donors pledge contributions ($25, $100, $500, or custom). The PayPal Smart Buttons SDK captures the order, validates payment status, and locks the balance into the campaign's programmatic escrow account.

### Stage 2: Contractor Milestone Claim Submission
* **Implementation:** `frontend/src/components/SubmitClaimModal.tsx` & `backend/app/api/claims.py`
* **Flow:** Contractors, suppliers, or relief volunteers upload itemized invoices/receipts for completed milestones (e.g., 50 bags of rice, clean water pumps, laptops). Uploads are verified for allowed MIME types (`.png, .jpg, .jpeg, .pdf, .webp`) and a 10MB size ceiling.

### Stage 3: Ground-Truth Beneficiary Verification
* **Implementation:** `frontend/src/components/VerifyProofModal.tsx` & `backend/app/services/twilio_service.py`
* **Flow:** Aid recipients on the ground receive a 6-digit **Twilio SMS OTP** and upload a live photo of delivered goods with timestamp and GPS coordinates. In demo mode, exact validation (`482910`) is strictly enforced to prevent arbitrary bypasses.

### Stage 4: Autonomous AI Discrepancy & Anti-Fraud Engine
* **Multimodal OCR (`gemini_vision.py`):** Uses **Google Gemini 2.0 Flash Vision** with `temperature=0.0` and strict Pydantic JSON schemas to deterministically extract items, quantities, and unit rates from unstructured or crumpled receipts.
* **Commodity Price Benchmark Validation (`price_validator.py`):** Compares extracted unit rates against **UN World Food Programme (WFP) & Humanitarian Data Exchange (HDX) market baselines** (`benchmarks.json`). Anomaly detection flags markups exceeding configurable thresholds.
* **Cross-Matching Engine (`agent_brain.py`):** Compares invoice line items against verified beneficiary delivery receipts to detect missing or phantom supplies.

### Stage 5: Programmatic Financial Action (Autonomous Execution)
* **Clean Match:** When benchmarks and field delivery match 100%, the agent calls the **PayPal Payouts REST API** (`paypal_agent_service.py`) to release the milestone funds directly to the vendor's PayPal email with zero manual button clicks.
* **Discrepancy / Markup Detected:** The agent immediately **halts the payout**, freezes unverified funds in escrow, and generates a structured forensic breakdown explaining why the transaction was blocked.
* **Truthful Payout Statuses:** Payout outcomes are recorded truthfully as `LIVE_SUCCESS`, `SIMULATED` (demo mode), or `FAILED` (if an API call is rejected).

### Stage 6: Forensic Surveillance & Human-in-the-Loop
* **AG Grid Audited Ledger (`AuditedLedgerGrid.tsx`):** Displays real-time transactions with status badges (🟢 Reconciled, 🟡 Pending Proof, 🔴 Flagged Anomaly, 🔵 Community Override), live cell flash animations, quick text search, and one-click CSV export.
* **Master-Detail Inspection Drawer (`MasterDetailDrawer.tsx`):** Auditors click `[Inspect]` on any row to open a side-by-side view comparing the contractor's invoice line items directly against the beneficiary's delivery photo, OTP status, GPS coordinates, and benchmark sources.
* **Live SSE Reasoning Stream (`AgentReasoningBox.tsx`):** Streams the agent's real-time cognitive steps (Ingestion $\rightarrow$ OCR Extraction $\rightarrow$ WFP Audit $\rightarrow$ Cross-Check $\rightarrow$ PayPal Payout) over Server-Sent Events.
* **Dispute Override Modal (`DisputeModal.tsx`):** If price increases were caused by legitimate emergency disruptions (e.g. floods wiping out roads), community organizers can review vendor justifications (with a minimum 15-character rationale requirement) and grant an authorized override.

---

## 6. Interactive Pre-Seeded Demonstration Scenarios

Three pre-configured scenarios can be executed instantly via quick-launcher buttons in the navbar:

| Scenario | Claim ID & Title | Claimed | AI Detection Findings | Final Autonomous Action | AG Grid Visual State |
|---|---|---|---|---|---|
| **🔴 1. Fraud Catch (Hero Demo)** | `CLM-FLOOD-01` Emergency Food Aid | $1,000 | • Rice billed @ \$12.50 vs \$8.00 WFP benchmark (**+56.3% markup**)<br>• Beneficiary confirms **25 missing blankets** | **HALT PAYOUT**<br>• $600 frozen in escrow<br>• Vendor payout blocked | Flashes Red; marked `Flagged Discrepancy` with forensic explanation |
| **🟢 2. Clean Pass** | `CLM-WATER-02` Clean Water Well Drilling | $1,200 | • Prices match WFP benchmark<br>• Beneficiary OTP & delivery photo verified | **AUTO-APPROVED**<br>• Autonomous PayPal Payout executed | Flashes Green; marked `100% Reconciled` |
| **🟡 3. Pending Field Proof** | `CLM-TECH-03` School Literacy Drive | $3,000 | • Invoice extracted<br>• Awaiting field beneficiary OTP | **ESCROW HOLD**<br>• Funds held until field sign-off | Displayed as `Pending Beneficiary Proof` |

---

## 7. Comprehensive Codebase & Component Inventory

### Backend Architecture (`/backend`)
* `backend/app/main.py`: FastAPI application entry point, CORS configuration, and router aggregation.
* `backend/app/api/`:
  * `campaigns.py`: Campaign pool endpoints, funding goals, and escrow balances.
  * `donations.py`: Inbound PayPal donation order capture and pool crediting.
  * `claims.py`: Vendor claim submission with file validation (MIME & size limits).
  * `verification.py`: Beneficiary delivery photo and SMS OTP verification endpoints.
  * `agent_runner.py`: Triggers the reconciliation audit and streams SSE reasoning logs.
  * `ledger.py`: Audited ledger query, transaction detail lookup, dispute override, and forensic CSV export.
* `backend/app/services/`:
  * `agent_brain.py`: Core cognitive orchestrator managing the 5-stage evaluation loop with server-side tolerance clamping.
  * `gemini_vision.py`: Google Gemini 2.0 Flash Vision client for multimodal OCR with deterministic reliability fallback.
  * `price_validator.py`: UN WFP/HDX market commodity price benchmark validator.
  * `paypal_agent_service.py`: PayPal Orders and Payouts REST API client with explicit `LIVE_SUCCESS`, `SIMULATED`, and `FAILED` status reporting.
  * `twilio_service.py`: Twilio Verify API integration with exact OTP verification.
* `backend/app/models/`:
  * `database.py`: SQLAlchemy database models (Campaign, Milestone, Claim, Proof, Ledger).
  * `schemas.py`: Pydantic validation schemas.
* `backend/app/core/`:
  * `config.py`: Environment configuration and demo mode defaults.
  * `benchmarks.json`: UN WFP / HDX market commodity price baselines with reference links and methodology notes.
* `backend/seed.py`: Deterministic database seeder for instant evaluator testing.

### Frontend Architecture (`/frontend`)
* `frontend/src/App.tsx`: Main dashboard layout with real-time state synchronization.
* `frontend/src/components/`:
  * `AuditedLedgerGrid.tsx`: AG Grid Community forensic surveillance table with custom badges and live cell flashing.
  * `MasterDetailDrawer.tsx`: Expandable side drawer with side-by-side evidence inspection.
  * `AgentReasoningBox.tsx`: 5-stage live SSE cognitive pipeline visualization.
  * `Navbar.tsx`: Header with live PayPal Sandbox status, backend health, and scenario launchers.
  * `KPICards.tsx`: Real-time pool metrics (Pooled, Payouts, Diverted Halted, Milestones).
  * `CampaignHero.tsx`: Campaign progress, beneficiary impact summary, and donation trigger.
  * `FundingProgressChart.tsx`: Visual breakdown of escrowed vs released capital.
  * `HowItWorksStrip.tsx`: Step-by-step 4-way reconciliation explanatory strip.
  * `PayPalDonationBtn.tsx`: PayPal Smart Buttons SDK integration.
  * `SubmitClaimModal.tsx`: Contractor invoice submission interface.
  * `VerifyProofModal.tsx`: Beneficiary SMS OTP and photo delivery interface.
  * `DisputeModal.tsx`: Human-in-the-loop community dispute override interface.
  * `ToastContainer.tsx`: Global notification toast system.
* `frontend/src/lib/`:
  * `api.ts`: Centralized typed API client for backend communication.
  * `types.ts`: TypeScript data contracts matching backend models.

---

## 8. Backend Security Policies & Guardrails

1. **Server-Side Tolerance Clamp:** `agent_brain.py` strictly clamps client-supplied tolerance values between `0.0%` and `35.0%` (`CRISIS_TOLERANCE_PERCENT`). Callers cannot weaken anti-fraud rules by passing arbitrary values like `?tolerance=999%`.
2. **File Upload Hardening:** `claims.py` restricts invoice uploads to `.png, .jpg, .jpeg, .pdf, .webp` and enforces a strict 10MB size ceiling.
3. **Protected Reset Endpoint:** `/api/system/reset` is locked strictly to `DEMO_MODE=true` to prevent unauthorized database resets.
4. **Idempotent Reconciliation:** Running reconciliation repeatedly on the same claim updates the existing ledger transaction rather than creating duplicate rows or triggering duplicate payouts.
5. **Route Separation:** Resolved path decorator shadowing in `ledger.py` so `/export/csv` and `/detail/{id}` do not collide.

---

## 9. Automated Verification Test Suite (6/6 Passing)

The test suite in `backend/tests/test_reconciliation.py` runs deterministically under Pytest:

```bash
cd backend
pytest tests/ -v
```

### Verified Test Results:
```
backend/tests/test_reconciliation.py::test_clean_claim_approved_and_settled PASSED [ 16%]
backend/tests/test_reconciliation.py::test_inflated_price_and_missing_items_halted PASSED [ 33%]
backend/tests/test_reconciliation.py::test_unverified_beneficiary_otp_holds_escrow PASSED [ 50%]
backend/tests/test_reconciliation.py::test_tolerance_hard_cap_prevents_client_bypass PASSED [ 66%]
backend/tests/test_reconciliation.py::test_idempotent_reconciliation_no_duplicate_ledger PASSED [ 83%]
backend/tests/test_reconciliation.py::test_truthful_payment_failure_reporting PASSED [100%]

======================= 6 passed in 39.75s =======================
```

---

## 10. Evaluator Quickstart & Testing Guide

### Prerequisites
* Python 3.10+
* Node.js 18+ (verified on Node 20 and Node 22)

### Step 1: Start Backend
```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

### Step 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 3: Open in Browser
Visit: **http://localhost:5173**

---

## 11. Future Roadmap

1. **PayPal Hyperwallet Cross-Border Payouts:** Support international diaspora disaster relief with automated local fiat currency conversions.
2. **Offline USSD / Feature Phone Verification:** Enable SMS-only delivery verification for rural low-connectivity areas without smartphone access.
3. **Multi-Signatory Community Governance:** Enable multi-sig community approval rules for high-value relief milestones exceeding $10,000.
