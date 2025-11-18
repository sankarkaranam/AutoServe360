from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.core.config import settings
from apps.api.routers import auth, me, tenants, customers, vehicles, invoices, inventory

app = FastAPI(title="AutoServe360 API", version="0.1.0",
              openapi_url=f"{settings.API_PREFIX}/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(me.router, prefix=settings.API_PREFIX)
app.include_router(tenants.router, prefix=settings.API_PREFIX)
app.include_router(customers.router, prefix=settings.API_PREFIX)
app.include_router(vehicles.router, prefix=settings.API_PREFIX)
app.include_router(invoices.router, prefix=settings.API_PREFIX)
app.include_router(inventory.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    return {"ok": True, "app": "AutoServe360 API"}
