'use client';

import { useState, useEffect } from 'react';
import { Calendar, Car, IndianRupee, Package } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Customer } from './types';

interface CustomerDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: Customer;
}

interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    purchase_date: string;
}

interface Invoice {
    id: string;
    invoice_number: string;
    issued_at: string;
    total_amount: number;
    status: string;
    items: Array<{
        item_name: string;
        quantity: number;
        price: number;
    }>;
}

export function CustomerDetailsDialog({ open, onOpenChange, customer }: CustomerDetailsDialogProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && customer.id) {
            fetchCustomerData();
        }
    }, [open, customer.id]);

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            // Fetch vehicles for this customer
            const vehiclesResponse = await fetch(`/api/vehicles?customer_id=${customer.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('as360_token')}`,
                    'X-Tenant-ID': localStorage.getItem('as360_tenant') || '',
                },
            });

            if (vehiclesResponse.ok) {
                const vehiclesData = await vehiclesResponse.json();
                setVehicles(vehiclesData);
            }

            // Fetch invoices for this customer
            const invoicesResponse = await fetch(`/api/invoices?customer_id=${customer.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('as360_token')}`,
                    'X-Tenant-ID': localStorage.getItem('as360_tenant') || '',
                },
            });

            if (invoicesResponse.ok) {
                const invoicesData = await invoicesResponse.json();
                setInvoices(invoicesData);
            }
        } catch (error) {
            console.error('Failed to fetch customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalLifetimeValue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total_amount, 0);

    const lastServiceDate = invoices.length > 0
        ? new Date(invoices[0].issued_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        : 'No service history';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Customer Profile</DialogTitle>
                    <DialogDescription>
                        Complete customer information and service history
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{customer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{customer.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{customer.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date of Birth</p>
                                <p className="font-medium">
                                    {customer.dob
                                        ? new Date(customer.dob).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })
                                        : '-'}
                                </p>
                            </div>
                            {customer.address && (
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium">
                                        {customer.address}
                                        {customer.city && `, ${customer.city}`}
                                        {customer.state && `, ${customer.state}`}
                                        {customer.pincode && ` - ${customer.pincode}`}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Lifetime Value</p>
                                </div>
                                <p className="text-2xl font-bold mt-2">
                                    ₹{totalLifetimeValue.toLocaleString('en-IN')}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Car className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Vehicles</p>
                                </div>
                                <p className="text-2xl font-bold mt-2">{vehicles.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Last Service</p>
                                </div>
                                <p className="text-sm font-medium mt-2">{lastServiceDate}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Vehicles */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Vehicles Owned</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : vehicles.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No vehicles registered
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {vehicles.map((vehicle) => (
                                        <div
                                            key={vehicle.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Car className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">
                                                        {vehicle.make} {vehicle.model} ({vehicle.year})
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        VIN: {vehicle.vin || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            {vehicle.purchase_date && (
                                                <p className="text-sm text-muted-foreground">
                                                    Purchased:{' '}
                                                    {new Date(vehicle.purchase_date).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Service History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Service History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ) : invoices.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No service history yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {invoices.map((invoice) => (
                                        <div key={invoice.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-medium">{invoice.invoice_number}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(invoice.issued_at).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">
                                                        ₹{invoice.total_amount.toLocaleString('en-IN')}
                                                    </p>
                                                    <Badge
                                                        variant={
                                                            invoice.status === 'paid'
                                                                ? 'default'
                                                                : invoice.status === 'partial'
                                                                    ? 'secondary'
                                                                    : 'outline'
                                                        }
                                                    >
                                                        {invoice.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {invoice.items && invoice.items.length > 0 && (
                                                <>
                                                    <Separator className="my-2" />
                                                    <div className="space-y-1">
                                                        {invoice.items.map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center justify-between text-sm"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Package className="h-3 w-3 text-muted-foreground" />
                                                                    <span>
                                                                        {item.item_name} × {item.quantity}
                                                                    </span>
                                                                </div>
                                                                <span className="text-muted-foreground">
                                                                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
