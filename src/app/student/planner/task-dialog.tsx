'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { CheckItem, List, PlannerTask } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { saveTask } from '@/app/actions/planner.actions';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { safeToDate } from '@/lib/utils';

interface TaskDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingTask: Partial<PlannerTask> | null;
  onTaskSaved: () => void;
  lists: List[];
}

export function TaskDialog({ isOpen, setIsOpen, editingTask, onTaskSaved, lists }: TaskDialogProps) {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [task, setTask] = useState<Partial<PlannerTask>>({});

  useEffect(() => {
    if (editingTask) {
      setTask({ ...editingTask, date: editingTask.date ? safeToDate(editingTask.date) : new Date() });
    } else {
      setTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        date: new Date(),
        checkItems: [],
        estimatedPomo: 1,
        type: 'study-session',
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
          date: task.date ? format(task.date as Date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          listId: task.listId === 'none' ? undefined : task.listId,
          checkItems: task.checkItems?.filter(item => item.text.trim() !== '') || []
      };
      
      await saveTask(dataToSave);

      onTaskSaved();
      
      setIsSaving(false);
      setIsOpen(false);
      toast({ title: 'Task saved!' });
  }

  const addCheckItem = () => {
    const newCheckItems: CheckItem[] = [...(task.checkItems || []), { id: `ci_${Date.now()}`, text: '', isCompleted: false }];
    updateField('checkItems', newCheckItems);
  };
  const removeCheckItem = (id: string) => {
    const newCheckItems = task.checkItems?.filter(item => item.id !== id);
    updateField('checkItems', newCheckItems);
  };
  const updateCheckItem = (id: string, field: 'text' | 'isCompleted', value: string | boolean) => {
    const newCheckItems = task.checkItems?.map(item => item.id === id ? { ...item, [field]: value } : item);
    updateField('checkItems', newCheckItems);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle>{editingTask?.id ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Task Objective</Label>
                <Input value={task.title || ''} onChange={e => updateField('title', e.target.value)} className="h-12 border-2 rounded-xl font-bold" placeholder="e.g., Complete Chapter 5 Notes" />
            </div>
             <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Detailed Description</Label>
                <Textarea value={task.description || ''} onChange={e => updateField('description', e.target.value)} className="rounded-xl border-2 font-medium" placeholder="Break down the steps..." rows={4} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Target List</Label>
                    <Select value={task.listId || 'none'} onValueChange={v => updateField('listId', v)}>
                        <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue placeholder="Select a list..."/></SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="none">Standalone Task</SelectItem>
                            {lists.map(list => <SelectItem key={list.id} value={list.id!}>{list.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Due Date</Label>
                    <DatePicker date={task.date as Date} setDate={(d) => updateField('date', d)} className="h-12 rounded-xl border-2 font-bold" />
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Execution Time</Label>
                    <Input type="time" value={task.time || ''} onChange={e => updateField('time', e.target.value)} className="h-12 rounded-xl border-2 font-black" />
                </div>
                 <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Strategic Priority</Label>
                    <Select value={task.priority || 'medium'} onValueChange={v => updateField('priority', v)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="low">Low Impact</SelectItem>
                            <SelectItem value="medium">Standard</SelectItem>
                            <SelectItem value="high">Critical</SelectItem>
                            <SelectItem value="urgent">Immediate Action</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Pomodoro Estimations</Label>
                <Input type="number" value={task.estimatedPomo || 1} onChange={e => updateField('estimatedPomo', Number(e.target.value))} min="1" className="h-12 border-2 rounded-xl font-black text-lg text-primary" />
            </div>
             <div className="space-y-4 pt-4 border-t-2 border-primary/5">
                <Label className="font-black uppercase text-[10px] tracking-widest text-primary">Micro-milestones (Checklist)</Label>
                <div className="space-y-3">
                    {(task.checkItems || []).map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl border-2 transition-all hover:border-primary/20">
                            <Checkbox 
                                id={`check-${item.id}`} 
                                checked={item.isCompleted} 
                                onCheckedChange={(checked) => updateCheckItem(item.id, 'isCompleted', !!checked)}
                                className="h-5 w-5 border-2"
                            />
                            <Input 
                                value={item.text} 
                                onChange={(e) => updateCheckItem(item.id, 'text', e.target.value)}
                                className={cn("bg-transparent border-none font-bold text-sm focus-visible:ring-0", item.isCompleted && 'line-through text-muted-foreground')}
                                placeholder="Sub-task description..."
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeCheckItem(item.id)} className="h-8 w-8 text-destructive rounded-lg hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={addCheckItem} className="w-full h-12 border-dashed border-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-primary/5 transition-all"><PlusCircle className="mr-2 h-4 w-4 text-primary"/> Instate Item</Button>
            </div>
        </div>
        <DialogFooter className="p-6 border-t bg-muted/30">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest border-2">Abort</Button>
            <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-12 px-10 font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-none">
                {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>}
                Commit Task
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
