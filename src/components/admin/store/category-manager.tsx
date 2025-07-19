
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
import { StoreCategory } from '@/lib/types';
import { saveStoreCategoryAction, deleteStoreCategoryAction } from '@/app/actions/store.actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface CategoryManagerProps {
  initialCategories: StoreCategory[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
    const { toast } = useToast();
    const [categories, setCategories] = useState<StoreCategory[]>(initialCategories);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<StoreCategory> | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<StoreCategory | null>(null);

    const handleOpenDialog = (category: Partial<StoreCategory> | null) => {
        setEditingCategory(category ? { ...category } : {});
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingCategory || !editingCategory.name) {
            toast({ title: 'Error', description: 'Category name is required.', variant: 'destructive'});
            return;
        }
        
        const slug = editingCategory.slug || editingCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        setIsSaving(true);
        const result = await saveStoreCategoryAction({ ...editingCategory, slug });

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
        if (!categoryToDelete?.id) return;
        const result = await deleteStoreCategoryAction(categoryToDelete.id);
        if (result.success) {
            setCategories(categories.filter(c => c.id !== categoryToDelete.id));
            toast({ title: 'Category Deleted', description: result.message, variant: 'destructive' });
        } else {
             toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setCategoryToDelete(null);
    };

    const updateField = (field: keyof StoreCategory, value: any) => {
        setEditingCategory(prev => prev ? { ...prev, [field]: value } : null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Store Categories</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Manage product categories for the RDC Store.</p>
                </div>
                <Button onClick={() => handleOpenDialog(null)}>
                    <PlusCircle className="mr-2"/> Create Category
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map(category => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="font-mono text-muted-foreground">/{category.slug}</TableCell>
                                    <TableCell>{category.order ?? 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleOpenDialog(category)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => setCategoryToDelete(category)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory?.id ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                    </DialogHeader>
                    {editingCategory && (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name</Label>
                                <Input id="name" value={editingCategory.name || ''} onChange={e => updateField('name', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug</Label>
                                <Input id="slug" value={editingCategory.slug || ''} onChange={e => updateField('slug', e.target.value)} placeholder="auto-generated from name if left blank" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input id="order" type="number" value={editingCategory.order || ''} onChange={e => updateField('order', Number(e.target.value))} placeholder="e.g., 1"/>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="animate-spin mr-2"/>}
                            Save Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the category <strong>{categoryToDelete?.name}</strong>.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
