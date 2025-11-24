import { api } from '@/lib/api';

export interface DashboardStats {
    today_sales: number;
    new_leads: number;
    pending_payments: number;
    sales_overview: Array<{ date: string; amount: number }>;
    recent_activity: Array<{
        type: string;
        description: string;
        amount: number;
        time: string;
    }>;
    top_products: Array<{ name: string; count: number }>;
    low_stock_items: Array<{ name: string; stock: number; sku: string }>;
}

export const getDashboardStats = () => {
    return api<DashboardStats>('/api/dashboard/stats');
};
