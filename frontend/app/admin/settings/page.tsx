'use client';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AdminSettings } from '@/components/settings/admin-settings';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AdminSettingsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <AdminSettings />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
