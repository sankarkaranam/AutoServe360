'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, CheckCircle2, AlertCircle, Download, Calendar as CalendarIcon, X } from 'lucide-react';
import { type InvoiceItem } from './add-item-form';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Skeleton } from "@/components/ui/skeleton"

export type Transaction = {
  id: string;
  customer: string;
  amount: number;
  status: 'Paid' | 'Due' | 'Partial';
  date: string;
  invoiceId: string;
  items: InvoiceItem[];
};

export function RecentTransactions({
  transactions,
  onDeleteTransaction,
  onDownloadInvoice,
  dateRange,
  setDateRange,
  isLoading = false
}: {
  transactions: Transaction[],
  onDeleteTransaction: (id: string) => void,
  onDownloadInvoice: (id: string) => void,
  dateRange: DateRange | undefined,
  setDateRange: (range: DateRange | undefined) => void,
  isLoading?: boolean
}) {
  return (
    <Card className="shadow-lg border-0 ring-1 ring-black/5 h-full flex flex-col">
      <CardHeader className="pb-4 border-b bg-muted/10 flex-none">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight font-headline">Recent Transactions</CardTitle>
            <CardDescription>Latest invoices and payments.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-background">
            {transactions.length} Records
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {dateRange && (
            <Button variant="ghost" size="icon" onClick={() => setDateRange(undefined)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted/5 sticky top-0 z-10 bg-background">
              <TableRow className="hover:bg-transparent border-none shadow-sm">
                <TableHead className="w-[40%] pl-6 h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                <TableHead className="text-center h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="text-right h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-muted/40">
                    <TableCell className="pl-6 py-4">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Skeleton className="h-6 w-16 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Skeleton className="h-5 w-16 ml-auto" />
                    </TableCell>
                    <TableCell className="pr-6 py-4">
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No recent transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="group hover:bg-muted/5 border-muted/40 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="font-medium">{transaction.customer}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5 flex items-center gap-1.5">
                        <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{transaction.invoiceId}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge
                        variant="secondary"
                        className={`
                        font-normal text-xs px-2.5 py-0.5 border
                        ${transaction.status === 'Paid'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : transaction.status === 'Partial'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }
                      `}
                      >
                        {transaction.status === 'Paid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {transaction.status === 'Due' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {transaction.status === 'Partial' && <Clock className="w-3 h-3 mr-1" />}
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium py-4">
                      ₹{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="pr-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDownloadInvoice(transaction.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTransaction(transaction.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
