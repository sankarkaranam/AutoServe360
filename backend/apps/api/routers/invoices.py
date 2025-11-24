
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.core.db import get_session
from apps.services.billing.models import Invoice, InvoiceItem
from apps.services.crm.models import Customer, Vehicle
from apps.core.security import get_current_user
import uuid
from decimal import Decimal
from typing import Optional
import datetime as dt

router = APIRouter(prefix="/invoices", tags=["invoices"])

# Request models
class InvoiceItemRequest(BaseModel):
    product_id: Optional[str] = None
    name: str
    qty: int
    rate: float
    tax_rate: float = 18.0

class CreateInvoiceRequest(BaseModel):
    customer_name: str
    mobile: Optional[str] = None
    email: Optional[str] = None
    vehicle_no: Optional[str] = None
    items: list[InvoiceItemRequest]
    status: str = "DUE"  # DUE, PAID, PARTIAL

# Response models
class InvoiceSummaryResponse(BaseModel):
    id: str
    customer: str
    date: str
    amount: float
    status: str  # DUE, PAID, PARTIAL

@router.post("", status_code=201, response_model=InvoiceSummaryResponse)
async def create_invoice(
    payload: CreateInvoiceRequest, 
    session: AsyncSession = Depends(get_session), 
    user=Depends(get_current_user)
):
    """Create a new invoice with line items, auto-creating customer if needed"""
    
    # Find or create customer
    customer_id = None
    if payload.customer_name:
        # Try to find existing customer by name and phone
        query = select(Customer).where(
            Customer.tenant_id == uuid.UUID(user.tenant_id),
            Customer.name == payload.customer_name
        )
        if payload.mobile:
            query = query.where(Customer.phone == payload.mobile)
        
        result = await session.execute(query)
        customer = result.scalar_one_or_none()
        
        if not customer:
            # Create new customer
            customer = Customer(
                id=uuid.uuid4(),
                tenant_id=uuid.UUID(user.tenant_id),
                name=payload.customer_name,
                phone=payload.mobile,
                email=payload.email
            )
            session.add(customer)
            await session.flush()  # Get the customer ID
        
        customer_id = customer.id
    
    # Find or create vehicle if provided
    vehicle_id = None
    if payload.vehicle_no and customer_id:
        result = await session.execute(
            select(Vehicle).where(
                Vehicle.tenant_id == uuid.UUID(user.tenant_id),
                Vehicle.vin == payload.vehicle_no
            )
        )
        vehicle = result.scalar_one_or_none()
        
        if not vehicle:
            # Create basic vehicle record
            vehicle = Vehicle(
                id=uuid.uuid4(),
                tenant_id=uuid.UUID(user.tenant_id),
                customer_id=customer_id,
                vin=payload.vehicle_no,
                active=True
            )
            session.add(vehicle)
            await session.flush()
        
        vehicle_id = vehicle.id
    
    # Generate invoice number
    timestamp = int(dt.datetime.utcnow().timestamp() * 1000)
    invoice_number = f"INV-{timestamp}"
    
    # Calculate total amount from items
    total_amount = Decimal("0.00")
    invoice_items = []
    
    for item in payload.items:
        # Calculate item amount: qty * rate * (1 + tax_rate/100)
        item_amount = Decimal(str(item.qty)) * Decimal(str(item.rate)) * (1 + Decimal(str(item.tax_rate)) / 100)
        total_amount += item_amount
        
        invoice_items.append({
            "product_id": item.product_id,
            "name": item.name,
            "qty": item.qty,
            "rate": item.rate,
            "tax_rate": item.tax_rate,
            "amount": float(item_amount)
        })
    
    # Map status
    db_status = "paid" if payload.status == "PAID" else "draft"
    
    # Create invoice
    invoice = Invoice(
        id=uuid.uuid4(),
        tenant_id=uuid.UUID(user.tenant_id),
        customer_id=customer_id,
        vehicle_id=vehicle_id,
        number=invoice_number,
        total_amount=float(total_amount),
        status=db_status
    )
    session.add(invoice)
    await session.flush()
    
    # Create invoice items
    for item_data in invoice_items:
        invoice_item = InvoiceItem(
            id=uuid.uuid4(),
            invoice_id=invoice.id,
            **item_data
        )
        # Convert product_id to UUID if present
        if invoice_item.product_id and isinstance(invoice_item.product_id, str):
            invoice_item.product_id = uuid.UUID(invoice_item.product_id)
        session.add(invoice_item)
    
    # Reduce inventory stock for items with product_id
    from apps.services.inventory.models import InventoryItem
    for item in payload.items:
        if item.product_id:
            # Find inventory item
            inv_query = select(InventoryItem).where(
                InventoryItem.id == uuid.UUID(item.product_id),
                InventoryItem.tenant_id == uuid.UUID(user.tenant_id)
            )
            result = await session.execute(inv_query)
            inv_item = result.scalar_one_or_none()
            
            if inv_item:
                # Reduce stock quantity
                inv_item.stock_quantity -= item.qty
                if inv_item.stock_quantity < 0:
                    inv_item.stock_quantity = 0
    
    await session.commit()
    
    # Validate customer name presence
    if not payload.customer_name:
        raise HTTPException(status_code=400, detail="Customer name is required")

    # Find or create customer (existing logic unchanged)
    # ... (existing code unchanged up to line 174)

    # Return response using stored customer name
    return InvoiceSummaryResponse(
        id=str(invoice.id),
        customer=customer.name if customer else "Walk-in Customer",
        date=invoice.issued_at.isoformat(),
        amount=float(total_amount),
        status=payload.status
    )

