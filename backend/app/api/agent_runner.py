from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.models.database import get_db, SessionLocal
from app.services.agent_brain import agent_brain

router = APIRouter(prefix="/api/agent", tags=["agent"])

@router.get("/stream/{claim_id}")
async def stream_agent_reconciliation(claim_id: str):
    """
    Server-Sent Events (SSE) endpoint.
    Streams the live 5-stage cognitive reasoning trace to the UI terminal.
    """
    db = SessionLocal()

    async def event_generator():
        try:
            async for sse_event in agent_brain.run_reconciliation(claim_id, db):
                yield sse_event
        finally:
            db.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
