'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Upload } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { type InventoryItem } from '@/components/pos/types';
import { Label } from '../ui/label';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Item name must be at least 3 characters.' }),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters.' }),
  price: z.number().min(0, { message: 'Price cannot be negative.' }),
  imageId: z.string().min(1, { message: 'Please select an image.' }),
});

export type ItemDetails = z.infer<typeof formSchema>;

type EditItemFormProps = {
  item: InventoryItem;
  onFinished: (itemDetails: ItemDetails) => void;
};


export function EditItemFirestoreForm({ item, onFinished }: EditItemFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ItemDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name,
      sku: item.sku || '',
      price: item.price,
    },
  });

  useEffect(() => {
    form.reset({
      name: item.name,
      sku: item.sku || '',
      price: item.price,
    });
  }, [item, form]);

  function onSubmit(values: ItemDetails) {
    setIsLoading(true);
    setTimeout(() => {
      onFinished(values);
      setIsLoading(false);
    }, 1000);
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
