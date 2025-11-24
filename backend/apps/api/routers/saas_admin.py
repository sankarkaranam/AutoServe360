from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, func, and_, extract
from apps.core.db import async_session
from apps.core.security import require_roles, hash_password
from apps.services.dealers.models import Tenant
from apps.services.auth.models import User
from apps.services.billing.models import SubscriptionPlan
from apps.services.features.service import initialize_features_for_tenant
import datetime as dt
import random
import string
from typing import List

router = APIRouter(prefix="/v1/saas", tags=["saas-admin"])


# ============================================================================
# MODELS
# ============================================================================

class DealerCreateIn(BaseModel):
    name: str
    plan: str = "standard"
    admin_email: EmailStr
    admin_password: str = "password"
    admin_name: str = "Dealer Admin"


class DealerUpdateIn(BaseModel):
    name: str | None = None
    plan: str | None = None
    status: str | None = None
    is_active: bool | None = None


class AdminStats(BaseModel):
    total_dealers: int
    active_dealers: int
    inactive_dealers: int
    dealers_by_plan: dict[str, int]
    total_revenue: float
    monthly_revenue: float
    expiring_soon: int
    new_signups_this_month: int


class RevenueTrend(BaseModel):
    month: str
    revenue: float
    dealers: int


# ============================================================================
# REPORTS & STATISTICS
# ============================================================================

