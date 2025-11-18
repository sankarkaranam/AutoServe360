'use client';

import { useState } from 'react';
import { addDays, format, isWithinInterval } from 'date-fns';
import { Calendar as CalendarIcon, Search, X, MoreHorizontal, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { type InvoiceItem } from './add-item-form';
import { Skeleton } from '../ui/skeleton';


export type Transaction = {
  id: string;
  customer: string;
  amount: number;
  status: 'Paid' | 'Due' | 'Partial';
  date: string;
  invoiceId: string;
  items: InvoiceItem[];
};

type RecentTransactionsProps = {
  transactions: Transaction[];
  onDeleteTransaction: (transactionId: string) => void;
  isLoading: boolean;
};

export function RecentTransactions({ transactions, onDeleteTransaction, isLoading }: RecentTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const handleDatePreset = (preset: string) => {
    const now = new Date();
    if (preset === 'today') {
      setDate({ from: now, to: now });
    } else if (preset === 'yesterday') {
      const yesterday = addDays(now, -1);
      setDate({ from: yesterday, to: yesterday });
    } else if (preset === 'last_7_days') {
      setDate({ from: addDays(now, -6), to: now });
    } else if (preset === 'last_30_days') {
      setDate({ from: addDays(now, -29), to: now });
    } else {
      setDate(undefined);
    }
  };
  
  const resetDate = () => setDate(undefined);

  const filteredTransactions = transactions.filter((tx) => {
    const transactionDate = new Date(tx.date);
    const inDateRange =
      !date ||
      !date.from ||
      isWithinInterval(transactionDate, {
        start: date.from,
        end: date.to || date.from,
      });

    const matchesSearch =
      searchTerm.trim() === '' ||
      tx.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());

    return inDateRange && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Transaction History</CardTitle>
        <CardDescription>
          Search and filter your sales transactions.
        </CardDescription>
        <div className="flex flex-col gap-4 pt-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or invoice..."
              className="w-full rounded-lg bg-background pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal md:w-[240px]',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} -{' '}
                        {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                 <div className="flex items-center justify-between p-2">
                  <Select onValueChange={handleDatePreset}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="last_7_days">Last 7 days</SelectItem>
                      <SelectItem value="last_30_days">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                   {date && (
                    <Button variant="ghost" size="icon" onClick={resetDate}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell colSpan={4}>
                        <Skeleton className="h-8 w-full" />
                    </TableCell>
                </TableRow>
            ))}
            {!isLoading && filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  No transactions found for the selected criteria.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filteredTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <div className="font-medium">{tx.customer}</div>
                  <div className="text-sm text-muted-foreground">{tx.invoiceId}</div>
                </TableCell>
                 <TableCell>
                  {format(new Date(tx.date), 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  ₹{tx.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onDeleteTransaction(tx.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete transaction</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
