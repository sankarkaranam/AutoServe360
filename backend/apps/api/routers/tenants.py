from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from apps.core.db import async_session
from apps.core.security import require_roles, hash_password
from apps.services.dealers.models import Tenant
from apps.services.auth.models import User

router = APIRouter(prefix="/saas", tags=["saas-admin"])


class DealerCreateIn(BaseModel):
    tenant_id: str
    name: str
    plan: str = "PRO"
    admin_email: EmailStr
    admin_password: str = "password"
    admin_name: str = "Dealer Admin"


@router.get("/dealers", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def list_dealers():
    async with async_session() as s:
        res = await s.execute(select(Tenant))
        rows = res.scalars().all()
        return [{"tenant_id": t.id, "name": t.name, "plan": t.plan, "status": t.status} for t in rows]


@router.post("/dealers", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def create_dealer(payload: DealerCreateIn):
    async with async_session() as s:
        # create tenant
        t = Tenant(id=payload.tenant_id, name=payload.name,
                   plan=payload.plan, status="active")
        s.add(t)
        # seed dealer admin
        u = User(
            tenant_id=payload.tenant_id,
            email=payload.admin_email.lower(),
            username="dealer_admin",
            display_name=payload.admin_name,
            role="dealer_admin",
            password_hash=hash_password(payload.admin_password),
        )
        s.add(u)
        await s.commit()
        return {"ok": True, "tenant_id": payload.tenant_id}
