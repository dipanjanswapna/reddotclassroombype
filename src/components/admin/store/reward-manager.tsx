
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
import { Reward } from '@/lib/types';
import { saveRewardAction, deleteRewardAction } from '@/app/actions/reward.actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

interface RewardManagerProps {
  initialRewards: Reward[];
}

export function RewardManager({ initialRewards }: RewardManagerProps) {
    const { toast } = useToast();
    const [rewards, setRewards] = useState<Reward[]>(initialRewards);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingReward, setEditingReward] = useState<Partial<Reward> | null>(null);
    const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);

    const handleOpenDialog = (reward: Partial<Reward> | null) => {
        setEditingReward(reward ? { ...reward } : { title: '', pointsRequired: 100, stock: 10 });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingReward || !editingReward.title || !editingReward.pointsRequired) {
            toast({ title: 'Error', description: 'Title and points required are mandatory.', variant: 'destructive'});
            return;
        }
        setIsSaving(true);
        const result = await saveRewardAction(editingReward);

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
        if (!rewardToDelete?.id) return;
        const result = await deleteRewardAction(rewardToDelete.id);
        if (result.success) {
            setRewards(rewards.filter(r => r.id !== rewardToDelete.id));
            toast({ title: 'Reward Deleted', description: result.message, variant: 'destructive' });
        } else {
             toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setRewardToDelete(null);
    };

    const updateField = (field: keyof Reward, value: any) => {
        setEditingReward(prev => prev ? { ...prev, [field]: value } : null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Rewards Management</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Manage rewards for the referral system.</p>
                </div>
                <Button onClick={() => handleOpenDialog(null)}>
                    <PlusCircle className="mr-2"/> Create Reward
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reward</TableHead>
                                <TableHead>Points Required</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rewards.map(reward => (
                                <TableRow key={reward.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Image src={reward.imageUrl} alt={reward.title} width={40} height={40} className="rounded-md object-cover"/>
                                        {reward.title}
                                    </TableCell>
                                    <TableCell>{reward.pointsRequired}</TableCell>
                                    <TableCell>{reward.stock}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleOpenDialog(reward)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => setRewardToDelete(reward)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingReward?.id ? 'Edit Reward' : 'Create New Reward'}</DialogTitle>
                    </DialogHeader>
                    {editingReward && (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={editingReward.title || ''} onChange={e => updateField('title', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={editingReward.description || ''} onChange={e => updateField('description', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input id="imageUrl" value={editingReward.imageUrl || ''} onChange={e => updateField('imageUrl', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pointsRequired">Points Required</Label>
                                    <Input id="pointsRequired" type="number" value={editingReward.pointsRequired} onChange={e => updateField('pointsRequired', Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input id="stock" type="number" value={editingReward.stock} onChange={e => updateField('stock', Number(e.target.value))} />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="animate-spin mr-2"/>}
                            Save Reward
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!rewardToDelete} onOpenChange={(open) => !open && setRewardToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the reward: <strong>{rewardToDelete?.title}</strong>.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
