'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Feature {
    feature_code: string;
    feature_name: string;
    is_enabled: boolean;
}

interface FeatureManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    dealer: {
        tenant_id: string;
        name: string;
        plan: string;
    } | null;
}

export function FeatureManagementModal({
    isOpen,
    onClose,
    dealer,
}: FeatureManagementModalProps) {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingFeature, setTogglingFeature] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && dealer) {
            fetchFeatures();
        }
    }, [isOpen, dealer]);

    const fetchFeatures = async () => {
        if (!dealer) return;
        setIsLoading(true);
        try {
            const data = await api<Feature[]>(`/api/v1/saas/features/tenant/${dealer.tenant_id}`);
            setFeatures(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load features.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (featureCode: string, currentStatus: boolean) => {
        if (!dealer) return;
        setTogglingFeature(featureCode);
        try {
            await api(`/api/v1/saas/features/tenant/${dealer.tenant_id}/toggle`, {
                method: 'POST',
                body: JSON.stringify({
                    feature_code: featureCode,
                    enabled: !currentStatus,
                }),
            });

            // Update local state
            setFeatures((prev) =>
                prev.map((f) =>
                    f.feature_code === featureCode ? { ...f, is_enabled: !currentStatus } : f
                )
            );

            toast({
                title: 'Feature Updated',
                description: `Feature ${!currentStatus ? 'enabled' : 'disabled'} successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update feature.',
                variant: 'destructive',
            });
        } finally {
            setTogglingFeature(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Manage Features: {dealer?.name}</DialogTitle>
                    <DialogDescription>
                        Customize features for this dealer. These settings override the plan defaults.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between py-2 border-b">
                    <div className="text-sm font-medium text-muted-foreground">
                        Current Plan: <Badge variant="outline" className="ml-2 capitalize">{dealer?.plan}</Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchFeatures} disabled={isLoading}>
                        Refresh
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-4 py-4">
                            {features.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No features found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {features.map((feature) => (
                                        <div
                                            key={feature.feature_code}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="space-y-0.5">
                                                <div className="font-medium text-sm">
                                                    {feature.feature_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {feature.feature_code}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {togglingFeature === feature.feature_code && (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                )}
                                                <Switch
                                                    checked={feature.is_enabled}
                                                    onCheckedChange={() => handleToggle(feature.feature_code, feature.is_enabled)}
                                                    disabled={togglingFeature === feature.feature_code}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}

                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
