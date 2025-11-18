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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { EditDealerUserForm } from './edit-dealer-user-form';
import { useAuth } from '@/app/_providers/auth';

type UserManagementProps = {
    onAddUser: () => void;
}

const sampleUsers = [
    { id: 'user-1', firstName: 'Rajesh', lastName: 'Kumar', email: 'supervisor@example.com', role: 'Supervisor' },
    { id: 'user-2', firstName: 'Anita', lastName: 'Desai', email: 'staff@example.com', role: 'Staff' },
];

export function UserManagement({ onAddUser }: UserManagementProps) {
  const { user } = useAuth();

  const { toast } = useToast();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState(sampleUsers);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (email: string) => {
    toast({
        title: 'Password Reset Email Sent',
        description: `A password reset link has been sent to ${email}.`,
    });
  };
  
  const openEditDialog = (dealerUser: any) => {
    setSelectedUser(dealerUser);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (dealerUser: any) => {
    setSelectedUser(dealerUser);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setUsers(users.filter(u => u.id !== selectedUser.id));
    toast({
        title: 'User Deleted',
        description: `${selectedUser.firstName} ${selectedUser.lastName} has been removed from your dealership.`,
    });
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  
  const handleEditUser = (values: any) => {
    if(!selectedUser) return;
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...values } : u));
    setIsEditDialogOpen(false);
    toast({
        title: 'User Updated',
        description: `${values.firstName} ${values.lastName}'s details have been updated.`,
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage staff and other users within your dealership.
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="ml-auto gap-1"
              onClick={onAddUser}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add User
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                  <>
                    <TableRow>
                      <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  </>
                )}
              {!isLoading && users && users.map((dealerUser) => (
                <TableRow key={dealerUser.id}>
                  <TableCell className="font-medium">{dealerUser.firstName} {dealerUser.lastName}</TableCell>
                  <TableCell>{dealerUser.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dealerUser.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(dealerUser)}>Edit User</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(dealerUser.email)}>
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(dealerUser)}
                        >
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!users || users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      No users found. Add one to get started.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the details for {selectedUser?.firstName} {selectedUser?.lastName}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <EditDealerUserForm 
              userToEdit={selectedUser} 
              onFinished={(values) => {
                handleEditUser(values);
                setIsEditDialogOpen(false);
                setSelectedUser(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account from your dealership records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteUser}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
