'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Bell, CreditCard, User, Users } from 'lucide-react';
import { UserManagement } from './user-management';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { AddDealerUserForm } from './add-dealer-user-form';
import { useAuth } from '@/app/_providers/auth';
import { ProfileSettings } from './profile-settings';
import { Label } from '@/components/ui/label';


export function DealerSettings() {
    const { toast } = useToast();
    const { user } = useAuth();

    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

    // Only dealer admins can manage users. For this prototype, we identify the dealer admin by email.
    const isDealerAdmin = user?.email === 'dealer@example.com';

    const handleSave = () => {
        toast({
            title: "Settings Saved",
            description: "Your profile information has been updated.",
        });
    }

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, profile, and notification preferences.
        </p>
      </div>
      <Separator />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
          {isDealerAdmin && <TabsTrigger value="users"><Users className="mr-2 h-4 w-4"/>Users</TabsTrigger>}
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4"/>Notifications</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="mr-2 h-4 w-4"/>Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        {isDealerAdmin && (
            <TabsContent value="users">
                <UserManagement onAddUser={() => setIsAddUserOpen(true)} />
            </TabsContent>
        )}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive important updates via email.</p>
                    </div>
                    <Switch defaultChecked/>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>SMS Alerts</Label>
                        <p className="text-xs text-muted-foreground">Get critical alerts via text message.</p>
                    </div>
                    <Switch />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>New Lead Notifications</Label>
                        <p className="text-xs text-muted-foreground">Get notified immediately about new leads.</p>
                    </div>
                    <Switch defaultChecked/>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and view payment history.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="text-lg font-semibold">Premium</p>
                </div>
                 <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Next Billing Date</p>
                    <p className="text-lg font-semibold">August 25, 2024</p>
                </div>
                <Button>Manage Subscription</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
     <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user for your dealership. They will receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <AddDealerUserForm onFinished={() => setIsAddUserOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
