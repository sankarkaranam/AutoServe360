'use client';

import { create } from 'zustand';
import { type Transaction } from '@/components/pos/recent-transactions';

const sampleTransactions: Transaction[] = [
    {
        id: 'txn-001',
        customer: 'Srinivas Reddy',
        amount: 2500,
        status: 'Paid',
        date: new Date(2024, 6, 22, 10, 30).toISOString(),
        invoiceId: 'INV-734829',
        items: [{ item: 'General Service', quantity: 1, rate: 1500 }, { item: 'Oil Filter', quantity: 1, rate: 350 }, { item: 'Engine Oil', quantity: 1, rate: 650 }]
    },
    {
        id: 'txn-002',
        customer: 'Padma Rao',
        amount: 850,
        status: 'Paid',
        date: new Date(2024, 6, 21, 14, 0).toISOString(),
        invoiceId: 'INV-192384',
        items: [{ item: 'Tire Puncture Repair', quantity: 2, rate: 200 }, { item: 'Chain Lubrication', quantity: 1, rate: 450 }]
    },
    {
        id: 'txn-003',
        customer: 'Venkata Naidu',
        amount: 1200,
        status: 'Paid',
        date: new Date().toISOString(),
        invoiceId: 'INV-583921',
        items: [{ item: 'Brake Pad Replacement', quantity: 1, rate: 1200 }]
    }
];

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (newTransaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: sampleTransactions,
  addTransaction: (newTransaction) =>
    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    })),
  deleteTransaction: (transactionId) =>
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== transactionId),
    })),
}));
