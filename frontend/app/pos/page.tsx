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

import { createInvoice, listInvoices, deleteInvoice } from '@/components/pos/data';
import type { CreateInvoiceInput } from '@/components/pos/types';



export default function POSPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // initial load
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listInvoices(20);
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
      } catch (e:any) {
        toast({ variant: 'destructive', title: 'Failed to load invoices', description: e.message });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [toast]);

  // called by PosMain after user confirms payment
  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>) => {
    try {
      const input: CreateInvoiceInput = {
        customer_name: tx.customer,
        items: (tx.items || []).map(it => ({
          product_id: null,
          name: it.item,
          qty: it.quantity,
          rate: it.rate,
          tax_rate: 18,
        })),
        status: tx.status === 'Paid' ? 'PAID' : 'DUE',
      };

      const created = await createInvoice(input);
      const newTx: Transaction = {
        id: created.id,
        customer: created.customer,
        amount: created.amount,
        status: created.status === 'PAID' ? 'Paid' : created.status === 'PARTIAL' ? 'Partial' : 'Due',
        date: created.date,
        invoiceId: created.id,
        items: tx.items || [],
      };
      setTransactions(prev => [newTx, ...prev]);
      toast({ title: 'Invoice Created', description: `Invoice ${created.id} saved.` });
    } catch (e:any) {
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

    const prev = transactions;
    setTransactions(prev.filter(x => x.id !== id));
    try {
      await deleteInvoice(id);
      toast({ title: 'Transaction Deleted', description: `Invoice ${id} removed.` });
    } catch (e:any) {
      setTransactions(prev); // rollback
      toast({ variant: 'destructive', title: 'Delete failed', description: e.message });
    } finally {
      setTransactionToDelete(null);
    }
  };

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
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
