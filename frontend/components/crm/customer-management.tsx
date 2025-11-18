'use client';

import { useState, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Gift, Cake } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AddCustomerForm } from './add-customer-form';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ViewCustomerDetails } from './view-customer-details';
import { AddVehicleForm } from './add-vehicle-form';
import { Badge } from '../ui/badge';

// Combined type for customer with their vehicles
type CustomerWithVehicles = any; // Using any for simplicity for now

const sampleLeads = [
    { id: 'lead-1', name: 'Naveen Kumar', source: 'Walk-in', status: 'New', vehicle: 'Hero Splendor', phone: '9123456780' },
    { id: 'lead-2', name: 'Priya Reddy', source: 'Website', status: 'Contacted', vehicle: 'Hero Xtreme 160R', phone: '9234567891' },
    { id: 'lead-3', name: 'Anand Varma', source: 'Referral', status: 'Follow-up', vehicle: 'Hero Glamour', phone: '9345678902' },
    { id: 'lead-4', name: 'Kiran Kumar', source: 'Website', status: 'New', vehicle: 'Hero Destini 125', phone: '9456789013' },
    { id: 'lead-5', name: 'Lalitha Devi', source: 'Walk-in', status: 'Follow-up', vehicle: 'Hero Pleasure+', phone: '9567890124' },
];

