
'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlannerTask } from "@/lib/types";
import { BookOpen, FileText, HelpCircle, Edit, Trash2, Award, Repeat, Clock, GripVertical } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
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

export function TaskItem({ task, onEdit, onDelete, onUpdate }: TaskItemProps) {
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
        <Card className="p-2.5 rounded-xl border-primary/10 shadow-sm hover:shadow-md transition-shadow group relative bg-background">
             <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-1.5 flex-grow min-w-0">
                     <div {...listeners} className="cursor-grab pt-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="font-bold text-xs uppercase tracking-tight text-foreground/90 truncate leading-relaxed">{task.title}</p>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-primary/10" onClick={onEdit}><Edit className="h-3 w-3 text-primary" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-destructive/10" onClick={onDelete}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
            </div>
            
            {task.description && <p className="text-[10px] text-muted-foreground mt-1 ml-5 line-clamp-1 italic">{task.description}</p>}
            
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap ml-5">
                <div className="p-1 bg-primary/5 rounded-md">
                    {eventIcons[task.type]}
                </div>
                {task.courseTitle && <Badge variant="secondary" className="text-[8px] h-4 font-black uppercase px-1.5">{task.courseTitle}</Badge>}
                {task.time && <Badge variant="outline" className="text-[8px] h-4 font-bold flex items-center gap-1 px-1.5 border-primary/10"><Clock className="h-2.5 w-2.5"/>{task.time}</Badge>}
                {task.priority && <Badge className={cn("text-[8px] h-4 font-black uppercase px-1.5", priorityColors[task.priority])}>{task.priority}</Badge>}
                {isOverdue && <Badge variant="destructive" className="text-[8px] h-4 font-black uppercase px-1.5">Late</Badge>}
            </div>
        </Card>
    </div>
  );
}
