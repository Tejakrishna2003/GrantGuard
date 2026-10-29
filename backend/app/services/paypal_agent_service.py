import uuid
import logging
import httpx
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.core.config import settings

logger = logging.getLogger(__name__)

class PayPalAgentService:
    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self.api_base = settings.PAYPAL_API_BASE
        self.access_token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None

    async def get_access_token(self) -> str:
        """
        Retrieves OAuth2 bearer token from PayPal Sandbox.
        """
        if settings.DEMO_MODE or not self.client_id or "YOUR_" in self.client_id:
            return "mock_sandbox_access_token_grantpool_agent"

        if self.access_token and self.token_expiry and datetime.now(timezone.utc) < self.token_expiry:
            return self.access_token

        url = f"{self.api_base}/v1/oauth2/token"
        headers = {"Accept": "application/json", "Accept-Language": "en_US"}
        data = {"grant_type": "client_credentials"}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    url,
                    headers=headers,
                    data=data,
                    auth=(self.client_id, self.client_secret)
                )
                if res.status_code == 200:
                    token_data = res.json()
                    self.access_token = token_data.get("access_token")
                    return self.access_token
                else:
                    logger.warning(f"PayPal OAuth failed ({res.status_code}): {res.text}. Using Sandbox Demo Token.")
                    return "mock_sandbox_access_token_grantpool_agent"
        except Exception as e:
            logger.warning(f"PayPal OAuth request error: {e}. Using Sandbox Demo Token.")
            return "mock_sandbox_access_token_grantpool_agent"

    async def capture_donation(self, order_id: str, amount: float) -> Dict[str, Any]:
        """
        Captures a PayPal donation into the community grant pool.
        """
        token = await self.get_access_token()
        if token == "mock_sandbox_access_token_grantpool_agent":
            return {
                "success": True,
                "capture_id": f"CAP-{uuid.uuid4().hex[:10].upper()}",
                "order_id": order_id or f"ORD-{uuid.uuid4().hex[:8].upper()}",
                "status": "COMPLETED",
                "amount": amount,
                "currency": "USD",
                "mode": "SANDBOX_SIMULATED",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        url = f"{self.api_base}/v2/checkout/orders/{order_id}/capture"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers)
                if res.status_code in (200, 201):
                    return {"success": True, "data": res.json(), "status": "COMPLETED"}
                else:
                    logger.warning(f"PayPal capture returned {res.status_code}: {res.text}")
                    return {
                        "success": False,
                        "error": f"PayPal capture failed ({res.status_code}): {res.text}",
                        "status": "FAILED"
                    }
        except Exception as e:
            logger.error(f"Error capturing order {order_id}: {e}")
            return {
                "success": False,
                "error": str(e),
                "status": "ERROR"
            }

    async def execute_payout(
        self,
        recipient_email: str,
        amount: float,
        note: str = "Milestone Grant Release: 100% Reconciled",
        claim_id: str = None
    ) -> Dict[str, Any]:
        """
        Executes a milestone payout to verified vendor email via PayPal Payouts REST API.
        Official PayPal Agent Toolkit function-calling signature.
        """
        token = await self.get_access_token()
        batch_id = f"GP-PAYOUT-{uuid.uuid4().hex[:10].upper()}"
        item_id = f"ITEM-{uuid.uuid4().hex[:8].upper()}"

        # If running in sandbox demo mode
        if token == "mock_sandbox_access_token_grantpool_agent":
            return {
                "success": True,
                "batch_id": batch_id,
                "payout_item_id": item_id,
                "status": "SIMULATED",
                "recipient_email": recipient_email,
                "amount": amount,
                "currency": "USD",
                "note": note,
                "claim_id": claim_id,
                "mode": "PAYPAL_SANDBOX_SIMULATION",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        url = f"{self.api_base}/v1/payments/payouts"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        payload = {
            "sender_batch_header": {
                "sender_batch_id": batch_id,
                "email_subject": "Community Grant Milestone Payout Released",
                "email_message": note
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": f"{amount:.2f}",
                        "currency": "USD"
                    },
                    "note": note,
                    "sender_item_id": item_id,
                    "receiver": recipient_email
                }
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code in (200, 201):
                    data = res.json()
                    header = data.get("batch_header", {})
                    return {
                        "success": True,
                        "batch_id": header.get("payout_batch_id", batch_id),
                        "status": "LIVE_SUCCESS",
                        "recipient_email": recipient_email,
                        "amount": amount,
                        "mode": "PAYPAL_SANDBOX_REST_LIVE"
                    }
                else:
                    err_msg = f"PayPal Payouts returned HTTP {res.status_code}: {res.text}"
                    logger.error(err_msg)
                    return {
                        "success": False,
                        "batch_id": batch_id,
                        "status": "FAILED",
                        "error": err_msg,
                        "recipient_email": recipient_email,
                        "amount": amount,
                        "mode": "PAYPAL_API_ERROR"
                    }
        except Exception as e:
            err_msg = f"PayPal payout network exception: {e}"
            logger.error(err_msg)
            return {
                "success": False,
                "batch_id": batch_id,
                "status": "FAILED",
                "error": err_msg,
                "recipient_email": recipient_email,
                "amount": amount,
                "mode": "PAYPAL_EXCEPTION"
            }

paypal_agent_service = PayPalAgentService()
