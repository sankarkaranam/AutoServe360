'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Campaign name must be at least 3 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
  target: z.string().min(1, { message: 'Please select a target audience.' }),
  channel: z.string().min(1, { message: 'Please select a delivery channel.' }),
  schedule: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type Campaign = {
  id: string;
  name: string;
  target: string;
  channel: string;
  status: 'Draft' | 'Sent' | 'Scheduled';
  sentOn: string | null;
}

type CreateCampaignFormProps = {
  onFinished: (campaign: Campaign) => void;
};

export function CreateCampaignForm({ onFinished }: CreateCampaignFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      message: '',
    },
  });

  function onSubmit(values: FormValues) {
    setIsLoading(true);

    const newCampaign: Campaign = {
      id: `promo-${Date.now()}`,
      name: values.name,
      target: values.target,
      channel: values.channel,
      status: values.schedule ? 'Scheduled' : 'Draft',
      sentOn: values.schedule ? new Date(values.schedule).toISOString() : null
    };

    // Simulate network delay
    setTimeout(() => {
      onFinished(newCampaign);
      setIsLoading(false);
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Summer Service Special" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your campaign message here. You can use placeholders like {{customerName}}."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an audience" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="All Customers">All Customers</SelectItem>
                    <SelectItem value="New Leads">New Leads</SelectItem>
                    <SelectItem value="High-Value Customers">High-Value Customers</SelectItem>
                    <SelectItem value="Recent Service">Recent Service Visitors</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SMS">SMS / Text Message</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule (Optional)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground pt-1">Leave blank to save as draft.</p>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4 space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Campaign
          </Button>
        </div>
      </form>
    </Form>
  );
}
