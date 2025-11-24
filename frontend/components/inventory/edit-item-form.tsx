'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { uploadInventoryImage } from '@/components/pos/data';
import Image from 'next/image';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { type InventoryItem } from '@/components/pos/types';

const formSchema = z.object({
    name: z.string().min(3, { message: 'Item name must be at least 3 characters.' }),
    sku: z.string().optional(),
    price: z.number().min(0, { message: 'Price cannot be negative.' }),
    stock: z.number().min(0, { message: 'Stock cannot be negative.' }),
    image_url: z.string().optional(),
});

export type ItemDetails = z.infer<typeof formSchema>;

type EditItemFormProps = {
    item: InventoryItem;
    onFinished: (itemDetails: ItemDetails) => void;
};

export function EditItemForm({ item, onFinished }: EditItemFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(item.image_url || null);
    const { toast } = useToast();

    const form = useForm<ItemDetails>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: item.name,
            sku: item.sku || '',
            price: item.price,
            stock: item.stock,
            image_url: item.image_url || '',
        },
    });

    useEffect(() => {
        form.reset({
            name: item.name,
            sku: item.sku || '',
            price: item.price,
            stock: item.stock,
            image_url: item.image_url || '',
        });
        setPreviewUrl(item.image_url || null);
    }, [item, form]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Show preview immediately
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);

                // Upload
                const response = await uploadInventoryImage(file);
                form.setValue('image_url', response.url);
                toast({ title: 'Image Uploaded', description: 'Image uploaded successfully.' });
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Upload Failed', description: 'Failed to upload image.' });
            }
        }
    };

    function onSubmit(values: ItemDetails) {
        setIsLoading(true);
        onFinished(values);
        setIsLoading(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit Price (₹)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex flex-col gap-2">
                                <FormLabel>Item Image</FormLabel>
                                <div className="flex items-center gap-4">
                                    <div className="relative h-20 w-20 rounded-md border overflow-hidden bg-muted flex items-center justify-center">
                                        {previewUrl || field.value ? (
                                            <Image
                                                src={previewUrl || field.value || ''}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <Label htmlFor="file-upload-edit" className="cursor-pointer">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Image
                                        </Label>
                                    </Button>
                                    <Input id="file-upload-edit" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}
