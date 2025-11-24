'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { PosMain } from '@/components/pos/pos-main';
import { RecentTransactions, type Transaction } from '@/components/pos/recent-transactions';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

import { createInvoice, listInvoices, deleteInvoice, getInvoice } from '@/components/pos/data';
import type { CreateInvoiceInput } from '@/components/pos/types';
import { PrintBill } from '@/components/pos/print-bill';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';



export default function POSPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [printData, setPrintData] = useState<any>(null);

  // Fetch transactions when dateRange changes
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        console.log('Fetching invoices...', dateRange);
        const data = await listInvoices(20, dateRange?.from, dateRange?.to);
        console.log('Fetched invoices:', data);
        if (!alive) return;
        setTransactions(data.map(i => ({
          id: i.id,
          customer: i.customer,
          amount: i.amount,
          status: i.status === 'PAID' ? 'Paid' : i.status === 'PARTIAL' ? 'Partial' : 'Due',
          date: i.date,
          invoiceId: i.id,
          items: [],
        })));
      } catch (e: any) {
        console.error('Error fetching invoices:', e);
        toast({ variant: 'destructive', title: 'Failed to load invoices', description: e.message });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [toast, dateRange]);

  // called by PosMain after user confirms payment
  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>) => {
    try {
      const input: CreateInvoiceInput = {
        customer_name: tx.customer,
        items: (tx.items || []).map(it => ({
          product_id: it.productId || null,
          name: it.item,
          qty: it.quantity,
          rate: it.rate,
          tax_rate: 18,
        })),
        status: tx.status === 'Paid' ? 'PAID' : 'DUE',
      };

      const created = await createInvoice(input);

      // Auto-refresh: Refetch all transactions from database
      try {
        const updatedTransactions = await listInvoices(20, dateRange?.from, dateRange?.to);
        setTransactions(updatedTransactions.map(i => ({
          id: i.id,
          customer: i.customer,
          amount: i.amount,
          status: i.status === 'PAID' ? 'Paid' : i.status === 'PARTIAL' ? 'Partial' : 'Due',
          date: i.date,
          invoiceId: i.id,
          items: [],
        })));
      } catch (refreshError) {
        console.error('Failed to refresh transactions:', refreshError);
      }

      toast({ title: 'Invoice Created', description: `Invoice ${created.id} saved.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Payment failed', description: e.message });
    }
  };

  const handleDeleteRequest = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const id = transactionToDelete;
    setIsDeleteDialogOpen(false);
    if (!id) return;

    // Optimistic update
    const prev = transactions;
    setTransactions(prev.filter(x => x.id !== id));

    try {
      await deleteInvoice(id);
      toast({ title: 'Transaction Deleted', description: `Invoice ${id} removed.` });
    } catch (e: any) {
      // Rollback on failure
      setTransactions(prev);
      toast({ variant: 'destructive', title: 'Delete failed', description: e.message || "Could not delete invoice. Please try again." });
    } finally {
      setTransactionToDelete(null);
    }
  };

  const handleDownloadInvoice = async (id: string) => {
    try {
      toast({ title: "Fetching Invoice...", description: "Please wait while we prepare the download." });
      const invoice = await getInvoice(id);

      // Calculate totals
      const subtotal = invoice.items.reduce((acc: number, item: any) => acc + (item.qty * item.rate), 0);
      const tax = subtotal * 0.18; // Assuming 18% tax
      const total = subtotal + tax;

      setPrintData({
        invoiceNumber: invoice.number || id, // Use ID if number not available
        customerName: invoice.customer,
        customerMobile: invoice.customer_phone,
        customerEmail: invoice.customer_email,
        vehicleNumber: invoice.vehicle_no,
        items: invoice.items.map((item: any) => ({
          item: item.name,
          quantity: item.qty,
          rate: item.rate,
          productId: item.product_id
        })),
        subtotal: subtotal,
        tax: tax,
        total: total,
        paymentMethod: 'Unknown', // We don't store payment method yet
        date: new Date(invoice.date),
      });
    } catch (error) {
      console.error("Failed to download invoice", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not fetch invoice details."
      });
    }
  };

  // Trigger print when printData is set
  useEffect(() => {
    if (printData) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        window.print();
        // Clear print data after printing
        setPrintData(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printData]);

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                  <PosMain onProcessPayment={handleAddTransaction} />
                </div>
                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                  <RecentTransactions
                    transactions={transactions}
                    onDeleteTransaction={handleDeleteRequest}
                    onDownloadInvoice={handleDownloadInvoice}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    isLoading={loading}
                  />
                </div>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Bill Component for downloading past invoices */}
      {printData && (
        <PrintBill
          invoiceNumber={printData.invoiceNumber}
          customerName={printData.customerName}
          customerMobile={printData.customerMobile}
          customerEmail={printData.customerEmail}
          vehicleNumber={printData.vehicleNumber}
          items={printData.items}
          subtotal={printData.subtotal}
          tax={printData.tax}
          total={printData.total}
          paymentMethod={printData.paymentMethod}
          date={printData.date}
        />
      )}
    </>
  );
}
