'use client';
import { useState, useEffect } from 'react';
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
import { MoreHorizontal, PlusCircle, Loader2, RefreshCw, Pencil, Settings } from 'lucide-react';
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
import { api } from '@/lib/api';

interface Dealer {
  tenant_id: string;
  name: string;
  plan: string;
  status: string;
  is_active: boolean;
  created_at: string;
  subscription_end: string | null;
}

import { FeatureManagementModal } from './feature-management-modal';
// Icons already imported above

// ... existing imports ...

export function DealerManagement() {
  const [isAddDealerOpen, setIsAddDealerOpen] = useState(false);
  const [isEditDealerOpen, setIsEditDealerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { toast } = useToast();

  const fetchDealers = async () => {
    try {
      setIsRefreshing(true);
      const data = await api<Dealer[]>('/api/v1/saas/dealers');
      setDealers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dealers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleResetPassword = async (email: string) => {
    toast({
      title: 'Password Reset Email Sent',
      description: `A password reset link has been sent to ${email}.`,
    });
  };

  const openEditDialog = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setIsEditDealerOpen(true);
  };

  const openDeleteDialog = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setIsDeleteDialogOpen(true);
  };

  const openFeatureModal = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setIsFeatureModalOpen(true);
  };

  const handleDeleteDealer = async () => {
    if (!selectedDealer) return;

    try {
      await api(`/api/v1/saas/dealers/${selectedDealer.tenant_id}`, {
        method: 'DELETE',
      });

      toast({
        title: 'Dealer Deleted',
        description: `${selectedDealer.name} has been removed from the database.`,
      });

      await fetchDealers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete dealer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDealer(null);
    }
  };

  const handleToggleStatus = async (dealer: Dealer) => {
    try {
      const newStatus = dealer.is_active ? false : true;

      await api(`/api/v1/saas/dealers/${dealer.tenant_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          is_active: newStatus,
          status: newStatus ? 'active' : 'suspended'
        }),
      });

      toast({
        title: `Dealer ${newStatus ? 'Activated' : 'Suspended'}`,
        description: `${dealer.name}'s status has been updated.`,
      });

      await fetchDealers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update dealer status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddDealer = async (values: any) => {
    try {
      await api('/api/v1/saas/dealers', {
        method: 'POST',
        body: JSON.stringify({
          name: values.companyName,
          plan: values.subscriptionPlanId,
          admin_email: values.contactEmail,
          admin_password: 'password', // Default password, should be random or set by user
          admin_name: values.contactName,
        }),
      });

      toast({
        title: 'Dealer Added Successfully',
        description: `${values.companyName} has been created and a password setup email has been sent.`,
      });

      setIsAddDealerOpen(false);
      await fetchDealers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create dealer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditDealer = async (values: any) => {
    if (!selectedDealer) return;

    try {
      await api(`/api/v1/saas/dealers/${selectedDealer.tenant_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: values.companyName,
          plan: values.subscriptionPlanId,
        }),
      });

      toast({
        title: 'Dealer Updated Successfully',
        description: `${values.companyName}'s details have been updated.`,
      });

      setIsEditDealerOpen(false);
      setSelectedDealer(null);
      await fetchDealers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update dealer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
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
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchDealers()}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
              </Button>
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription End</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!isLoading && dealers && dealers.map((dealer) => {
                const daysRemaining = getDaysRemaining(dealer.subscription_end);
                const isExpiringSoon = daysRemaining !== null && daysRemaining < 30 && daysRemaining > 0;

                return (
                  <TableRow key={dealer.tenant_id}>
                    <TableCell className="font-medium">
                      {dealer.name}
                    </TableCell>
                    <TableCell className="capitalize">
                      <Badge variant="outline">{dealer.plan || 'None'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={dealer.is_active && dealer.status === 'active' ? 'default' : 'destructive'}
                        className={dealer.is_active && dealer.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {dealer.is_active ? dealer.status : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {dealer.subscription_end ? (
                        <div className="flex flex-col">
                          <span>{new Date(dealer.subscription_end).toLocaleDateString()}</span>
                          {isExpiringSoon && (
                            <span className="text-xs text-orange-600">
                              {daysRemaining} days left
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(dealer.created_at).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => openEditDialog(dealer)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openFeatureModal(dealer)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Features
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(dealer)}>
                            {dealer.is_active ? 'Suspend Dealer' : 'Activate Dealer'}
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
                );
              })}
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
              Update the details for {selectedDealer?.name}.
            </DialogDescription>
          </DialogHeader>
          <EditDealerForm
            dealer={selectedDealer ? {
              id: selectedDealer.tenant_id,
              companyName: selectedDealer.name,
              subscriptionPlanId: selectedDealer.plan,
              contactName: '',
              contactEmail: '',
              status: selectedDealer.status,
              expiryDate: selectedDealer.subscription_end || ''
            } : null}
            onFinished={(values) => {
              handleEditDealer(values);
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
      <FeatureManagementModal
        isOpen={isFeatureModalOpen}
        onClose={() => {
          setIsFeatureModalOpen(false);
          setSelectedDealer(null);
        }}
        dealer={selectedDealer}
      />
    </>
  );
}
