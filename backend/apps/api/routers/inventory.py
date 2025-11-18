from fastapi import APIRouter

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/health")
async def health():
    return {"ok": True, "module": "inventory"} 
