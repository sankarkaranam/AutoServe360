'use client';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const samplePlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 999,
    features: 'CRM & Leads, Basic Inventory',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 1999,
    features: 'Basic Plan + POS, Service Reminders',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2999,
    features: 'Standard Plan + Advanced Reports, AI Tools',
  },
];

export function SubscriptionManagement() {
  // In the future, this would come from a useCollection hook
  const [plans] = useState(samplePlans);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Subscription Plan Management</CardTitle>
            <CardDescription>
              Create, view, and manage subscription plans for dealers.
            </CardDescription>
          </div>
          <Button size="sm" className="ml-auto gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Plan
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Price (per month)</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>₹{plan.price.toLocaleString()}</TableCell>
                <TableCell>{plan.features}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit Plan</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