@router.get("/reports/stats", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def get_admin_stats() -> AdminStats:
    """Get comprehensive admin dashboard statistics"""
    async with async_session() as s:
        # Total dealers
        total_result = await s.execute(select(func.count(Tenant.id)))
        total_dealers = total_result.scalar() or 0
        
        # Active dealers
        active_result = await s.execute(
            select(func.count(Tenant.id)).where(
                and_(Tenant.is_active == True, Tenant.status == "active")
            )
        )
        active_dealers = active_result.scalar() or 0
        
        # Inactive dealers
        inactive_dealers = total_dealers - active_dealers
        
        # Dealers by plan
        plan_result = await s.execute(
            select(Tenant.plan_id, func.count(Tenant.id))
            .group_by(Tenant.plan_id)
        )
        dealers_by_plan = {row[0] or "none": row[1] for row in plan_result.all()}
        
        # Total revenue (sum of all plan prices * active dealers)
        # Get plan prices
        plans_result = await s.execute(select(SubscriptionPlan))
        plans = {p.id: float(p.price) for p in plans_result.scalars().all()}
        
        total_revenue = 0.0
        monthly_revenue = 0.0
        
        # Calculate revenue from active subscriptions
        tenants_result = await s.execute(
            select(Tenant).where(
                and_(Tenant.is_active == True, Tenant.status == "active")
            )
        )
        for tenant in tenants_result.scalars().all():
            if tenant.plan_id and tenant.plan_id in plans:
                plan_price = plans[tenant.plan_id]
                total_revenue += plan_price
                
                # If subscription started this month, add to monthly revenue
                if tenant.subscription_start:
                    now = dt.datetime.utcnow()
                    if (tenant.subscription_start.year == now.year and 
                        tenant.subscription_start.month == now.month):
                        monthly_revenue += plan_price
        
        # Expiring soon (next 30 days)
        thirty_days_from_now = dt.datetime.utcnow() + dt.timedelta(days=30)
        expiring_result = await s.execute(
            select(func.count(Tenant.id)).where(
                and_(
                    Tenant.is_active == True,
                    Tenant.subscription_end.isnot(None),
                    Tenant.subscription_end <= thirty_days_from_now,
                    Tenant.subscription_end >= dt.datetime.utcnow()
                )
            )
        )
        expiring_soon = expiring_result.scalar() or 0
        
        # New signups this month
        now = dt.datetime.utcnow()
        first_day_of_month = dt.datetime(now.year, now.month, 1)
        new_signups_result = await s.execute(
            select(func.count(Tenant.id)).where(
                Tenant.created_at >= first_day_of_month
            )
        )
        new_signups_this_month = new_signups_result.scalar() or 0
        
        return AdminStats(
            total_dealers=total_dealers,
            active_dealers=active_dealers,
            inactive_dealers=inactive_dealers,
            dealers_by_plan=dealers_by_plan,
            total_revenue=total_revenue,
            monthly_revenue=monthly_revenue,
            expiring_soon=expiring_soon,
            new_signups_this_month=new_signups_this_month
        )


@router.get("/reports/revenue-trend", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def get_revenue_trend(months: int = Query(default=6, ge=1, le=12)) -> List[RevenueTrend]:
    """Get revenue trend for the last N months"""
    async with async_session() as s:
        # Get plan prices
        plans_result = await s.execute(select(SubscriptionPlan))
        plans = {p.id: float(p.price) for p in plans_result.scalars().all()}
        
        # Calculate revenue for each month
        trends = []
        now = dt.datetime.utcnow()
        
        for i in range(months - 1, -1, -1):
            # Calculate the target month
            target_date = now - dt.timedelta(days=30 * i)
            month_start = dt.datetime(target_date.year, target_date.month, 1)
            
            # Get next month start
            if target_date.month == 12:
                month_end = dt.datetime(target_date.year + 1, 1, 1)
            else:
                month_end = dt.datetime(target_date.year, target_date.month + 1, 1)
            
            # Get dealers active in this month
            dealers_result = await s.execute(
                select(Tenant).where(
                    and_(
                        Tenant.subscription_start <= month_end,
                        (Tenant.subscription_end.is_(None) | (Tenant.subscription_end >= month_start))
                    )
                )
            )
            
            monthly_revenue = 0.0
            dealer_count = 0
            
            for tenant in dealers_result.scalars().all():
                if tenant.plan_id and tenant.plan_id in plans:
                    monthly_revenue += plans[tenant.plan_id]
                    dealer_count += 1
            
            trends.append(RevenueTrend(
                month=target_date.strftime("%b %Y"),
                revenue=monthly_revenue,
                dealers=dealer_count
            ))
        
        return trends


# ============================================================================
# DEALER MANAGEMENT
# ============================================================================

def generate_tenant_id(name: str) -> str:
    """Generate a unique tenant ID from dealer name"""
    slug = name.lower().strip().replace(" ", "-")
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"{slug}-{suffix}"


@router.get("/dealers", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def list_dealers():
    """List all dealers"""
    async with async_session() as s:
        res = await s.execute(select(Tenant).order_by(Tenant.created_at.desc()))
        rows = res.scalars().all()
        return [{
            "tenant_id": str(t.id),
            "name": t.name,
            "plan": t.plan_id,
            "status": t.status,
            "is_active": t.is_active,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "subscription_end": t.subscription_end.isoformat() if t.subscription_end else None
        } for t in rows]


@router.post("/dealers", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def create_dealer(payload: DealerCreateIn, background_tasks: BackgroundTasks):
    """Create a new dealer"""
    async with async_session() as s:
        # Generate unique tenant ID
        new_tenant_id = generate_tenant_id(payload.name)
        
        # Check collision
        existing = await s.execute(select(Tenant).where(Tenant.id == new_tenant_id))
        if existing.scalar_one_or_none():
            new_tenant_id = generate_tenant_id(payload.name)
        
        # Create tenant
        sub_end = dt.datetime.utcnow() + dt.timedelta(days=365)
        
        t = Tenant(
            id=new_tenant_id,
            name=payload.name,
            code=new_tenant_id,  # Use same as ID for now
            plan_id=payload.plan,
            status="active",
            is_active=True,
            subscription_start=dt.datetime.utcnow(),
            subscription_end=sub_end
        )
        s.add(t)
        
        # Create dealer admin user
        u = User(
            tenant_id=new_tenant_id,
            email=payload.admin_email.lower(),
            username="dealer_admin",
            display_name=payload.admin_name,
            role="dealer_admin",
            password_hash=hash_password(payload.admin_password),
        )
        s.add(u)
        
        # Initialize features for tenant
        await initialize_features_for_tenant(s, new_tenant_id, payload.plan)
        
        await s.commit()
        
        return {"ok": True, "tenant_id": new_tenant_id}


@router.put("/dealers/{tenant_id}", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def update_dealer(tenant_id: str, payload: DealerUpdateIn):
    """Update dealer information"""
    async with async_session() as s:
        res = await s.execute(select(Tenant).where(Tenant.id == tenant_id))
        t = res.scalar_one_or_none()
        if not t:
            raise HTTPException(404, "Tenant not found")
        
        if payload.name is not None:
            t.name = payload.name
        if payload.plan is not None:
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
    """Delete a dealer"""
    async with async_session() as s:
        res = await s.execute(select(Tenant).where(Tenant.id == tenant_id))
        t = res.scalar_one_or_none()
        if not t:
            raise HTTPException(404, "Tenant not found")
        
        await s.delete(t)
        await s.commit()
        return {"ok": True}


# ============================================================================
# SUBSCRIPTION PLANS
# ============================================================================

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


# ============================================================================
# FEATURE MANAGEMENT
# ============================================================================

@router.get("/features/tenant/{tenant_id}", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def get_tenant_features(tenant_id: str):
    """Get all features for a specific tenant"""
    from apps.services.features.service import get_tenant_features as get_features
    from apps.services.features.models import FEATURE_CODES
    import uuid
    
    async with async_session() as s:
        try:
            tenant_uuid = uuid.UUID(tenant_id)
            features = await get_features(s, tenant_uuid)
            
            return [{
                "id": f["feature_code"],
                "name": FEATURE_CODES.get(f["feature_code"], f["feature_code"]),
                "description": "",
                "enabled": f["is_enabled"]
            } for f in features]
        except ValueError:
            raise HTTPException(400, "Invalid tenant ID")


@router.post("/features/tenant/{tenant_id}/toggle", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def toggle_tenant_feature(tenant_id: str, feature_id: str = Query(...)):
    """Toggle a feature for a specific tenant"""
    from apps.services.features.service import toggle_feature
    import uuid
    
    async with async_session() as s:
        try:
            tenant_uuid = uuid.UUID(tenant_id)
            
            # Get current state
            features = await get_tenant_features(tenant_id)
            current_feature = next((f for f in features if f["id"] == feature_id), None)
            
            if current_feature is None:
                raise HTTPException(404, "Feature not found")
            
            # Toggle
            new_state = not current_feature["enabled"]
            await toggle_feature(s, tenant_uuid, feature_id, new_state)
            
            return {"ok": True, "enabled": new_state}
        except ValueError:
            raise HTTPException(400, "Invalid tenant ID")
