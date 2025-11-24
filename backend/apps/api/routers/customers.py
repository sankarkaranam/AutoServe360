
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from apps.core.db import get_session
from apps.services.crm.models import Customer
from apps.core.security import get_current_user
import uuid
import datetime as dt

router = APIRouter(prefix="/customers", tags=["customers"])

class CustomerIn(BaseModel):
    tenant_id: str
    name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    dob: str | None = None

class CustomerOut(CustomerIn):
    id: str
    created_at: dt.datetime
    updated_at: dt.datetime

@router.get("", response_model=list[CustomerOut])
async def list_customers(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Customer).where(Customer.tenant_id==user.tenant_id).order_by(Customer.created_at.desc()))
    customers = res.scalars().all()
    
    return [
        CustomerOut(
            id=str(c.id),
            tenant_id=str(c.tenant_id),
            name=c.name,
            email=c.email,
            phone=c.phone,
            address=c.address,
            city=c.city,
            state=c.state,
            pincode=c.pincode,
            dob=c.dob.isoformat() if c.dob and hasattr(c.dob, 'isoformat') else (str(c.dob) if c.dob else None),
            created_at=c.created_at,
            updated_at=c.updated_at
        ) for c in customers
    ]

@router.post("", status_code=201)
async def create_customer(payload: CustomerIn, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    if payload.tenant_id != str(user.tenant_id):
        raise HTTPException(403, "Cross-tenant write forbidden")
    
    customer_data = payload.model_dump()
    if customer_data.get('dob'):
        customer_data['dob'] = dt.datetime.fromisoformat(customer_data['dob'])
    
    c = Customer(id=str(uuid.uuid4()), **customer_data)
    session.add(c)
    await session.commit()
    return {"ok": True, "id": c.id}

@router.get("/{customer_id}", response_model=CustomerOut)
async def get_customer(customer_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Customer).where(Customer.id==uuid.UUID(customer_id), Customer.tenant_id==user.tenant_id))
    obj = res.scalar_one_or_none()
    if not obj:
        raise HTTPException(404, "Not found")
    
    return CustomerOut(
        id=str(obj.id),
        tenant_id=str(obj.tenant_id),
        name=obj.name,
        email=obj.email,
        phone=obj.phone,
        address=obj.address,
        city=obj.city,
        state=obj.state,
        pincode=obj.pincode,
        dob=obj.dob.isoformat() if obj.dob and hasattr(obj.dob, 'isoformat') else (str(obj.dob) if obj.dob else None),
        created_at=obj.created_at,
        updated_at=obj.updated_at
    )

@router.put("/{customer_id}")
async def update_customer(customer_id: str, payload: CustomerIn, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Customer).where(Customer.id==uuid.UUID(customer_id), Customer.tenant_id==user.tenant_id))
    customer = res.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(404, "Customer not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get('dob'):
        update_data['dob'] = dt.datetime.fromisoformat(update_data['dob'])
    
    for key, value in update_data.items():
        if key != 'id' and key != 'tenant_id':
            setattr(customer, key, value)
    
    customer.updated_at = dt.datetime.utcnow()
    await session.commit()
    
    return {"ok": True}

@router.delete("/{customer_id}", status_code=204)
async def delete_customer(customer_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Customer).where(Customer.id==uuid.UUID(customer_id), Customer.tenant_id==user.tenant_id))
    customer = res.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(404, "Customer not found")
    
    await session.delete(customer)
    await session.commit()
    
    return None
