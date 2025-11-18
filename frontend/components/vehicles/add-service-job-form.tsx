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
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  jobDescription: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  mileage: z.coerce.number().min(1, { message: 'Mileage must be greater than 0.' }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date"}),
});

type AddServiceJobFormProps = {
  vehicle: any;
  onFinished: (values: z.infer<typeof formSchema>) => void;
};

export function AddServiceJobForm({ vehicle, onFinished }: AddServiceJobFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: '',
      mileage: vehicle.mileage || 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTimeout(() => {
        onFinished(values);
        toast({
            title: 'Service Job Added',
            description: `The service job has been successfully logged.`,
        });
        setIsLoading(false);
    }, 1000)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="jobDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service / Job Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Replaced brake pads, performed engine diagnostics..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Mileage (km)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 55,000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Service Job
          </Button>
        </div>
      </form>
    </Form>
  );
}
