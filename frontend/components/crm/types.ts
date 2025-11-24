export interface Customer {
    id?: string;
    tenant_id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    dob?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Lead {
    id?: string;
    tenant_id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    source: LeadSource;
    status: LeadStatus;
    vehicle_of_interest?: string | null;
    notes?: string | null;
    follow_up_date?: string | null;
    assigned_to?: string | null;
    converted_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export enum LeadStatus {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    FOLLOW_UP = "FOLLOW_UP",
    QUALIFIED = "QUALIFIED",
    CONVERTED = "CONVERTED",
    LOST = "LOST"
}

export enum LeadSource {
    WALK_IN = "WALK_IN",
    WEBSITE = "WEBSITE",
    REFERRAL = "REFERRAL",
    PHONE = "PHONE",
    SOCIAL_MEDIA = "SOCIAL_MEDIA"
}

export interface CreateCustomerInput {
    tenant_id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    dob?: string;
}

export interface CreateLeadInput {
    tenant_id?: string;
    name: string;
    phone?: string;
    email?: string;
    source?: LeadSource;
    status?: LeadStatus;
    vehicle_of_interest?: string;
    notes?: string;
    follow_up_date?: string;
    assigned_to?: string;
}

export interface ConvertLeadInput {
    customer_name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    dob?: string;
}
