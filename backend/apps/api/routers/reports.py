from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from apps.core.db import async_session
from apps.core.security import require_roles
from apps.services.dealers.models import Tenant
from apps.services.billing.models import Invoice, SubscriptionPlan
from apps.services.crm.models import Customer
import datetime as dt

router = APIRouter(prefix="/saas", tags=["saas-admin"])


@router.get("/reports/stats", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def get_admin_stats():
    """Get key metrics for SaaS admin dashboard"""
    async with async_session() as s:
        # Total dealers
        total_dealers = await s.scalar(select(func.count(Tenant.id)))
        
        # Active dealers
        active_dealers = await s.scalar(
            select(func.count(Tenant.id)).where(Tenant.is_active == True, Tenant.status == "active")
        )
        
        # Dealers by plan
        dealers_by_plan = await s.execute(
            select(Tenant.plan_id, func.count(Tenant.id))
            .group_by(Tenant.plan_id)
        )
        plan_distribution = {row[0] or "none": row[1] for row in dealers_by_plan}
        
        # Total revenue (sum of all invoices with status='paid')
        total_revenue = await s.scalar(
            select(func.sum(Invoice.total_amount)).where(Invoice.status == "paid")
        ) or 0
        
        # Revenue this month
        first_day_of_month = dt.datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_revenue = await s.scalar(
            select(func.sum(Invoice.total_amount))
            .where(Invoice.status == "paid", Invoice.issued_at >= first_day_of_month)
        ) or 0
        
        # Expiring soon (next 30 days)
        thirty_days_from_now = dt.datetime.utcnow() + dt.timedelta(days=30)
        expiring_soon = await s.scalar(
            select(func.count(Tenant.id))
            .where(
                Tenant.subscription_end.isnot(None),
                Tenant.subscription_end <= thirty_days_from_now,
                Tenant.subscription_end >= dt.datetime.utcnow()
            )
        ) or 0
        
        # New signups this month
        new_signups = await s.scalar(
            select(func.count(Tenant.id))
            .where(Tenant.created_at >= first_day_of_month)
        ) or 0
        
        return {
            "total_dealers": total_dealers,
            "active_dealers": active_dealers,
            "inactive_dealers": total_dealers - active_dealers,
            "dealers_by_plan": plan_distribution,
            "total_revenue": float(total_revenue),
            "monthly_revenue": float(monthly_revenue),
            "expiring_soon": expiring_soon,
            "new_signups_this_month": new_signups
        }


@router.get("/reports/revenue-trend", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def get_revenue_trend(months: int = 6):
    """Get revenue trend for the last N months"""
    async with async_session() as s:
        # Calculate revenue per month for the last N months
        result = []
        now = dt.datetime.utcnow()
        
        for i in range(months - 1, -1, -1):
            # Calculate first day of the month
            target_month = now - dt.timedelta(days=30 * i)
            first_day = target_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Calculate last day of the month
            if first_day.month == 12:
                last_day = first_day.replace(year=first_day.year + 1, month=1, day=1)
            else:
                last_day = first_day.replace(month=first_day.month + 1, day=1)
            
            # Get revenue for this month
            revenue = await s.scalar(
                select(func.sum(Invoice.total_amount))
                .where(
                    Invoice.status == "paid",
                    Invoice.issued_at >= first_day,
                    Invoice.issued_at < last_day
                )
            ) or 0
            
            result.append({
                "month": first_day.strftime("%b %Y"),
                "revenue": float(revenue)
            })
        
        return result


@router.get("/reports/dealers-expiring", dependencies=[Depends(require_roles("superadmin", "saas_admin"))])
async def get_expiring_dealers(days: int = 30):
    """Get list of dealers whose subscriptions are expiring soon"""
    async with async_session() as s:
        cutoff_date = dt.datetime.utcnow() + dt.timedelta(days=days)
        
        res = await s.execute(
            select(Tenant)
            .where(
                Tenant.subscription_end.isnot(None),
                Tenant.subscription_end <= cutoff_date,
                Tenant.subscription_end >= dt.datetime.utcnow()
            )
            .order_by(Tenant.subscription_end)
        )
        dealers = res.scalars().all()
        
        return [{
            "tenant_id": d.id,
            "name": d.name,
            "plan": d.plan_id,
            "subscription_end": d.subscription_end,
            "days_remaining": (d.subscription_end - dt.datetime.utcnow()).days if d.subscription_end else None
        } for d in dealers]
