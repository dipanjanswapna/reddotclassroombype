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
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical, X, Package } from 'lucide-react';
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
        <div className="space-y-8">
            <Card className="rounded-xl border-primary/10 shadow-xl overflow-hidden bg-card">
                <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-primary/5 bg-muted/30">
                    <div className="space-y-1">
                        <CardTitle className="font-black uppercase tracking-tight text-lg">Product Inventory</CardTitle>
                        <CardDescription className="font-medium">Manage all physical products available in the RDC Store.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)} className="rounded-xl font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-2xl active:scale-95 transition-all">
                        <PlusCircle className="mr-2 h-4 w-4"/> Instate Product
                    </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Product</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Category</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-primary">Price</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Stock</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-primary/5">
                            {products.map(product => (
                                <TableRow key={product.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="px-8 py-6 font-bold flex items-center gap-4">
                                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border-2 border-primary/5 shadow-inner">
                                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover"/>
                                        </div>
                                        {product.name}
                                    </TableCell>
                                    <TableCell className="px-8 py-6">
                                        <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest rounded-lg">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 font-black text-primary text-base">৳{product.price}</TableCell>
                                    <TableCell className="px-8 py-6 font-bold">{product.stock ?? 'N/A'}</TableCell>
                                    <TableCell className="px-8 py-6">
                                        <Badge variant={product.isPublished ? "accent" : "secondary"} className="font-black text-[9px] uppercase tracking-widest rounded-lg">
                                            {product.isPublished ? 'Live' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent className="rounded-xl border-primary/20 shadow-2xl">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(product)} className="font-bold text-xs uppercase tracking-tight"><Edit className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive font-bold text-xs uppercase tracking-tight" onClick={() => setProductToDelete(product)}><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                    <DialogHeader className="p-8 pb-4 border-b">
                        <DialogTitle>{editingProduct?.id ? 'Refine Product Artifact' : 'Instate New Product'}</DialogTitle>
                    </DialogHeader>
                    {editingProduct && (
                        <div className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            <div className="space-y-3">
                                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Universal Label</Label>
                                <Input value={editingProduct.name || ''} onChange={e => updateField('name', e.target.value)} className="h-14 rounded-xl border-2 font-bold shadow-sm" placeholder="e.g., RDC MASTER PHYSICS NOTEBOOK" />
                            </div>
                             <div className="space-y-3">
                                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Detailed Manifest</Label>
                                <Textarea value={editingProduct.description || ''} onChange={e => updateField('description', e.target.value)} className="rounded-xl border-2 font-medium" rows={4} placeholder="Summarize the product values..." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Primary Category</Label>
                                    <Select value={editingProduct.category} onValueChange={(v) => updateField('category', v)}>
                                        <SelectTrigger className="h-12 rounded-xl border-2 font-bold"><SelectValue placeholder="Select Sector..."/></SelectTrigger>
                                        <SelectContent className="rounded-xl">{categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-3">
                                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Sub-category Specialization</Label>
                                    <Select 
                                        value={editingProduct.subCategory} 
                                        onValueChange={(v) => updateField('subCategory', v)}
                                        disabled={availableSubCategories.length === 0}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-2 font-bold"><SelectValue placeholder="Select Tier..."/></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {availableSubCategories.map(sub => <SelectItem key={sub.name} value={sub.name}>{sub.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Listing Price (BDT)</Label>
                                    <Input type="number" value={editingProduct.price || 0} onChange={e => updateField('price', Number(e.target.value))} className="h-12 rounded-xl border-2 font-black text-lg text-primary" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Retail Ref. (Optional)</Label>
                                    <Input type="number" value={editingProduct.oldPrice || ''} onChange={e => updateField('oldPrice', Number(e.target.value))} className="h-12 rounded-xl border-2 font-black text-lg opacity-60" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Stock Readiness</Label>
                                    <Input type="number" value={editingProduct.stock || 0} onChange={e => updateField('stock', Number(e.target.value))} className="h-12 rounded-xl border-2 font-black text-lg" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Primary Identification URL</Label>
                                <Input value={editingProduct.imageUrl || ''} onChange={e => updateField('imageUrl', e.target.value)} className="h-12 rounded-xl border-2 font-medium" placeholder="https://placehold.co/..." />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Authorized Provider</Label>
                                <Select value={editingProduct.sellerId} onValueChange={(v) => updateField('sellerId', v === 'admin' ? undefined : v)}>
                                    <SelectTrigger className="h-12 rounded-xl border-2 font-bold"><SelectValue placeholder="Select Origin..."/></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="admin">Admin Authority (RDC)</SelectItem>
                                        {sellers.map(s => <SelectItem key={s.id} value={s.id!}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="flex items-center justify-between rounded-xl border-2 border-primary/10 p-6 bg-muted/10 shadow-inner">
                                <div className="space-y-1">
                                    <Label htmlFor="isPublished" className="font-black uppercase text-sm tracking-tight leading-none">Public Deployment</Label>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Authorize product visibility in RDC Store</p>
                                </div>
                                <Switch id="isPublished" checked={editingProduct.isPublished} onCheckedChange={(checked) => updateField('isPublished', checked)} />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="p-8 border-t bg-muted/30">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest border-2">Abort</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-12 px-14 font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-none">
                            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>}
                            Commit Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-4 border-destructive shadow-2xl">
                    <AlertDialogHeader className="text-center">
                        <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4"><Trash2 className="h-8 w-8 text-destructive"/></div>
                        <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">Destroy Product Artifact?</AlertDialogTitle>
                        <AlertDialogDescription className="font-bold text-muted-foreground mt-2">This action is irreversible. "{productToDelete?.name}" will be erased from the central database.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-4 mt-6">
                        <AlertDialogCancel className="rounded-xl h-12 px-8 font-black uppercase text-[10px] border-2">Keep Artifact</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="rounded-xl h-12 px-10 font-black uppercase text-[10px] bg-destructive hover:bg-destructive/90 shadow-2xl shadow-destructive/20 border-none">Erase Permanently</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