const sampleCustomers = [
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

const sampleVehicles = [
  { id: 'veh-1', customerId: 'cust-1', make: 'Hero', model: 'Splendor+', year: 2022, registrationNumber: 'AP03 C 1234', serviceCount: 3 },
  { id: 'veh-2', customerId: 'cust-2', make: 'Hero', model: 'Passion Pro', year: 2021, registrationNumber: 'AP05 F 5678', serviceCount: 2 },
  { id: 'veh-3', customerId: 'cust-3', make: 'Hero', model: 'Glamour', year: 2023, registrationNumber: 'AP26 N 9012', serviceCount: 1 },
  { id: 'veh-4', customerId: 'cust-4', make: 'Hero', model: 'Xtreme 160R', year: 2022, registrationNumber: 'AP07 B 3456', serviceCount: 4 },
  { id: 'veh-5', customerId: 'cust-5', make: 'Hero', model: 'Destini 125', year: 2020, registrationNumber: 'AP39 G 7890', serviceCount: 5 },
  { id: 'veh-6', customerId: 'cust-6', make: 'Hero', model: 'Pleasure+', year: 2023, registrationNumber: 'AP09 H 1122', serviceCount: 1 },
  { id: 'veh-7', customerId: 'cust-7', make: 'Hero', model: 'HF Deluxe', year: 2019, registrationNumber: 'TS08 E 3344', serviceCount: 6 },
  { id: 'veh-8', customerId: 'cust-8', make: 'Hero', model: 'Maestro Edge 125', year: 2022, registrationNumber: 'AP16 J 5566', serviceCount: 2 },
  { id: 'veh-9', customerId: 'cust-9', make: 'Hero', model: 'Super Splendor', year: 2018, registrationNumber: 'AP28 K 7788', serviceCount: 8 },
  { id: 'veh-10', customerId: 'cust-10', make: 'Hero', model: 'XPulse 200 4V', year: 2023, registrationNumber: 'AP31 L 9900', serviceCount: 1 },
  { id: 'veh-11', customerId: 'cust-11', make: 'Hero', model: 'Splendor+ XTEC', year: 2023, registrationNumber: 'AP02 M 1212', serviceCount: 2 },
  { id: 'veh-12', customerId: 'cust-12', make: 'Hero', model: 'Glamour XTEC', year: 2022, registrationNumber: 'AP04 P 3434', serviceCount: 3 },
  { id: 'veh-13', customerId: 'cust-13', make: 'Hero', model: 'HF 100', year: 2021, registrationNumber: 'AP27 Q 5656', serviceCount: 4 },
  { id: 'veh-14', customerId: 'cust-14', make: 'Hero', model: 'Xtreme 200S 4V', year: 2023, registrationNumber: 'TS09 R 7878', serviceCount: 1 },
  { id: 'veh-15', customerId: 'cust-15', make: 'Hero', model: 'Splendor+', year: 2017, registrationNumber: 'AP37 S 9090', serviceCount: 10 },
];

export function CustomerManagement() {
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState(sampleCustomers);
  const [vehicles, setVehicles] = useState(sampleVehicles);

  const { toast } = useToast();

  const customersWithVehicles = useMemo(() => {
    return customers.map(customer => ({
      ...customer,
      vehicles: vehicles.filter(v => v.customerId === customer.id)
    }));
  }, [customers, vehicles]);


  const openDeleteDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };
  
  const openViewDetailsDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setIsViewDetailsOpen(true);
  }
  
  const openAddVehicleDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setIsAddVehicleOpen(true);
  }

  const handleSendWish = (customerName: string, wishType: string) => {
    toast({
        title: 'Wish Sent!',
        description: `${wishType} has been sent to ${customerName}.`,
    })
  }

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
    setVehicles(vehicles.filter(v => v.customerId !== selectedCustomer.id));
    toast({
        title: 'Customer Deleted',
        description: `${selectedCustomer.firstName} ${selectedCustomer.lastName} and their vehicles have been removed.`,
    });
    setIsDeleteDialogOpen(false);
    setSelectedCustomer(null);
  };
  
  const handleAddCustomer = (values: any) => {
    const customerId = `cust-${Date.now()}`;
    const vehicleId = `veh-${Date.now()}`;
    const newCustomer = {
      id: customerId,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth || '',
    };
    const newVehicle = {
      id: vehicleId,
      customerId: customerId,
      make: values.make,
      model: values.model,
      year: values.year,
      registrationNumber: values.registrationNumber,
      serviceCount: 0,
    };
    setCustomers(prev => [newCustomer, ...prev]);
    setVehicles(prev => [newVehicle, ...prev]);
    setIsAddCustomerOpen(false);
    toast({
      title: 'Customer & Vehicle Added',
      description: `${values.firstName} ${values.lastName} and their vehicle have been added.`,
    });
  }

  const handleAddVehicle = (values: any) => {
     if (!selectedCustomer) return;
     const vehicleId = `veh-${Date.now()}`;
     const newVehicle = {
       id: vehicleId,
       customerId: selectedCustomer.id,
       ...values
     };
     setVehicles(prev => [newVehicle, ...prev]);
     setIsAddVehicleOpen(false);
      toast({
        title: 'Vehicle Added',
        description: `The new vehicle has been added to the customer's profile.`,
      });
  }


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Customer Relationship Management</CardTitle>
              <CardDescription>
                View, manage, and add customers, leads, and vehicle information.
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="ml-auto gap-1"
              onClick={() => setIsAddCustomerOpen(true)}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Customer
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customers">
            <TabsList>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
            </TabsList>
            <TabsContent value="customers" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Vehicle Reg. No.</TableHead>
                    <TableHead>Service Count</TableHead>
                    <TableHead>Wishes</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersWithVehicles.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </TableCell>
                      <TableCell>
                        <div>{customer.email}</div>
                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                      </TableCell>
                      <TableCell>
                        {customer.dateOfBirth ? new Date(customer.dateOfBirth + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {customer.vehicles.map((v: any) => v.registrationNumber).join(', ') || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {customer.vehicles.reduce((acc: number, v: any) => acc + (v.serviceCount || 0), 0) || 0}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Gift className="mr-2 h-4 w-4" />
                              Send
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Send a Wish</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleSendWish(`${customer.firstName} ${customer.lastName}`, 'Birthday Wish')}>
                              <Cake className="mr-2 h-4 w-4" />
                              <span>Birthday</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendWish(`${customer.firstName} ${customer.lastName}`, 'Vehicle Anniversary Wish')}>
                              Anniversary
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>Festival</DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => handleSendWish(`${customer.firstName} ${customer.lastName}`, 'Diwali Greeting')}>Diwali</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendWish(`${customer.firstName} ${customer.lastName}`, 'Holi Greeting')}>Holi</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendWish(`${customer.firstName} ${customer.lastName}`, 'Christmas Greeting')}>Christmas</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => openViewDetailsDialog(customer)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAddVehicleDialog(customer)}>Add Vehicle</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => openDeleteDialog(customer)}
                            >
                              Delete Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!customersWithVehicles || customersWithVehicles.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        No customers found. Add one to get started!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="leads" className="mt-4">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Vehicle of Interest</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className='sr-only'>Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {sampleLeads.map(lead => (
                        <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.phone}</TableCell>
                            <TableCell>{lead.vehicle}</TableCell>
                            <TableCell>{lead.source}</TableCell>
                            <TableCell>
                                <Badge variant={lead.status === 'New' ? 'default' : 'secondary'}>{lead.status}</Badge>
                            </TableCell>
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
                                    <DropdownMenuItem>Convert to Customer</DropdownMenuItem>
                                    <DropdownMenuItem>Mark as Not Interested</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
               </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer & Vehicle</DialogTitle>
            <DialogDescription>
              Enter the details for the new customer and their primary vehicle.
            </DialogDescription>
          </DialogHeader>
          <AddCustomerForm onFinished={handleAddCustomer} />
        </DialogContent>
      </Dialog>
      
      {selectedCustomer && (
        <>
          <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
            <DialogContent className="sm:max-w-2xl">
              <ViewCustomerDetails customer={selectedCustomer} />
            </DialogContent>
          </Dialog>

          <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Vehicle for {selectedCustomer.firstName}</DialogTitle>
                <DialogDescription>
                  Enter the details for the new vehicle.
                </DialogDescription>
              </DialogHeader>
              <AddVehicleForm customerId={selectedCustomer.id} onFinished={() => handleAddVehicle} />
            </DialogContent>
          </Dialog>
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer and all their associated vehicles. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteCustomer}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
