from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, update, delete
from apps.core.db import async_session
from apps.core.security import require_roles, hash_password
from apps.services.dealers.models import Tenant
from apps.services.auth.models import User
import datetime as dt
from apps.services.features.service import initialize_features_for_tenant

router = APIRouter(prefix="/saas", tags=["saas-admin"])


class DealerCreateIn(BaseModel):
    tenant_id: str
    name: str
    plan: str = "standard"
    admin_email: EmailStr
    admin_password: str = "password"
    admin_name: str = "Dealer Admin"

class DealerUpdateIn(BaseModel):
    name: str | None = None
    plan: str | None = None
    status: str | None = None # active, suspended
    is_active: bool | None = None

@router.get("/dealers", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def list_dealers():
    async with async_session() as s:
        res = await s.execute(select(Tenant).order_by(Tenant.created_at.desc()))
        rows = res.scalars().all()
        return [{
            "tenant_id": t.id, 
            "name": t.name, 
            "plan": t.plan_id, 
            "status": t.status,
            "is_active": t.is_active,
            "created_at": t.created_at,
            "subscription_end": t.subscription_end
        } for t in rows]



import random
import string
from fastapi import BackgroundTasks
from apps.services.email.service import send_welcome_email
from apps.core.config import settings

def generate_tenant_id(name: str) -> str:
    # "Hero Motors" -> "hero-motors"
    slug = name.lower().strip().replace(" ", "-")
    # Add random suffix to ensure uniqueness
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"{slug}-{suffix}"

@router.post("/dealers", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def create_dealer(payload: DealerCreateIn, background_tasks: BackgroundTasks):
    async with async_session() as s:
        # Auto-generate tenant_id if not provided (or always override if we want to enforce it)
        # For now, let's assume payload.tenant_id might be empty or we overwrite it
        # The user asked to NOT set it manually.
        
        # Generate a unique ID
        new_tenant_id = generate_tenant_id(payload.name)
        
        # Check collision (unlikely with 4-char suffix but good practice)
        existing = await s.execute(select(Tenant).where(Tenant.id == new_tenant_id))
        if existing.scalar_one_or_none():
            # Retry once with new suffix
            new_tenant_id = generate_tenant_id(payload.name)

        # create tenant
        sub_end = dt.datetime.utcnow() + dt.timedelta(days=365)
        
        t = Tenant(
            id=new_tenant_id, 
            name=payload.name,
            plan_id=payload.plan, 
            status="active",
            is_active=True,
            subscription_start=dt.datetime.utcnow(),
            subscription_end=sub_end
        )
        s.add(t)
        
        # seed dealer admin
        u = User(
            tenant_id=new_tenant_id,
            email=payload.admin_email.lower(),
            username="dealer_admin",
            display_name=payload.admin_name,
            role="dealer_admin",
            password_hash=hash_password(payload.admin_password),
        )
        s.add(u)
        await s.commit()
        
        # Send Welcome Email via Background Task
        login_url = f"{settings.CORS_ORIGINS.split(',')[0] if ',' in str(settings.CORS_ORIGINS) else settings.CORS_ORIGINS}/login"
        background_tasks.add_task(
            send_welcome_email, 
            payload.admin_email, 
            payload.admin_name, 
            payload.admin_password,
            login_url
        )

        return {"ok": True, "tenant_id": new_tenant_id}

@router.put("/dealers/{tenant_id}", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def update_dealer(tenant_id: str, payload: DealerUpdateIn):
    async with async_session() as s:
        res = await s.execute(select(Tenant).where(Tenant.id == tenant_id))
        t = res.scalar_one_or_none()
        if not t:
            raise HTTPException(404, "Tenant not found")
        
        if payload.name is not None:
            t.name = payload.name
        if payload.plan is not None:
            # If plan changed, re-initialize features
            if t.plan_id != payload.plan:
                t.plan_id = payload.plan
                await initialize_features_for_tenant(s, t.id, payload.plan)
            else:
                t.plan_id = payload.plan
        if payload.status is not None:
            t.status = payload.status
        if payload.is_active is not None:
            t.is_active = payload.is_active
            
        await s.commit()
        return {"ok": True}

@router.delete("/dealers/{tenant_id}", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def delete_dealer(tenant_id: str):
    async with async_session() as s:
        # Cascade delete should handle users if configured, but let's be safe
        # SQLAlchemy cascade might not trigger if we just delete the tenant row via query
        # Better to fetch and delete object
        res = await s.execute(select(Tenant).where(Tenant.id == tenant_id))
        t = res.scalar_one_or_none()
        if not t:
            raise HTTPException(404, "Tenant not found")
        
        await s.delete(t)
        await s.commit()
        return {"ok": True}
