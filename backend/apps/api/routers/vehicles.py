
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.core.db import get_session
from apps.services.crm.models import Vehicle
from apps.core.security import get_current_user
import uuid
import datetime as dt

from sqlalchemy.orm import joinedload

from apps.services.inventory.vehicle_models import VehicleInventory, VehicleStatus

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

class VehicleIn(BaseModel):
    tenant_id: str
    customer_id: str
    make: str | None = None
    model: str | None = None
    year: int | None = None
    vin: str | None = None
    van_number: str | None = None
    chassis_number: str | None = None
    purchase_date: dt.datetime | None = None

class VehicleOut(VehicleIn):
    id: str
    customer_name: str | None = None

class InventoryIn(BaseModel):
    tenant_id: str
    make: str
    model: str
    year: int
    color: str | None = None
    vin: str | None = None
    chassis_number: str | None = None
    cost_price: float | None = None
    selling_price: float | None = None
    status: str = "IN_STOCK"

@router.post("", status_code=201)
async def create_vehicle(payload: VehicleIn, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    if payload.tenant_id != str(user.tenant_id):
        pass 
    
    v = Vehicle(id=str(uuid.uuid4()), **payload.model_dump())
    session.add(v)
    await session.commit()
    return {"ok": True, "id": v.id}

@router.get("", response_model=list[VehicleOut])
async def list_vehicles(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    stmt = select(Vehicle).options(joinedload(Vehicle.customer)).where(Vehicle.tenant_id == user.tenant_id)
    res = await session.execute(stmt)
    vehicles = res.scalars().all()
    return [
        VehicleOut(
            id=str(v.id),
            tenant_id=str(v.tenant_id),
            customer_id=str(v.customer_id),
            make=v.make,
            model=v.model,
            year=v.year,
            vin=v.vin,
            van_number=v.van_number,
            chassis_number=v.chassis_number,
            purchase_date=v.purchase_date,
            customer_name=v.customer.name if v.customer else "Unknown"
        ) for v in vehicles
    ]

@router.post("/inventory", status_code=201)
async def create_inventory(payload: InventoryIn, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    if payload.tenant_id != str(user.tenant_id):
        pass

    inv = VehicleInventory(id=str(uuid.uuid4()), **payload.model_dump())
    session.add(inv)
    await session.commit()
    return {"ok": True, "id": inv.id}

@router.get("/inventory", response_model=list[InventoryIn])
async def list_inventory(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    res = await session.execute(select(VehicleInventory).where(VehicleInventory.tenant_id == user.tenant_id))
    return [
        InventoryIn(
            tenant_id=str(i.tenant_id),
            make=i.make,
            model=i.model,
            year=i.year,
            color=i.color,
            vin=i.vin,
            chassis_number=i.chassis_number,
            cost_price=i.cost_price,
            selling_price=i.selling_price,
            status=i.status
        ) for i in res.scalars().all()
    ]

class SellVehicleRequest(BaseModel):
    customer_id: str
    selling_price: float

@router.post("/inventory/{id}/sell", status_code=200)
async def sell_vehicle(id: str, payload: SellVehicleRequest, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    # Find inventory item
    res = await session.execute(select(VehicleInventory).where(VehicleInventory.id == uuid.UUID(id), VehicleInventory.tenant_id == user.tenant_id))
    inv = res.scalar_one_or_none()
    
    if not inv:
        raise HTTPException(404, "Vehicle not found in inventory")
        
    if inv.status == VehicleStatus.SOLD:
        raise HTTPException(400, "Vehicle already sold")
        
    # Update inventory status
    inv.status = VehicleStatus.SOLD
    inv.selling_price = payload.selling_price
    
    # Create Customer Vehicle record
    vehicle = Vehicle(
        id=str(uuid.uuid4()),
        tenant_id=user.tenant_id,
        customer_id=uuid.UUID(payload.customer_id),
        make=inv.make,
        model=inv.model,
        year=inv.year,
        vin=inv.vin,
        chassis_number=inv.chassis_number,
        purchase_date=dt.datetime.utcnow(),
        active=True
    )
    session.add(vehicle)
    await session.commit()
    
    return {"ok": True, "vehicle_id": vehicle.id}
