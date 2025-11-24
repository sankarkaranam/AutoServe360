'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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
import { type InventoryItem } from '@/components/pos/types';

const formSchema = z.object({
  newStock: z.number().min(0, { message: 'Stock cannot be negative.' }),
});

type FormValues = z.infer<typeof formSchema>;

type AdjustStockFormProps = {
  item: InventoryItem;
  onFinished: (newStock: number) => void;
};

export function AdjustStockFirestoreForm({ item, onFinished }: AdjustStockFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newStock: item.stock,
    },
  });

  useEffect(() => {
    form.reset({
      newStock: item.stock,
    });
  }, [item, form]);


  function onSubmit(values: FormValues) {
    setIsLoading(true);
    setTimeout(() => {
      onFinished(values.newStock);
      setIsLoading(false);
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-md border bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">Current Stock</p>
          <p className="text-2xl font-bold">{item.stock}</p>
        </div>
        <FormField
          control={form.control}
          name="newStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Stock Quantity</FormLabel>
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
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Adjust Stock
          </Button>
        </div>
      </form>
    </Form>
  );
}
