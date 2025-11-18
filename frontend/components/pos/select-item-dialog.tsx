
'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { type InvoiceItem, AddItemForm } from './add-item-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';


const sampleInventory = [
    { id: 'item-001', name: 'Engine Oil (1L)', sku: 'EO-1L-SYN', stock: 15, price: 1250, imageId: 'engine-oil' },
    { id: 'item-002', name: 'Oil Filter', sku: 'OF-GEN-01', stock: 45, price: 350, imageId: 'oil-filter' },
    { id: 'item-003', name: 'Air Filter', sku: 'AF-GEN-01', stock: 32, price: 450, imageId: 'air-filter' },
    { id: 'item-004', name: 'Brake Pads (Set)', sku: 'BP-FR-01', stock: 8, price: 1800, imageId: 'brake-pads' },
    { id: 'item-005', name: 'Chain Lube', sku: 'CL-500ML', stock: 25, price: 600, imageId: 'chain-lube' },
    { id: 'item-006', name: 'Spark Plug', sku: 'SP-BOSCH-01', stock: 5, price: 150, imageId: 'spark-plug' },
    { id: 'item-007', name: 'Motorcycle Chain', sku: 'MC-STD-120', stock: 12, price: 2200, imageId: 'motorcycle-chain' },
    { id: 'item-008', name: 'Motorcycle Tire', sku: 'MT-100-90-17', stock: 9, price: 3500, imageId: 'motorcycle-tire' },
    { id: 'item-009', name: 'Full-face Helmet', sku: 'HEL-FF-BLK-M', stock: 18, price: 4500, imageId: 'helmet' },
    { id: 'item-010', name: 'Riding Gloves', sku: 'GLV-R-BLK-L', stock: 22, price: 1500, imageId: 'gloves' },
];

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

export function SelectItemDialog({ onSelectItem, onFinished }: SelectItemDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = useMemo(() => {
    return sampleInventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelect = (item: { name: string; price: number }) => {
      onSelectItem({ item: item.name, rate: item.price, quantity: 1 });
      onFinished();
    }
  
  const handleAddCustomItem = (item: InvoiceItem) => {
      onSelectItem(item);
      onFinished();
  }
  
  const getImage = (imageId: string) => {
    return PlaceHolderImages.find(img => img.id === imageId);
  }

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
                            <TableRow key={item.id} className="cursor-pointer" onClick={() => handleSelect(item)}>
                                <TableCell>
                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                                    {image && (
                                        <Image 
                                            src={image.imageUrl}
                                            alt={item.name}
                                            width={48}
                                            height={48}
                                            className="object-cover"
                                            data-ai-hint={image.imageHint}
                                        />
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
                                    onClick={() => handleSelect(item)}
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
                        <TableRow key={service.id} className="cursor-pointer" onClick={() => handleSelect(service)}>
                            <TableCell>
                                <div className="font-medium">{service.name}</div>
                            </TableCell>
                            <TableCell className="text-right font-medium">₹{service.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon">
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
    </div>
  );
}
