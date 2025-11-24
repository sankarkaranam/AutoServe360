#!/usr/bin/env python3
"""Simple sync script to generate JWT token"""
import jwt
import datetime as dt

# Settings from backend
JWT_SECRET = "dev_secret_local"
ALGORITHM = "HS256"

# User data (assuming we have a test user)
user_data = {
    "sub": "123e4567-e89b-12d3-a456-426614174000",  # User ID
    "tenant_id": "737efdd5-db2f-481b-8fc1-51d74de5cae1",  # Tenant ID from api.ts
    "role": "admin",
    "email": "admin@test.com",
    "exp": int((dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=7)).timestamp()),
    "iat": int(dt.datetime.now(dt.timezone.utc).timestamp()),
}

token = jwt.encode(user_data, JWT_SECRET, algorithm=ALGORITHM)
print("\n" + "="*80)
print("DEVELOPMENT JWT TOKEN:")
print("="*80)
print(token)
print("="*80)
print("\nTo use in browser console:")
print(f"localStorage.setItem('as360_token', '{token}');")
print(f"localStorage.setItem('as360_tenant', '{user_data['tenant_id']}');")
print("="*80 + "\n")
