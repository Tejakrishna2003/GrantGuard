import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    DEMO_MODE: bool = True

    DATABASE_URL: str = "sqlite:///./grantpool.db"

    PAYPAL_MODE: str = "sandbox"
    PAYPAL_CLIENT_ID: str = "sandbox_client_id_grantpool"
    PAYPAL_CLIENT_SECRET: str = "sandbox_client_secret_grantpool"
    PAYPAL_API_BASE: str = "https://api-m.sandbox.paypal.com"

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_VERIFY_SERVICE_SID: str = ""

    DEFAULT_TOLERANCE_PERCENT: float = 10.0
    CRISIS_TOLERANCE_PERCENT: float = 35.0

    class Config:
        env_file = [".env", "../.env"]
        extra = "allow"

settings = Settings()

# Root directory of backend
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
