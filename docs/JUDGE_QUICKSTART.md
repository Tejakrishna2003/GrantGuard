# Judge Quickstart & Evaluator Guide (60 Seconds)

Welcome to **GrantPool AI**! This guide gives judges a frictionless testing experience.

---

## ⚡ 1-Minute Evaluation Instructions

### 1. Terminal 1 — Start Backend
```bash
cd backend
.\venv\Scripts\python seed.py
.\venv\Scripts\uvicorn app.main:app --port 8000
```
*Backend runs at: `http://localhost:8000` (Swagger docs at `/docs`)*

### 2. Terminal 2 — Start Frontend
```bash
cd frontend
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 🧪 What to Click & Test During Evaluation

### Test 1: The Live Hero Fraud Catch Demo
1. Look at the top navigation bar.
2. Click the red button: **`1. Fraud Catch (Hero)`**.
3. Watch the **Autonomous Cognitive Reasoning Stream** terminal:
   - Notice the agent running OCR on the invoice.
   - Watch the agent flag the **56.3% price markup** against WFP baselines.
   - Watch the agent detect that **25 blankets were never delivered**.
   - Watch the agent autonomously execute: **HALT DISBURSEMENT**.
4. Notice the **AG Grid Audited Ledger**:
   - The top row flashes red.
   - Status changes to `FLAGGED DISCREPANCY`.
   - Variance shows `-$600.00 (+56.3% Markup)`.
   - The **Capital Protected** KPI increments to `$600.00`.

### Test 2: The Clean Autonomous PayPal Payout
1. Click the green button: **`2. Clean Pass`**.
2. Watch the terminal stream pass all checks and autonomously fire the **PayPal Agent Toolkit Payouts API**.
3. The row on AG Grid flashes green with status `100% RECONCILED`.

### Test 3: Side-by-Side Proof Inspection (Master-Detail Drawer)
1. On any row in the AG Grid table, click the **`Inspect`** button.
2. An expandable inspection drawer slides out showing:
   - The AI Forensic Reconciler verdict.
   - The Gemini Vision line-item table.
   - The field delivery photo with GPS coordinates and Twilio OTP verification status.

### Test 4: Human-in-the-Loop Dispute Override
1. On the red flagged row, click **`Override`**.
2. Review the documented contractor justification.
3. Click **`Approve & Release via PayPal Payouts`** to demonstrate human governance over the autonomous agent.

---

## 🔑 Test Sandbox Credentials
- **Buyer Account (Donor):** `sb-donor123@personal.example.com` / `Test@1234`
- **Vendor Account (Payouts):** `sb-vendor456@business.example.com` / `Test@5678`
- **Demo Mode:** Active by default (`DEMO_MODE=true` in `.env.example`).
