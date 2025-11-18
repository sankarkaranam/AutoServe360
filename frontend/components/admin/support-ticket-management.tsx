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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const sampleTickets = [
  {
    id: 'ticket-001',
    subject: 'Cannot login to POS',
    dealer: 'Prestige Motors',
    priority: 'High',
    status: 'Open',
    lastUpdate: '2 hours ago',
  },
  {
    id: 'ticket-002',
    subject: 'Billing question for invoice #INV-123',
    dealer: 'Galaxy Auto',
    priority: 'Medium',
    status: 'In Progress',
    lastUpdate: '1 day ago',
  },
  {
    id: 'ticket-003',
    subject: 'Feature request: Dark Mode',
    dealer: 'Sunrise Cars',
    priority: 'Low',
    status: 'Resolved',
    lastUpdate: '3 days ago',
  },
];

const priorityVariant: Record<string, 'destructive' | 'secondary' | 'default'> = {
    'High': 'destructive',
    'Medium': 'secondary',
    'Low': 'default'
}

const statusVariant: Record<string, string> = {
    'Open': 'bg-red-500',
    'In Progress': 'bg-yellow-500',
    'Resolved': 'bg-green-500'
}


export function SupportTicketManagement() {
  // In the future, this would come from a useCollection hook
  const [tickets] = useState(sampleTickets);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>
          View and respond to support tickets from dealers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dealer</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.dealer}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>
                    <Badge variant={priorityVariant[ticket.priority] || 'default'}>{ticket.priority}</Badge>
                </TableCell>
                <TableCell>
                    <Badge className={statusVariant[ticket.status] || ''}>{ticket.status}</Badge>
                </TableCell>
                <TableCell>{ticket.lastUpdate}</TableCell>
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
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                      <DropdownMenuItem>Close Ticket</DropdownMenuItem>
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
