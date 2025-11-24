"""Initialize features for existing dealers"""
import asyncio
from apps.core.db import async_session
from apps.services.features.service import initialize_features_for_tenant
from apps.services.dealers.models import Tenant
from sqlalchemy import select

async def main():
    async with async_session() as session:
        # Get all dealers
        result = await session.execute(select(Tenant))
        dealers = result.scalars().all()
        
        print(f"Initializing features for {len(dealers)} dealers...\n")
        
        for dealer in dealers:
            print(f"  • {dealer.name} ({dealer.plan_id})")
            await initialize_features_for_tenant(
                session,
                dealer.id,
                dealer.plan_id or 'enterprise'
            )
        
        print(f"\n✅ Features initialized successfully!")
        print(f"   All dealers now have access to their plan features")

if __name__ == "__main__":
    asyncio.run(main())
