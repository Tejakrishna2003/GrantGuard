# GrantPool AI — Autonomous Anti-Diversion Escrow & Audited Ledger

> **Built for the PayPal AI Hackathon (Devpost)**  
> **Categories Targeted:** Best Use of Agentic Commerce ($5,000) / Most Impactful ($5,000) + Best Use of AG Grid - 1st Place ($5,000)  
> **Open Source License:** [MIT License](LICENSE) (Auto-detected in repository root)

---

## 💡 The Problem: The "Middleman Black Box" in Aid Distribution

Over **$40 Billion** is donated annually to disaster relief, mutual aid funds, and grassroots community grants. Yet donors and community organizers frequently struggle with the **Intermediary Overhead Trap**:
- Traditional crowdfunding platforms (GoFundMe, Kickstarter) lump donated funds into a single personal bank account without milestone verification or spending controls.
- Up to **15% to 30% of donated capital** is lost to unverified contractor price inflation, phantom delivery invoices, and unauthorized cuts before reaching the ground.

---

## 🚀 The Solution: 4-Way Cross-Reconciliation AI Agent

**GrantPool AI** is an autonomous financial escrow agent that ensures community grant capital only moves when delivery is cryptographically verified:

```
[Community Donor]  ───(PayPal Donations SDK)───►  [GrantPool Capital Escrow]
                                                              │
[Contractor / Vendor] ── Uploads Invoice PDF ───┐             ▼
                                                ├─►  [Autonomous Reconciler Agent]
[Beneficiary / Volunteer] ── Photo + SMS OTP ───┘     • Gemini 2.0 Flash Vision OCR
                                                      • UN WFP Market Benchmark Catalog
                                                      • Item Cross-Match Engine
                                                              │
                                     ┌────────────────────────┴───────────────────────┐
                              [Passed: 100% Match]                              [Discrepancy / Markup]
                                     │                                                   │
                      PayPal Agent Toolkit Payouts                               HALT Payout & Freeze Escrow
                                     │                                                   │
                                     └────────────────────────┬──────────────────────────┘
                                                              ▼
                                               [AG Grid Forensic Auditing Ledger]
                                       • 🟢 Reconciled | 🟡 Pending OTP | 🔴 Flagged Anomaly
                                       • Live Cell Flash Animations
                                       • Master-Detail Inspection Drawer (Side-by-Side Proof)
                                       • Live Agent Thought-Log Stream (SSE)
                                       • Human-in-the-Loop Dispute Override Modal
```

---

## ⚡ 60-Second Quickstart for Judges

### Prerequisites
- Python 3.10+
- Node.js 18+ (verified on Node 22+)

### Step 1: Clone & Configure
```bash
git clone https://github.com/YOUR_USERNAME/grantpool-agent.git
cd grantpool-agent
cp .env.example .env
```
*(The repository is configured with `DEMO_MODE=true` by default—you do **not** need to create external API keys or register phone numbers to evaluate the complete end-to-end flow!)*

### Step 2: Start Backend
```bash
cd backend
pip install -r requirements.txt
python seed.py       # Seeds 3 realistic scenarios into SQLite
uvicorn app.main:app --reload --port 8000
```

### Step 3: Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### Step 4: Open in Browser
Visit: **http://localhost:5173**

---

## 🔑 Pre-Configured PayPal Sandbox Test Credentials

To test simulated buyer donations and vendor disbursements:

| Account Type | Sandbox Email | Password | Role |
|---|---|---|---|
| **Personal Buyer** | `sb-donor123@personal.example.com` | `Test@1234` | Simulates donor contributions into pool |
| **Business Vendor** | `sb-vendor456@business.example.com` | `Test@5678` | Receives automated PayPal Payouts |

*API credentials can be configured in `.env` via `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`.*

---

## 🎬 3 Pre-Seeded Scenarios (Click to Test Instantly)

At the top of the application navbar, three quick-launcher buttons allow judges to execute real-time AI reconciliation loops:

1. **🔴 1. Fraud Catch (The Hero Demo — Claim #CLM-FLOOD-01):**
   - *Grant:* Flood Relief Emergency Food Distribution ($1,000 claimed).
   - *AI Detection:* Gemini Vision parses invoice $\rightarrow$ WFP price check detects **56.3% price markup** on rice ($12.50 vs $8.00 median) $\rightarrow$ Beneficiary confirms **25 blankets missing**.
   - *Result:* **HALT PAYOUT** $\rightarrow$ $600 frozen in escrow $\rightarrow$ Row turns red on AG Grid with full forensic explanation.
2. **🟢 2. Clean Pass (Claim #CLM-WATER-02):**
   - *Grant:* Clean Water Well Drilling ($1,200 claimed).
   - *AI Detection:* Prices match WFP benchmark; beneficiary confirms delivery with OTP and photo.
   - *Result:* **AUTO-APPROVED** $\rightarrow$ Milestone payout executed autonomously via PayPal Payouts REST API $\rightarrow$ Row flashes green on AG Grid (`100% RECONCILED`).
3. **🟡 3. Pending OTP (Claim #CLM-TECH-03):**
   - *Grant:* School Digital Literacy Drive ($3,000 claimed).
   - *AI Detection:* Awaiting on-site beneficiary confirmation.
   - *Result:* **ESCROW HOLD** $\rightarrow$ Funds held until field sign-off is submitted.

---

## 📊 AG Grid Sponsor Showcase Features

Built using **AG Grid React Community (100% Open-Source & License-Free)**:
- **Custom Status Badge Renderers:** 🟢 `100% Reconciled`, 🟡 `Pending Beneficiary Proof`, 🔴 `Flagged Discrepancy`, 🔵 `Community Override`.
- **Live Cell Flashing (`enableCellChangeFlash: true`):** Updated financial cells flash with yellow/green/red glow transitions upon reconciliation.
- **Master-Detail Inspection Drawer:** Click `[Inspect]` on any row to open an expandable side drawer showing invoice line items side-by-side with the beneficiary delivery photo, Twilio OTP status, and GPS coordinates.
- **Quick Filters & Status Search:** Real-time text filtering across grants, vendors, amounts, and transaction IDs.
- **Forensic CSV Export:** One-click auditor export via `GET /api/ledger/export/csv`.

---

## 🛠️ Complete Tech Stack

| Component | Technology | Role |
|---|---|---|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS | Modern high-speed client |
| **Data Ledger** | **AG Grid React Community** | Real-time audited financial surveillance dashboard |
| **Backend** | FastAPI (Python 3.12) + SQLAlchemy + SQLite | High-performance asynchronous API |
| **AI Model** | Google Gemini 2.0 Flash Vision | Deterministic multimodal OCR and structured line-item extraction |
| **Market Data** | UN World Food Programme (WFP) & HDX Catalog | Real-time commodity benchmark pricing |
| **Payment Rail** | PayPal Sandbox (Donations & Payouts REST APIs) | Inbound pooling + automated disbursement |
| **Proof Gateway** | Twilio Verify API + Instant Demo Bypass | Cryptographic OTP delivery confirmation |

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
