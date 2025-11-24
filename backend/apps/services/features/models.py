from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from apps.core.db import Base, BaseMixin
import uuid

class FeatureFlag(BaseMixin, Base):
    __tablename__ = "feature_flags"
    
    tenant_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("tenants.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    
    feature_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    is_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    
    # Unique constraint: one feature per tenant
    __table_args__ = (
        {'schema': None},  # Use default schema
    )


# Feature codes for reference
FEATURE_CODES = {
    # Core Features
    "pos_system": "Point of Sale System",
    "crm_basic": "Basic CRM & Leads",
    "crm_advanced": "Advanced CRM Features",
    "inventory_basic": "Basic Inventory Management",
    "inventory_advanced": "Advanced Inventory & Analytics",
    
    # Integrations
    "whatsapp_integration": "WhatsApp Messaging",
    "email_integration": "Email Marketing",
    "sms_integration": "SMS Notifications",
    
    # Advanced Features
    "ai_tools": "AI-Powered Tools",
    "custom_branding": "White-Label/Custom Branding",
    "api_access": "API Access",
    "webhooks": "Webhook Integration",
    
    # Reports & Analytics
    "basic_reports": "Basic Reports",
    "advanced_reports": "Advanced Analytics & Reports",
    "custom_reports": "Custom Report Builder",
    
    # Multi-tenancy
    "multi_location": "Multiple Branch Support",
    "multi_currency": "Multi-Currency Support",
    
    # Limits
    "unlimited_users": "Unlimited Staff Users",
    "unlimited_customers": "Unlimited Customers",
    "unlimited_storage": "Unlimited Data Storage",
}


# Plan-based default features
PLAN_FEATURES = {
    "basic": [
        "crm_basic",
        "inventory_basic",
        "basic_reports",
    ],
    "standard": [
        "pos_system",
        "crm_basic",
        "crm_advanced",
        "inventory_basic",
        "whatsapp_integration",
        "basic_reports",
    ],
    "premium": [
        "pos_system",
        "crm_basic",
        "crm_advanced",
        "inventory_basic",
        "inventory_advanced",
        "whatsapp_integration",
        "email_integration",
        "sms_integration",
        "basic_reports",
        "advanced_reports",
        "api_access",
        "multi_location",
    ],
    "enterprise": [
        # All features
        "pos_system",
        "crm_basic",
        "crm_advanced",
        "inventory_basic",
        "inventory_advanced",
        "whatsapp_integration",
        "email_integration",
        "sms_integration",
        "ai_tools",
        "custom_branding",
        "api_access",
        "webhooks",
        "basic_reports",
        "advanced_reports",
        "custom_reports",
        "multi_location",
        "multi_currency",
        "unlimited_users",
        "unlimited_customers",
        "unlimited_storage",
    ],
}
