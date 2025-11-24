"""Reset password for dealer@example.com"""
import asyncio
import asyncpg
from apps.core.config import settings
from apps.core.security import hash_password

async def main():
    db_url = settings.DB_URL.replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(db_url)
    try:
        new_password = 'password123'
        hashed = hash_password(new_password)
        
        await conn.execute(
            'UPDATE users SET hashed_password = $1 WHERE email = $2',
            hashed, 'dealer@example.com'
        )
        
        print('✅ Password reset successfully!')
        print('\n=== LOGIN CREDENTIALS ===')
        print('Tenant ID: dealer-001')
        print('Email: dealer@example.com')
        print('Password: password123')
        print('\n🌐 Login at: http://localhost:3000')
        
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
