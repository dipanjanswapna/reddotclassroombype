'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlannerTask } from "@/lib/types";
import { BookOpen, FileText, HelpCircle, Edit, Trash2, Award, Repeat, Clock, GripVertical } from "lucide-react";
import { isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TaskItemProps = {
  task: PlannerTask;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (task: PlannerTask) => void;
};

const eventIcons: { [key in PlannerTask['type']]: React.ReactNode } = {
    'study-session': <BookOpen className="h-3 w-3" />,
    'assignment-deadline': <FileText className="h-3 w-3" />,
    'quiz-reminder': <HelpCircle className="h-3 w-3" />,
    'exam-prep': <Award className="h-3 w-3" />,
    'habit': <Repeat className="h-3 w-3" />,
};

const priorityColors = {
    low: 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    medium: 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    high: 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
    urgent: 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200',
}

/**
 * @fileOverview High-density task item component.
 * Uses tight padding and 20px corners for professional profile.
 */
export function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
    const isOverdue = !isToday(new Date(task.date)) && isPast(new Date(task.date)) && task.status !== 'completed';
  
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: task.id!});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
        <Card className="p-3 rounded-[20px] border-primary/10 shadow-sm hover:shadow-xl transition-all group relative bg-background border-2">
             <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-2 flex-grow min-w-0">
                     <div {...listeners} className="cursor-grab pt-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-black text-xs md:text-sm uppercase tracking-tight text-foreground leading-tight truncate">{task.title}</p>
                        {task.description && <p className="text-[10px] text-muted-foreground line-clamp-1 italic">{task.description}</p>}
                    </div>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10" onClick={onEdit}><Edit className="h-3.5 w-3.5 text-primary" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-destructive/10" onClick={onDelete}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3 flex-wrap ml-6">
                <div className="p-1.5 bg-primary/5 rounded-lg border border-primary/10">
                    {eventIcons[task.type]}
                </div>
                {task.courseTitle && <Badge variant="secondary" className="text-[8px] h-4.5 font-black uppercase px-2 rounded-lg">{task.courseTitle}</Badge>}
                {task.time && <Badge variant="outline" className="text-[8px] h-4.5 font-bold flex items-center gap-1 px-2 border-primary/10 rounded-lg"><Clock className="h-2.5 w-2.5"/>{task.time}</Badge>}
                {task.priority && <Badge className={cn("text-[8px] h-4.5 font-black uppercase px-2 rounded-lg", priorityColors[task.priority])}>{task.priority}</Badge>}
                {isOverdue && <Badge variant="destructive" className="text-[8px] h-4.5 font-black uppercase px-2 rounded-lg">Overdue</Badge>}
            </div>
        </Card>
    </div>
  );
}