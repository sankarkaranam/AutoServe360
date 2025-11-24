from contextvars import ContextVar
from typing import Optional
import uuid

# Context variable to hold the current tenant ID
_tenant_id_ctx: ContextVar[Optional[uuid.UUID]] = ContextVar("tenant_id", default=None)

def get_tenant_id() -> Optional[uuid.UUID]:
    return _tenant_id_ctx.get()

def set_tenant_id(tenant_id: uuid.UUID) -> None:
    _tenant_id_ctx.set(tenant_id)

def reset_tenant_id() -> None:
    _tenant_id_ctx.set(None)
