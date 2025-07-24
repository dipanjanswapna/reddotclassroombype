
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { List, PlannerTask } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { saveTask } from '@/app/actions/planner.actions';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface TaskDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingTask: Partial<PlannerTask> | null;
  onTaskSaved: (task: PlannerTask) => void;
  lists: List[];
}

export function TaskDialog({ isOpen, setIsOpen, editingTask, onTaskSaved, lists }: TaskDialogProps) {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [task, setTask] = useState<Partial<PlannerTask>>({});

  useEffect(() => {
    if (editingTask) {
      setTask({ ...editingTask, date: editingTask.date ? new Date(editingTask.date) : new Date() });
    } else {
      setTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        date: new Date(),
      });
    }
  }, [editingTask]);

  const updateField = (field: keyof PlannerTask, value: any) => {
    setTask(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = async () => {
      if (!task.title || !userInfo) {
          toast({ title: 'Title is required', variant: 'destructive'});
          return;
      }
      setIsSaving(true);
      const dataToSave = {
          ...task,
          userId: userInfo.uid,
          date: task.date ? format(task.date as Date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      };
      
      await saveTask(dataToSave);

      // This is a simplification. In a real app, the action would return the saved object with its new ID.
      onTaskSaved(dataToSave as PlannerTask);
      
      setIsSaving(false);
      setIsOpen(false);
      toast({ title: 'Task saved!' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingTask?.id ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label>Title</Label>
                <Input value={task.title || ''} onChange={e => updateField('title', e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={task.description || ''} onChange={e => updateField('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>List</Label>
                    <Select value={task.listId || ''} onValueChange={v => updateField('listId', v)}>
                        <SelectTrigger><SelectValue placeholder="Select a list..."/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">No List</SelectItem>
                            {lists.map(list => <SelectItem key={list.id} value={list.id!}>{list.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Due Date</Label>
                    <DatePicker date={task.date as Date} setDate={(d) => updateField('date', d)} />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Start Time (Optional)</Label>
                    <Input type="time" value={task.time || ''} onChange={e => updateField('time', e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={task.priority || 'medium'} onValueChange={v => updateField('priority', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="animate-spin mr-2"/>}
                Save Task
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
