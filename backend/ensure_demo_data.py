import asyncio
from sqlalchemy import select
from apps.core.db import async_session
from apps.services.dealers.models import Tenant
from apps.services.auth.models import User
from apps.core.security import hash_password

async def main():
    async with async_session() as session:
        # 1. Check Tenant
        stmt = select(Tenant).where(Tenant.code == "dealer-001")
        result = await session.execute(stmt)
        tenant = result.scalar_one_or_none()
        
        if not tenant:
            print("Creating tenant 'dealer-001'...")
            tenant = Tenant(name="Demo Dealer", code="dealer-001")
            session.add(tenant)
            await session.commit()
            await session.refresh(tenant)
        else:
            print("Tenant 'dealer-001' exists.")
            
        # 2. Check User
        stmt_user = select(User).where(User.email == "dealer@example.com")
        result_user = await session.execute(stmt_user)
        user = result_user.scalar_one_or_none()
        
        if not user:
            print("Creating user 'dealer@example.com'...")
            hashed = hash_password("password")
            user = User(
                tenant_id=tenant.id,
                email="dealer@example.com",
                hashed_password=hashed,
                role="dealer_admin",
                username="Demo User"
            )
            session.add(user)
            await session.commit()
            print("User created.")
        else:
            print("User 'dealer@example.com' exists.")

if __name__ == "__main__":
    asyncio.run(main())
