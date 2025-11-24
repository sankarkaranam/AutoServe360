'use client';

import { create } from 'zustand';
import { type Transaction } from '@/components/pos/recent-transactions';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (newTransaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,
  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';
      const response = await fetch(`${apiBase}/invoices?limit=50`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();

      // Map backend response to Transaction type
      // Backend returns: { id, customer, date, amount, status }
      // Frontend expects: { id, customer, amount, status, date, invoiceId, items }
      const transactions: Transaction[] = data.map((inv: any) => ({
        id: inv.id,
        customer: inv.customer,
        amount: inv.amount,
        status: inv.status === 'PAID' ? 'Paid' : inv.status === 'PARTIAL' ? 'Partial' : 'Due',
        date: inv.date,
        invoiceId: inv.id.substring(0, 8), // Use ID as invoice ID for now if not provided separately
        items: [] // Items are not returned in summary list, defaulting to empty
      }));

      set({ transactions, isLoading: false });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  addTransaction: (newTransaction) =>
    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    })),
  deleteTransaction: (transactionId) =>
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== transactionId),
    })),
}));
