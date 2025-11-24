"""
Seed subscription plans for the SaaS platform
"""
import asyncio
from apps.core.db import async_session
from apps.services.billing.models import SubscriptionPlan
from sqlalchemy import select

async def seed_subscription_plans():
    """Create default subscription plans"""
    
    plans = [
        {
            "id": "basic",
            "name": "Basic",
            "price": 999.00,
            "features": "CRM & Lead Management, Up to 100 customers, Basic Inventory, Email Support",
            "is_active": True
        },
        {
            "id": "standard",
            "name": "Standard",
            "price": 2999.00,
            "features": "Everything in Basic, Unlimited customers, POS System, Service Reminders, WhatsApp Integration, Priority Support",
            "is_active": True
        },
        {
            "id": "premium",
            "name": "Premium",
            "price": 5999.00,
            "features": "Everything in Standard, Advanced Reports & Analytics, AI-Powered Tools, Custom Branding, API Access, Dedicated Support",
            "is_active": True
        },
        {
            "id": "enterprise",
            "name": "Enterprise",
            "price": 0.00,  # Custom pricing
            "features": "Everything in Premium, Unlimited everything, Custom Features, On-premise option, 24/7 Support, Custom Pricing",
            "is_active": True
        }
    ]
    
    async with async_session() as s:
        for plan_data in plans:
            # Check if plan already exists
            existing = await s.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.id == plan_data["id"])
            )
            if existing.scalar_one_or_none():
                print(f"✓ Plan '{plan_data['name']}' already exists, skipping...")
                continue
            
            plan = SubscriptionPlan(**plan_data)
            s.add(plan)
            print(f"✓ Created plan: {plan_data['name']} - ₹{plan_data['price']}/month")
        
        await s.commit()
        print("\n✅ Subscription plans seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_subscription_plans())
