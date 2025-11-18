'use client';

import { Car, User, Mail, Phone, Calendar, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';

type CustomerWithVehicles = any; 

type ViewCustomerDetailsProps = {
  customer: CustomerWithVehicles;
};

export function ViewCustomerDetails({ customer }: ViewCustomerDetailsProps) {
  if (!customer) {
    return <p>No customer data available.</p>;
  }

  const { firstName, lastName, email, phone, dateOfBirth, vehicles = [] } = customer;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <User className="h-6 w-6" />
            {firstName} {lastName}
          </CardTitle>
          <CardDescription>Customer Profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{phone}</span>
          </div>
          {dateOfBirth && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Born on {new Date(dateOfBirth).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Car className="h-5 w-5" />
        Vehicles ({vehicles.length})
      </h3>

      {vehicles.length > 0 ? (
        <div className="space-y-4">
          {vehicles.map((vehicle: any) => (
            <Card key={vehicle.id}>
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </CardTitle>
                <CardDescription>{vehicle.registrationNumber}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="font-medium">VIN</p>
                  <p className="text-muted-foreground">{vehicle.vin}</p>
                </div>
                <div>
                  <p className="font-medium">Engine Number</p>
                  <p className="text-muted-foreground">{vehicle.engineNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Purchase Date</p>
                  <p className="text-muted-foreground">
                    {vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <p>{vehicle.serviceCount || 0} Services</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No vehicles associated with this customer.</p>
      )}
    </div>
  );
}
