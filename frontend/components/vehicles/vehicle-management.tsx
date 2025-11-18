'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { ServiceHistoryDialog } from './service-history-dialog';

const sampleCustomers = [
  { id: 'cust-1', firstName: 'Srinivas', lastName: 'Reddy'},
  { id: 'cust-2', firstName: 'Padma', lastName: 'Rao'},
  { id: 'cust-3', firstName: 'Venkata', lastName: 'Naidu'},
  { id: 'cust-4', firstName: 'Lakshmi', lastName: 'Kumari'},
  { id: 'cust-5', firstName: 'Ravi', lastName: 'Varma'},
  { id: 'cust-6', firstName: 'Anusha', lastName: 'Chowdary'},
  { id: 'cust-7', firstName: 'Murali', lastName: 'Krishna'},
  { id: 'cust-8', firstName: 'Sita', lastName: 'Ganti'},
  { id: 'cust-9', firstName: 'Prasad', lastName: 'Gupta'},
  { id: 'cust-10', firstName: 'Jyothi', lastName: 'Yadav'},
  { id: 'cust-11', firstName: 'Babu', lastName: 'Raju'},
  { id: 'cust-12', firstName: 'Durga', lastName: 'Prasad'},
  { id: 'cust-13', firstName: 'Gopi', lastName: 'Chand'},
  { id: 'cust-14', firstName: 'Uma', lastName: 'Maheswari'},
  { id: 'cust-15', firstName: 'Nageswara', lastName: 'Rao'},
];

const sampleVehicles = [
  { id: 'veh-1', customerId: 'cust-1', make: 'Hero', model: 'Splendor+', year: 2022, registrationNumber: 'AP03 C 1234', vin: 'MA3ER123456789012', serviceCount: 3 },
  { id: 'veh-2', customerId: 'cust-2', make: 'Hero', model: 'Passion Pro', year: 2021, registrationNumber: 'AP05 F 5678', vin: 'MA3ER123456789013', serviceCount: 2 },
  { id: 'veh-3', customerId: 'cust-3', make: 'Hero', model: 'Glamour', year: 2023, registrationNumber: 'AP26 N 9012', vin: 'MA3ER123456789014', serviceCount: 1 },
  { id: 'veh-4', customerId: 'cust-4', make: 'Hero', model: 'Xtreme 160R', year: 2022, registrationNumber: 'AP07 B 3456', vin: 'MA3ER123456789015', serviceCount: 4 },
  { id: 'veh-5', customerId: 'cust-5', make: 'Hero', model: 'Destini 125', year: 2020, registrationNumber: 'AP39 G 7890', vin: 'MA3ER123456789016', serviceCount: 5 },
  { id: 'veh-6', customerId: 'cust-6', make: 'Hero', model: 'Pleasure+', year: 2023, registrationNumber: 'AP09 H 1122', vin: 'MA3ER123456789017', serviceCount: 1 },
];

export function VehicleManagement() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const customerMap = useMemo(() => {
    return new Map(sampleCustomers.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
  }, []);

  const openHistoryDialog = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsHistoryOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Vehicle & Service Management</CardTitle>
              <CardDescription>
                View all vehicles and manage their service histories.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Make & Model</TableHead>
                <TableHead>Registration No.</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Service Count</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  <TableRow><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  <TableRow><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  <TableRow><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                </>
              )}
              {!isLoading && sampleVehicles && sampleVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.make} {vehicle.model} ({vehicle.year})</TableCell>
                  <TableCell>{vehicle.registrationNumber}</TableCell>
                  <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
                  <TableCell>{customerMap.get(vehicle.customerId) || 'N/A'}</TableCell>
                  <TableCell>{vehicle.serviceCount || 0}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openHistoryDialog(vehicle)}>View History</DropdownMenuItem>
                        <DropdownMenuItem>Edit Vehicle</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {!isLoading && (!sampleVehicles || sampleVehicles.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No vehicles found. Add a customer and their vehicle from the CRM page.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedVehicle && (
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="sm:max-w-2xl">
            <ServiceHistoryDialog 
                vehicle={selectedVehicle} 
                customerName={customerMap.get(selectedVehicle.customerId) || 'N/A'}
                onOpenChange={setIsHistoryOpen}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
