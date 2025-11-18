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
import { Separator } from '../ui/separator';

const formSchema = z.object({
  // Customer
  firstName: z.string().min(2, { message: 'First name is required.' }),
  lastName: z.string().min(2, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  dateOfBirth: z.string().optional(),
  // Vehicle
  make: z.string().min(2, { message: 'Vehicle make is required.' }),
  model: z.string().min(2, { message: 'Vehicle model is required.' }),
  year: z.coerce.number().min(1900, { message: 'Invalid year.' }),
  vin: z.string().min(10, { message: 'VIN is required.' }),
  registrationNumber: z.string().min(4, { message: 'Registration number is required.' }),
  engineNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
});

type AddCustomerFormProps = {
  onFinished: (values: z.infer<typeof formSchema>) => void;
};

export function AddCustomerForm({ onFinished }: AddCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
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
        
        <h3 className="text-lg font-medium">Customer Details</h3>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Venkatesh" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Rao" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., venkatesh.rao@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., 9876543210" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Separator className="my-6" />

        <h3 className="text-lg font-medium">Vehicle Details</h3>
         <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Royal Enfield" {...field} />
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
                    <Input placeholder="e.g., Classic 350" {...field} />
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
                    <Input type="number" placeholder="e.g., 2023" {...field} />
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
                    <Input placeholder="e.g., AP39G1234" {...field} />
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
            Add Customer & Vehicle
          </Button>
        </div>
      </form>
    </Form>
  );
}
