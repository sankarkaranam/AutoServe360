'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Car, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { listVehicles } from './data';
import type { Vehicle } from './types';
import { VehicleFormDialog } from './vehicle-form-dialog';
import { useToast } from '@/hooks/use-toast';

export function VehicleList() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const { toast } = useToast();

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const data = await listVehicles();
            setVehicles(data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load vehicles.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const filteredVehicles = vehicles.filter(v =>
    (v.vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setIsAddOpen(true);
    };

    const handleDialogClose = (refresh: boolean) => {
        setIsAddOpen(false);
        setEditingVehicle(null);
        if (refresh) {
            fetchVehicles();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search vehicles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle Details</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>VIN / Van No.</TableHead>
                            <TableHead>Chassis No.</TableHead>
                            <TableHead>Purchase Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredVehicles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No vehicles found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredVehicles.map((vehicle) => (
                                <TableRow key={vehicle.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-muted/20 flex items-center justify-center">
                                                <Car className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{vehicle.customer_name || 'Unknown'}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {vehicle.vin || vehicle.van_number || '-'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {vehicle.chassis_number || '-'}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {vehicle.purchase_date ? new Date(vehicle.purchase_date).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={vehicle.active ? 'default' : 'secondary'} className={vehicle.active ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200' : ''}>
                                            {vehicle.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <VehicleFormDialog
                open={isAddOpen}
                onOpenChange={(open) => !open && handleDialogClose(false)}
                onSuccess={() => handleDialogClose(true)}
                vehicle={editingVehicle}
            />
        </div>
    );
}
