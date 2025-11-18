'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DealerManagement } from '@/components/admin/dealer-management';
import { Button } from '@/components/ui/button';
import { IndianRupee, Ticket, Users, CreditCard, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { SubscriptionManagement } from '@/components/admin/subscription-management';
import { SupportTicketManagement } from '@/components/admin/support-ticket-management';
import { ReportsDashboard } from '@/components/admin/reports-dashboard';
import { useAuth } from '@/app/_providers/auth';

function AdminDashboard() {
  const { user, loading } = useAuth(); // <- replaces Firebase useUser()
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Sync tab from querystring
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Gate: only admins allowed
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login/admin');
      return;
    }

    // Adjust this rule to your backend roles
    const isAdmin =
      user.role === 'superadmin' ||
      user.role === 'saas_admin' ||
      user.email === 'admin@example.com';

    if (!isAdmin) {
      router.replace('/');
    }
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/admin/dashboard?tab=${value}`, { scroll: false });
  };

  return (
    <>
      <AppHeader />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold font-headline tracking-tight">
            SaaS Admin Dashboard
          </h2>
          <div className="flex items-center gap-2">
            <Button>Download Report</Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dealers">Dealers</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="support">Support Tickets</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Revenue"
                value="₹4,52,310"
                icon={<IndianRupee className="h-4 w-4" />}
                description="+5.2% from last month"
              />
              <StatCard
                title="Active Subscriptions"
                value="+75"
                icon={<CreditCard className="h-4 w-4" />}
                description="+12.1% from last month"
              />
              <StatCard
                title="Total Dealers"
                value="125"
                icon={<Users className="h-4 w-4" />}
                description="+5 from last month"
              />
              <StatCard
                title="New Support Tickets"
                value="15"
                icon={<Ticket className="h-4 w-4" />}
                description="+8 since yesterday"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <div className="lg:col-span-4">
                <SalesChart />
              </div>
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                      <Activity /> Recent Signups
                    </CardTitle>
                    <CardDescription>New dealers who joined this week.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Prestige Motors</p>
                      <p>Galaxy Auto</p>
                      <p>Sunrise Cars</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dealers" className="space-y-4">
            <DealerManagement />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="support">
            <SupportTicketManagement />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

const AdminDashboardPageWithSuspense = () => (
  <Suspense fallback={<div className="p-6">Loading...</div>}>
    <AdminDashboard />
  </Suspense>
);

export default function AdminDashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <AdminDashboardPageWithSuspense />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
