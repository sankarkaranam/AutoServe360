"""
Script to create a test user and generate a JWT token for development.
This token can be used in the frontend localStorage for authentication.
"""
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import uuid

# Import models and security functions
sys.path.insert(0, '/Users/sankarkaranam/Documents/Projects/GrowthQ/AutoServe360/backend')
from apps.services.auth.models import User, Tenant
from apps.core.security import hash_password, create_access_token

async def create_test_user_and_token():
    """Create a test user and generate JWT token"""
    db_url = "postgresql+asyncpg://postgres:postgres@localhost:5433/autoserve360"
    
    try:
        engine = create_async_engine(db_url)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            # Check if tenant exists
            result = await session.execute(
                select(Tenant).where(Tenant.id == uuid.UUID('737efdd5-db2f-481b-8fc1-51d74de5cae1'))
            )
            tenant = result.scalar_one_or_none()
            
            if not tenant:
                print("Creating test tenant...")
                tenant = Tenant(
                    id=uuid.UUID('737efdd5-db2f-481b-8fc1-51d74de5cae1'),
                    name='Test Garage',
                    active=True
                )
                session.add(tenant)
                await session.commit()
                print(f"✓ Created tenant: {tenant.name} ({tenant.id})")
            else:
                print(f"✓ Tenant exists: {tenant.name} ({tenant.id})")
            
            # Check if user exists
            result = await session.execute(
                select(User).where(User.email == 'admin@test.com')
            )
            user = result.scalar_one_or_none()
            
            if not user:
                print("\nCreating test user...")
                user = User(
                    id=uuid.uuid4(),
                    tenant_id=tenant.id,
                    email='admin@test.com',
                    hashed_password=hash_password('admin123'),
                    role='admin',
                    active=True
                )
                session.add(user)
                await session.commit()
                print(f"✓ Created user: {user.email}")
                print(f"  Password: admin123")
            else:
                print(f"\n✓ User exists: {user.email}")
            
            # Generate JWT token
            token = create_access_token(
                sub=str(user.id),
                tenant_id=str(user.tenant_id),
                role=user.role,
                email=user.email,
                expires_minutes=60 * 24 * 7  # 7 days
            )
            
            print(f"\n{'='*80}")
            print("JWT TOKEN FOR DEVELOPMENT:")
            print(f"{'='*80}")
            print(token)
            print(f"{'='*80}")
            print("\nTo use this token in your frontend:")
            print("1. Open browser console on http://localhost:3000")
            print("2. Run: localStorage.setItem('as360_token', 'YOUR_TOKEN_HERE')")
            print(f"3. Run: localStorage.setItem('as360_tenant', '{tenant.id}')")
            print("4. Refresh the page")
            print(f"{'='*80}\n")
            
            # Also save to a file
            with open('/Users/sankarkaranam/Documents/Projects/GrowthQ/AutoServe360/backend/dev_token.txt', 'w') as f:
                f.write(f"TOKEN={token}\n")
                f.write(f"TENANT_ID={tenant.id}\n")
                f.write(f"USER_EMAIL={user.email}\n")
                f.write(f"USER_ID={user.id}\n")
            
            print("✓ Token also saved to: backend/dev_token.txt\n")
        
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f"\n✗ Failed to create user/token!")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(create_test_user_and_token())
    sys.exit(0 if success else 1)
