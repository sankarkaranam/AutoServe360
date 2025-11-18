'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, IndianRupee, UserPlus, Wrench } from 'lucide-react';
import { isToday } from 'date-fns';

import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { AssistantCard } from '@/components/dashboard/assistant-card';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { StatCard } from '@/components/dashboard/stat-card';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

import { useTransactionStore } from '@/lib/transaction-store';
import { useAuth } from '@/app/_providers/auth';

function DealerDashboardInner() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { transactions } = useTransactionStore();

  // Compute today's sales from local store (demo data)
  const todaysSales = useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter((tx) => isToday(new Date(tx.date)))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  // Redirect unauthenticated users to dealer login
  useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login/dealer');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="p-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="mt-4 h-8 w-48" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      </div>
    );
  }

  // Friendly display name fallback chain
  const displayName =
    (user as any).display_name || user.name || (user as any).username || user.email || 'Dealer';

  return (
    <>
      <AppHeader />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">
          Welcome, {displayName}!
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Sales"
            value={`₹${todaysSales.toLocaleString('en-IN')}`}
            icon={<IndianRupee className="h-4 w-4" />}
            description="+20.1% from last month"
          />
          <StatCard
            title="New Leads"
            value="+45"
            icon={<UserPlus className="h-4 w-4" />}
            description="+180.1% from last month"
          />
          <StatCard
            title="Open Job Cards"
            value="12"
            icon={<Wrench className="h-4 w-4" />}
            description="+19% from last month"
          />
          <StatCard
            title="Pending Payments"
            value="₹23,150"
            icon={<Clock className="h-4 w-4" />}
            description="+2 from yesterday"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <SalesChart />
          </div>
          <div className="lg:col-span-3">
            <AssistantCard />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <ActivityFeed />
        </div>
      </main>
    </>
  );
}

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <DealerDashboardInner />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
