"""Feature management service"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from apps.services.features.models import FeatureFlag, PLAN_FEATURES
from apps.services.dealers.models import Tenant
import uuid


async def initialize_features_for_tenant(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    plan_id: str
) -> None:
    """Initialize feature flags for a new tenant based on their plan"""
    
    # Get features for this plan
    features = PLAN_FEATURES.get(plan_id, [])
    
    # Create feature flags
    for feature_code in features:
        flag = FeatureFlag(
            tenant_id=tenant_id,
            feature_code=feature_code,
            is_enabled=True
        )
        session.add(flag)
    
    await session.commit()


async def check_feature_access(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    feature_code: str
) -> bool:
    """Check if a tenant has access to a specific feature"""
    
    # Check if tenant is active
    tenant_result = await session.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()
    
    if not tenant or not tenant.is_active:
        return False
    
    # Check feature flag
    flag_result = await session.execute(
        select(FeatureFlag).where(
            FeatureFlag.tenant_id == tenant_id,
            FeatureFlag.feature_code == feature_code
        )
    )
    flag = flag_result.scalar_one_or_none()
    
    return flag.is_enabled if flag else False


async def get_tenant_features(
    session: AsyncSession,
    tenant_id: uuid.UUID
) -> list[dict]:
    """Get all features for a tenant"""
    
    result = await session.execute(
        select(FeatureFlag).where(FeatureFlag.tenant_id == tenant_id)
    )
    flags = result.scalars().all()
    
    return [
        {
            "feature_code": f.feature_code,
            "is_enabled": f.is_enabled,
            "id": str(f.id)
        }
        for f in flags
    ]


async def toggle_feature(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    feature_code: str,
    enabled: bool
) -> None:
    """Enable or disable a feature for a tenant"""
    
    # Check if feature exists
    result = await session.execute(
        select(FeatureFlag).where(
            FeatureFlag.tenant_id == tenant_id,
            FeatureFlag.feature_code == feature_code
        )
    )
    flag = result.scalar_one_or_none()
    
    if flag:
        flag.is_enabled = enabled
    else:
        # Create if doesn't exist
        flag = FeatureFlag(
            tenant_id=tenant_id,
            feature_code=feature_code,
            is_enabled=enabled
        )
        session.add(flag)
    
    await session.commit()
