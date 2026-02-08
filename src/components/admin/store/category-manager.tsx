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
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical, X, ListTree, Tags } from 'lucide-react';
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
        <div className="space-y-8">
            <Card className="rounded-xl border-primary/10 shadow-xl overflow-hidden bg-card">
                <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-primary/5 bg-muted/30">
                    <div className="space-y-1">
                        <CardTitle className="font-black uppercase tracking-tight text-lg">Knowledge Taxonomy</CardTitle>
                        <CardDescription className="font-medium">Manage product categories and sub-categories for store navigation.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)} className="rounded-xl font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-2xl active:scale-95 transition-all">
                        <PlusCircle className="mr-2 h-4 w-4"/> Instate Category
                    </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Name</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Hierarchy Depth</TableHead>
                                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Order</TableHead>
                                <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-primary/5">
                            {categories.sort((a,b) => (a.order || 99) - (b.order || 99)).map(category => (
                                <TableRow key={category.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="px-8 py-6 font-bold">{category.name}</TableCell>
                                    <TableCell className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1 max-w-md">
                                            {category.subCategoryGroups?.flatMap(g => g.subCategories).map(sc => <Badge key={sc.name} variant="outline" className="font-bold text-[9px] uppercase tracking-tighter">{sc.name}</Badge>)}
                                            {(!category.subCategoryGroups || category.subCategoryGroups.length === 0) && <span className="text-xs text-muted-foreground italic">Root Only</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 font-black text-primary">{category.order ?? 'N/A'}</TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent className="rounded-xl border-primary/20 shadow-2xl">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(category)} className="font-bold text-xs uppercase tracking-tight"><Edit className="mr-2 h-4 w-4" /> Edit Taxonomy</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive font-bold text-xs uppercase tracking-tight" onClick={() => setCategoryToDelete(category)}><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>
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
                        <DialogTitle>{editingCategory?.id ? 'Refine Taxonomy Node' : 'Instate New Taxonomy Node'}</DialogTitle>
                    </DialogHeader>
                    {editingCategory && (
                        <div className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Category Label</Label>
                                    <Input value={editingCategory.name || ''} onChange={e => updateField('name', e.target.value)} className="h-12 rounded-xl border-2 font-bold shadow-sm" placeholder="e.g., ADMISSION BOOKS" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">System Slug</Label>
                                    <Input value={editingCategory.slug || ''} onChange={e => updateField('slug', e.target.value)} placeholder="auto-generated" className="h-12 rounded-xl border-2 font-mono text-sm opacity-70" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Priority Weights (Display Order)</Label>
                                <Input type="number" value={editingCategory.order || ''} onChange={e => updateField('order', Number(e.target.value))} className="h-12 rounded-xl border-2 font-black text-lg text-primary w-full md:w-32" />
                            </div>
                            
                            <div className="space-y-4 pt-6 border-t-2 border-primary/5">
                                <Label className="font-black uppercase text-[10px] tracking-widest text-primary flex items-center gap-2">
                                    <ListTree className="h-4 w-4"/> Hierarchical Sub-sectors
                                </Label>
                                <div className="space-y-6">
                                {(editingCategory.subCategoryGroups || []).map((group, groupIndex) => (
                                    <div key={groupIndex} className="p-6 border-2 rounded-xl bg-muted/20 space-y-4 shadow-sm relative group/item">
                                        <div className="flex items-center justify-between gap-4">
                                            <Input 
                                                className="h-11 rounded-lg border-2 font-black uppercase text-xs tracking-wider flex-grow bg-background" 
                                                value={group.title} 
                                                onChange={e => updateGroupTitle(groupIndex, e.target.value)}
                                                placeholder="GROUP TITLE (e.g., MEDICAL SECTOR)"
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeSubCategoryGroup(groupIndex)} className="h-11 w-11 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="h-5 w-5"/></Button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 border-l-4 border-primary/10">
                                        {(group.subCategories || []).map((sc, subIndex) => (
                                            <div key={subIndex} className="flex items-center gap-2">
                                                <Input 
                                                    className="h-10 rounded-lg border-2 font-bold text-xs"
                                                    value={sc.name}
                                                    onChange={(e) => updateSubCategory(groupIndex, subIndex, e.target.value)}
                                                    placeholder={`Artifact Sub-type ${subIndex + 1}`}
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => removeSubCategory(groupIndex, subIndex)} className="h-8 w-8 text-destructive rounded-lg hover:bg-destructive/5"><X className="h-4 w-4"/></Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addSubCategory(groupIndex)} className="h-10 rounded-lg border-dashed border-2 font-black uppercase text-[9px] tracking-widest hover:bg-primary/5 shadow-sm"><PlusCircle className="mr-2 h-3.5 w-3.5"/> Instate Sub-type</Button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                                <Button variant="outline" className="w-full h-14 border-dashed border-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-primary/5 transition-all" onClick={addSubCategoryGroup}><PlusCircle className="mr-2 h-5 w-5 text-primary"/> Register Tier Group</Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="p-8 border-t bg-muted/30">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest border-2">Abort</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-12 px-14 font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-none">
                            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>}
                            Commit Taxonomy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-4 border-destructive shadow-2xl">
                    <AlertDialogHeader className="text-center">
                        <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4"><Trash2 className="h-8 w-8 text-destructive"/></div>
                        <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">Destroy Taxonomy Node?</AlertDialogTitle>
                        <AlertDialogDescription className="font-bold text-muted-foreground mt-2">Erasing "{categoryToDelete?.name}" will disconnect all associated artifacts. This action is terminal.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-4 mt-6">
                        <AlertDialogCancel className="rounded-xl h-12 px-8 font-black uppercase text-[10px] border-2">Retain Node</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="rounded-xl h-12 px-10 font-black uppercase text-[10px] bg-destructive hover:bg-destructive/90 shadow-2xl shadow-destructive/20 border-none">Erase Permanently</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
