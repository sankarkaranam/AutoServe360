'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Loader2, Upload } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const { user, loading, updateProfile } = useAuth();
  const { toast } = useToast();

  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<ImagePlaceholder[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: '', email: '' },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || '',
        email: user.email || '',
      });
      setSelectedPhotoUrl(user.photoURL || null);
    }
  }, [user, form]);

  const allImages = useMemo(() => [...localImages, ...PlaceHolderImages], [localImages]);

  const handleProfileUpdate = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({ displayName: data.displayName });
      toast({ title: 'Profile Updated', description: 'Your name has been successfully updated.' });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpdate = async () => {
    if (!user || !selectedPhotoUrl) return;
    setIsSaving(true);
    try {
      await updateProfile({ photoURL: selectedPhotoUrl });
      toast({ title: 'Profile Photo Updated', description: 'Your new photo has been saved.' });
      setIsPhotoDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage: ImagePlaceholder = {
        id: `local-${Date.now()}`,
        description: file.name,
        imageUrl: reader.result as string,
        imageHint: 'custom upload',
      };
      setLocalImages(prev => [newImage, ...prev]);
      setSelectedPhotoUrl(newImage.imageUrl);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent><p>Loading...</p></CardContent>
      </Card>
    );
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || ''} />
                  <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" onClick={() => setIsPhotoDialogOpen(true)}>
                  Change Photo
                </Button>
              </div>

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-start">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Change Profile Photo</DialogTitle>
            <DialogDescription>Select a new photo from the options below or upload your own.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Choose an avatar</Label>
              <Button asChild variant="outline" size="sm">
                <label htmlFor="photo-upload" className="inline-flex items-center cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </label>
              </Button>
              <Input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
            </div>

            <ScrollArea className="h-72 w-full rounded-md border">
              <div className="grid grid-cols-4 gap-4 p-4">
                {allImages.map((image) => (
                  <button
                    type="button"
                    key={image.id}
                    className={cn(
                      'cursor-pointer rounded-full border-4 p-1 transition-all hover:opacity-80',
                      selectedPhotoUrl === image.imageUrl ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                    )}
                    onClick={() => setSelectedPhotoUrl(image.imageUrl)}
                  >
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={image.imageUrl} alt={image.description} />
                      <AvatarFallback>{image.description.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handlePhotoUpdate} disabled={isSaving || !selectedPhotoUrl}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
