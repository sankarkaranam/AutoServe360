# apps/api/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
# apps/api/routers/auth.py
# OLD
# from apps.core.security import create_jwt, verify_password

# NEW
from apps.core.security import create_access_token as create_jwt, verify_password


from apps.core.db import get_session
from apps.core.security import create_jwt, verify_password
from apps.services.auth.models import User  # your SQLAlchemy model
from apps.services.dealers.models import Tenant  # your tenant model

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginIn(BaseModel):
    tenant_id: str
    email: str
    password: str


@router.post("/login")
async def login(payload: LoginIn, session: AsyncSession = Depends(get_session)):
    # tenant must exist
    t = (await session.execute(select(Tenant).where(Tenant.code == payload.tenant_id))).scalar_one_or_none()
    if not t:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tenant")

    # user must exist within tenant (adjust your columns)
    u = (
        await session.execute(
            select(User).where(
                User.tenant_id == t.id,
                User.email == payload.email,
            )
        )
    ).scalar_one_or_none()

    if not u or not verify_password(payload.password, u.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_jwt(
        {
            "sub": str(u.id),
            "email": u.email,
            "role": u.role,          # 'saas_admin', 'dealer_admin', etc.
            "tenant_id": str(t.id),  # or t.code if you prefer
        }
    )

    return {"access_token": token, "token_type": "bearer"}
