'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { listInventory } from './data';
import type { VehicleInventory } from './types';
import { InventoryFormDialog } from './inventory-form-dialog';
import { SellVehicleDialog } from './sell-vehicle-dialog';

export function InventoryList() {
    const [inventory, setInventory] = useState<VehicleInventory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleInventory | null>(null);

    const fetchInventory = async () => {
        try {
            const data = await listInventory();
            setInventory(data);
        } catch (error) {
            console.error('Failed to load inventory:', error);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredInventory = inventory.filter(v =>
    (v.chassis_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSellClick = (vehicle: VehicleInventory) => {
        setSelectedVehicle(vehicle);
        setIsSellDialogOpen(true);
    };

    const handleSellSuccess = () => {
        fetchInventory();
        setIsSellDialogOpen(false);
        setSelectedVehicle(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by chassis, VIN, make, or model..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Inventory
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Make & Model</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Chassis No.</TableHead>
                            <TableHead>VIN</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No vehicles in inventory
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInventory.map((vehicle, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">
                                        {vehicle.make} {vehicle.model}
                                    </TableCell>
                                    <TableCell>{vehicle.year}</TableCell>
                                    <TableCell>{vehicle.chassis_number || '-'}</TableCell>
                                    <TableCell>{vehicle.vin || '-'}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                vehicle.status === 'IN_STOCK'
                                                    ? 'default'
                                                    : vehicle.status === 'SOLD'
                                                        ? 'secondary'
                                                        : 'outline'
                                            }
                                        >
                                            {vehicle.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {vehicle.selling_price ? `₹${vehicle.selling_price.toLocaleString()}` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {vehicle.status === 'IN_STOCK' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSellClick(vehicle)}
                                            >
                                                Sell
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <InventoryFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSuccess={fetchInventory}
            />

            {selectedVehicle && (
                <SellVehicleDialog
                    open={isSellDialogOpen}
                    onOpenChange={setIsSellDialogOpen}
                    vehicle={selectedVehicle}
                    onSuccess={handleSellSuccess}
                />
            )}
        </div>
    );
}
