'use client';
import { useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Bot, Loader2, CalendarClock, Lightbulb } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  optimizeCampaignSendTime,
  type OptimizeCampaignSendTimeOutput,
} from '@/ai/flows/optimize-campaign-send-time';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  campaignType: z.string({ required_error: 'Please select a campaign type.' }),
  targetAudience: z.string().min(10, { message: 'Please describe the target audience.' }),
  historicalData: z.string().min(10, { message: 'Please provide some historical context.' }),
});

function CampaignOptimizerCorePage() {
  const [result, setResult] = useState<OptimizeCampaignSendTimeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignType: 'service-reminders',
      targetAudience: 'Customers who have not visited in the last 6 months.',
      historicalData: 'Previous SMS campaigns had a 15% open rate when sent on weekday afternoons. Email campaigns have a higher open rate on weekends.',
    },
  });

  const handleOptimizeCampaign = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);

    try {
      const predictionResult = await optimizeCampaignSendTime({
        ...values,
        dealerId: 'dealer-123', // In a real app, this would come from the user's session
      });
      setResult(predictionResult);
      toast({
        title: 'Optimization Complete',
        description: "AI has recommended the optimal send time.",
      });
    } catch (error) {
      console.error('Error optimizing campaign:', error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Could not generate recommendation. Please try again.',
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
            <h1 className="text-3xl font-bold font-headline">AI Campaign Optimizer</h1>
            <p className="text-muted-foreground">
              Let AI determine the best time to send your campaign for maximum engagement.
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOptimizeCampaign)} className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle>1. Describe Your Campaign</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <FormField
                            control={form.control}
                            name="campaignType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Campaign Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select a campaign type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="service-reminders">Service Reminders</SelectItem>
                                            <SelectItem value="festival-greetings">Festival Greetings</SelectItem>
                                            <SelectItem value="promotional-offers">Promotional Offers</SelectItem>
                                            <SelectItem value="new-product-launch">New Product Launch</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="targetAudience"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Audience</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Customers who bought a bike in the last year." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="historicalData"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Historical Context & Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Past campaigns performed well on weekends. Our target audience is mostly office workers." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Bot className="mr-2 h-4 w-4" />
                    )}
                    Find Optimal Send Time
                    </Button>
                </div>
            </form>
          </Form>

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>AI is analyzing historical data and trends...</p>
            </div>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-accent" />
                  AI Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">Optimized Send Time</p>
                  <p className="text-3xl font-bold font-headline flex items-center justify-center gap-2 mt-2">
                    <CalendarClock className="h-8 w-8 text-primary" />
                    {new Date(result.optimizedSendTime).toLocaleString('en-IN', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5"/>Rationale</h3>
                  <p className="text-sm text-muted-foreground p-4 border rounded-md bg-background">
                    {result.rationale}
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

export default function CampaignOptimizerPage() {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <SidebarInset>
                    <CampaignOptimizerCorePage />
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
