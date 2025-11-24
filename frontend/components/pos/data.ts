import { api } from '@/lib/api';
import type { CreateInvoiceInput, InvoiceSummary } from './types';

export const createInvoice = (payload: CreateInvoiceInput) =>
  api<InvoiceSummary>('/api/invoices', { method: 'POST', body: JSON.stringify(payload) });

export const listInvoices = (limit = 20, startDate?: Date, endDate?: Date) => {
  let url = `/api/invoices?limit=${limit}`;
  if (startDate) url += `&start_date=${startDate.toISOString()}`;
  if (endDate) url += `&end_date=${endDate.toISOString()}`;
  return api<InvoiceSummary[]>(url);
};

export const getInvoice = (id: string) =>
  api<any>(`/api/invoices/${id}`);

export const deleteInvoice = (id: string) =>
  api<void>(`/api/invoices/${id}`, { method: 'DELETE' });

export const listInventory = () =>
  api<import('./types').InventoryItem[]>('/api/inventory');

export const createInventoryItem = (item: any) =>
  api<import('./types').InventoryItem>('/api/inventory', { method: 'POST', body: JSON.stringify(item) });

export const updateInventoryItem = (id: string, item: any) =>
  api<import('./types').InventoryItem>(`/api/inventory/${id}`, { method: 'PUT', body: JSON.stringify(item) });

export const deleteInventoryItem = (id: string) =>
  api<void>(`/api/inventory/${id}`, { method: 'DELETE' });

export const uploadInventoryImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/inventory/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is in localStorage
    }
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
};
