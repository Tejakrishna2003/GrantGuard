# Evaluator & Judge Quickstart Guide (60 Seconds)

Welcome to **GrantPool AI**! This guide is designed to provide evaluators with a zero-friction, 60-second walkthrough of the complete end-to-end reconciliation pipeline.

---

## ⚡ 1-Minute Launch Instructions

### Terminal 1: Backend Setup & Launch
```bash
cd backend

# Create & activate virtual environment:
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Run automated verification tests (6/6 passing tests):
pytest tests/ -v

# Seed clean demo scenarios into SQLite:
python seed.py

# Start FastAPI server:
uvicorn app.main:app --port 8000
```
*Backend is live at: `http://localhost:8000` (Health check: `/health`, Interactive API docs: `/docs`)*

### Terminal 2: Frontend Launch
```bash
cd frontend
npm install
npm run dev
```
*Frontend is live at: `http://localhost:5173`*

---

## 🧪 What to Click & Test During Evaluation

### Test 1: The Hero Fraud-Catch Demo (Claim #CLM-FLOOD-01)
1. In the top navigation bar, click the red button: **`1. Fraud Catch (Hero)`**.
2. Observe the **Autonomous Cognitive Reasoning Stream** terminal:
   - Stage 1: Ingestion & Gemini Vision OCR parses the vendor invoice.
   - Stage 2: Cross-referencing against UN WFP baseline detects a **56.3% price markup on rice** ($12.50 billed vs $8.00 benchmark).
   - Stage 3: Beneficiary OTP check detects that **25 winter blankets ($375.00) were never delivered**.
   - Stage 4: Discrepancy gate calculates a total unauthorized cut of **$600.00**.
   - Stage 5: Agent autonomously executes: **HALT DISBURSEMENT & FREEZE CAPITAL**.
3. Observe the **AG Grid Audited Ledger**:
   - The top row flashes red.
   - Status badge transitions to: `🔴 Flagged Discrepancy`.
   - Discrepancy cell shows: `-$600.00 (+56.3% Markup)`.
   - Settlement column shows: `FROZEN_ESCROW`.
   - Top KPI card updates to: **Capital Protected: $600.00**.

### Test 2: The Clean Autonomous PayPal Payout (Claim #CLM-WATER-02)
1. Click the green button: **`2. Clean Pass`**.
2. Observe the reasoning stream:
   - WFP price validation passes.
   - Beneficiary OTP and geotagged delivery photo are confirmed.
   - Decision: `100% RECONCILED`.
   - Action: Milestone funds are released autonomously via the **PayPal Payouts REST API**.
3. In the AG Grid table, the row flashes green with status badge `🟢 100% Reconciled` and settlement badge `🔵 SIM: GP-PAYOUT-...` (or `🟢 LIVE:` if live credentials are configured).

### Test 3: Side-by-Side Evidence Inspection (Master-Detail Drawer)
1. Click the **`Inspect`** button on any row in the AG Grid table.
2. An expandable Master-Detail side drawer slides out from the right:
   - Examine the vendor's line-item invoice breakdown.
   - Compare it against the field beneficiary delivery photo and geotag coordinates.
   - Review the verified Twilio OTP status and WFP benchmark price citations.

### Test 4: Human-in-the-Loop Dispute Override
1. On the red flagged row, click **`Override`**.
2. Review the contractor's emergency justification (e.g. washed-out bridges increasing diesel transport costs).
3. Enter an organizer justification (minimum 15 characters) and click **`Approve & Release via PayPal Payouts`**.
4. The AG Grid updates to status `🔵 Community Override`, demonstrating human-in-the-loop governance over the autonomous agent.

### Test 5: Forensic CSV Auditor Export
1. Click the **`Export CSV`** button in the AG Grid toolbar.
2. Open the downloaded CSV file to verify the complete, timestamped financial audit trail.

---

## 🔑 Pre-Configured Sandbox Accounts
- **Personal Buyer (Donor):** `sb-donor123@personal.example.com` / `Test@1234`
- **Business Vendor (Recipient):** `sb-vendor456@business.example.com` / `Test@5678`
- **Default Mode:** Active by default (`DEMO_MODE=true` in `.env.example`).
