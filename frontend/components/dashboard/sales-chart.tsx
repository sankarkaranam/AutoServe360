'use client';
import { useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

const generateData = () => [
  {
    name: 'Sun',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Mon',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Tue',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Wed',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Thu',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Fri',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Sat',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
];


export function SalesChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate data on the client side only, after initial render
    setData(generateData());
    setIsLoading(false);
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">Sales Overview</CardTitle>
        <CardDescription>Your sales performance for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
            {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
            ) : (
                <BarChart data={data}>
                    <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    />
                    <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                    />
                    <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                    />
                    <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
