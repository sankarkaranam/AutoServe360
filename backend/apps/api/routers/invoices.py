
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.core.db import get_session
from apps.services.billing.models import Invoice
from apps.core.security import get_current_user
import uuid
from decimal import Decimal

router = APIRouter(prefix="/invoices", tags=["invoices"])

class InvoiceIn(BaseModel):
    tenant_id: str
    customer_id: str | None = None
    vehicle_id: str | None = None
    number: str
    total_amount: Decimal = Decimal("0.00")
    status: str = "draft"

@router.post("", status_code=201)
async def create_invoice(payload: InvoiceIn, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    if payload.tenant_id != user.tenant_id:
        raise HTTPException(403, "Cross-tenant write forbidden")
    i = Invoice(id=str(uuid.uuid4()), **payload.model_dump())
    session.add(i)
    await session.commit()
    return {"ok": True, "id": i.id}

@router.get("", response_model=list[InvoiceIn])
async def list_invoices(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Invoice).where(Invoice.tenant_id==user.tenant_id))
    items = []
    for o in res.scalars().all():
        items.append(InvoiceIn(tenant_id=o.tenant_id, customer_id=o.customer_id, vehicle_id=o.vehicle_id, number=o.number, total_amount=o.total_amount, status=o.status))
    return items
