from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from apps.core.db import async_session
from apps.core.security import require_roles
from apps.services.billing.models import SubscriptionPlan

router = APIRouter(prefix="/saas", tags=["saas-admin"])


class SubscriptionPlanIn(BaseModel):
    id: str  # basic, standard, premium
    name: str
    price: float
    features: str  # JSON string or comma-separated
    is_active: bool = True


@router.get("/plans", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def list_subscription_plans():
    """List all subscription plans"""
    async with async_session() as s:
        res = await s.execute(select(SubscriptionPlan).where(SubscriptionPlan.is_active == True))
        rows = res.scalars().all()
        return [{
            "id": p.id,
            "name": p.name,
            "price": float(p.price),
            "features": p.features,
            "is_active": p.is_active
        } for p in rows]


@router.post("/plans", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def create_subscription_plan(payload: SubscriptionPlanIn):
    """Create a new subscription plan"""
    async with async_session() as s:
        # Check if plan exists
        existing = await s.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == payload.id))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Plan ID already exists")
        
        plan = SubscriptionPlan(
            id=payload.id,
            name=payload.name,
            price=payload.price,
            features=payload.features,
            is_active=payload.is_active
        )
        s.add(plan)
        await s.commit()
        return {"ok": True, "plan_id": payload.id}


@router.put("/plans/{plan_id}", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def update_subscription_plan(plan_id: str, payload: SubscriptionPlanIn):
    """Update an existing subscription plan"""
    async with async_session() as s:
        res = await s.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id))
        plan = res.scalar_one_or_none()
        if not plan:
            raise HTTPException(404, "Plan not found")
        
        plan.name = payload.name
        plan.price = payload.price
        plan.features = payload.features
        plan.is_active = payload.is_active
        
        await s.commit()
        return {"ok": True}


@router.delete("/plans/{plan_id}", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def delete_subscription_plan(plan_id: str):
    """Delete a subscription plan (soft delete by setting is_active=False)"""
    async with async_session() as s:
        res = await s.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id))
        plan = res.scalar_one_or_none()
        if not plan:
            raise HTTPException(404, "Plan not found")
        
        plan.is_active = False
        await s.commit()
        return {"ok": True}
