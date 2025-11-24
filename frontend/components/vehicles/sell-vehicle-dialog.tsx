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
import { sellVehicle } from './data';
import { listCustomers } from './data';
import type { VehicleInventory } from './types';

const formSchema = z.object({
    customer_id: z.string().min(1, 'Customer is required'),
    selling_price: z.string().min(1, 'Selling price is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface SellVehicleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicle: VehicleInventory;
    onSuccess: () => void;
}

export function SellVehicleDialog({ open, onOpenChange, vehicle, onSuccess }: SellVehicleDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customer_id: '',
            selling_price: vehicle.selling_price?.toString() || '',
        },
    });

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await listCustomers();
                setCustomers(data);
            } catch (error) {
                console.error('Failed to load customers:', error);
            }
        };

        if (open) {
            fetchCustomers();
            form.reset({
                customer_id: '',
                selling_price: vehicle.selling_price?.toString() || '',
            });
        }
    }, [open, vehicle, form]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            // Note: We need the inventory ID, but it's not in the VehicleInventory type
            // This is a limitation - we'll need to update the type or pass the ID separately
            // For now, we'll assume the vehicle object has an id property
            const inventoryId = (vehicle as any).id;

            if (!inventoryId) {
                throw new Error('Vehicle ID not found');
            }

            await sellVehicle(
                inventoryId,
                values.customer_id,
                parseFloat(values.selling_price)
            );

            toast({
                title: 'Success',
                description: 'Vehicle sold and added to customer records',
            });

            form.reset();
            onSuccess();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to sell vehicle',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sell Vehicle</DialogTitle>
                    <DialogDescription>
                        Sell {vehicle.make} {vehicle.model} ({vehicle.year}) to a customer
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="customer_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="selling_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Selling Price *</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Sale
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
