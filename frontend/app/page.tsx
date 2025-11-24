'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, IndianRupee, UserPlus, Wrench } from 'lucide-react';

import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { AssistantCard } from '@/components/dashboard/assistant-card';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { StatCard } from '@/components/dashboard/stat-card';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/app/_providers/auth';
import { getDashboardStats, type DashboardStats } from '@/components/dashboard/data';

function DealerDashboardInner() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setDataLoading(true);
        const data = await getDashboardStats();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

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
            value={dataLoading ? '...' : `₹${dashboardData?.today_sales.toLocaleString('en-IN') || '0'}`}
            icon={<IndianRupee className="h-4 w-4" />}
            description={dataLoading ? 'Loading...' : `${dashboardData?.today_sales || 0 > 0 ? 'Active sales today' : 'No sales yet today'}`}
          />
          <StatCard
            title="New Leads"
            value={dataLoading ? '...' : `+${dashboardData?.new_leads || '0'}`}
            icon={<UserPlus className="h-4 w-4" />}
            description={dataLoading ? 'Loading...' : 'Last 30 days'}
          />
          <StatCard
            title="Open Job Cards"
            value="0"
            icon={<Wrench className="h-4 w-4" />}
            description="Coming soon"
          />
          <StatCard
            title="Pending Payments"
            value={dataLoading ? '...' : `₹${dashboardData?.pending_payments.toLocaleString('en-IN') || '0'}`}
            icon={<Clock className="h-4 w-4" />}
            description={dataLoading ? 'Loading...' : 'Unpaid invoices'}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <SalesChart data={dashboardData?.sales_overview || []} loading={dataLoading} />
          </div>
          <div className="lg:col-span-3">
            <AssistantCard />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <ActivityFeed activities={dashboardData?.recent_activity || []} loading={dataLoading} />
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
