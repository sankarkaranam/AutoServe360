'use client';
import { startOfMonth, subMonths, format, isWithinInterval } from 'date-fns';
import type { Transaction } from '@/components/pos/recent-transactions';

export const sampleServiceJobs = [
    { id: 'job-1', vehicleId: 'veh-1', jobDescription: 'General Service, Oil Change', mileage: 12500, date: '2024-05-10T00:00:00.000Z' },
    { id: 'job-2', vehicleId: 'veh-1', jobDescription: 'Brake Pad Replacement', mileage: 25000, date: '2024-07-15T00:00:00.000Z' },
    { id: 'job-3', vehicleId: 'veh-2', jobDescription: 'Tire Change', mileage: 15000, date: '2024-06-20T00:00:00.000Z' },
];


// Generate more comprehensive sample data for the last 6 months
export const generateMonthlyData = (transactions: Transaction[]) => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

        const monthSales = transactions
            .filter(t => isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd }))
            .reduce((sum, t) => sum + t.amount, 0);
        
        data.push({
            date,
            month: format(date, 'MMM'),
            sales: monthSales,
            services: Math.floor(Math.random() * 30) + 20, // Keep this random for now
            newCustomers: Math.floor(Math.random() * 15) + 5, // Keep this random for now
        });
    }
    return data;
}

export const generateRecentActivity = (transactions: Transaction[]) => transactions.map((t, i) => {
    const isSale = Math.random() > 0.4;
    return {
        id: t.id,
        type: isSale ? 'Sale' : 'Service',
        description: isSale ? `Invoice #${t.invoiceId}` : `Service for ${t.customer}`,
        amount: t.amount,
        date: t.date,
    }
});
