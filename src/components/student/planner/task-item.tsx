
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudyPlanEvent } from "@/lib/types";
import { BookOpen, Calendar, Edit, FileText, HelpCircle, Trash2, Clock, CheckCircle, Flag, Minus, Plus, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format, parse } from 'date-fns';
import { Input } from "@/components/ui/input";

type TaskItemProps = {
  event: StudyPlanEvent;
  onEdit: () => void;
  onDelete: () => void;
  onTaskUpdate: (event: StudyPlanEvent) => void;
};

const eventIcons: { [key in StudyPlanEvent['type']]: React.ReactNode } = {
    'study-session': <BookOpen className="h-5 w-5" />,
    'assignment-deadline': <FileText className="h-5 w-5" />,
    'quiz-reminder': <HelpCircle className="h-5 w-5" />,
    'exam-prep': <Calendar className="h-5 w-5" />,
    'live-class': <Video className="h-5 w-5" />,
};

const priorityColors: { [key: string]: string } = {
    High: 'text-destructive',
    Medium: 'text-yellow-500',
    Low: 'text-green-500'
}

export function TaskItem({ event, onEdit, onDelete, onTaskUpdate }: TaskItemProps) {
  const { completedPomos = 0, estimatedPomos = 0 } = event;
  const progress = estimatedPomos > 0 ? (completedPomos / estimatedPomos) * 100 : 0;
  const isCompleted = progress >= 100;

  const formattedTime = event.time ? format(parse(event.time, 'HH:mm', new Date()), 'h:mm a') : null;

  const handlePomoChange = (amount: number) => {
    const newCompleted = Math.max(0, completedPomos + amount);
    onTaskUpdate({ ...event, completedPomos: newCompleted });
  };


  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        {formattedTime && (
            <div className="text-xs font-semibold text-muted-foreground w-16 text-right shrink-0">
                {formattedTime}
            </div>
        )}
        <div className={cn("flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center", !formattedTime && 'ml-4')}>
            {isCompleted ? <CheckCircle className="h-5 w-5" /> : eventIcons[event.type]}
        </div>
        <div className="flex-grow">
          <p className="font-semibold">{event.title}</p>
          <p className="text-sm text-muted-foreground">{event.description}</p>
          <div className="flex items-center gap-2 mt-1">
            {event.courseTitle && <Badge variant="secondary">{event.courseTitle}</Badge>}
            {event.priority && <Flag className={cn("h-4 w-4", priorityColors[event.priority])}/>}
          </div>
        </div>
        <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      {(event.type === 'study-session' || event.type === 'exam-prep') && estimatedPomos > 0 && (
        <div className="mt-3 pl-14 sm:pl-24">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <div className="flex items-center gap-1"><Clock className="h-3 w-3"/> Pomodoro Sessions</div>
                 <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handlePomoChange(-1)}><Minus className="h-3 w-3"/></Button>
                    <span>{completedPomos} / {estimatedPomos}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handlePomoChange(1)}><Plus className="h-3 w-3"/></Button>
                 </div>
            </div>
            <Progress value={progress} className="h-1.5"/>
        </div>
      )}
    </Card>
  );
}
