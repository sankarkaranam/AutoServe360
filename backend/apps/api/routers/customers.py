
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.core.db import get_session
from apps.services.crm.models import Customer
from apps.core.security import get_current_user
import uuid

router = APIRouter(prefix="/customers", tags=["customers"])

class CustomerIn(BaseModel):
    tenant_id: str
    name: str
    email: str | None = None
    phone: str | None = None

@router.get("", response_model=list[CustomerIn])
async def list_customers(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Customer).where(Customer.tenant_id==user.tenant_id))
    return [CustomerIn(tenant_id=c.tenant_id, name=c.name, email=c.email, phone=c.phone) for c in res.scalars().all()]

@router.post("", status_code=201)
async def create_customer(payload: CustomerIn, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    if payload.tenant_id != user.tenant_id:
        raise HTTPException(403, "Cross-tenant write forbidden")
    c = Customer(id=str(uuid.uuid4()), **payload.model_dump())
    session.add(c)
    await session.commit()
    return {"ok": True, "id": c.id}

@router.get("/{customer_id}")
async def get_customer(customer_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Customer).where(Customer.id==customer_id, Customer.tenant_id==user.tenant_id))
    obj = res.scalar_one_or_none()
    if not obj:
        raise HTTPException(404, "Not found")
    return {"id": obj.id, "tenant_id": obj.tenant_id, "name": obj.name, "email": obj.email, "phone": obj.phone}
