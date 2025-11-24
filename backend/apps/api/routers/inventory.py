from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from apps.core.db import get_session
from apps.core.security import get_current_user
from apps.services.inventory.models import InventoryItem
from pydantic import BaseModel
import uuid
import shutil
import os
from typing import Optional

router = APIRouter(prefix="/inventory", tags=["inventory"])

class InventoryItemBase(BaseModel):
    name: str
    sku: str | None = None
    stock: int = 0
    price: float = 0.0
    image_url: str | None = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(InventoryItemBase):
    pass

class InventoryItemResponse(InventoryItemBase):
    id: str
    
    class Config:
        from_attributes = True

@router.get("", response_model=list[InventoryItemResponse])
async def list_inventory(
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user)
):
    """List inventory items for the current tenant"""
    try:
        result = await session.execute(
            select(InventoryItem)
            .where(InventoryItem.tenant_id == uuid.UUID(user.tenant_id))
            .order_by(InventoryItem.name)
        )
        items = result.scalars().all()
        
        return [
            InventoryItemResponse(
                id=str(item.id),
                name=item.name,
                sku=item.sku,
                stock=item.stock_quantity,
                price=float(item.price),
                image_url=item.image_url
            )
            for item in items
        ]
    except Exception as e:
        print(f"Error listing inventory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=InventoryItemResponse)
async def create_inventory_item(
    item: InventoryItemCreate,
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user)
):
    """Create a new inventory item"""
    try:
        new_item = InventoryItem(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(user.tenant_id),
            name=item.name,
            sku=item.sku,
            stock_quantity=item.stock,
            price=item.price,
            image_url=item.image_url
        )
        session.add(new_item)
        await session.commit()
        await session.refresh(new_item)
        
        return InventoryItemResponse(
            id=str(new_item.id),
            name=new_item.name,
            sku=new_item.sku,
            stock=new_item.stock_quantity,
            price=float(new_item.price),
            image_url=new_item.image_url
        )
    except Exception as e:
        print(f"Error creating inventory item: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: str,
    item_update: InventoryItemUpdate,
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user)
):
    """Update an inventory item"""
    try:
        result = await session.execute(
            select(InventoryItem)
            .where(InventoryItem.id == uuid.UUID(item_id))
            .where(InventoryItem.tenant_id == uuid.UUID(user.tenant_id))
        )
        item = result.scalar_one_or_none()
        
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
            
        item.name = item_update.name
        item.sku = item_update.sku
        item.stock_quantity = item_update.stock
        item.price = item_update.price
        item.image_url = item_update.image_url
        
        await session.commit()
        await session.refresh(item)
        
        return InventoryItemResponse(
            id=str(item.id),
            name=item.name,
            sku=item.sku,
            stock=item.stock_quantity,
            price=float(item.price),
            image_url=item.image_url
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating inventory item: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{item_id}")
async def delete_inventory_item(
    item_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user)
):
    """Delete an inventory item"""
    try:
        result = await session.execute(
            select(InventoryItem)
            .where(InventoryItem.id == uuid.UUID(item_id))
            .where(InventoryItem.tenant_id == uuid.UUID(user.tenant_id))
        )
        item = result.scalar_one_or_none()
        
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
            
        await session.delete(item)
        await session.commit()
        
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting inventory item: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_inventory_image(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    """Upload an image for an inventory item"""
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "static/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return the URL
        # Assuming the backend is served at the root or handled by proxy, 
        # but here we return the relative path which frontend can prepend with backend URL
        return {"url": f"/static/uploads/{filename}"}
    except Exception as e:
        print(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health():
    return {"ok": True, "module": "inventory"}
