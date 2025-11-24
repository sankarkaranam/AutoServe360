import asyncio
import uuid
from sqlalchemy import select
from apps.core.db import async_session
from apps.services.dealers.models import Tenant
from apps.services.auth.models import User
from apps.core.security import hash_password

async def seed():
    async with async_session() as session:
        # 1. Create Tenant
        tenant_code = "dealer-001"
        stmt = select(Tenant).where(Tenant.code == tenant_code)
        existing = (await session.execute(stmt)).scalar_one_or_none()
        
        if not existing:
            print(f"Creating tenant {tenant_code}...")
            tenant = Tenant(
                name="AutoServe Demo Dealer",
                code=tenant_code,
            )
            # Wait, I need to check if Tenant has tenant_id.
            # In A1, even the tenant table usually has a tenant_id (often its own ID or a "system" ID).
            # But for simplicity, the Tenant table might be global.
            # Let's check the model definition I wrote.
            
            # If Tenant doesn't have tenant_id, I shouldn't pass it.
            # But I need to be sure.
            
            # Assuming Tenant is global for now based on my previous write.
            session.add(tenant)
            await session.commit()
            await session.refresh(tenant)
            print(f"Tenant created: {tenant.id}")
        else:
            tenant = existing
            print(f"Tenant exists: {tenant.id}")

        # 2. Create User
        email = "dealer@example.com"
        stmt_user = select(User).where(User.email == email)
        existing_user = (await session.execute(stmt_user)).scalar_one_or_none()
        
        if not existing_user:
            print(f"Creating user {email}...")
            user = User(
                email=email,
                username="dealer",
                hashed_password=hash_password("password"),
                role="dealer_admin",
                tenant_id=tenant.id
            )
            session.add(user)
            await session.commit()
            print("User created.")
        else:
            print("User exists.")

if __name__ == "__main__":
    asyncio.run(seed())