class InvoiceDetailResponse(InvoiceSummaryResponse):
    items: list[dict]
    vehicle_no: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None

@router.get("/{invoice_id}", response_model=InvoiceDetailResponse)
async def get_invoice(
    invoice_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user)
):
    """Get full details of a specific invoice"""
    try:
        # Fetch invoice with related data
        query = (
            select(Invoice, Customer, Vehicle)
            .outerjoin(Customer, Invoice.customer_id == Customer.id)
            .outerjoin(Vehicle, Invoice.vehicle_id == Vehicle.id)
            .where(
                Invoice.id == uuid.UUID(invoice_id),
                Invoice.tenant_id == uuid.UUID(user.tenant_id)
            )
        )
        result = await session.execute(query)
        row = result.first()
        
        if not row:
            raise HTTPException(status_code=404, detail="Invoice not found")
            
        invoice, customer, vehicle = row
        
        # Fetch items
        items_query = select(InvoiceItem).where(InvoiceItem.invoice_id == invoice.id)
        items_result = await session.execute(items_query)
        items = items_result.scalars().all()
        
        return InvoiceDetailResponse(
            id=str(invoice.id),
            customer=customer.name if customer else "Walk-in Customer",
            customer_email=customer.email if customer else None,
            customer_phone=customer.phone if customer else None,
            vehicle_no=vehicle.vin if vehicle else None,
            date=invoice.issued_at.isoformat() if invoice.issued_at else dt.datetime.utcnow().isoformat(),
            amount=float(invoice.total_amount),
            status="PAID" if invoice.status == "paid" else "PARTIAL" if invoice.status == "partial" else "DUE",
            items=[{
                "id": str(item.id),
                "name": item.name,
                "qty": item.qty,
                "rate": float(item.rate),
                "amount": float(item.amount)
            } for item in items]
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching invoice: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=list[InvoiceSummaryResponse])
async def list_invoices(
    limit: int = 20,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    session: AsyncSession = Depends(get_session), 
    user=Depends(get_current_user)
):
    """List invoices for the current tenant with optional date filtering"""
    try:
        query = (
            select(Invoice, Customer)
            .outerjoin(Customer, Invoice.customer_id == Customer.id)
            .where(Invoice.tenant_id == uuid.UUID(user.tenant_id))
        )

        if start_date:
            try:
                # Parse and convert to naive UTC
                start = dt.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                start = start.astimezone(dt.timezone.utc).replace(tzinfo=None)
                query = query.where(Invoice.issued_at >= start)
            except ValueError:
                pass # Ignore invalid dates

        if end_date:
            try:
                # Parse and convert to naive UTC
                end = dt.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                end = end.astimezone(dt.timezone.utc).replace(tzinfo=None)
                
                # Add one day to include the end date fully if it's just a date
                if 'T' not in end_date:
                     end = end + dt.timedelta(days=1)
                query = query.where(Invoice.issued_at <= end)
            except ValueError:
                pass

        query = query.order_by(Invoice.issued_at.desc()).limit(limit)

        result = await session.execute(query)
        
        invoices = []
        for invoice, customer in result.all():
            # Map status
            status = "PAID" if invoice.status == "paid" else "PARTIAL" if invoice.status == "partial" else "DUE"
            
            invoices.append(InvoiceSummaryResponse(
                id=str(invoice.id),  # Convert UUID to string
                customer=customer.name if customer else "Walk-in Customer",
                date=invoice.issued_at.isoformat() if invoice.issued_at else dt.datetime.utcnow().isoformat(),
                amount=float(invoice.total_amount),
                status=status
            ))
        
        return invoices
    except Exception as e:
        print(f"Error in list_invoices: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch invoices: {str(e)}")

@router.delete("/{invoice_id}", status_code=204)
async def delete_invoice(
    invoice_id: str,
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user)
):
    """Delete an invoice and its line items"""
    result = await session.execute(
        select(Invoice).where(
                Invoice.id == uuid.UUID(invoice_id),
                Invoice.tenant_id == uuid.UUID(user.tenant_id)
            )
    )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(404, "Invoice not found")
    
    await session.delete(invoice)
    await session.commit()
    
    return None
