from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from apps.core.db import get_session
from apps.core.security import get_current_user
from apps.services.billing.models import Invoice
from apps.services.crm.models import Customer
from apps.services.inventory.models import InventoryItem
from pydantic import BaseModel
import datetime as dt
from typing import List

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

class DashboardStats(BaseModel):
    today_sales: float
    new_leads: int
    pending_payments: float
    sales_overview: List[dict]  # Last 7 days
    recent_activity: List[dict]
    top_products: List[dict]
    low_stock_items: List[dict]

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user)
):
    """Get dashboard statistics for the current tenant"""
    
    # Today's sales (sum of paid invoices from today)
    today_start = dt.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_sales_query = select(func.sum(Invoice.total_amount)).where(
        Invoice.tenant_id == user.tenant_id,
        Invoice.status == 'paid',
        Invoice.issued_at >= today_start
    )
    today_sales_result = await session.execute(today_sales_query)
    today_sales = float(today_sales_result.scalar() or 0)
    
    # New leads (customers created in last 30 days)
    thirty_days_ago = dt.datetime.utcnow() - dt.timedelta(days=30)
    new_leads_query = select(func.count(Customer.id)).where(
        Customer.tenant_id == user.tenant_id,
        Customer.created_at >= thirty_days_ago
    )
    new_leads_result = await session.execute(new_leads_query)
    new_leads = int(new_leads_result.scalar() or 0)
    
    # Pending payments (sum of unpaid/partial invoices)
    pending_query = select(func.sum(Invoice.total_amount)).where(
        Invoice.tenant_id == user.tenant_id,
        Invoice.status.in_(['draft', 'partial'])
    )
    pending_result = await session.execute(pending_query)
    pending_payments = float(pending_result.scalar() or 0)
    
    # Sales overview (last 7 days)
    sales_overview = []
    for i in range(6, -1, -1):
        day_start = (dt.datetime.utcnow() - dt.timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + dt.timedelta(days=1)
        
        day_sales_query = select(func.sum(Invoice.total_amount)).where(
            Invoice.tenant_id == user.tenant_id,
            Invoice.status == 'paid',
            Invoice.issued_at >= day_start,
            Invoice.issued_at < day_end
        )
        day_sales_result = await session.execute(day_sales_query)
        day_sales = float(day_sales_result.scalar() or 0)
        
        sales_overview.append({
            'date': day_start.strftime('%a'),  # Mon, Tue, etc.
            'amount': day_sales
        })
    
    # Recent activity (last 10 invoices)
    recent_invoices_query = (
        select(Invoice, Customer)
        .outerjoin(Customer, Invoice.customer_id == Customer.id)
        .where(Invoice.tenant_id == user.tenant_id)
        .order_by(Invoice.issued_at.desc())
        .limit(10)
    )
    recent_invoices_result = await session.execute(recent_invoices_query)
    recent_activity = []
    
    for invoice, customer in recent_invoices_result.all():
        activity_type = "payment" if invoice.status == "paid" else "invoice"
        recent_activity.append({
            'type': activity_type,
            'description': f"{'Payment processed' if activity_type == 'payment' else 'Invoice created'} for {customer.name if customer else 'Unknown'}",
            'amount': float(invoice.total_amount),
            'time': invoice.issued_at.isoformat() if invoice.issued_at else dt.datetime.utcnow().isoformat()
        })
    
    # Top products (most sold items from invoice_items)
    # For now, return empty as we need to join with invoice_items
    top_products = []
    
    # Low stock items (inventory below 10 units)
    low_stock_query = (
        select(InventoryItem)
        .where(
            InventoryItem.tenant_id == user.tenant_id,
            InventoryItem.stock_quantity < 10
        )
        .limit(5)
    )
    low_stock_result = await session.execute(low_stock_query)
    low_stock_items = []
    
    for item in low_stock_result.scalars().all():
        low_stock_items.append({
            'name': item.name,
            'stock': item.stock_quantity,
            'sku': item.sku or 'N/A'
        })
    
    return DashboardStats(
        today_sales=today_sales,
        new_leads=new_leads,
        pending_payments=pending_payments,
        sales_overview=sales_overview,
        recent_activity=recent_activity,
        top_products=top_products,
        low_stock_items=low_stock_items
    )
