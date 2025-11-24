'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createVehicle, listCustomers } from './data';
import type { Vehicle } from './types';

const formSchema = z.object({
    customer_id: z.string().optional(),
    customer_name: z.string().optional(),
    customer_email: z.string().optional(),
    customer_phone: z.string().optional(),
    customer_dob: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.string().optional(),
    vin: z.string().optional(),
});

interface VehicleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    vehicle?: Vehicle | null;
}

export function VehicleFormDialog({ open, onOpenChange, onSuccess, vehicle }: VehicleFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customer_id: '',
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            customer_dob: '',
            make: '',
            model: '',
            year: undefined,
            vin: '',
        },
    });

    useEffect(() => {
        if (open) {
            fetchCustomers();
            if (vehicle) {
                form.reset({
                    customer_id: vehicle.customer_id,
                    make: vehicle.make || '',
                    model: vehicle.model || '',
                    year: vehicle.year?.toString(),
                    vin: vehicle.vin || '',
                });
            } else {
                form.reset({
                    customer_id: '',
                    make: '',
                    model: '',
                    year: undefined,
                    vin: '',
                });
            }
        }
    }, [open, vehicle, form]);

    const fetchCustomers = async () => {
        try {
            const data = await listCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            let customerId = values.customer_id;

            // Create new customer if needed
            if (isNewCustomer && values.customer_name) {
                const { createCustomer } = await import('@/components/crm/data');
                const result = await createCustomer({
                    name: values.customer_name,
                    email: values.customer_email || undefined,
                    phone: values.customer_phone || undefined,
                    dob: values.customer_dob || undefined,
                });
                customerId = result.id;
            }

            if (!customerId) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Please select or create a customer',
                });
                return;
            }

            // TODO: Handle edit (PUT) if vehicle exists
            if (vehicle) {
                // Update logic here
                toast({ title: 'Not Implemented', description: 'Edit functionality coming soon.' });
            } else {
                await createVehicle({
                    tenant_id: '', // Will be injected by data service
                    customer_id: customerId,
                    make: values.make,
                    model: values.model,
                    year: values.year ? parseInt(values.year) : undefined,
                    vin: values.vin,
                });
                toast({
                    title: 'Vehicle Created',
                    description: 'New vehicle has been added successfully.',
                });
                onSuccess();
            }
        } catch (error: any) {
            console.error('Failed to save vehicle:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to save vehicle.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
                    <DialogDescription>
                        {vehicle ? 'Update vehicle details.' : 'Add a new vehicle to the system.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Button
                                type="button"
                                variant={!isNewCustomer ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setIsNewCustomer(false)}
                            >
                                Existing Customer
                            </Button>
                            <Button
                                type="button"
                                variant={isNewCustomer ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setIsNewCustomer(true)}
                            >
                                New Customer
                            </Button>
                        </div>

                        {!isNewCustomer ? (
                            <FormField
                                control={form.control}
                                name="customer_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!vehicle}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a customer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id}>
                                                        {customer.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <>
                                <FormField
                                    control={form.control}
                                    name="customer_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter customer name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="customer_phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter phone" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customer_email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="Enter email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="customer_dob"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date of Birth (for campaigns)</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="make"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Make</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Toyota" {...field} />
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
                                            <Input placeholder="Camry" {...field} />
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
                                            <Input type="number" placeholder="2023" {...field} />
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
                                            <Input placeholder="VIN123..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
