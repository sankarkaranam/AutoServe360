'use client';

import { PlusCircle, Search, Printer, CreditCard, Trash2, MessageSquare, Loader2, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { PrintBill } from './print-bill';

import { getInvoice } from './data';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

export function PosMain({ onProcessPayment }: { onProcessPayment: (transaction: Omit<Transaction, 'id'>) => void; }) {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const {
    customer: customerDetails,
    items,
    invoiceId,
    setCustomer: setCustomerDetails,
    addItem,
    updateItemQuantity,
    deleteItem,
    clearInvoice,
    setInvoiceId
  } = useInvoiceStore();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    setMounted(true);
    if (!invoiceId) {
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

  const isValidPhone = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

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
    if (!isValidPhone(customerDetails.phone)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit mobile number.',
      });
      return;
    }
    setIsPaymentOpen(true);
  }

  const handleConfirmPayment = async (paymentMethod: string) => {
    if (!invoiceId) return;

    setIsProcessing(true);
    try {
      const newTransaction: Omit<Transaction, 'id'> = {
        customer: customerDetails.name,
        amount: total,
        status: 'Paid',
        date: new Date().toISOString(),
        invoiceId: invoiceId,
        items: items,
      };

      await onProcessPayment(newTransaction);

      toast({
        title: 'Payment Successful',
        description: `Invoice ${invoiceId} for ${customerDetails.name} has been paid.`,
      });

      // Prepare print data - useEffect will trigger print
      setPrintData({
        invoiceNumber: invoiceId,
        customerName: customerDetails.name,
        customerMobile: customerDetails.phone,
        customerEmail: customerDetails.email,
        vehicleNumber: customerDetails.vehicleNumber,
        items: items,
        subtotal: subtotal,
        tax: tax,
        total: total,
        paymentMethod: paymentMethod,
        date: new Date(),
      });

      clearInvoice();
      setIsPaymentOpen(false);
    } catch (error) {
      console.error("Payment processing failed", error);
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: 'There was an error processing the payment. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }

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

  const handleCustomerDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerDetails({ [name]: value });
  };

  return (
    <>
      <Card className="shadow-lg border-0 ring-1 ring-black/5 print:shadow-none print:border-none print:ring-0" id="invoice-card">
        <CardHeader className="pb-6 border-b bg-muted/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold tracking-tight font-headline">
                  New Invoice
                </CardTitle>
                {mounted && invoiceId && (
                  <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20">
                    {invoiceId}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                Create a professional invoice for your customer.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72 print:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search existing customer..."
                className="w-full pl-9 bg-background border-muted-foreground/20 focus-visible:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Name</Label>
              <Input
                id="customerName"
                name="name"
                value={customerDetails.name}
                onChange={handleCustomerDetailChange}
                placeholder="Enter name"
                className="h-11 bg-background border-muted-foreground/20 focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mobile Number</Label>
              <Input
                id="customerPhone"
                name="phone"
                value={customerDetails.phone}
                onChange={handleCustomerDetailChange}
                placeholder="Enter 10-digit mobile"
                className={`h-11 bg-background border-muted-foreground/20 focus-visible:ring-primary/20 ${customerDetails.phone && !isValidPhone(customerDetails.phone) ? 'border-destructive focus-visible:ring-destructive' : ''
                  }`}
              />
              {customerDetails.phone && !isValidPhone(customerDetails.phone) && (
                <p className="text-xs text-destructive">Must be 10 digits</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email (Optional)</Label>
              <Input
                id="customerEmail"
                name="email"
                value={customerDetails.email}
                onChange={handleCustomerDetailChange}
                placeholder="Enter email"
                className="h-11 bg-background border-muted-foreground/20 focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vehicle Number</Label>
              <Input
                id="vehicleNumber"
                name="vehicleNumber"
                value={customerDetails.vehicleNumber}
                onChange={handleCustomerDetailChange}
                placeholder="e.g., AP-39-1234"
                className="h-11 bg-background border-muted-foreground/20 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-b">
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[40%] pl-6 h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Item Details</TableHead>
                  <TableHead className="text-center h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Qty</TableHead>
                  <TableHead className="text-right h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rate</TableHead>
                  <TableHead className="text-right h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                  <TableHead className="w-[50px] print:hidden"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const amount = item.quantity * item.rate;
                  return (
                    <TableRow key={index} className="group hover:bg-muted/5 border-muted/40 transition-colors">
                      <TableCell className="pl-6 font-medium text-base py-4">{item.item}</TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateItemQuantity(index, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateItemQuantity(index, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground py-4">₹{item.rate.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono font-medium py-4">₹{amount.toFixed(2)}</TableCell>
                      <TableCell className="print:hidden pr-6 py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(index)}
                          className='h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {items.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="h-[300px] text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-2">
                          <Search className="h-6 w-6 opacity-50" />
                        </div>
                        <p className="font-medium">No items added yet</p>
                        <p className="text-sm text-muted-foreground/60 max-w-xs">
                          Search for items in the inventory or add custom services to create an invoice.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary"
                          onClick={() => setIsAddItemOpen(true)}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Item from Inventory
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {items.length > 0 && (
            <div className="p-6 bg-muted/5 print:hidden border-b">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed h-12 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={() => setIsAddItemOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Item
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 space-y-3">
                <h4 className="font-medium text-blue-900 text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Payment Notes
                </h4>
                <textarea
                  className="w-full bg-transparent border-none text-sm text-blue-800 placeholder:text-blue-800/40 focus:ring-0 resize-none h-20"
                  placeholder="Add notes about payment terms or additional details..."
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Taxes (GST @ 18%)</span>
                <span className="font-mono">₹{tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">Total Amount</span>
                <span className="font-bold text-2xl font-headline text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t bg-muted/5 px-8 py-6 print:hidden">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            Ready to process
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleSendWhatsApp} className="flex-1 sm:flex-none">
              <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" onClick={() => handlePrint('digital')} className="flex-1 sm:flex-none">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button
              size="lg"
              onClick={handleProcessPayment}
              disabled={items.length === 0}
              className="flex-1 sm:flex-none shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
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
            <Button type="button" variant="default" onClick={() => handleConfirmPayment(paymentMethod)} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Bill Component */}
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
