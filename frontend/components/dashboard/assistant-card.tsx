'use client';

import { getDashboardSummary, type DashboardSummaryOutput } from '@/ai/flows/smart-dashboard-assistant';
import { Sparkles, Bot } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function AssistantSummary() {
  const [summaryData, setSummaryData] = useState<DashboardSummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await getDashboardSummary({
          revenue: 3500000,
          sales: 573,
          leadConversionRate: 0.12,
          customerSatisfaction: 89,
          period: 'this month',
        });
        setSummaryData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard summary:', error);
        setError('Could not load AI summary at this time. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return <p className="text-sm text-foreground">{summaryData?.summary}</p>;
}

export function AssistantCard() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Sparkles className="text-accent" />
          <span>Smart Summary</span>
        </CardTitle>
        <CardDescription>
          An AI-powered summary of your performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-lg border bg-secondary/30 p-3">
          <div className="rounded-full border bg-background p-1.5">
            <Bot className="size-5 text-primary" />
          </div>
          <Suspense fallback={<Skeleton className="h-20 w-full" />}>
            <AssistantSummary />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
}
