'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { AddItemForm, type NewItemDetails } from './add-item-form';
import { EditItemForm, type ItemDetails } from './edit-item-form';
import { AdjustStockFirestoreForm } from './adjust-stock-firestore';
import { listInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/components/pos/data';

import { InventoryItem } from '@/components/pos/types';

export function InventoryManagement() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const data = await listInventory();
      setInventory(data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load inventory items." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStockBadge = (stock: number) => {
    if (stock > 20) return <Badge className="bg-green-600">In Stock</Badge>;
    if (stock > 0) return <Badge variant="secondary" className="bg-yellow-500">Low Stock</Badge>;
    return <Badge variant="destructive">Out of Stock</Badge>;
  }

  const openDialog = (dialog: 'add' | 'edit' | 'adjust' | 'delete', item?: InventoryItem) => {
    setSelectedItem(item || null);
    if (dialog === 'add') setIsAddDialogOpen(true);
    if (dialog === 'edit') setIsEditDialogOpen(true);
    if (dialog === 'adjust') setIsAdjustStockOpen(true);
    if (dialog === 'delete') setIsDeleteDialogOpen(true);
  }

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    try {
      await deleteInventoryItem(selectedItem.id);
      setInventory(inventory.filter(i => i.id !== selectedItem.id));
      toast({ title: 'Item Deleted', description: `${selectedItem.name} has been removed from inventory.` });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete item." });
    }
  };

  const handleAddItem = async (newItem: NewItemDetails) => {
    try {
      const created = await createInventoryItem(newItem);
      setInventory(prev => [created, ...prev]);
      setIsAddDialogOpen(false);
      toast({ title: 'Item Added', description: `${newItem.name} has been added to the inventory.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add item." });
    }
  }

  const handleEditItem = async (editedItem: ItemDetails) => {
    if (!selectedItem) return;
    try {
      const updated = await updateInventoryItem(selectedItem.id, editedItem);
      setInventory(inventory.map(i => i.id === selectedItem.id ? updated : i));
      setIsEditDialogOpen(false);
      toast({ title: 'Item Updated', description: `${editedItem.name} has been updated.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update item." });
    }
  }

  const handleAdjustStock = async (newStock: number) => {
    if (!selectedItem) return;
    try {
      const updated = await updateInventoryItem(selectedItem.id, { ...selectedItem, stock: newStock });
      setInventory(inventory.map(i => i.id === selectedItem.id ? updated : i));
      setIsAdjustStockOpen(false);
      toast({ title: 'Stock Adjusted', description: `Stock for ${selectedItem.name} is now ${newStock}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to adjust stock." });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Track and manage your parts and supplies.
              </CardDescription>
            </div>
            <Button size="sm" className="ml-auto gap-1" onClick={() => openDialog('add')}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Item
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price (₹)</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && inventory?.map((item) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{getStockBadge(item.stock)}</TableCell>
                    <TableCell className="text-right">{item.stock}</TableCell>
                    <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openDialog('edit', item)}>Edit Item</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog('adjust', item)}>Adjust Stock</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => openDialog('delete', item)}>
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {!isLoading && (!inventory || inventory.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No inventory items found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>Enter the details for the new inventory item.</DialogDescription>
          </DialogHeader>
          <AddItemForm onFinished={handleAddItem} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update the details for {selectedItem?.name}.</DialogDescription>
          </DialogHeader>
          {selectedItem && <EditItemForm item={selectedItem} onFinished={handleEditItem} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isAdjustStockOpen} onOpenChange={setIsAdjustStockOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>Change the stock quantity for {selectedItem?.name}.</DialogDescription>
          </DialogHeader>
          {selectedItem && <AdjustStockFirestoreForm item={selectedItem} onFinished={() => handleAdjustStock(selectedItem.stock)} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the item from your inventory. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
