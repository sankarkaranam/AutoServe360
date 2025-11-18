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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
import { AddDealerForm } from './add-dealer-form';
import { EditDealerForm } from './edit-dealer-form';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const sampleDealers = [
    { id: 'dealer-1', companyName: 'Prestige Motors', contactName: 'Rohan Sharma', contactEmail: 'rohan@example.com', subscriptionPlanId: 'premium', status: 'Active', expiryDate: '2025-07-20T00:00:00.000Z' },
    { id: 'dealer-2', companyName: 'Galaxy Auto', contactName: 'Priya Singh', contactEmail: 'priya@example.com', subscriptionPlanId: 'standard', status: 'Active', expiryDate: '2025-06-15T00:00:00.000Z' },
    { id: 'dealer-3', companyName: 'Sunrise Cars', contactName: 'Amit Patel', contactEmail: 'amit@example.com', subscriptionPlanId: 'basic', status: 'Suspended', expiryDate: '2024-08-01T00:00:00.000Z' },
];

export function DealerManagement() {
  const [isAddDealerOpen, setIsAddDealerOpen] = useState(false);
  const [isEditDealerOpen, setIsEditDealerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [dealers, setDealers] = useState(sampleDealers);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const handleResetPassword = async (email: string) => {
    toast({
        title: 'Password Reset Email Sent',
        description: `A password reset link has been sent to ${email}.`,
    });
  };

  const openEditDialog = (dealer: any) => {
    setSelectedDealer(dealer);
    setIsEditDealerOpen(true);
  };
  
  const openDeleteDialog = (dealer: any) => {
    setSelectedDealer(dealer);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDealer = async () => {
    if (!selectedDealer) return;
    setDealers(dealers.filter(d => d.id !== selectedDealer.id));
    toast({
        title: 'Dealer Deleted',
        description: `${selectedDealer.companyName} has been removed from the database.`,
    });
    setIsDeleteDialogOpen(false);
    setSelectedDealer(null);
  };
  
  const handleSuspendDealer = async (dealer: any) => {
    if (!dealer) return;
    const newStatus = dealer.status === 'Active' ? 'Suspended' : 'Active';
    setDealers(dealers.map(d => d.id === dealer.id ? { ...d, status: newStatus } : d));
    toast({
        title: `Dealer ${newStatus}`,
        description: `${dealer.companyName}'s status has been updated.`,
    });
  };
  
   const handleAddDealer = (values: any) => {
    const newDealer = {
        id: `dealer-${Date.now()}`,
        ...values,
        status: 'Active',
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    };
    setDealers(prev => [newDealer, ...prev]);
    setIsAddDealerOpen(false);
     toast({
        title: 'Dealer Added Successfully',
        description: `${values.companyName} has been created and a password setup email has been sent.`,
      });
  };

  const handleEditDealer = (values: any) => {
    if (!selectedDealer) return;
    setDealers(dealers.map(d => d.id === selectedDealer.id ? { ...d, ...values } : d));
    setIsEditDealerOpen(false);
    toast({
        title: 'Dealer Updated Successfully',
        description: `${values.companyName}'s details have been updated.`,
      });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Dealer Management</CardTitle>
              <CardDescription>
                View, manage, and add dealers to the platform.
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="ml-auto gap-1"
              onClick={() => setIsAddDealerOpen(true)}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Dealer
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>License Expiry</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  <TableRow>
                    <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                  <TableRow>
                     <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                </>
              )}
              {!isLoading && dealers && dealers.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell className="font-medium">
                    {dealer.companyName}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{dealer.contactName}</div>
                    <div className="text-sm text-muted-foreground">
                      {dealer.contactEmail}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{dealer.subscriptionPlanId}</TableCell>
                  <TableCell>
                    <Badge
                      variant={dealer.status === 'Active' ? 'default' : 'destructive'}
                      className={dealer.status === 'Active' ? 'bg-green-600' : ''}
                    >
                      {dealer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(dealer.expiryDate).toLocaleDateString()}
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
                        <DropdownMenuItem onClick={() => openEditDialog(dealer)}>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>Manage License</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspendDealer(dealer)}>
                           {dealer.status === 'Active' ? 'Suspend Dealer' : 'Activate Dealer'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleResetPassword(dealer.contactEmail)}>
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(dealer)}
                        >
                          Delete Dealer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {!isLoading && (!dealers || dealers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No dealers found. Add one to get started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isAddDealerOpen} onOpenChange={setIsAddDealerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Dealer</DialogTitle>
            <DialogDescription>
              A new user will be created and an email will be sent to them to set their password.
            </DialogDescription>
          </DialogHeader>
          <AddDealerForm onFinished={handleAddDealer} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDealerOpen} onOpenChange={setIsEditDealerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Dealer Details</DialogTitle>
            <DialogDescription>
              Update the details for {selectedDealer?.companyName}.
            </DialogDescription>
          </DialogHeader>
          <EditDealerForm 
            dealer={selectedDealer} 
            onFinished={(values) => {
              handleEditDealer(values);
              setIsEditDealerOpen(false);
              setSelectedDealer(null);
            }} 
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              dealer account and all associated data from the database. The
              authentication user will NOT be deleted automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteDealer}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
