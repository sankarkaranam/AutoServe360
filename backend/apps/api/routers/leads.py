from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.core.db import get_session
from apps.services.crm.models import Lead, LeadStatus, LeadSource, Customer
from apps.core.security import get_current_user
import uuid
import datetime as dt

router = APIRouter(prefix="/leads", tags=["leads"])

class LeadIn(BaseModel):
    tenant_id: str
    name: str
    phone: str | None = None
    email: str | None = None
    source: str = "WALK_IN"
    status: str = "NEW"
    vehicle_of_interest: str | None = None
    notes: str | None = None
    follow_up_date: dt.datetime | None = None
    assigned_to: str | None = None

class LeadOut(LeadIn):
    id: str
    converted_at: dt.datetime | None = None
    created_at: dt.datetime
    updated_at: dt.datetime

class ConvertLeadRequest(BaseModel):
    customer_name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    dob: str | None = None

@router.post("", status_code=201)
async def create_lead(payload: LeadIn, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    if payload.tenant_id != str(user.tenant_id):
        raise HTTPException(403, "Cross-tenant write forbidden")
    
    lead = Lead(id=str(uuid.uuid4()), **payload.model_dump())
    session.add(lead)
    await session.commit()
    return {"ok": True, "id": lead.id}

@router.get("", response_model=list[LeadOut])
async def list_leads(
    status: str | None = None,
    source: str | None = None,
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user)
):
    query = select(Lead).where(Lead.tenant_id == user.tenant_id)
    
    if status:
        query = query.where(Lead.status == status)
    if source:
        query = query.where(Lead.source == source)
    
    query = query.order_by(Lead.created_at.desc())
    
    res = await session.execute(query)
    leads = res.scalars().all()
    
    return [
        LeadOut(
            id=str(l.id),
            tenant_id=str(l.tenant_id),
            name=l.name,
            phone=l.phone,
            email=l.email,
            source=l.source,
            status=l.status,
            vehicle_of_interest=l.vehicle_of_interest,
            notes=l.notes,
            follow_up_date=l.follow_up_date,
            assigned_to=l.assigned_to,
            converted_at=l.converted_at,
            created_at=l.created_at,
            updated_at=l.updated_at
        ) for l in leads
    ]

@router.get("/{lead_id}", response_model=LeadOut)
async def get_lead(lead_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Lead).where(Lead.id == uuid.UUID(lead_id), Lead.tenant_id == user.tenant_id))
    lead = res.scalar_one_or_none()
    
    if not lead:
        raise HTTPException(404, "Lead not found")
    
    return LeadOut(
        id=str(lead.id),
        tenant_id=str(lead.tenant_id),
        name=lead.name,
        phone=lead.phone,
        email=lead.email,
        source=lead.source,
        status=lead.status,
        vehicle_of_interest=lead.vehicle_of_interest,
        notes=lead.notes,
        follow_up_date=lead.follow_up_date,
        assigned_to=lead.assigned_to,
        converted_at=lead.converted_at,
        created_at=lead.created_at,
        updated_at=lead.updated_at
    )

@router.put("/{lead_id}")
async def update_lead(lead_id: str, payload: LeadIn, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Lead).where(Lead.id == uuid.UUID(lead_id), Lead.tenant_id == user.tenant_id))
    lead = res.scalar_one_or_none()
    
    if not lead:
        raise HTTPException(404, "Lead not found")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        if key != 'id' and key != 'tenant_id':
            setattr(lead, key, value)
    
    lead.updated_at = dt.datetime.utcnow()
    await session.commit()
    
    return {"ok": True}

@router.post("/{lead_id}/convert")
async def convert_lead(
    lead_id: str,
    payload: ConvertLeadRequest,
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user)
):
    # Get the lead
    res = await session.execute(select(Lead).where(Lead.id == uuid.UUID(lead_id), Lead.tenant_id == user.tenant_id))
    lead = res.scalar_one_or_none()
    
    if not lead:
        raise HTTPException(404, "Lead not found")
    
    if lead.status == LeadStatus.CONVERTED:
        raise HTTPException(400, "Lead already converted")
    
    # Create customer
    customer_id = str(uuid.uuid4())
    customer = Customer(
        id=customer_id,
        tenant_id=user.tenant_id,
        lead_id=uuid.UUID(lead_id),
        name=payload.customer_name,
        email=payload.email or lead.email,
        phone=payload.phone or lead.phone,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
        dob=dt.datetime.fromisoformat(payload.dob) if payload.dob else None
    )
    
    # Update lead status
    lead.status = LeadStatus.CONVERTED
    lead.converted_at = dt.datetime.utcnow()
    
    session.add(customer)
    await session.commit()
    
    return {"ok": True, "customer_id": customer_id}

@router.delete("/{lead_id}", status_code=204)
async def delete_lead(lead_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Lead).where(Lead.id == uuid.UUID(lead_id), Lead.tenant_id == user.tenant_id))
    lead = res.scalar_one_or_none()
    
    if not lead:
        raise HTTPException(404, "Lead not found")
    
    await session.delete(lead)
    await session.commit()
    
    return None
