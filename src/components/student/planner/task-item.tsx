
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudyPlanEvent } from "@/lib/types";
import { BookOpen, FileText, HelpCircle, Edit, Trash2 } from "lucide-react";

type TaskItemProps = {
  event: StudyPlanEvent;
  onEdit: () => void;
  onDelete: () => void;
};

const eventIcons: { [key in StudyPlanEvent['type']]: React.ReactNode } = {
    'study-session': <BookOpen className="h-5 w-5" />,
    'assignment-deadline': <FileText className="h-5 w-5" />,
    'quiz-reminder': <HelpCircle className="h-5 w-5" />,
};

export function TaskItem({ event, onEdit, onDelete }: TaskItemProps) {
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
        {eventIcons[event.type]}
      </div>
      <div className="flex-grow">
        <p className="font-semibold">{event.title}</p>
        <p className="text-sm text-muted-foreground">{event.description}</p>
        {event.courseTitle && <Badge variant="secondary" className="mt-1">{event.courseTitle}</Badge>}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}
