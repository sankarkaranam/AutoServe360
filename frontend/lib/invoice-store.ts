'use client';

import { create } from 'zustand';
import { type InvoiceItem } from '@/components/pos/add-item-form';

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  vehicleNumber: string;
}

interface InvoiceState {
  customer: CustomerDetails;
  items: InvoiceItem[];
  invoiceId: string;
  setCustomer: (customer: Partial<CustomerDetails>) => void;
  addItem: (item: InvoiceItem) => void;
  deleteItem: (index: number) => void;
  clearInvoice: () => void;
  setInvoiceId: (id: string) => void;
}

const getInitialInvoiceId = () => {
    if (typeof window !== 'undefined') {
        return `INV-${Date.now().toString().slice(-6)}`;
    }
    return 'INV-000000';
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  customer: {
    name: '',
    phone: '',
    email: '',
    vehicleNumber: '',
  },
  items: [],
  invoiceId: getInitialInvoiceId(),
  setCustomer: (customer) => set((state) => ({ customer: { ...state.customer, ...customer } })),
  addItem: (newItem) =>
    set((state) => {
      const existingItemIndex = state.items.findIndex((item) => item.item === newItem.item);
      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return { items: updatedItems };
      }
      return { items: [...state.items, newItem] };
    }),
  deleteItem: (indexToDelete) =>
    set((state) => ({
      items: state.items.filter((_, index) => index !== indexToDelete),
    })),
  clearInvoice: () =>
    set({
      customer: { name: '', phone: '', email: '', vehicleNumber: '' },
      items: [],
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
    }),
  setInvoiceId: (id: string) => set({ invoiceId: id }),
}));
