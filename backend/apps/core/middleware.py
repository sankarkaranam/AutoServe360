from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from apps.core.context import set_tenant_id, reset_tenant_id
import uuid

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        tenant_id_header = request.headers.get("X-Tenant-Id")
        
        if tenant_id_header:
            try:
                # Validate UUID format
                tenant_uuid = uuid.UUID(tenant_id_header)
                set_tenant_id(tenant_uuid)
            except ValueError:
                # Invalid UUID, ignore or raise? 
                # For middleware, maybe just ignore and let dependency injection handle validation error if strict
                pass
        
        try:
            response = await call_next(request)
            return response
        finally:
            reset_tenant_id()
