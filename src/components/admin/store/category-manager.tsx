
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
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { StoreCategory, SubCategoryGroup } from '@/lib/types';
import { saveStoreCategoryAction, deleteStoreCategoryAction } from '@/app/actions/store.actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Textarea } from '../ui/textarea';

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
    
    const updateGroupTitle = (groupIndex: number, title: string) => {
        setEditingCategory(prev => {
            if (!prev) return null;
            const newGroups = [...(prev.subCategoryGroups || [])];
            newGroups[groupIndex] = { ...newGroups[groupIndex], title };
            return { ...prev, subCategoryGroups: newGroups };
        });
    };

    const updateSubCategory = (groupIndex: number, subIndex: number, value: string) => {
        setEditingCategory(prev => {
            if (!prev) return null;
            const newGroups = [...(prev.subCategoryGroups || [])];
            const newSubCategories = [...(newGroups[groupIndex].subCategories || [])];
            newSubCategories[subIndex] = { name: value };
            newGroups[groupIndex] = { ...newGroups[groupIndex], subCategories: newSubCategories };
            return { ...prev, subCategoryGroups: newGroups };
        });
    };
    
    const addSubCategoryGroup = () => {
         setEditingCategory(prev => ({
            ...prev,
            subCategoryGroups: [...(prev?.subCategoryGroups || []), { title: 'New Group', subCategories: [{ name: '' }] }]
        }));
    };

    const addSubCategory = (groupIndex: number) => {
        setEditingCategory(prev => {
            if (!prev) return null;
            const newGroups = [...(prev.subCategoryGroups || [])];
            const newSubCategories = [...(newGroups[groupIndex].subCategories || []), { name: '' }];
            newGroups[groupIndex] = { ...newGroups[groupIndex], subCategories: newSubCategories };
            return { ...prev, subCategoryGroups: newGroups };
        });
    };

    const removeSubCategoryGroup = (groupIndex: number) => {
        setEditingCategory(prev => ({
            ...prev,
            subCategoryGroups: prev?.subCategoryGroups?.filter((_, i) => i !== groupIndex)
        }));
    };
    
    const removeSubCategory = (groupIndex: number, subIndex: number) => {
        setEditingCategory(prev => {
            if (!prev) return null;
            const newGroups = [...(prev.subCategoryGroups || [])];
            const newSubCategories = newGroups[groupIndex].subCategories.filter((_, i) => i !== subIndex);
            newGroups[groupIndex] = { ...newGroups[groupIndex], subCategories: newSubCategories };
            return { ...prev, subCategoryGroups: newGroups };
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Store Categories</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Manage product categories and sub-categories for the RDC Store.</p>
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
                                <TableHead>Sub-categories</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.sort((a,b) => (a.order || 99) - (b.order || 99)).map(category => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1 max-w-md">
                                            {category.subCategoryGroups?.flatMap(g => g.subCategories).map(sc => <span key={sc.name} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{sc.name}</span>)}
                                        </div>
                                    </TableCell>
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingCategory?.id ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                    </DialogHeader>
                    {editingCategory && (
                        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
                            <div className="space-y-4 pt-4 border-t">
                                <Label className="font-semibold">Sub-category Groups</Label>
                                <div className="space-y-4">
                                {(editingCategory.subCategoryGroups || []).map((group, groupIndex) => (
                                    <div key={groupIndex} className="p-3 border rounded-md bg-muted/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Input 
                                                className="font-semibold text-base flex-grow" 
                                                value={group.title} 
                                                onChange={e => updateGroupTitle(groupIndex, e.target.value)}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeSubCategoryGroup(groupIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                        <div className="space-y-2 pl-2">
                                        {(group.subCategories || []).map((sc, subIndex) => (
                                            <div key={subIndex} className="flex items-center gap-2">
                                                <Input 
                                                    value={sc.name}
                                                    onChange={(e) => updateSubCategory(groupIndex, subIndex, e.target.value)}
                                                    placeholder={`Sub-category ${subIndex + 1}`}
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => removeSubCategory(groupIndex, subIndex)}><X className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addSubCategory(groupIndex)}>Add Sub-category</Button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={addSubCategoryGroup}>Add Sub-category Group</Button>
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
                        <AlertDialogDescription>This will permanently delete the category <strong>{categoryToDelete?.name}</strong> and all its sub-categories.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
