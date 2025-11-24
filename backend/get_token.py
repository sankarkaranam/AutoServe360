import asyncio
import aiohttp
import json

async def main():
    async with aiohttp.ClientSession() as session:
        login_url = "http://localhost:8000/api/auth/login"
        login_payload = {
            "tenant_code": "dealer-001",
            "email": "dealer@example.com",
            "password": "password"
        }
        async with session.post(login_url, json=login_payload) as resp:
            if resp.status != 200:
                print(f"Login failed: {resp.status}")
                text = await resp.text()
                print(text)
                return
            data = await resp.json()
            token = data["access_token"]
            print(token)

if __name__ == "__main__":
    asyncio.run(main())
