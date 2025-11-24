import { api } from '@/lib/api';
import type { Customer, Lead, CreateCustomerInput, CreateLeadInput, ConvertLeadInput } from './types';

// Customer API calls
export const listCustomers = () => {
    return api<Customer[]>('/api/customers');
};

export const getCustomer = (id: string) => {
    return api<Customer>(`/api/customers/${id}`);
};

export const createCustomer = (payload: Omit<CreateCustomerInput, 'tenant_id'> & { tenant_id?: string }) => {
    const tenant_id = payload.tenant_id || (typeof window !== 'undefined' ? localStorage.getItem('as360_tenant') : '');
    if (!tenant_id) throw new Error("Tenant ID not found");

    return api<{ ok: boolean; id: string }>('/api/customers', {
        method: 'POST',
        body: JSON.stringify({ ...payload, tenant_id }),
    });
};

export const updateCustomer = (id: string, payload: Omit<CreateCustomerInput, 'tenant_id'> & { tenant_id?: string }) => {
    const tenant_id = payload.tenant_id || (typeof window !== 'undefined' ? localStorage.getItem('as360_tenant') : '');
    if (!tenant_id) throw new Error("Tenant ID not found");

    return api<{ ok: boolean }>(`/api/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...payload, tenant_id }),
    });
};

export const deleteCustomer = (id: string) => {
    return api<void>(`/api/customers/${id}`, {
        method: 'DELETE',
    });
};

// Lead API calls
export const listLeads = (filters?: { status?: string; source?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.source) params.append('source', filters.source);

    const queryString = params.toString();
    return api<Lead[]>(`/api/leads${queryString ? `?${queryString}` : ''}`);
};

export const getLead = (id: string) => {
    return api<Lead>(`/api/leads/${id}`);
};

export const createLead = (payload: Omit<CreateLeadInput, 'tenant_id'> & { tenant_id?: string }) => {
    const tenant_id = payload.tenant_id || (typeof window !== 'undefined' ? localStorage.getItem('as360_tenant') : '');
    if (!tenant_id) throw new Error("Tenant ID not found");

    return api<{ ok: boolean; id: string }>('/api/leads', {
        method: 'POST',
        body: JSON.stringify({ ...payload, tenant_id }),
    });
};

export const updateLead = (id: string, payload: Omit<CreateLeadInput, 'tenant_id'> & { tenant_id?: string }) => {
    const tenant_id = payload.tenant_id || (typeof window !== 'undefined' ? localStorage.getItem('as360_tenant') : '');
    if (!tenant_id) throw new Error("Tenant ID not found");

    return api<{ ok: boolean }>(`/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...payload, tenant_id }),
    });
};

export const convertLead = (id: string, payload: ConvertLeadInput) => {
    return api<{ ok: boolean; customer_id: string }>(`/api/leads/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const deleteLead = (id: string) => {
    return api<void>(`/api/leads/${id}`, {
        method: 'DELETE',
    });
};
