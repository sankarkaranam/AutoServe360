'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/app/_providers/auth'; // <-- from your provider
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Cake, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getMonth, addMonths, format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CreateCampaignForm, type Campaign } from './create-campaign-form';

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string; // ISO: YYYY-MM-DD
};

const sampleCustomers: Customer[] = [
  { id: 'cust-1', firstName: 'Srinivas', lastName: 'Reddy', email: 'srinivas.r@example.com', phone: '9876500001', dateOfBirth: '1985-05-10' },
  { id: 'cust-2', firstName: 'Padma', lastName: 'Rao', email: 'padma.rao@example.com', phone: '9876500002', dateOfBirth: '1992-11-21' },
  { id: 'cust-3', firstName: 'Venkata', lastName: 'Naidu', email: 'venkata.n@example.com', phone: '9876500003', dateOfBirth: '1978-02-15' },
  { id: 'cust-4', firstName: 'Lakshmi', lastName: 'Kumari', email: 'lakshmi.k@example.com', phone: '9876500004', dateOfBirth: '1995-08-30' },
  { id: 'cust-5', firstName: 'Ravi', lastName: 'Varma', email: 'ravi.varma@example.com', phone: '9876500005', dateOfBirth: '1988-07-07' },
  { id: 'cust-6', firstName: 'Anusha', lastName: 'Chowdary', email: 'anusha.c@example.com', phone: '9876500006', dateOfBirth: '2000-01-25' },
  { id: 'cust-7', firstName: 'Murali', lastName: 'Krishna', email: 'murali.k@example.com', phone: '9876500007', dateOfBirth: '1980-09-12' },
  { id: 'cust-8', firstName: 'Sita', lastName: 'Ganti', email: 'sita.g@example.com', phone: '9876500008', dateOfBirth: '1999-03-03' },
  { id: 'cust-9', firstName: 'Prasad', lastName: 'Gupta', email: 'prasad.g@example.com', phone: '9876500009', dateOfBirth: '1975-12-18' },
  { id: 'cust-10', firstName: 'Jyothi', lastName: 'Yadav', email: 'jyothi.y@example.com', phone: '9876500010', dateOfBirth: '1991-06-01' },
  { id: 'cust-11', firstName: 'Babu', lastName: 'Raju', email: 'babu.raju@example.com', phone: '9876500011', dateOfBirth: '1982-04-22' },
  { id: 'cust-12', firstName: 'Durga', lastName: 'Prasad', email: 'durga.p@example.com', phone: '9876500012', dateOfBirth: '1993-10-05' },
  { id: 'cust-13', firstName: 'Gopi', lastName: 'Chand', email: 'gopi.chand@example.com', phone: '9876500013', dateOfBirth: '1986-08-14' },
  { id: 'cust-14', firstName: 'Uma', lastName: 'Maheswari', email: 'uma.m@example.com', phone: '9876500014', dateOfBirth: '1998-05-20' },
  { id: 'cust-15', firstName: 'Nageswara', lastName: 'Rao', email: 'nageswara.r@example.com', phone: '9876500015', dateOfBirth: '1970-03-10' },
];

export function CampaignManagement() {
  // still works with your existing AuthProvider
  const { user } = useAuth();

  const { toast } = useToast();
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  // Firebase-free campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'promo-001',
      name: 'Monsoon Service Offer',
      target: 'All Customers',
      channel: 'SMS',
      status: 'Sent',
      sentOn: new Date(2024, 6, 15).toISOString(),
    },
    {
      id: 'promo-002',
      name: 'New Year Discount',
      target: 'New Leads',
      channel: 'Email',
      status: 'Draft',
      sentOn: null,
    },
  ]);

  // If you later fetch real customers (REST/GraphQL), replace this.
  const allCustomers = sampleCustomers;

  const targetDate = useMemo(() => addMonths(new Date(), monthOffset), [monthOffset]);

  const birthdayCustomers = useMemo(() => {
    const targetMonth = getMonth(targetDate); // 0..11

    return allCustomers.filter((c) => {
      if (!c.dateOfBirth) return false;
      const parts = c.dateOfBirth.split('-'); // YYYY-MM-DD
      if (parts.length !== 3) return false;
      const month = Number(parts[1]); // 1..12
      if (Number.isNaN(month)) return false;
      return month - 1 === targetMonth;
    });
  }, [allCustomers, targetDate]);

  const handleSendWish = (customerName: string) => {
    toast({
      title: 'Wish Sent!',
      description: `Birthday wish has been sent to ${customerName}.`,
    });
  };

  const handleCreateCampaign = (newCampaign: Campaign) => {
    setCampaigns((prev) => [newCampaign, ...prev]);
    toast({
      title: 'Campaign Created!',
      description: `The "${newCampaign.name}" campaign has been saved as a draft.`,
    });
    setIsCreateCampaignOpen(false);
  };

  // set to false since we’re not loading from the network anymore
  const isLoading = false;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>
                Send targeted wishes, promotions, and greetings to your customers.
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="ml-auto gap-1"
              onClick={() => setIsCreateCampaignOpen(true)}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Campaign
              </span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="birthdays">
            <TabsList>
              <TabsTrigger value="birthdays">Birthdays</TabsTrigger>
              <TabsTrigger value="promotions">Promotions</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>

            {/* Birthdays */}
            <TabsContent value="birthdays" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {format(targetDate, 'MMMM yyyy')} Birthdays
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setMonthOffset((v) => v - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setMonthOffset(0)} disabled={monthOffset === 0}>
                    Current Month
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setMonthOffset((v) => v + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <>
                      <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                      <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    </>
                  )}

                  {!isLoading && birthdayCustomers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.firstName} {c.lastName}
                      </TableCell>
                      <TableCell>
                        <div>{c.email || '-'}</div>
                        <div className="text-sm text-muted-foreground">{c.phone || '-'}</div>
                      </TableCell>
                      <TableCell>
                        {c.dateOfBirth
                          ? new Date(`${c.dateOfBirth}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleSendWish(`${c.firstName} ${c.lastName}`)}>
                          <Cake className="mr-2 h-4 w-4" />
                          Send Birthday Wish
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!isLoading && birthdayCustomers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No customers have a birthday in {format(targetDate, 'MMMM')}.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Promotions */}
            <TabsContent value="promotions" className="mt-4">
              <h3 className="text-lg font-semibold mb-4">Promotional Campaigns</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.target}</TableCell>
                      <TableCell>{campaign.channel}</TableCell>
                      <TableCell>
                        <Badge
                          variant={campaign.status === 'Sent' ? 'default' : 'secondary'}
                          className={campaign.status === 'Sent' ? 'bg-green-600' : ''}
                        >
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {campaign.sentOn ? new Date(campaign.sentOn).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Scheduled */}
            <TabsContent value="scheduled" className="mt-4">
              <div className="text-center text-muted-foreground py-16">
                <p>No campaigns scheduled for the future.</p>
                <p className="text-sm">Create a new campaign and set a future date to see it here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Campaign */}
      <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Design and schedule a new promotional message for your customers or leads.
            </DialogDescription>
          </DialogHeader>
          <CreateCampaignForm onFinished={handleCreateCampaign} />
        </DialogContent>
      </Dialog>
    </>
  );
}
