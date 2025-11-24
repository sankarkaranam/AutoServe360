export interface Vehicle {
    id?: string;
    tenant_id: string;
    customer_id: string;
    customer_name?: string;
    make: string | null;
    model: string | null;
    year: number | null;
    vin: string | null;
    van_number?: string | null;
    chassis_number?: string | null;
    purchase_date?: string | null;
    active?: boolean;
}

export interface VehicleInventory {
    id?: string;
    tenant_id: string;
    make: string;
    model: string;
    year: number;
    color?: string | null;
    vin?: string | null;
    chassis_number?: string | null;
    cost_price?: number | null;
    selling_price?: number | null;
    status: 'IN_STOCK' | 'SOLD' | 'RESERVED';
}

export interface CreateVehicleInventoryInput {
    tenant_id?: string;
    make: string;
    model: string;
    year: number;
    color?: string;
    vin?: string;
    chassis_number?: string;
    cost_price?: number;
    selling_price?: number;
    status?: 'IN_STOCK' | 'SOLD' | 'RESERVED';
}

export interface CreateVehicleInput {
    tenant_id: string;
    customer_id: string;
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
}
