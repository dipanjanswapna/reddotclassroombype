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
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical, Package, Image as ImageIcon, Check, ChevronsUpDown } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
        setEditingProduct(product ? { ...product } : { isPublished: true, price: 0, stock: 10 });
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
            if (!prev) return null;
            const newState = { ...prev, [field]: value };
            if (field === 'category') {
                newState.subCategory = ''; // Reset subcategory when category changes
            }
            return newState;
        });
    };

    const availableSubCategories = editingProduct?.category 
        ? categories.find(c => c.name === editingProduct.category)?.subCategoryGroups?.flatMap(g => g.subCategories) || []
        : [];

    return (
        <div className="space-y-8">
            <Card className="rounded-[20px] border-primary/10 shadow-xl overflow-hidden bg-card">
                <CardHeader className="bg-primary/5 p-6 border-b border-primary/10 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Active Inventory</CardTitle>
                        <CardDescription className="font-medium text-xs">A comprehensive list of products available in the RDC Store.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6 shadow-lg shadow-primary/20 transition-transform active:scale-95">
                        <PlusCircle className="mr-2 h-4 w-4"/> Create Product
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-primary/10">
                                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">Product Info</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Category</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Price</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Stock</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                                    <TableHead className="text-right px-6 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(product => (
                                    <TableRow key={product.id} className="border-primary/10 hover:bg-primary/5 transition-colors">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 relative rounded-xl overflow-hidden border border-primary/10 bg-white shadow-sm shrink-0">
                                                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover"/>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-black text-sm uppercase tracking-tight truncate max-w-[200px]">{product.name}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter truncate">ID: #{product.id.slice(-8)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest px-2.5 h-5 bg-primary/10 text-primary border-none">
                                                {product.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm">৳{product.price}</span>
                                                {product.oldPrice && <span className="text-[9px] font-bold text-muted-foreground line-through opacity-60">৳{product.oldPrice}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={cn("font-black text-sm", (product.stock || 0) < 10 ? "text-orange-600" : "text-foreground")}>
                                                    {product.stock ?? 'N/A'}
                                                </span>
                                                {(product.stock || 0) < 5 && <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.isPublished ? "accent" : "secondary"} className="font-black text-[9px] uppercase tracking-widest">
                                                {product.isPublished ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10">
                                                        <MoreVertical className="h-4 w-4 text-primary"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl shadow-2xl border-primary/10 p-2">
                                                    <DropdownMenuItem onClick={() => handleOpenDialog(product)} className="rounded-lg cursor-pointer flex items-center gap-2 py-2">
                                                        <Edit className="h-4 w-4 text-primary" /> 
                                                        <span className="font-black text-[10px] uppercase tracking-widest">Edit Details</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setProductToDelete(product)} className="rounded-lg cursor-pointer flex items-center gap-2 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                        <Trash2 className="h-4 w-4" /> 
                                                        <span className="font-black text-[10px] uppercase tracking-widest">Delete Product</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {products.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-30">
                                                <Package className="w-12 h-12 mb-2" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Inventory is empty</p>
                                            </div>
                                        </TableRow>
                                    )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-3xl rounded-[25px] border-primary/20 shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="bg-primary/5 p-6 border-b border-primary/10">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-xl">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black uppercase tracking-tight">
                                    {editingProduct?.id ? 'Edit Product Details' : 'Create New Merchandise'}
                                </DialogTitle>
                                <DialogDescription className="font-medium text-xs">Fill out the information below to update the catalog.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    {editingProduct && (
                        <div className="grid gap-8 p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Left Side: Media & Settings */}
                                <div className="md:col-span-5 space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Main Product Image</Label>
                                        <div className="aspect-square relative rounded-[20px] overflow-hidden border-2 border-primary/10 bg-muted/20 shadow-inner group">
                                            {editingProduct.imageUrl ? (
                                                <Image src={editingProduct.imageUrl} alt="Preview" fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"/>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-40">
                                                    <ImageIcon className="w-12 h-12 mb-2" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">No Image Provided</span>
                                                </div>
                                            )}
                                        </div>
                                        <Input 
                                            placeholder="https://example.com/image.png" 
                                            value={editingProduct.imageUrl || ''} 
                                            onChange={e => updateField('imageUrl', e.target.value)} 
                                            className="rounded-xl h-11 bg-muted/30 border-primary/5 text-xs font-mono"
                                        />
                                    </div>

                                    <div className="p-5 rounded-[20px] bg-muted/20 border border-primary/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="isPublished" className="font-black text-[10px] uppercase tracking-widest">Live Status</Label>
                                                <p className="text-[9px] text-muted-foreground">Visible to customers</p>
                                            </div>
                                            <Switch id="isPublished" checked={editingProduct.isPublished} onCheckedChange={(checked) => updateField('isPublished', checked)} />
                                        </div>
                                        <Separator className="bg-primary/5" />
                                        <div className="space-y-2">
                                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Assigned Seller</Label>
                                            <Select value={editingProduct.sellerId || 'admin'} onValueChange={(v) => updateField('sellerId', v === 'admin' ? undefined : v)}>
                                                <SelectTrigger className="rounded-xl h-10 border-primary/5 bg-background shadow-sm text-xs font-bold">
                                                    <SelectValue placeholder="Select a seller..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-white/10">
                                                    <SelectItem value="admin" className="text-xs font-bold">RDC (ORIGINAL)</SelectItem>
                                                    {sellers.map(s => <SelectItem key={s.id} value={s.id!} className="text-xs font-bold">{s.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Details & Inventory */}
                                <div className="md:col-span-7 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Title</Label>
                                        <Input id="name" value={editingProduct.name || ''} onChange={e => updateField('name', e.target.value)} className="rounded-xl h-12 text-base font-black uppercase tracking-tight focus:border-primary/50" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                                            <Select value={editingProduct.category} onValueChange={(v) => updateField('category', v)}>
                                                <SelectTrigger className="rounded-xl h-11 border-primary/10 bg-white font-bold text-xs"><SelectValue placeholder="Category"/></SelectTrigger>
                                                <SelectContent className="rounded-xl border-white/10">{categories.map(cat => <SelectItem key={cat.id} value={cat.name} className="text-xs font-bold">{cat.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sub-Category</Label>
                                            <Select 
                                                value={editingProduct.subCategory} 
                                                onValueChange={(v) => updateField('subCategory', v)}
                                                disabled={availableSubCategories.length === 0}
                                            >
                                                <SelectTrigger className="rounded-xl h-11 border-primary/10 bg-white font-bold text-xs disabled:opacity-50"><SelectValue placeholder="Sub-category"/></SelectTrigger>
                                                <SelectContent className="rounded-xl border-white/10">
                                                    {availableSubCategories.map(sub => <SelectItem key={sub.name} value={sub.name} className="text-xs font-bold">{sub.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 p-5 rounded-[20px] bg-primary/[0.02] border border-primary/5">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-primary/60">Sale Price</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-primary text-xs">৳</span>
                                                <Input type="number" value={editingProduct.price || 0} onChange={e => updateField('price', Number(e.target.value))} className="pl-7 rounded-xl h-11 font-black text-lg border-primary/10 shadow-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Original</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-xs">৳</span>
                                                <Input type="number" value={editingProduct.oldPrice || ''} onChange={e => updateField('oldPrice', Number(e.target.value))} className="pl-7 rounded-xl h-11 font-bold text-muted-foreground bg-muted/20 border-primary/5" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Stock Qty</Label>
                                            <Input type="number" value={editingProduct.stock || 0} onChange={e => updateField('stock', Number(e.target.value))} className="rounded-xl h-11 font-black text-center border-primary/10 bg-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Description</Label>
                                        <Textarea id="description" value={editingProduct.description || ''} onChange={e => updateField('description', e.target.value)} rows={6} className="rounded-[20px] border-primary/10 bg-white text-sm font-medium leading-relaxed resize-none p-4 focus:border-primary/50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="bg-primary/5 p-6 border-t border-primary/10">
                        <DialogClose asChild><Button variant="ghost" className="rounded-xl font-bold uppercase text-[10px] tracking-widest px-8">Discard</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-10 shadow-xl shadow-primary/20 active:scale-95 transition-all">
                            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <Check className="h-4 w-4 mr-2"/>}
                            {editingProduct?.id ? 'Update Catalog' : 'Save New Product'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent className="rounded-[25px] border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline text-2xl font-black uppercase tracking-tight">Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium text-base text-muted-foreground leading-relaxed">
                            This action is permanent. This will remove <strong>{productToDelete?.name}</strong> from the store catalog and all student wishlists.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="rounded-xl font-bold uppercase text-[10px] px-8">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl font-black uppercase text-[10px] px-8 shadow-xl shadow-destructive/20">
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
