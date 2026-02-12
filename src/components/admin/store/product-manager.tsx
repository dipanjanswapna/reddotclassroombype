'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
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
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical, Package, Image as ImageIcon, Check, Search, AlertCircle, ShoppingCart, Star } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface ProductManagerProps {
  initialProducts: Product[];
  sellers: Organization[];
  categories: StoreCategory[];
}

/**
 * @fileOverview Refined Admin Store Product Manager.
 * Optimized for high-density wall-to-wall UI with 20px corners.
 * Features an ultra-responsive 2-column dialog that adapts to all devices.
 */
export function ProductManager({ initialProducts, sellers, categories }: ProductManagerProps) {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenDialog = (product: Partial<Product> | null) => {
        setEditingProduct(product ? { ...product } : { 
            isPublished: true, 
            price: 0, 
            stock: 10, 
            category: categories[0]?.name || '',
            imageUrl: 'https://placehold.co/600x600.png'
        });
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
            toast({ title: 'Product Deleted', description: result.message });
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
                const newCat = categories.find(c => c.name === value);
                const firstSub = newCat?.subCategoryGroups?.[0]?.subCategories[0]?.name || '';
                newState.subCategory = firstSub;
            }
            return newState;
        });
    };

    const availableSubCategories = useMemo(() => {
        if (!editingProduct?.category) return [];
        const currentCat = categories.find(c => c.name === editingProduct.category);
        return currentCat?.subCategoryGroups?.flatMap(g => g.subCategories) || [];
    }, [editingProduct?.category, categories]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    return (
        <div className="space-y-8 px-1">
            {/* Premium Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-card/20 backdrop-blur-xl p-4 rounded-[25px] border border-primary/10 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input 
                        placeholder="Search products..." 
                        className="pl-9 h-11 rounded-xl bg-white dark:bg-background border-primary/10 focus:border-primary transition-all shadow-inner" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => handleOpenDialog(null)} className="w-full md:w-auto h-11 rounded-xl font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/20 active:scale-95 transition-all">
                    <PlusCircle className="mr-2 h-4 w-4"/> Add New Product
                </Button>
            </div>

            {/* Catalog Grid */}
            <Card className="rounded-[20px] border-primary/10 shadow-2xl overflow-hidden bg-card">
                <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-xl text-white shadow-md">
                            <Package className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Merchandise Catalog</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-primary/10">
                                    <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">Product Details</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Category</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Pricing</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Stock</TableHead>
                                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                                    <TableHead className="text-right px-6 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map(product => (
                                    <TableRow key={product.id} className="border-primary/10 hover:bg-primary/5 transition-colors group">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 relative rounded-xl overflow-hidden border-2 border-primary/10 bg-white shadow-sm shrink-0">
                                                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover p-1 group-hover:scale-110 transition-transform duration-500"/>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-black text-sm uppercase tracking-tight truncate max-w-[300px]">{product.name}</span>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter opacity-60">ID: #{product.id.slice(-8)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest w-fit border-primary/20 text-primary bg-primary/5">{product.category}</Badge>
                                                {product.subCategory && <span className="text-[9px] font-bold text-muted-foreground pl-1">{product.subCategory}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm text-foreground">৳{product.price}</span>
                                                {product.oldPrice && <span className="text-[9px] font-bold text-muted-foreground line-through opacity-40">৳{product.oldPrice}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn("font-black text-sm", (product.stock || 0) < 10 ? "text-orange-600" : "text-foreground")}>
                                                {product.stock ?? 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.isPublished ? "accent" : "secondary"} className="font-black text-[9px] uppercase tracking-widest px-3 h-5 border-none shadow-sm">
                                                {product.isPublished ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10">
                                                        <MoreVertical className="h-4 w-4 text-primary"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl shadow-2xl border-primary/10 p-2 min-w-[180px]">
                                                    <DropdownMenuItem onClick={() => handleOpenDialog(product)} className="rounded-lg cursor-pointer flex items-center gap-3 py-2.5 font-black text-[10px] uppercase tracking-widest">
                                                        <Edit className="h-4 w-4 text-primary" /> Edit Product
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setProductToDelete(product)} className="rounded-lg cursor-pointer flex items-center gap-3 py-2.5 font-black text-[10px] uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                        <Trash2 className="h-4 w-4" /> Delete Forever
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Ultra Responsive Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-4xl rounded-[25px] border-primary/20 shadow-2xl p-0 overflow-hidden outline-none bg-background">
                    {/* Fixed Header */}
                    <DialogHeader className="bg-primary/5 p-5 md:p-6 border-b border-primary/10 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary p-2.5 md:p-3 rounded-2xl shadow-lg text-white">
                                <Edit className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight">
                                    {editingProduct?.id ? 'Product Editor' : 'Register New Item'}
                                </DialogTitle>
                                <DialogDescription className="font-medium text-[9px] md:text-[10px] uppercase tracking-[0.2em] opacity-60">Synchronizing with RDC Store DB</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {editingProduct && (
                        <div className="flex flex-col lg:grid lg:grid-cols-12 max-h-[70svh] overflow-y-auto custom-scrollbar">
                            {/* Left Column: Visuals & Core (Stacked on Mobile) */}
                            <div className="lg:col-span-4 bg-muted/20 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-primary/5 space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1 block text-left">Identity Visual</Label>
                                    <div className="aspect-square relative rounded-[20px] overflow-hidden border-4 border-white shadow-xl bg-white group mx-auto max-w-[240px] lg:max-w-full">
                                        <Image src={editingProduct.imageUrl || 'https://placehold.co/600x600.png'} alt="Preview" fill className="object-contain p-4"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest opacity-60 text-left block">Image URL</Label>
                                        <Input 
                                            value={editingProduct.imageUrl || ''} 
                                            onChange={e => updateField('imageUrl', e.target.value)} 
                                            className="rounded-xl h-10 text-[11px] font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="p-5 rounded-[20px] bg-white border border-primary/10 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-foreground">Live Visibility</Label>
                                        <Switch checked={editingProduct.isPublished} onCheckedChange={(val) => updateField('isPublished', val)} />
                                    </div>
                                    <Separator className="bg-primary/5" />
                                    <div className="space-y-2">
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-foreground text-left block">Seller Origin</Label>
                                        <Select value={editingProduct.sellerId || 'rdc'} onValueChange={(v) => updateField('sellerId', v === 'rdc' ? undefined : v)}>
                                            <SelectTrigger className="rounded-xl h-10 border-primary/5 bg-muted/20 font-bold text-[11px] uppercase"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl border-white/10">
                                                <SelectItem value="rdc" className="font-bold text-xs uppercase">RDC Originals</SelectItem>
                                                {sellers.map(s => <SelectItem key={s.id} value={s.id!} className="font-bold text-xs uppercase">{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Content & Inventory (Stacked on Mobile) */}
                            <div className="lg:col-span-8 p-6 md:p-8 space-y-8 bg-card">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 text-left block">Product Name</Label>
                                    <Input 
                                        placeholder="e.g., Higher Math Guide" 
                                        value={editingProduct.name || ''} 
                                        onChange={e => updateField('name', e.target.value)} 
                                        className="rounded-xl h-12 md:h-14 text-base md:text-lg font-black uppercase border-primary/10 focus:border-primary shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 text-left block">Primary Category</Label>
                                        <Select value={editingProduct.category} onValueChange={(v) => updateField('category', v)}>
                                            <SelectTrigger className="rounded-xl h-11 border-primary/10 bg-muted/10 font-black text-xs uppercase"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl border-white/10">
                                                {categories.map(cat => <SelectItem key={cat.id} value={cat.name} className="font-black text-xs uppercase">{cat.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 text-left block">Sub-Category</Label>
                                        <Select 
                                            value={editingProduct.subCategory} 
                                            onValueChange={(v) => updateField('subCategory', v)}
                                            disabled={availableSubCategories.length === 0}
                                        >
                                            <SelectTrigger className="rounded-xl h-11 border-primary/10 bg-muted/10 font-black text-xs uppercase disabled:opacity-40"><SelectValue placeholder="No sub-category"/></SelectTrigger>
                                            <SelectContent className="rounded-xl border-white/10">
                                                {availableSubCategories.map(sub => <SelectItem key={sub.name} value={sub.name} className="font-black text-xs uppercase">{sub.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="p-5 md:p-6 rounded-[20px] bg-[#eef2ed] dark:bg-black/20 border border-primary/5 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-primary text-left block">Price (BDT)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-primary">৳</span>
                                            <Input type="number" value={editingProduct.price || 0} onChange={e => updateField('price', Number(e.target.value))} className="pl-7 rounded-xl h-11 font-black text-lg border-primary/10 bg-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-left block">Old Price</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground opacity-60">৳</span>
                                            <Input type="number" value={editingProduct.oldPrice || ''} onChange={e => updateField('oldPrice', Number(e.target.value))} className="pl-7 rounded-xl h-11 font-bold text-muted-foreground bg-white/50 border-primary/5" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-left block">Stock Units</Label>
                                        <Input type="number" value={editingProduct.stock || 0} onChange={e => updateField('stock', Number(e.target.value))} className="rounded-xl h-11 font-black text-center border-primary/10 bg-white" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 text-left block">Product Description</Label>
                                    <Textarea 
                                        value={editingProduct.description || ''} 
                                        onChange={e => updateField('description', e.target.value)} 
                                        rows={6} 
                                        className="rounded-[20px] border-primary/10 bg-muted/5 text-sm font-medium leading-relaxed resize-none p-5 focus:border-primary shadow-inner" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fixed Footer */}
                    <DialogFooter className="bg-primary/5 p-5 md:p-6 border-t border-primary/10 flex flex-row justify-between items-center gap-3 shrink-0">
                        <DialogClose asChild><Button variant="ghost" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-11">Discard</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8 md:px-12 shadow-xl shadow-primary/30 active:scale-95 transition-all">
                            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <Check className="h-4 w-4 mr-2"/>}
                            Commit Database
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Deletion Confirm */}
            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent className="rounded-[25px] border-none shadow-2xl p-8">
                    <AlertDialogHeader className="space-y-4 text-center">
                        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Erase Product?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
                                This action is permanent. <strong>{productToDelete?.name}</strong> will be removed from all active storefronts.
                            </AlertDialogDescription>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-3 pt-6 mt-4 border-t border-primary/5">
                        <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px] tracking-widest h-12 flex-1 mt-0">No, Wait</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl font-black uppercase text-[10px] tracking-widest h-12 flex-1 shadow-xl shadow-destructive/20 border-none">
                            Yes, Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
