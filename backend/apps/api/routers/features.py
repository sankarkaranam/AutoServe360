from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from apps.core.db import get_session
from apps.core.security import require_roles
from apps.services.features.service import (
    get_tenant_features,
    toggle_feature,
    initialize_features_for_tenant
)
from apps.services.features.models import FEATURE_CODES, PLAN_FEATURES

router = APIRouter(prefix="/v1/saas/features", tags=["features"])


class FeatureOut(BaseModel):
    feature_code: str
    feature_name: str
    is_enabled: bool


class FeatureToggleIn(BaseModel):
    feature_code: str
    enabled: bool


@router.get("/tenant/{tenant_id}", response_model=List[FeatureOut])
async def get_dealer_features(
    tenant_id: str,
    session: AsyncSession = Depends(get_session),
    _user=Depends(require_roles("superadmin", "saas_admin"))
):
    """Get all features for a specific dealer"""
    try:
        tenant_uuid = uuid.UUID(tenant_id)
        features = await get_tenant_features(session, tenant_uuid)
        
        return [
            {
                "feature_code": f["feature_code"],
                "feature_name": FEATURE_CODES.get(f["feature_code"], f["feature_code"]),
                "is_enabled": f["is_enabled"]
            }
            for f in features
        ]
    except ValueError:
        raise HTTPException(400, "Invalid tenant ID")


@router.post("/tenant/{tenant_id}/toggle")
async def toggle_dealer_feature(
    tenant_id: str,
    payload: FeatureToggleIn,
    session: AsyncSession = Depends(get_session),
    _user=Depends(require_roles("superadmin", "saas_admin"))
):
    """Enable or disable a feature for a dealer"""
    try:
        tenant_uuid = uuid.UUID(tenant_id)
        await toggle_feature(
            session,
            tenant_uuid,
            payload.feature_code,
            payload.enabled
        )
        return {"success": True, "message": "Feature updated"}
    except ValueError:
        raise HTTPException(400, "Invalid tenant ID")


@router.post("/tenant/{tenant_id}/initialize/{plan_id}")
async def initialize_dealer_features(
    tenant_id: str,
    plan_id: str,
    session: AsyncSession = Depends(get_session),
    _user=Depends(require_roles("superadmin", "saas_admin"))
):
    """Initialize features for a dealer based on their plan"""
    try:
        tenant_uuid = uuid.UUID(tenant_id)
        
        if plan_id not in PLAN_FEATURES:
            raise HTTPException(400, f"Invalid plan: {plan_id}")
        
        await initialize_features_for_tenant(session, tenant_uuid, plan_id)
        return {
            "success": True,
            "message": f"Initialized {len(PLAN_FEATURES[plan_id])} features for {plan_id} plan"
        }
    except ValueError:
        raise HTTPException(400, "Invalid tenant ID")


@router.get("/available")
async def get_available_features(
    _user=Depends(require_roles("superadmin", "saas_admin"))
):
    """Get list of all available features"""
    return {
        "features": [
            {"code": code, "name": name}
            for code, name in FEATURE_CODES.items()
        ],
        "plans": {
            plan: features
            for plan, features in PLAN_FEATURES.items()
        }
    }
