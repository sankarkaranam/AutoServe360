'use client';

import { useState, useMemo } from 'react';
import { Car, User, PlusCircle } from 'lucide-react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  Dialog,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { AddServiceJobForm } from './add-service-job-form';
import { sampleServiceJobs } from '@/lib/data-utils';

type ServiceHistoryDialogProps = {
  vehicle: any;
  customerName: string;
  onOpenChange: (open: boolean) => void;
};

export function ServiceHistoryDialog({ vehicle, customerName, onOpenChange }: ServiceHistoryDialogProps) {
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceJobs, setServiceJobs] = useState(sampleServiceJobs.filter(j => j.vehicleId === vehicle.id));
  
  const sortedJobs = useMemo(() => {
    return serviceJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [serviceJobs]);

  const handleAddJob = (values: any) => {
    const newJob = {
        id: `job-${Date.now()}`,
        vehicleId: vehicle.id,
        ...values,
        date: new Date(values.date).toISOString(),
    };
    // In a real app, this would be `addDocumentNonBlocking` to a firestore collection
    setServiceJobs(prev => [newJob, ...prev]); 
    setIsAddJobOpen(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-headline">
          <Car className="h-6 w-6" />
          Service History: {vehicle.make} {vehicle.model}
        </DialogTitle>
        <DialogDescription>
          {vehicle.registrationNumber} &bull; Owned by {customerName}
        </DialogDescription>
      </DialogHeader>
      <Separator />
      <div className="max-h-[60vh] overflow-y-auto pr-4">
        {isLoading && (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        )}
        {!isLoading && sortedJobs.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground">
                <p>No service history found for this vehicle.</p>
                <p>Add the first service job below.</p>
            </div>
        )}
        {!isLoading && sortedJobs.length > 0 && (
            <div className="space-y-4">
                {sortedJobs.map(job => (
                    <div key={job.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{job.jobDescription}</p>
                                <p className="text-sm text-muted-foreground">
                                    Mileage: {job.mileage.toLocaleString('en-IN')} km
                                </p>
                            </div>
                            <p className="text-sm font-medium">
                                {new Date(job.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <Separator />
      
      <Button onClick={() => setIsAddJobOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add New Service Job
      </Button>

      <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service Job</DialogTitle>
            <DialogDescription>
              Log a new service job for {vehicle.make} {vehicle.model}.
            </DialogDescription>
          </DialogHeader>
          <AddServiceJobForm 
            vehicle={vehicle}
            onFinished={handleAddJob}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
