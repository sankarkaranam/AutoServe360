from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.core.config import settings
from apps.api.routers import auth, me, tenants, customers, vehicles, invoices, inventory, subscriptions, reports, features, dashboard, leads, saas_admin

from apps.core.middleware import TenantMiddleware

app = FastAPI(title="AutoServe360 API", version="0.1.0",
              openapi_url=f"{settings.API_PREFIX}/openapi.json")

from fastapi.staticfiles import StaticFiles
import os
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(TenantMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(me.router, prefix=settings.API_PREFIX)
app.include_router(saas_admin.router, prefix=settings.API_PREFIX)  # New SaaS Admin API
app.include_router(tenants.router, prefix=settings.API_PREFIX)
app.include_router(subscriptions.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(features.router, prefix=settings.API_PREFIX)
app.include_router(customers.router, prefix=settings.API_PREFIX)
app.include_router(leads.router, prefix=settings.API_PREFIX)
app.include_router(vehicles.router, prefix=settings.API_PREFIX)
app.include_router(invoices.router, prefix=settings.API_PREFIX)
app.include_router(inventory.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    return {"ok": True, "app": "AutoServe360 API"}
