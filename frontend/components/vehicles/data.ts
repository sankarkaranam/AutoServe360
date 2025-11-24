import { api } from '@/lib/api';
import type { Vehicle, CreateVehicleInput, VehicleInventory, CreateVehicleInventoryInput } from './types';

export const listInventory = () => {
    return api<VehicleInventory[]>('/api/vehicles/inventory');
};

export const createInventory = (payload: Omit<CreateVehicleInventoryInput, 'tenant_id'> & { tenant_id?: string }) => {
    const tenant_id = payload.tenant_id || (typeof window !== 'undefined' ? localStorage.getItem('as360_tenant') : '');
    if (!tenant_id) throw new Error("Tenant ID not found");

    return api<{ ok: boolean; id: string }>('/api/vehicles/inventory', {
        method: 'POST',
        body: JSON.stringify({ ...payload, tenant_id }),
    });
};

export const sellVehicle = (inventoryId: string, customerId: string, sellingPrice: number) => {
    return api<{ ok: boolean; vehicle_id: string }>(`/api/vehicles/inventory/${inventoryId}/sell`, {
        method: 'POST',
        body: JSON.stringify({ customer_id: customerId, selling_price: sellingPrice }),
    });
};

export const listVehicles = () =>
    api<Vehicle[]>('/api/vehicles');

export const createVehicle = (payload: Omit<CreateVehicleInput, 'tenant_id'> & { tenant_id?: string }) => {
    const tenant_id = payload.tenant_id || (typeof window !== 'undefined' ? localStorage.getItem('as360_tenant') : '');
    if (!tenant_id) throw new Error("Tenant ID not found");

    return api<{ ok: boolean; id: string }>('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify({ ...payload, tenant_id }),
    });
};

export const listCustomers = () =>
    api<any[]>('/api/customers');
