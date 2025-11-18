'use client';
import {
  BarChart3,
  Boxes,
  BrainCircuit,
  Building,
  Download,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Settings,
  ShoppingCart,
  Sparkles,
  Ticket,
  Users,
  Wrench,
  Package,
  CalendarClock,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { CardTitle } from '../ui/card'; // Adjust the path based on your project structure
import { Button } from '../ui/button';
import { useAuth } from '@/app/_providers/auth';

export function AppSidebar() {
  const { user } = useAuth();

  const pathname = usePathname();
  const isAdmin = user?.email === 'admin@example.com';
  const isDealerAdmin = user?.email === 'dealer@example.com';

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleName = () => {
    if (isAdmin) return 'SaaS Admin';
    if (isDealerAdmin) return 'Dealer Admin';
    // You can expand this logic for other roles
    if (user?.email?.includes('supervisor')) return 'Supervisor';
    if (user?.email?.includes('staff')) return 'Staff';
    return 'User';
  };
  
  const displayName = user?.name || 'User'; // Assuming 'name' exists on the User type
  const displayRole = getRoleName();
  const displayInitials = getInitials(displayName);


  if (isAdmin) {
    return (
       <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="h-16 justify-center p-4">
          <Logo className="size-7 shrink-0 text-sidebar-primary" />
          <span className="font-headline text-xl font-bold text-white">
            Hero Motors
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === '/admin/dashboard'}>
                <Link href="/admin/dashboard">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dealers" isActive={pathname === '/admin/dashboard?tab=dealers'}>
                   <Link href="/admin/dashboard?tab=dealers">
                      <Building />
                      Dealers
                   </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Subscriptions" isActive={pathname === '/admin/dashboard?tab=subscriptions'}>
                   <Link href="/admin/dashboard?tab=subscriptions">
                    <Package />
                    Subscriptions
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Support Tickets" isActive={pathname === '/admin/dashboard?tab=support'}>
                   <Link href="/admin/dashboard?tab=support">
                    <Ticket />
                    Support
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Reports" isActive={pathname === '/admin/dashboard?tab=reports'}>
                  <Link href="/admin/dashboard?tab=reports">
                    <BarChart3 />
                    Reports
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
           <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" isActive={pathname.startsWith('/admin/settings')}>
                  <Link href="/admin/settings">
                    <Settings />
                    Settings
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <Button variant="ghost" className="h-auto w-full justify-start p-2">
              <Avatar className="size-8">
                <AvatarFallback>{displayInitials}</AvatarFallback>
              </Avatar>
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-sidebar-foreground">{displayName}</p>
                <p className="text-xs text-sidebar-foreground/70">
                  {displayRole}
                </p>
              </div>
          </Button>
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-16 justify-center p-4">
        <Logo className="size-7 shrink-0 text-sidebar-primary" />
        <span className="font-headline text-xl font-bold text-primary">
          Hero Motors
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === '/'}>
                <Link href="/">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="POS / Billing" isActive={pathname.startsWith('/pos')}>
              <Link href="/pos">
                <ShoppingCart />
                POS / Billing
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="CRM & Leads" isActive={pathname.startsWith('/crm')}>
              <Link href="/crm">
                <Users />
                CRM & Leads
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Vehicle & Service" isActive={pathname.startsWith('/vehicles')}>
              <Link href="/vehicles">
                <Wrench />
                Vehicle & Service
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Inventory" isActive={pathname.startsWith('/inventory')}>
              <Link href="/inventory">
                <Boxes />
                Inventory
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Campaigns" isActive={pathname.startsWith('/campaigns')}>
              <Link href="/campaigns">
                <Megaphone />
                Campaigns
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {isDealerAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Reports" isActive={pathname.startsWith('/reports')}>
                <Link href="/reports">
                  <BarChart3 />
                  Reports
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
         <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSub>
              <SidebarMenuButton tooltip="AI Tools">
                <BrainCircuit />
                AI Tools
              </SidebarMenuButton>
              <SidebarMenuSubItem>
                 <SidebarMenuSubButton asChild isActive={pathname.startsWith('/ai/import-data')}>
                  <Link href="/ai/import-data">
                    <Download/>
                    Import Data
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                 <SidebarMenuSubButton asChild isActive={pathname.startsWith('/ai/service-predictor')}>
                  <Link href="/ai/service-predictor">
                    <Sparkles/>
                    Service Predictor
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
               <SidebarMenuSubItem>
                 <SidebarMenuSubButton asChild isActive={pathname.startsWith('/ai/campaign-optimizer')}>
                  <Link href="/ai/campaign-optimizer">
                    <CalendarClock/>
                    Campaign Optimizer
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton tooltip="Support">
              <LifeBuoy />
              Support
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings" isActive={pathname.startsWith('/settings')}>
              <Link href="/settings">
                <Settings />
                Settings
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <Button variant="ghost" className="h-auto w-full justify-start p-2">
            <Avatar className="size-8">
              <AvatarFallback>{displayInitials}</AvatarFallback>
            </Avatar>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-sidebar-foreground">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/70">
                {displayRole}
              </p>
            </div>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export async function getServerSideProps() {
  const invoiceId = 'INV-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return {
    props: { invoiceId },
  };
}

export default function POSPage({ invoiceId }: { invoiceId: string }) {
  return (
    <PosMain invoiceId={invoiceId} />
  );
}

// filepath: components/pos/pos-main.tsx
export function PosMain({ invoiceId }: { invoiceId: string }) {
  return (
    <CardTitle className="font-headline flex items-baseline gap-4">
      New Invoice
      <span className="text-sm font-mono text-muted-foreground">{invoiceId}</span>
    </CardTitle>
  );
}
