'use client';
import { useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Bot, Loader2, CalendarCheck, Lightbulb } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { predictServiceReminder, type PredictServiceReminderOutput } from '@/ai/flows/predict-service-reminders';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  lastServiceDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please select a valid date." }),
  currentMileage: z.coerce.number().min(1, { message: 'Mileage must be greater than 0.' }),
  typicalUsagePattern: z.string({ required_error: 'Please select a usage pattern.' }),
  vehicleModel: z.string().min(2, { message: 'Vehicle model is required.' }),
});

function ServicePredictorCorePage() {
  const [result, setResult] = useState<PredictServiceReminderOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastServiceDate: '',
      currentMileage: 0,
      vehicleModel: '',
    },
  });

  const handlePredictService = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);

    try {
      const predictionResult = await predictServiceReminder(values);
      setResult(predictionResult);
      toast({
        title: 'Prediction Generated',
        description: "AI has predicted the next service date.",
      });
    } catch (error) {
      console.error('Error predicting service date:', error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Could not generate prediction. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">AI Service Predictor</h1>
            <p className="text-muted-foreground">
              Predict the next optimal service date for a vehicle based on its history and usage.
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePredictService)} className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle>1. Enter Vehicle Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="vehicleModel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vehicle Model</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Hero Splendor+" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastServiceDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Service Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="currentMileage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Mileage (in km)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 25000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="typicalUsagePattern"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Typical Usage Pattern</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                <SelectValue placeholder="Select a usage pattern" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="daily-commute">Daily Commute (City)</SelectItem>
                                                <SelectItem value="long-distance">Long Distance (Highway)</SelectItem>
                                                <SelectItem value="weekend-trips">Occasional / Weekend Trips</SelectItem>
                                                 <SelectItem value="mixed-use">Mixed Usage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Bot className="mr-2 h-4 w-4" />
                    )}
                    Predict Next Service Date
                    </Button>
                </div>
            </form>
          </Form>

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>AI is calculating the optimal service date...</p>
            </div>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-accent" />
                  AI Service Prediction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">Predicted Next Service Date</p>
                  <p className="text-3xl font-bold font-headline flex items-center justify-center gap-2 mt-2">
                    <CalendarCheck className="h-8 w-8 text-primary" />
                    {new Date(result.predictedServiceDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5"/>Reasoning</h3>
                  <p className="text-sm text-muted-foreground p-4 border rounded-md bg-background">
                    {result.reasoning}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

export default function ServicePredictorPage() {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <SidebarInset>
                    <ServicePredictorCorePage />
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
