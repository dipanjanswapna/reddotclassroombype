

'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudyPlanEvent } from "@/lib/types";
import { BookOpen, Calendar, Edit, FileText, HelpCircle, Trash2, Clock, CheckCircle, Flag, Minus, Plus, Video, Link as LinkIcon, Users, TestTube2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format, parse } from 'date-fns';
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


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
    'exam-prep': <TestTube2 className="h-5 w-5" />,
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

  const getEventTime = () => {
    if (!event.time) return null;
    const startTime = format(parse(event.time, 'HH:mm', new Date()), 'h:mm a');
    if (!event.endTime) return startTime;
    const endTime = format(parse(event.endTime, 'HH:mm', new Date()), 'h:mm a');
    return `${startTime} - ${endTime}`;
  };

  const formattedTime = getEventTime();

  const handlePomoChange = (amount: number) => {
    const newCompleted = Math.max(0, completedPomos + amount);
    onTaskUpdate({ ...event, completedPomos: newCompleted });
  };


  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        {formattedTime && (
            <div className="text-xs font-semibold text-muted-foreground w-24 text-right shrink-0">
                {formattedTime}
            </div>
        )}
        <div className={cn("flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center", !formattedTime && 'ml-4')}>
            {isCompleted ? <CheckCircle className="h-5 w-5" /> : eventIcons[event.type]}
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2">
             <p className="font-semibold">{event.title}</p>
             {event.resourceLink && (
                <Link href={event.resourceLink} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="h-4 w-4 text-muted-foreground hover:text-primary"/>
                </Link>
             )}
          </div>
          <p className="text-sm text-muted-foreground">{event.description}</p>
          <div className="flex items-center gap-2 mt-1">
            {event.courseTitle && <Badge variant="secondary">{event.courseTitle}</Badge>}
            {event.priority && <Flag className={cn("h-4 w-4", priorityColors[event.priority])}/>}
            {event.participantIds && event.participantIds.length > 0 && (
                <div className="flex items-center -space-x-2">
                    {event.participantIds.slice(0, 3).map(id => (
                        <Avatar key={id} className="w-6 h-6 border-2 border-background">
                            <AvatarImage src={`https://placehold.co/100x100.png`} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    ))}
                    {event.participantIds.length > 3 && <span className="text-xs text-muted-foreground pl-3">+{event.participantIds.length - 3}</span>}
                </div>
            )}
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
