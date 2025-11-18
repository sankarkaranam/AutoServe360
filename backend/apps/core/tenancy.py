from fastapi import Header, HTTPException, Depends
from typing import Optional
from apps.services.auth.models import User
from apps.core.security import get_current_user

async def require_tenant(x_tenant_id: Optional[str] = Header(default=None)) -> str:
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-Id header required")
    return x_tenant_id

def enforce_same_tenant(user: User = Depends(get_current_user), tenant_id: str = Depends(require_tenant)) -> str:
    # SaaS admins can cross tenants; others must match
    if user.role in ("superadmin", "saas_admin"):
        return tenant_id
    if user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Cross-tenant access denied")
    return tenant_id
