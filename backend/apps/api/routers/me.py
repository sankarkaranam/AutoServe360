# apps/api/routers/me.py
from fastapi import APIRouter, Depends
from apps.core.security import get_current_user

router = APIRouter(prefix="/api/me", tags=["me"])


@router.get("")
async def read_me(user=Depends(get_current_user)):
    return {"user": user}
