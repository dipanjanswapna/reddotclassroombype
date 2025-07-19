
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Product, Organization, StoreCategory } from '@/lib/types';
import { saveProductAction, deleteProductAction } from '@/app/actions/product.actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface ProductManagerProps {
  initialProducts: Product[];
  sellers: Organization[];
  categories: StoreCategory[];
}

export function ProductManager({ initialProducts, sellers, categories }: ProductManagerProps) {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const handleOpenDialog = (product: Partial<Product> | null) => {
        setEditingProduct(product ? { ...product } : { isPublished: true, price: 0 });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingProduct || !editingProduct.name) {
            toast({ title: 'Error', description: 'Product name is required.', variant: 'destructive'});
            return;
        }
        setIsSaving(true);
        const result = await saveProductAction(editingProduct);

        if (result.success) {
            toast({ title: 'Success', description: result.message });
            window.location.reload(); 
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setIsSaving(false);
        setIsDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!productToDelete?.id) return;
        const result = await deleteProductAction(productToDelete.id);
        if (result.success) {
            setProducts(products.filter(p => p.id !== productToDelete.id));
            toast({ title: 'Product Deleted', description: result.message, variant: 'destructive' });
        } else {
             toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setProductToDelete(null);
    };

    const updateField = (field: keyof Product, value: any) => {
        setEditingProduct(prev => {
            const newState = prev ? { ...prev, [field]: value } : null;
            if (field === 'category' && newState) {
                newState.subCategory = ''; // Reset subcategory when category changes
            }
            return newState;
        });
    };

    const availableSubCategories = editingProduct?.category 
        ? categories.find(c => c.name === editingProduct.category)?.subCategoryGroups?.flatMap(g => g.subCategories) || []
        : [];

    return (
        <>
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Store Products</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Manage all products for the RDC Store.</p>
                </div>
                <Button onClick={() => handleOpenDialog(null)}>
                    <PlusCircle className="mr-2"/> Create Product
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                    <CardDescription>A list of all products available in the store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover"/>
                                        {product.name}
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                                    <TableCell>৳{product.price}</TableCell>
                                    <TableCell>{product.stock ?? 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.isPublished ? "accent" : "secondary"}>
                                            {product.isPublished ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleOpenDialog(product)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => setProductToDelete(product)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingProduct?.id ? 'Edit Product' : 'Create New Product'}</DialogTitle>
                    </DialogHeader>
                    {editingProduct && (
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" value={editingProduct.name || ''} onChange={e => updateField('name', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={editingProduct.description || ''} onChange={e => updateField('description', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={editingProduct.category} onValueChange={(v) => updateField('category', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select a category..."/></SelectTrigger>
                                        <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label>Sub-category</Label>
                                    <Select 
                                        value={editingProduct.subCategory} 
                                        onValueChange={(v) => updateField('subCategory', v)}
                                        disabled={availableSubCategories.length === 0}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select a sub-category..."/></SelectTrigger>
                                        <SelectContent>
                                            {availableSubCategories.map(sub => <SelectItem key={sub.name} value={sub.name}>{sub.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Price (BDT)</Label>
                                    <Input type="number" value={editingProduct.price || 0} onChange={e => updateField('price', Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Old Price (Optional)</Label>
                                    <Input type="number" value={editingProduct.oldPrice || ''} onChange={e => updateField('oldPrice', Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock</Label>
                                    <Input type="number" value={editingProduct.stock || 0} onChange={e => updateField('stock', Number(e.target.value))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Main Image URL</Label>
                                <Input value={editingProduct.imageUrl || ''} onChange={e => updateField('imageUrl', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Seller (Optional)</Label>
                                <Select value={editingProduct.sellerId} onValueChange={(v) => updateField('sellerId', v === 'admin' ? undefined : v)}>
                                    <SelectTrigger><SelectValue placeholder="Select a seller..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin (RDC)</SelectItem>
                                        {sellers.map(s => <SelectItem key={s.id} value={s.id!}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Switch id="isPublished" checked={editingProduct.isPublished} onCheckedChange={(checked) => updateField('isPublished', checked)} />
                                <Label htmlFor="isPublished">Publish this product</Label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="animate-spin mr-2"/>}
                            Save Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the product: <strong>{productToDelete?.name}</strong>.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
