
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.core.db import get_session
from apps.services.crm.models import Vehicle
from apps.core.security import get_current_user
import uuid

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

class VehicleIn(BaseModel):
    tenant_id: str
    customer_id: str
    make: str | None = None
    model: str | None = None
    year: int | None = None
    vin: str | None = None

@router.post("", status_code=201)
async def create_vehicle(payload: VehicleIn, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    if payload.tenant_id != user.tenant_id:
        raise HTTPException(403, "Cross-tenant write forbidden")
    v = Vehicle(id=str(uuid.uuid4()), **payload.model_dump())
    session.add(v)
    await session.commit()
    return {"ok": True, "id": v.id}

@router.get("", response_model=list[VehicleIn])
async def list_vehicles(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(Vehicle).where(Vehicle.tenant_id==user.tenant_id))
    return [VehicleIn(tenant_id=o.tenant_id, customer_id=o.customer_id, make=o.make, model=o.model, year=o.year, vin=o.vin) for o in res.scalars().all()]
