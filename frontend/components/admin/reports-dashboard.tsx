'use client';
import { useState } from 'react';
import { addDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Users, Package, BarChart as BarChartIcon, Calendar as CalendarIcon } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '../ui/badge';


const revenueData = [
  { month: 'Jan', revenue: 110000 },
  { month: 'Feb', revenue: 95000 },
  { month: 'Mar', revenue: 120000 },
  { month: 'Apr', revenue: 135000 },
  { month: 'May', revenue: 125000 },
  { month: 'Jun', revenue: 150000 },
];

const newDealersData = [
  { month: 'Jan', count: 8 },
  { month: 'Feb', count: 10 },
  { month: 'Mar', count: 7 },
  { month: 'Apr', count: 12 },
  { month: 'May', count: 15 },
  { month: 'Jun', count: 11 },
]

const planDistributionData = [
    { name: 'Basic', value: 45, color: 'hsl(var(--chart-1))' },
    { name: 'Standard', value: 55, color: 'hsl(var(--chart-2))' },
    { name: 'Premium', value: 25, color: 'hsl(var(--chart-3))' },
];

const recentTransactions = [
    { id: 'TXN-001', dealer: 'Prestige Motors', plan: 'Premium', amount: 2999, date: '2024-07-22' },
    { id: 'TXN-002', dealer: 'Galaxy Auto', plan: 'Standard', amount: 1999, date: '2024-07-21' },
    { id: 'TXN-003', dealer: 'Sunrise Cars', plan: 'Basic', amount: 999, date: '2024-07-21' },
    { id: 'TXN-004', dealer: 'Deccan Wheels', plan: 'Premium', amount: 2999, date: '2024-07-20' },
];

const newSignups = [
    { dealer: 'Cyber Auto', plan: 'Standard', date: '2024-07-22' },
    { dealer: 'Pearl Motors', plan: 'Basic', date: '2024-07-20' },
    { dealer: 'Charminar Cars', plan: 'Premium', date: '2024-07-19' },
]

export function ReportsDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <CardTitle>Reports and Analytics</CardTitle>
                <CardDescription>
                    Detailed insights into platform performance and financial metrics.
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
        <StatCard
          title="Total Revenue"
          value="₹7,40,000"
          icon={<IndianRupee className="h-4 w-4" />}
          description="+11.5% from last period"
        />
        <StatCard
          title="New Dealers"
          value="+63"
          icon={<Users className="h-4 w-4" />}
          description="+18.2% from last period"
        />
        <StatCard
          title="Avg. Revenue Per Dealer"
          value="₹5,920"
          icon={<Package className="h-4 w-4" />}
          description="Across all active dealers"
        />
        <StatCard
          title="Churn Rate"
          value="1.2%"
          icon={<BarChartIcon className="h-4 w-4" />}
          description="-0.5% from last period"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Monthly revenue generated from subscriptions.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} fontSize={12} tickLine={false} axisLine={false}/>
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                        <Legend />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>
          <Card>
            <CardHeader>
                <CardTitle>New Dealers Trend</CardTitle>
                <CardDescription>Number of new dealers joining each month.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={newDealersData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false}/>
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" name="New Dealers" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>
      </div>

       <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Breakdown of active dealers by subscription plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={planDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                   {planDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className='p-4'>
            <Tabs defaultValue="transactions">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                <TabsTrigger value="signups">New Signups</TabsTrigger>
              </TabsList>
              <TabsContent value="transactions" className='mt-4'>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Dealer</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className='text-right'>Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentTransactions.map(tx => (
                            <TableRow key={tx.id}>
                                <TableCell className="font-medium">{tx.dealer}</TableCell>
                                <TableCell><Badge variant="outline">{tx.plan}</Badge></TableCell>
                                <TableCell>{format(new Date(tx.date), 'dd MMM yyyy')}</TableCell>
                                <TableCell className='text-right'>₹{tx.amount.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
              </TabsContent>
              <TabsContent value="signups" className='mt-4'>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Dealer</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Signup Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {newSignups.map(signup => (
                            <TableRow key={signup.dealer}>
                                <TableCell className="font-medium">{signup.dealer}</TableCell>
                                <TableCell><Badge variant="outline">{signup.plan}</Badge></TableCell>
                                <TableCell>{format(new Date(signup.date), 'dd MMM yyyy')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
       </div>
    </div>
  );
}
