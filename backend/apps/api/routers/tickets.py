from fastapi import APIRouter

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.get("/health")
async def health():
    return {"ok": True, "module": "tickets"} 
