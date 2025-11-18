import { api } from '@/lib/api';
import type { CreateInvoiceInput, InvoiceSummary } from './types';

export const createInvoice = (payload: CreateInvoiceInput) =>
  api<InvoiceSummary>('/billing/invoices', { method: 'POST', body: JSON.stringify(payload) });

export const listInvoices = (limit = 20) =>
  api<InvoiceSummary[]>(`/billing/invoices?limit=${limit}`);

export const deleteInvoice = (id: string) =>
  api<void>(`/billing/invoices/${id}`, { method: 'DELETE' });
