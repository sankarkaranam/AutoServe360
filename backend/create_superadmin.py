"""
Simple superadmin creation without model relationships
"""
import asyncio
import asyncpg
from apps.core.config import settings
from apps.core.security import hash_password
import uuid

async def create_superadmin():
    """Create a superadmin user using direct SQL"""
    
    email = "admin@autoserve360.com"
    password = "admin123"  # Change this in production!
    
    # Parse database URL
    db_url = settings.DB_URL.replace("postgresql+asyncpg://", "postgresql://")
    
    conn = await asyncpg.connect(db_url)
    
    try:
        # Check if user exists
        existing = await conn.fetchrow(
            "SELECT id FROM users WHERE email = $1", email
        )
        
        if existing:
            print(f"✓ User '{email}' already exists!")
            # Update to superadmin
            await conn.execute(
                "UPDATE users SET role = $1 WHERE email = $2",
                "superadmin", email
            )
            print(f"✓ Updated to superadmin role")
        else:
            # Create new superadmin
            user_id = uuid.uuid4()
            password_hash = hash_password(password)
            
            await conn.execute(
                """
                INSERT INTO users (id, email, username, display_name, role, password_hash)
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                user_id, email, "superadmin", "Super Administrator", "superadmin", password_hash
            )
            print(f"\n✅ Superadmin created successfully!")
        
        print(f"\n📧 Email: {email}")
        print(f"🔑 Password: {password}")
        print(f"👤 Role: superadmin")
        print(f"\n🌐 Login at: http://localhost:3000/login/admin")
        print(f"📊 Then go to: http://localhost:3000/admin/dashboard")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(create_superadmin())
