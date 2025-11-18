'use client';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { DealerReports } from '@/components/reports/dealer-reports';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function ReportsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <DealerReports />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
