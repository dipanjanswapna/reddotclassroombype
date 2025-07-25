

'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlannerTask } from "@/lib/types";
import { BookOpen, FileText, HelpCircle, Edit, Trash2, Award, Repeat, Clock, GripVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
    'study-session': <BookOpen className="h-4 w-4" />,
    'assignment-deadline': <FileText className="h-4 w-4" />,
    'quiz-reminder': <HelpCircle className="h-4 w-4" />,
    'exam-prep': <Award className="h-4 w-4" />,
    'habit': <Repeat className="h-4 w-4" />,
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
        <Card className="p-3 cursor-grab active:cursor-grabbing">
             <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                     <div {...listeners} className="cursor-grab pt-0.5">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-sm leading-tight flex-grow">{task.title}</p>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
            </div>
            {task.description && <p className="text-xs text-muted-foreground mt-1 ml-7">{task.description}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap ml-7">
                {eventIcons[task.type]}
                {task.courseTitle && <Badge variant="secondary">{task.courseTitle}</Badge>}
                {task.time && <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3"/>{task.time}</Badge>}
                {task.priority && <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>}
                {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
        </Card>
    </div>
  );
}
