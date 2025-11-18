'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Shield, SlidersHorizontal, User } from 'lucide-react';
import { ProfileSettings } from './profile-settings';

export function AdminSettings() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Settings Saved",
            description: "Your general settings have been updated.",
        });
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your SaaS platform's global settings.
        </p>
      </div>
      <Separator />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="general"><SlidersHorizontal className="mr-2 h-4 w-4" />General</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="api"><KeyRound className="mr-2 h-4 w-4" />API Keys</TabsTrigger>
        </TabsList>
         <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Update platform-wide settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input id="appName" defaultValue="Hero Motors" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" type="email" defaultValue="support@heromotors.example.com" />
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage security settings for the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center text-muted-foreground p-8">
              <p>Security settings are managed by Firebase.</p>
               <p className="text-xs">Two-Factor Authentication, Password Policies, and other security features are configured in the Firebase console.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for third-party integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="googleMaps">Google Maps API Key</Label>
                    <Input id="googleMaps" placeholder="Enter your Google Maps API Key" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="msgGateway">SMS Gateway API Key</Label>
                    <Input id="msgGateway" placeholder="Enter your SMS Gateway API Key" />
                </div>
                <Button onClick={handleSave}>Save API Keys</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
