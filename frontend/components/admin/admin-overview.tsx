'use client';
import { useState, useEffect } from 'react';
import { StatCard } from '../dashboard/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IndianRupee, CreditCard, Users, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface AdminStats {
    total_dealers: number;
    active_dealers: number;
    inactive_dealers: number;
    dealers_by_plan: Record<string, number>;
    total_revenue: number;
    monthly_revenue: number;
    expiring_soon: number;
    new_signups_this_month: number;
}

export function AdminOverview() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { toast } = useToast();

    const fetchStats = async () => {
        try {
            setIsRefreshing(true);
            const data = await api<AdminStats>('/api/v1/saas/reports/stats');
            setStats(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load statistics. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-3 w-40 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const activeSubscriptions = Object.values(stats.dealers_by_plan).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchStats()}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-2">Refresh</span>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.total_revenue.toLocaleString()}`}
                    icon={<IndianRupee className="h-4 w-4" />}
                    description={`₹${stats.monthly_revenue.toLocaleString()} this month`}
                />
                <StatCard
                    title="Active Subscriptions"
                    value={`${stats.active_dealers}`}
                    icon={<CreditCard className="h-4 w-4" />}
                    description={`${stats.total_dealers} total dealers`}
                />
                <StatCard
                    title="New Signups"
                    value={`+${stats.new_signups_this_month}`}
                    icon={<Users className="h-4 w-4" />}
                    description="This month"
                />
                <StatCard
                    title="Expiring Soon"
                    value={`${stats.expiring_soon}`}
                    icon={<AlertCircle className="h-4 w-4 text-orange-500" />}
                    description="Next 30 days"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dealers by Plan</CardTitle>
                            <CardDescription>Distribution across subscription tiers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(stats.dealers_by_plan).map(([plan, count]) => {
                                    const percentage = stats.total_dealers > 0 ? (count / stats.total_dealers) * 100 : 0;
                                    return (
                                        <div key={plan} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium capitalize">{plan || 'No Plan'}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {count} ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                            <CardDescription>Platform health at a glance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Active Dealers</span>
                                <span className="text-2xl font-bold text-green-600">{stats.active_dealers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Inactive Dealers</span>
                                <span className="text-2xl font-bold text-gray-400">{stats.inactive_dealers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Expiring Soon</span>
                                <span className="text-2xl font-bold text-orange-600">{stats.expiring_soon}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                                <span className="text-2xl font-bold">₹{stats.monthly_revenue.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
