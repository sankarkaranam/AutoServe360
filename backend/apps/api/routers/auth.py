from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.core.db import get_session
from apps.core.security import create_access_token, verify_password
from apps.services.auth.models import User
from apps.services.dealers.models import Tenant
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

class TokenOut(BaseModel):
    access_token: str
    token_type: str

class LoginIn(BaseModel):
    identifier: str | None = None
    tenant_code: str | None = None
    email: str | None = None
    password: str

@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn, session: AsyncSession = Depends(get_session)):
    # Resolve identifier (email or tenant_code)
    identifier = payload.identifier
    if not identifier:
        if payload.email:
            identifier = payload.email
        elif payload.tenant_code:
            identifier = payload.tenant_code
    if not identifier:
        raise HTTPException(status_code=400, detail="Missing identifier (email or tenant_code)")

    user = None
    tenant = None

    # Strategy 1: treat identifier as email
    if "@" in identifier:
        stmt = select(User).where(User.email == identifier.lower())
        result = await session.execute(stmt)
        user = result.scalars().first()
        if user:
            stmt_tenant = select(Tenant).where(Tenant.id == user.tenant_id)
            tenant_res = await session.execute(stmt_tenant)
            tenant = tenant_res.scalar_one_or_none()

    # Strategy 2: treat identifier as tenant code
    if not user:
        stmt = select(Tenant).where(Tenant.code == identifier)
        result = await session.execute(stmt)
        tenant = result.scalar_one_or_none()
        if not tenant:
            try:
                stmt = select(Tenant).where(Tenant.id == uuid.UUID(identifier))
                result = await session.execute(stmt)
                tenant = result.scalar_one_or_none()
            except Exception:
                pass
        if tenant:
            stmt_user = select(User).where(User.tenant_id == tenant.id, User.role == "dealer_admin")
            user_res = await session.execute(stmt_user)
            user = user_res.scalars().first()

    # Verify credentials
    if not user or not tenant or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Generate JWT token
    token = create_access_token(
        sub=str(user.id),
        tenant_id=str(tenant.id),
        role=user.role,
        email=user.email,
    )

    return {"access_token": token, "token_type": "bearer"}
