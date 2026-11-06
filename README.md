# GrantPool AI — Autonomous Anti-Diversion Escrow & Audited Ledger

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Tests: 6 Passed](https://img.shields.io/badge/Pytest-6%20Passed%20(100%25)-brightgreen.svg)](backend/tests/test_reconciliation.py)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-blue.svg)](backend/app/main.py)
[![Frontend: React + Vite](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61dafb.svg)](frontend/src/App.tsx)
[![Ledger: AG Grid](https://img.shields.io/badge/Data%20Ledger-AG%20Grid%20Community%20v31-red.svg)](frontend/src/components/AuditedLedgerGrid.tsx)
[![Payments: PayPal REST](https://img.shields.io/badge/Payment%20Rail-PayPal%20Orders%20%26%20Payouts-003087.svg)](backend/app/services/paypal_agent_service.py)

---

## 📌 Table of Contents
- [1. The Problem: The $40B "Middleman Black Box"](#1-the-problem-the-40b-middleman-black-box)
- [2. The Solution: 4-Way Cross-Reconciliation](#2-the-solution-4-way-cross-reconciliation)
- [3. 60-Second Quickstart for Evaluators](#3-60-second-quickstart-for-evaluators)
- [4. Automated Backend Test Suite](#4-automated-backend-test-suite)
- [5. Pre-Configured Test Credentials & Scenarios](#5-pre-configured-test-credentials--scenarios)
- [6. AG Grid Sponsor Showcase Features](#6-ag-grid-sponsor-showcase-features)
- [7. Complete Technical Architecture & Security Policies](#7-complete-technical-architecture--security-policies)
- [8. Repository Structure](#8-repository-structure)
- [9. Truthful Disclosure Statement](#9-truthful-disclosure-statement)
- [10. License](#10-license)

---

## 1. The Problem: The $40B "Middleman Black Box"

Over **$40 Billion** is contributed annually to emergency relief, mutual aid funds, and grassroots community grants. Yet donors and community organizers frequently struggle with the **Intermediary Overhead Trap**:
* Traditional crowdfunding platforms lump donated funds into a single personal bank account without milestone verification, spending restrictions, or delivery checks.
* An estimated **15% to 30% of donated capital** is lost to unverified contractor price inflation, phantom delivery invoices, and administrative cuts before reaching the ground.
* Small NGOs and mutual-aid groups cannot afford expensive third-party forensic accounting teams to audit every supplier invoice against real-world delivery.

---

## 2. The Solution: 4-Way Cross-Reconciliation

**GrantPool AI** is an autonomous financial escrow agent that ensures community grant capital only moves when delivery and fair market pricing are verified via **Dual-Factor Ground Truth (SMS OTP + Geotagged Proof)**:

```
[Community Donor]  ───(PayPal Donations SDK)───►  [GrantPool Capital Escrow]
                                                               │
[Contractor / Vendor] ── Uploads Invoice PDF ───┐             ▼
                                                 ├─►  [Autonomous Reconciler Agent]
[Beneficiary / Volunteer] ── Photo + SMS OTP ───┘     • Gemini 2.0 Flash Vision OCR
                                                       • UN WFP Market Benchmark Catalog
                                                       • Line-Item & Quantity Match Engine
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

## 3. 60-Second Quickstart for Evaluators

### System Requirements
* **Python:** 3.10, 3.11, or 3.12
* **Node.js:** 18+ (verified on Node 20 and Node 22)
* **OS:** Windows, macOS, or Linux

### Step 1: Clone the Repository
```bash
git clone https://github.com/Tejakrishna2003/GrantGuard.git
cd GrantGuard
cp .env.example .env
```
*(The repository is configured with `DEMO_MODE=true` by default—you do **not** need external API keys or phone numbers to evaluate the complete end-to-end flow!)*

### Step 2: Start Backend (Terminal 1)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment:
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
# .\venv\Scripts\activate.bat
# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed 3 realistic scenarios into SQLite
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
*Backend runs at: `http://localhost:8000` (Health check at `/health`, OpenAPI docs at `/docs`)*

### Step 3: Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 4. Automated Backend Test Suite

The repository includes a comprehensive, deterministic test suite covering core reconciliation invariants, anti-fraud enforcement, and payment integrity:

```bash
cd backend
pytest tests/ -v
```

### Verified Test Cases (6/6 Passing):
| Test Case | Verified Invariant |
|---|---|
| `test_clean_claim_approved_and_settled` | 100% matching invoices release autonomous payouts. |
| `test_inflated_price_and_missing_items_halted` | +56.3% WFP markup & missing blankets immediately halt payout and freeze $600. |
| `test_unverified_beneficiary_otp_holds_escrow` | Missing OTP keeps funds locked in escrow as `PENDING`. |
| `test_tolerance_hard_cap_prevents_client_bypass` | Server hard-clamps tolerance at 35% to prevent client manipulation. |
| `test_idempotent_reconciliation_no_duplicate_ledger` | Re-running reconciliation never creates duplicate transactions or payouts. |
| `test_truthful_payment_failure_reporting` | API failures report explicit `FAILED` status and are never masked as success. |

---

## 5. Pre-Configured Test Credentials & Scenarios

### PayPal Sandbox Test Accounts
| Account Type | Sandbox Email | Role |
|---|---|---|
| **Personal Buyer (Donor)** | `sb-donor123@personal.example.com` | Pledges donations into escrow pool |
| **Business Vendor (Recipient)** | `sb-vendor456@business.example.com` | Receives autonomous milestone payouts |

### 3 Pre-Seeded Scenarios (Click in Navbar to Execute)
1. **🔴 1. Fraud Catch (Hero Demo — Claim #CLM-FLOOD-01):**
   * *Project:* Flood Relief Emergency Food Distribution ($1,000 claimed).
   * *AI Findings:* Gemini parses invoice $\rightarrow$ WFP price check detects **56.3% price markup** on rice ($12.50 vs $8.00 median) $\rightarrow$ Beneficiary reports **25 blankets missing**.
   * *Outcome:* **HALT PAYOUT** $\rightarrow$ $600 frozen in escrow $\rightarrow$ Row turns red on AG Grid with full forensic explanation.
2. **🟢 2. Clean Pass (Claim #CLM-WATER-02):**
   * *Project:* Clean Water Well Drilling ($1,200 claimed).
   * *AI Findings:* Unit rates match WFP benchmarks; beneficiary confirms delivery with OTP and photo.
   * *Outcome:* **AUTO-APPROVED** $\rightarrow$ Milestone payout executed autonomously via PayPal Payouts REST API $\rightarrow$ Row flashes green on AG Grid (`100% RECONCILED`).
3. **🟡 3. Pending OTP (Claim #CLM-TECH-03):**
   * *Project:* School Digital Literacy Drive ($3,000 claimed).
   * *AI Findings:* Invoice extracted; awaiting field delivery OTP confirmation.
   * *Outcome:* **ESCROW HOLD** $\rightarrow$ Funds held in escrow until beneficiary signs off.

---

## 6. AG Grid Sponsor Showcase Features

Built using **AG Grid React Community (100% Open-Source & License-Free)**:
* **Custom Status Badge Renderers:** 🟢 `100% Reconciled`, 🟡 `Pending Beneficiary Proof`, 🔴 `Flagged Discrepancy`, 🔵 `Community Override`.
* **Live Cell Flash Animations (`enableCellChangeFlash: true`):** Updated financial cells flash with yellow/green/red glow transitions upon reconciliation.
* **Master-Detail Inspection Drawer:** Click `[Inspect]` on any row to open an expandable side drawer comparing invoice line items against the field delivery photo, Twilio OTP status, GPS coordinates, and WFP benchmark citations.
* **Responsive Column Fitting:** Automatically resizes columns on viewport changes with `sizeColumnsToFit()`.
* **Quick Filter & Status Filtering:** Instant search across grants, vendors, amounts, and transaction IDs.
* **Forensic CSV Export:** One-click auditor export via `GET /api/ledger/export/csv`.

---

## 7. Complete Technical Architecture & Security Policies

| Component | Technology | Role & Security Guardrail |
|---|---|---|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS | High-speed responsive UI |
| **Data Ledger** | **AG Grid React Community v31** | Forensic financial surveillance table |
| **Backend API** | FastAPI (Python 3.12) + SQLAlchemy + SQLite | High-performance asynchronous REST API |
| **AI Model** | Google Gemini 2.0 Flash Vision | Deterministic multimodal OCR (`temperature=0.0`, Pydantic JSON schema) |
| **Market Data** | UN World Food Programme (WFP) & HDX Catalog | Commodity median price index with source URLs (`benchmarks.json`) |
| **Payment Rail** | PayPal Sandbox (Orders & Payouts REST APIs) | Inbound pooling + automated milestone disbursement (Live & Simulated) |
| **Proof Gateway** | Twilio Verify API + Field Geotagging | Dual-Factor SMS OTP & on-site delivery confirmation |
| **Upload Security** | Server-side MIME & Size Validation | Restricts uploads to `.png, .jpg, .jpeg, .pdf, .webp` (max 10MB) |
| **Tolerance Clamp** | Server-side Hard Cap (35.0%) | Prevents client query parameters from bypassing anti-fraud rules |
| **Reset Guard** | Environment Restricted | `/api/system/reset` is locked strictly to `DEMO_MODE=true` |

---

## 8. Repository Structure

```
GrantGuard/
├── backend/
│   ├── app/
│   │   ├── api/               # FastAPI routers (claims, campaigns, donations, ledger, etc.)
│   │   ├── core/              # Config, settings, and benchmarks.json (WFP reference index)
│   │   ├── models/            # SQLAlchemy database models & Pydantic DTOs
│   │   └── services/          # Agent brain, Gemini vision, price validator, PayPal client
│   ├── tests/                 # Automated Pytest test suite (6 passing tests)
│   ├── requirements.txt       # Python dependencies (pinned)
│   └── seed.py                # Deterministic SQLite database seeder
├── frontend/
│   ├── src/
│   │   ├── components/        # AG Grid ledger, Master-Detail drawer, reasoning terminal, modals
│   │   ├── lib/               # Typed API client and TypeScript interface definitions
│   │   └── App.tsx            # Main dashboard controller
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite bundler configuration
├── docs/
│   ├── DEVPOST_NARRATIVE.md   # Official Devpost submission text
│   └── JUDGE_QUICKSTART.md    # 60-second judge evaluation guide
├── PROJECT_OVERVIEW.md        # Comprehensive technical architecture document
├── LICENSE                    # MIT License
└── render.yaml                # Cloud deployment blueprint
```

---

## 9. Truthful Disclosure Statement

* **Payment Rail:** In default demo mode, payouts simulate the PayPal Sandbox flow to allow zero-configuration evaluation. When configured with valid `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`, the system executes live calls against the PayPal Payouts REST API. The ledger explicitly distinguishes between `🟢 LIVE_SUCCESS` and `🔵 SIMULATED` batches.
* **Escrow Architecture:** GrantPool AI operates an **escrow-style programmatic release gate** managed via SQLite/SQLAlchemy. Funds remain locked in pool balances until milestone evidence passes all AI and beneficiary gates.
* **AI Model:** Gemini 2.0 Flash Vision parses invoice images. A deterministic fallback exists for offline and rate-limited environments to ensure demo reliability.
* **Benchmark Data:** Price references reflect United Nations World Food Programme (WFP) and Humanitarian Data Exchange (HDX) baseline surveys normalized to USD.

---

## 10. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
