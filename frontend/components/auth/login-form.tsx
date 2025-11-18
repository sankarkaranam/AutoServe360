'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/_providers/auth';

const schema = z.object({
  tenantId: z.string().min(3, 'Tenant ID is required'),
  email: z.string().email(),
  password: z.string().min(4, 'Password is required'),
});

type Props = { role: 'dealer' | 'admin' };

export function LoginForm({ role }: Props) {
  const { login, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: 'dealer-001',
      email: role === 'admin' ? 'admin@example.com' : 'dealer@example.com',
      password: 'password',
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await login(values);
      toast({ title: 'Login successful' });
      router.push(role === 'admin' ? '/admin/dashboard' : '/');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Login failed', description: e?.message ?? 'Try again' });
    }
  }

  return (
    <Card className="p-6">
      <CardContent className="space-y-4 p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dealer / Tenant ID</FormLabel>
                  <FormControl><Input placeholder="dealer-001" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="dealer@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
