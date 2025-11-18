export type PosItemInput = { product_id?: string | null; name: string; qty: number; rate: number; tax_rate: number; };

export type CreateInvoiceInput = {
  customer_name: string;
  mobile?: string;
  email?: string;
  vehicle_no?: string;
  items: PosItemInput[];
  status?: 'DUE'|'PAID'|'PARTIAL';
};

export type InvoiceSummary = {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: 'DUE'|'PAID'|'PARTIAL';
};
