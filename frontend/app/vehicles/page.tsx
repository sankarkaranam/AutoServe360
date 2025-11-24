'use client';

import { VehicleList } from '@/components/vehicles/vehicle-list';
import { InventoryList } from '@/components/vehicles/inventory-list';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function VehiclesPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-bold tracking-tight font-headline">Vehicle & Service</h2>
              <p className="text-muted-foreground">
                Manage customer vehicles, dealer inventory, and service history.
              </p>
            </div>
            <Separator className="my-6" />

            <Tabs defaultValue="customers" className="w-full">
              <TabsList>
                <TabsTrigger value="customers">Customer Vehicles</TabsTrigger>
                <TabsTrigger value="inventory">Vehicle Inventory</TabsTrigger>
              </TabsList>

              <TabsContent value="customers" className="mt-6">
                <VehicleList />
              </TabsContent>

              <TabsContent value="inventory" className="mt-6">
                <InventoryList />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
