'use client';
import { useState, useMemo, useEffect } from 'react';
import { addDays, format, startOfMonth, subMonths, isWithinInterval } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Users, Package, BarChart as BarChartIcon, Calendar as CalendarIcon, Wrench } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useTransactionStore } from '@/lib/transaction-store';
import { generateMonthlyData, generateRecentActivity } from '@/lib/data-utils';

const revenueSplitData = [
    { name: 'Vehicle Service', value: 65, color: 'hsl(var(--chart-1))' },
    { name: 'Parts & Accessories', value: 35, color: 'hsl(var(--chart-2))' },
];


export function DealerReports() {
  const { transactions } = useTransactionStore();
  
  const [allMonthlyData, setAllMonthlyData] = useState<any[]>([]);
  const [allRecentActivity, setAllRecentActivity] = useState<any[]>([]);
  const isLoading = false; // Not loading from firestore anymore

  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(subMonths(new Date(), 5)),
    to: new Date(),
  });

   useEffect(() => {
    if(transactions){
        setAllMonthlyData(generateMonthlyData(transactions));
        setAllRecentActivity(generateRecentActivity(transactions));
    }
  }, [transactions]);


  const filteredData = useMemo(() => {
    if (isLoading || !date?.from || !transactions) return [];
    return allMonthlyData.filter(d => isWithinInterval(d.date, { start: date.from!, end: date.to || date.from! }));
  }, [date, allMonthlyData, isLoading, transactions]);

  const filteredActivity = useMemo(() => {
    if (isLoading || !date?.from || !transactions) return [];
    const activities = generateRecentActivity(transactions);
    return activities.filter(d => isWithinInterval(new Date(d.date), { start: date.from!, end: date.to || date.from! }));
  }, [date, transactions, isLoading]);
  
  const totals = useMemo(() => {
    if (isLoading || !transactions) return { sales: 0, services: 0, newCustomers: 0 };
    return filteredData.reduce((acc, curr) => {
        acc.sales += curr.sales;
        acc.services += curr.services;
        acc.newCustomers += curr.newCustomers;
        return acc;
    }, { sales: 0, services: 0, newCustomers: 0 });
  }, [filteredData, isLoading, transactions]);
  
  const avgSaleValue = useMemo(() => {
    if (isLoading || !transactions) return 0;
    if(filteredActivity.length === 0) return 0;
    const total = filteredActivity.reduce((sum, act) => sum + act.amount, 0);
    return total / filteredActivity.length;
  }, [filteredActivity, isLoading, transactions]);

  const StatCardWrapper = ({...props}) => (
    isLoading ? <Skeleton className="h-28 w-full" /> : <StatCard {...props} />
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <CardTitle>Your Reports</CardTitle>
                <CardDescription>
                    Insights into your dealership's performance.
                </CardDescription>
            </div>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-full md:w-[300px] justify-start text-left font-normal',
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
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardWrapper
          title="Total Sales"
          value={`₹${totals.sales.toLocaleString('en-IN')}`}
          icon={<IndianRupee className="h-4 w-4" />}
          description="Sales within the selected period"
        />
        <StatCardWrapper
          title="New Customers"
          value={`+${totals.newCustomers}`}
          icon={<Users className="h-4 w-4" />}
          description="New customers in this period"
        />
        <StatCardWrapper
          title="Services Completed"
          value={totals.services.toString()}
          icon={<Wrench className="h-4 w-4" />}
          description="Jobs completed in this period"
        />
        <StatCardWrapper
          title="Avg. Sale Value"
          value={`₹${avgSaleValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={<BarChartIcon className="h-4 w-4" />}
          description="Average per transaction"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
         <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
                <CardDescription>Monthly sales performance for the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    {isLoading ? <Skeleton className="h-full w-full" /> : (
                        <BarChart data={filteredData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} fontSize={12} tickLine={false} axisLine={false}/>
                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                            <Legend />
                            <Bar dataKey="sales" fill="hsl(var(--primary))" name="Sales" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
         </Card>
         <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Revenue Split</CardTitle>
                <CardDescription>Overall breakdown of revenue sources.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                    <PieChart>
                        <Pie data={revenueSplitData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {revenueSplitData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} />
                        <Legend />
                    </PieChart>
                )}
                </ResponsiveContainer>
            </CardContent>
         </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>A log of your sales and service jobs for the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className='text-right'>Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && filteredActivity.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                No activity found for the selected period.
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && filteredActivity.map(item => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Badge variant={item.type === 'Sale' ? 'default' : 'secondary'} className={item.type === 'Sale' ? 'bg-blue-500' : 'bg-green-500'}>{item.type}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell>{format(new Date(item.date), 'dd MMM yyyy')}</TableCell>
                            <TableCell className='text-right'>₹{item.amount.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
