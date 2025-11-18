from fastapi import APIRouter

router = APIRouter(prefix="/campaigns", tags=["campaigns"])

@router.get("/health")
async def health():
    return {"ok": True, "module": "campaigns"} 
