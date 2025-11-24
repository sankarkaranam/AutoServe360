'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
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
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Item name must be at least 3 characters.' }),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters.' }),
  price: z.number().min(0, { message: 'Price cannot be negative.' }),
  stock: z.number().min(0, { message: 'Stock cannot be negative.' }),
  imageId: z.string().min(1, { message: 'Please select an image.' }),
});

export type NewItemDetails = z.infer<typeof formSchema>;

type AddItemFormProps = {
  onFinished: (newItem: NewItemDetails) => void;
};

export function AddItemFirestoreForm({ onFinished }: AddItemFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localImages, setLocalImages] = useState<ImagePlaceholder[]>([]);

  const form = useForm<NewItemDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      stock: 0,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: ImagePlaceholder = {
          id: `local-${Date.now()}`,
          description: file.name,
          imageUrl: reader.result as string,
          imageHint: file.name.split('.').slice(0, -1).join(' '),
        };
        setLocalImages(prev => [newImage, ...prev]);
        form.setValue('imageId', newImage.id);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: NewItemDetails) {
    setIsLoading(true);
    setTimeout(() => {
      onFinished(values);
      setIsLoading(false);
    }, 1000);
  }

  const allImages = [...localImages, ...PlaceHolderImages];

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
              <FormLabel>Initial Stock Quantity</FormLabel>
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
          name="imageId"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Item Image</FormLabel>
                <Button asChild variant="outline" size="sm">
                  <Label htmlFor="file-upload-add">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Label>
                </Button>
                <Input id="file-upload-add" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
              </div>
              <FormControl>
                <ScrollArea className="h-48 w-full rounded-md border">
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2">
                    {allImages.map((image) => (
                      <div
                        key={image.id}
                        onClick={() => field.onChange(image.id)}
                        className={cn(
                          'cursor-pointer rounded-md border-2 p-1',
                          field.value === image.id
                            ? 'border-primary ring-2 ring-primary'
                            : 'border-transparent'
                        )}
                      >
                        <Image
                          src={image.imageUrl}
                          alt={image.description}
                          width={100}
                          height={100}
                          className="aspect-square w-full rounded-sm object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Item to Inventory
          </Button>
        </div>
      </form>
    </Form>
  );
}
