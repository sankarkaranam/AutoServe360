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

const formSchema = z.object({
  make: z.string().min(2, { message: 'Vehicle make is required.' }),
  model: z.string().min(2, { message: 'Vehicle model is required.' }),
  year: z.coerce.number().min(1900, { message: 'Invalid year.' }),
  vin: z.string().min(10, { message: 'VIN is required.' }),
  registrationNumber: z.string().min(4, { message: 'Registration number is required.' }),
  engineNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
});

type AddVehicleFormProps = {
  customerId: string;
  onFinished: (values: z.infer<typeof formSchema>) => void;
};

export function AddVehicleForm({ customerId, onFinished }: AddVehicleFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      registrationNumber: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTimeout(() => {
        onFinished(values);
        setIsLoading(false);
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Maruti Suzuki" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Swift" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 2022" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Date of Purchase</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Registration No.</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., DL1CX1234" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
         <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
                <FormItem>
                <FormLabel>VIN</FormLabel>
                <FormControl>
                    <Input placeholder="Vehicle Identification Number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        <FormField
            control={form.control}
            name="engineNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Engine No. (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="Engine Number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Vehicle
          </Button>
        </div>
      </form>
    </Form>
  );
}
