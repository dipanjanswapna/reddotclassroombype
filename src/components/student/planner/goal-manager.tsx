
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DatePicker } from '@/components/ui/date-picker';
import { PlusCircle, Edit, Trash2, Target, Loader2 } from 'lucide-react';
import { Goal } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { saveGoal, deleteGoal } from '@/app/actions/planner.actions';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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

interface GoalManagerProps {
  initialGoals: Goal[];
  onGoalsChange: React.Dispatch<React.SetStateAction<Goal[]>>;
}

export function GoalManager({ initialGoals, onGoalsChange }: GoalManagerProps) {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Partial<Goal> | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleOpenDialog = (goal: Partial<Goal> | null) => {
    setEditingGoal(goal ? { ...goal, targetDate: goal.targetDate ? safeToDate(goal.targetDate) : undefined } : { type: 'short_term', status: 'active', progress: 0, userId: userInfo?.uid });
    setIsDialogOpen(true);
  };
  
  const handleSave = async () => {
    if (!editingGoal || !editingGoal.title) {
        toast({ title: 'Title is required', variant: 'destructive'});
        return;
    }
    setIsSaving(true);
    
    await saveGoal(editingGoal);
    
    // Optimistic UI update
    if (editingGoal.id) {
        onGoalsChange(prev => prev.map(g => g.id === editingGoal!.id ? editingGoal as Goal : g));
    } else {
        // This is a simplification. A proper implementation would refetch or get the ID back.
        onGoalsChange(prev => [...prev, {...editingGoal, id: `new_${Date.now()}`} as Goal]);
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    toast({ title: "Goal Saved!", description: "Your goal has been successfully saved." });
  };
  
  const handleDelete = async () => {
    if (!goalToDelete?.id) return;
    await deleteGoal(goalToDelete.id);
    onGoalsChange(prev => prev.filter(g => g.id !== goalToDelete.id));
    setGoalToDelete(null);
    toast({ title: "Goal Deleted", variant: 'destructive'});
  }

  const updateField = (field: keyof Goal, value: any) => {
    setEditingGoal(prev => (prev ? { ...prev, [field]: value } : null));
  };
  
  const getStatusBadge = (status: Goal['status']) => {
      switch(status) {
          case 'achieved': return 'accent';
          case 'abandoned': return 'destructive';
          default: return 'secondary';
      }
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <Button onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2 h-4 w-4"/> Add New Goal</Button>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialGoals.map(goal => (
          <Card key={goal.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                 <CardTitle className="text-lg">{goal.title}</CardTitle>
                 <Badge variant={getStatusBadge(goal.status)}>{goal.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-sm text-muted-foreground">{goal.description}</p>
              <div>
                <Label>Progress: {goal.progress}%</Label>
                <Slider value={[goal.progress]} disabled className="mt-2"/>
              </div>
              {goal.targetDate && (
                <p className="text-xs text-muted-foreground">Target: {format(safeToDate(goal.targetDate), 'PPP')}</p>
              )}
            </CardContent>
            <div className="p-4 pt-0 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => handleOpenDialog(goal)}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => setGoalToDelete(goal)}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingGoal?.id ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
            </DialogHeader>
            {editingGoal && (
                 <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={editingGoal.title || ''} onChange={e => updateField('title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={editingGoal.description || ''} onChange={e => updateField('description', e.target.value)} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={editingGoal.type} onValueChange={(v: Goal['type']) => updateField('type', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent><SelectItem value="short_term">Short Term</SelectItem><SelectItem value="long_term">Long Term</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                             <Select value={editingGoal.status} onValueChange={(v: Goal['status']) => updateField('status', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="achieved">Achieved</SelectItem><SelectItem value="abandoned">Abandoned</SelectItem></SelectContent>
                            </Select>
                        </div>
                     </div>
                      <div className="space-y-2">
                        <Label>Target Date (Optional)</Label>
                        <DatePicker date={editingGoal.targetDate as Date} setDate={(date) => updateField('targetDate', date)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Progress: {editingGoal.progress}%</Label>
                        <Slider value={[editingGoal.progress || 0]} onValueChange={(v) => updateField('progress', v[0])} max={100} step={1} />
                    </div>
                 </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="animate-spin mr-2"/>}
                    Save Goal
                </Button>
            </DialogFooter>
          </DialogContent>
       </Dialog>
       
       <AlertDialog open={!!goalToDelete} onOpenChange={(open) => !open && setGoalToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the goal: "{goalToDelete?.title}".</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
