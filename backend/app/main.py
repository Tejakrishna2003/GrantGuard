from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings, UPLOAD_DIR
from app.models.database import init_db
from app.api import campaigns, donations, claims, verification, agent_runner, ledger

# Initialize SQLite tables
init_db()

app = FastAPI(
    title="GrantPool AI - Autonomous Anti-Diversion Escrow API",
    description="Backend engine integrating PayPal Donations & Payouts, Gemini 2.0 Flash Vision, WFP Benchmarks, and AG Grid Ledger.",
    version="1.0.0"
)

# Configure CORS
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(campaigns.router)
app.include_router(donations.router)
app.include_router(claims.router)
app.include_router(verification.router)
app.include_router(agent_runner.router)
app.include_router(ledger.router)

# Mount Uploads directory for static invoice / proof image serving
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.get("/")
def root():
    return {
        "project": "GrantPool AI",
        "tagline": "Autonomous Anti-Diversion Escrow for Community Relief Funds",
        "status": "RUNNING",
        "demo_mode": settings.DEMO_MODE,
        "paypal_mode": settings.PAYPAL_MODE,
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
