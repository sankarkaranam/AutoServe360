
'use client';

import { PlusCircle, Search, Printer, CreditCard, Trash2, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '../ui/separator';
import { type InvoiceItem } from './add-item-form';
import { type Transaction } from '../pos/recent-transactions';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { SelectItemDialog } from './select-item-dialog';
import { useInvoiceStore } from '@/lib/invoice-store';

export function PosMain({ onProcessPayment }: { onProcessPayment: (transaction: Omit<Transaction, 'id'>) => void; }) {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    customer: customerDetails,
    items,
    invoiceId,
    setCustomer: setCustomerDetails,
    addItem,
    deleteItem,
    clearInvoice,
    setInvoiceId
  } = useInvoiceStore();
  
  useEffect(() => {
    if(!invoiceId) {
      setInvoiceId(`INV-${Date.now().toString().slice(-6)}`);
    }
  }, [invoiceId, setInvoiceId]);

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleAddItem = (newItem: InvoiceItem) => {
    addItem(newItem);
    toast({
      title: 'Item Added',
      description: `${newItem.item} has been added to the invoice.`,
    });
  };
  
  const handleDeleteItem = (indexToDelete: number) => {
    deleteItem(indexToDelete);
  }

  const handlePrint = (type: 'digital' | 'thermal') => {
    if (type === 'digital') {
        window.print();
    } else {
        toast({ 
            title: `Printing Thermal Invoice...`, 
            description: `Invoice ${invoiceId} sent to the thermal printer.` 
        });
    }
  }

  const handleSendWhatsApp = () => {
    toast({ title: 'Sending WhatsApp...', description: `Invoice ${invoiceId} sent to ${customerDetails.phone}.` });
  }

  const handleProcessPayment = () => {
    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Process Payment',
        description: 'Please add items to the invoice first.',
      });
      return;
    }
    if (!customerDetails.name || !customerDetails.phone) {
        toast({
            variant: 'destructive',
            title: 'Customer Details Missing',
            description: 'Please enter customer name and phone number.',
        });
        return;
    }
    setIsPaymentOpen(true);
  }

  const handleConfirmPayment = async (paymentMethod: string) => {
     if (!invoiceId) return;
     const newTransaction: Omit<Transaction, 'id'> = {
        customer: customerDetails.name,
        amount: total,
        status: 'Paid',
        date: new Date().toISOString(),
        invoiceId: invoiceId,
        items: items,
    };
    
    onProcessPayment(newTransaction);

    toast({
      title: 'Payment Successful',
      description: `Invoice ${invoiceId} for ${customerDetails.name} has been paid.`,
    });
    
    clearInvoice();
    setIsPaymentOpen(false);
  }
  
  const handleCustomerDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerDetails({ [name]: value });
  };

  const [paymentMethod, setPaymentMethod] = useState('cash');

  return (
    <>
      <Card className="shadow-md print:shadow-none print:border-none" id="invoice-card">
        <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="font-headline flex items-baseline gap-4">
                        New Invoice
                        {invoiceId && <span className='text-sm font-mono text-muted-foreground'>{invoiceId}</span>}
                    </CardTitle>
                    <CardDescription>
                    Create a new invoice for a customer.
                    </CardDescription>
                </div>
                <div className="relative flex-1 w-full md:w-auto md:max-w-sm print:hidden">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search Customer..."
                    className="w-full rounded-lg bg-secondary/80 pl-8"
                    />
                </div>
            </div>
             <Separator className="my-4" />
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" name="name" value={customerDetails.name} onChange={handleCustomerDetailChange} placeholder="Enter name" />
                </div>
                <div>
                    <Label htmlFor="customerPhone">Mobile Number</Label>
                    <Input id="customerPhone" name="phone" value={customerDetails.phone} onChange={handleCustomerDetailChange} placeholder="Enter mobile" />
                </div>
                 <div>
                    <Label htmlFor="customerEmail">Email (Optional)</Label>
                    <Input id="customerEmail" name="email" value={customerDetails.email} onChange={handleCustomerDetailChange} placeholder="Enter email" />
                </div>
                 <div>
                    <Label htmlFor="vehicleNumber">Vehicle Number (Optional)</Label>
                    <Input id="vehicleNumber" name="vehicleNumber" value={customerDetails.vehicleNumber} onChange={handleCustomerDetailChange} placeholder="e.g., AP-39-1234" />
                </div>
             </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Item</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px] print:hidden"><span className='sr-only'>Delete</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const amount = item.quantity * item.rate;
                return (
                    <TableRow key={index}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{amount.toFixed(2)}</TableCell>
                    <TableCell className="print:hidden">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(index)} className='text-muted-foreground hover:text-destructive'>
                            <Trash2 className='h-4 w-4' />
                        </Button>
                    </TableCell>
                    </TableRow>
                )
              })}
              {items.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                       No items added.
                    </TableCell>
                </TableRow>
              )}
              <TableRow className="print:hidden">
                <TableCell colSpan={5}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setIsAddItemOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Item from Inventory
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Separator className="my-4" />
          <div className="grid gap-2 text-sm">
            <div className="flex items-center">
              <div>Subtotal</div>
              <div className="ml-auto font-medium">₹{subtotal.toFixed(2)}</div>
            </div>
            <div className="flex items-center">
              <div>Taxes (GST @ 18%)</div>
              <div className="ml-auto font-medium">₹{tax.toFixed(2)}</div>
            </div>
            <div className="flex items-center font-semibold text-lg">
              <div>Total</div>
              <div className="ml-auto">₹{total.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3 print:hidden">
          <div className="text-xs text-muted-foreground">
            Invoice {invoiceId && <span className='font-mono'>{invoiceId}</span>} for <span className="font-semibold">{customerDetails.name}</span> 
            {customerDetails.vehicleNumber && ` (${customerDetails.vehicleNumber})`}
          </div>
          <div className="ml-auto flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={handleSendWhatsApp}>
                <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePrint('digital')}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button size="sm" onClick={handleProcessPayment}>
              <CreditCard className="mr-2 h-4 w-4" /> Process Payment
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Item from Inventory</DialogTitle>
            <DialogDescription>
              Search for a part or service to add to the invoice.
            </DialogDescription>
          </DialogHeader>
          <SelectItemDialog onSelectItem={handleAddItem} onFinished={() => setIsAddItemOpen(false)} />
        </DialogContent>
      </Dialog>
      
       <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Confirm payment method and finalize the invoice.
            </DialogDescription>
          </DialogHeader>
           <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
                <div className='flex items-center justify-between rounded-lg border p-4'>
                    <Label htmlFor="totalAmount" className='text-muted-foreground'>Amount to be Paid</Label>
                    <div id="totalAmount" className='text-2xl font-bold font-headline'>₹{total.toFixed(2)}</div>
                </div>
                 <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-4 pt-4">
                    <div>
                        <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                        <Label htmlFor="cash" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        Cash
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="card" id="card" className="peer sr-only" />
                        <Label htmlFor="card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        Card
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                        <Label htmlFor="upi" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        UPI
                        </Label>
                    </div>
                </RadioGroup>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
             <DialogClose asChild>
                <Button type="button" variant="secondary">
                    Close
                </Button>
            </DialogClose>
            <Button type="button" variant="default" onClick={() => handleConfirmPayment(paymentMethod)}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
