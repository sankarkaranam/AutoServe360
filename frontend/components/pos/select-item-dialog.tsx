
'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search, PlusCircle, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { type InvoiceItem, AddItemForm } from './add-item-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';


// sampleInventory removed in favor of API data

const sampleServices = [
    { id: 'serv-001', name: 'General Service', price: 1500 },
    { id: 'serv-002', name: 'Oil Change', price: 500 },
    { id: 'serv-003', name: 'Tire Fitting', price: 250 },
    { id: 'serv-004', name: 'Brake Inspection', price: 400 },
    { id: 'serv-005', name: 'Chain Adjustment', price: 150 },
]

type SelectItemDialogProps = {
    onSelectItem: (item: InvoiceItem) => void;
    onFinished: () => void;
};

import { listInventory } from './data';

// ... imports

export function SelectItemDialog({ onSelectItem, onFinished }: SelectItemDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<InvoiceItem[]>([]); // Shopping cart

    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        listInventory().then(data => {
            if (active) {
                setInventoryItems(data.map(item => ({
                    ...item,
                    imageId: 'oil-filter' // Default image for now
                })));
                setLoading(false);
            }
        }).catch(err => {
            console.error("Failed to load inventory", err);
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, []);

    const filteredInventory = useMemo(() => {
        return inventoryItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, inventoryItems]);

    const handleAddToCart = (item: { name: string; price: number }) => {
        // Add to cart instead of immediately adding to bill
        const newItem: InvoiceItem = {
            item: item.name,
            rate: item.price,
            quantity: 1, // Changed from 2 to 1
            productId: (item as any).id // Ensure id is passed as productId
        };
        setCart(prev => [...prev, newItem]);
    };

    const handleRemoveFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const handleDone = () => {
        // Add all cart items to bill
        cart.forEach(item => onSelectItem(item));
        setCart([]);
        onFinished();
    };

    const handleAddCustomItem = (item: InvoiceItem) => {
        onSelectItem(item);
        onFinished();
    }

    const getImage = (imageId: string) => {
        return PlaceHolderImages.find(img => img.id === imageId);
    }

    const cartTotal = cart.reduce((sum, item) => sum + (item.rate * item.quantity), 0);

    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search for an item or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                />
            </div>

            <Tabs defaultValue="inventory">
                <TabsList className="w-full">
                    <TabsTrigger value="inventory" className="w-full">Inventory Parts</TabsTrigger>
                    <TabsTrigger value="services" className="w-full">Services</TabsTrigger>
                    <TabsTrigger value="custom" className="w-full">Custom Item</TabsTrigger>
                </TabsList>
                <TabsContent value="inventory">
                    <ScrollArea className="h-72">
                        <Table>
                            <TableBody>
                                {filteredInventory.map(item => {
                                    const image = getImage(item.imageId);
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
                                                        <div className="text-muted-foreground text-xs">No Img</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">Stock: {item.stock}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">₹{item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleAddToCart(item)}
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                </Button>

                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="services">
                    <ScrollArea className="h-72">
                        <Table>
                            <TableBody>
                                {sampleServices.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(service => (
                                    <TableRow key={service.id}>
                                        <TableCell>
                                            <div className="font-medium">{service.name}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">₹{service.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleAddToCart(service)}>
                                                <PlusCircle className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="custom">
                    <div className="p-4 border rounded-md">
                        <AddItemForm onAddItem={handleAddCustomItem} />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Shopping Cart Summary */}
            {cart.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="font-medium">Cart ({cart.length} items)</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                            Clear All
                        </Button>
                    </div>

                    <ScrollArea className="max-h-32">
                        <div className="space-y-2">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                                    <div className="flex-1">
                                        <span className="font-medium">{item.item}</span>
                                        <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">₹{(item.rate * item.quantity).toFixed(2)}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleRemoveFromCart(idx)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <Separator />

                    <div className="flex items-center justify-between font-semibold">
                        <span>Cart Total</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>

                    <Button onClick={handleDone} className="w-full" size="lg">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add {cart.length} Items to Bill
                    </Button>
                </div>
            )}
        </div>
    );
}
