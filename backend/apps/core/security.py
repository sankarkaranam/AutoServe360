# apps/core/security.py
from __future__ import annotations

import datetime as dt
from typing import Any, Callable, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from pydantic import BaseModel, ValidationError

from apps.core.config import settings

# -----------------------------
# Password hashing (bcrypt)
# -----------------------------
_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return _pwd.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd.verify(plain, hashed)


# -----------------------------
# JWT helpers
# -----------------------------
ALGORITHM = "HS256"
JWT_EXPIRE_MIN = 60 * 24  # 24h default


class UserClaims(BaseModel):
    sub: str                # user id
    tenant_id: str
    role: str
    email: str
    exp: int


def _now_utc() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def create_access_token(
    *,
    sub: str,
    tenant_id: str,
    role: str,
    email: str,
    expires_minutes: int = JWT_EXPIRE_MIN,
    extra: Optional[dict[str, Any]] = None,
) -> str:
    to_encode: dict[str, Any] = {
        "sub": sub,
        "tenant_id": tenant_id,
        "role": role,
        "email": email,
        "exp": int((_now_utc() + dt.timedelta(minutes=expires_minutes)).timestamp()),
        "iat": int(_now_utc().timestamp()),
    }
    if extra:
        to_encode.update(extra)
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)
    return token

# Back-compat alias if some files still import create_jwt


def create_jwt(
    *,
    sub: str,
    tenant_id: str,
    role: str,
    email: str,
    expires_minutes: int = JWT_EXPIRE_MIN,
    extra: Optional[dict[str, Any]] = None,
) -> str:
    return create_access_token(
        sub=sub,
        tenant_id=tenant_id,
        role=role,
        email=email,
        expires_minutes=expires_minutes,
        extra=extra,
    )


# -----------------------------
# Auth dependency
# -----------------------------
_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> UserClaims:
    if creds is None or not creds.scheme.lower() == "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = creds.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET,
                             algorithms=[ALGORITHM])
        claims = UserClaims(**payload)
        # Optional: future place to check token revocation/tenant suspension, etc.
        return claims
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

# -----------------------------
# Role guard (use in routers)
# -----------------------------


def require_roles(*allowed: str) -> Callable[..., Any]:
    """
    Example:
        @router.post("/tenants", dependencies=[Depends(require_roles("superadmin","saas_admin"))])
        async def create_tenant(...):
            ...
    """
    async def _dep(current: UserClaims = Depends(get_current_user)) -> UserClaims:
        if current.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current
    return _dep
