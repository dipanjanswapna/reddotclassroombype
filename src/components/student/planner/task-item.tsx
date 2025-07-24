

'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlannerTask, CheckItem } from "@/lib/types";
import { BookOpen, FileText, HelpCircle, Edit, Trash2, Award, Repeat, Minus, Plus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { saveTask } from "@/app/actions/planner.actions";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";


type TaskItemProps = {
  event: PlannerTask;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (task: PlannerTask) => void;
};

const eventIcons: { [key in PlannerTask['type']]: React.ReactNode } = {
    'study-session': <BookOpen className="h-5 w-5" />,
    'assignment-deadline': <FileText className="h-5 w-5" />,
    'quiz-reminder': <HelpCircle className="h-5 w-5" />,
    'exam-prep': <Award className="h-5 w-5" />,
    'habit': <Repeat className="h-5 w-5" />,
};

const priorityColors = {
    low: 'border-blue-500 bg-blue-50 text-blue-800',
    medium: 'border-yellow-500 bg-yellow-50 text-yellow-800',
    high: 'border-orange-500 bg-orange-50 text-orange-800',
    urgent: 'border-red-500 bg-red-50 text-red-800',
}

export function TaskItem({ event, onEdit, onDelete, onUpdate }: TaskItemProps) {
  const { userInfo, refreshUserInfo } = useAuth();
  const { toast } = useToast();

  const handlePomoChange = async (change: number) => {
    if (!userInfo) return;

    const newPomoCount = (event.actualPomo || 0) + change;
    const updatedEvent = { ...event, actualPomo: Math.max(0, newPomoCount) };
    
    onUpdate(updatedEvent);
    await saveTask(updatedEvent);
    
    if (change > 0) {
      toast({ title: "Session Complete!", description: "You've earned 1 study point." });
      await refreshUserInfo();
    }
  };
  
  const handleToggleCheckItem = async (checkItemId: string, isCompleted: boolean) => {
    const updatedCheckItems = event.checkItems?.map(item =>
      item.id === checkItemId ? { ...item, isCompleted } : item
    ) || [];

    const updatedEvent = { ...event, checkItems: updatedCheckItems };
    onUpdate(updatedEvent);
    await saveTask(updatedEvent);
  };
  
  const progress = event.estimatedPomo && event.estimatedPomo > 0
    ? Math.round(((event.actualPomo || 0) / event.estimatedPomo) * 100)
    : 0;

  return (
    <Card className="p-4 flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
        {eventIcons[event.type]}
      </div>
      <div className="flex-grow">
        <p className="font-semibold">{event.title}</p>
        <p className="text-sm text-muted-foreground">{event.description}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
            {event.courseTitle && <Badge variant="secondary" className="mt-1">{event.courseTitle}</Badge>}
            {event.time && <Badge variant="outline">{event.time}</Badge>}
            {event.priority && <Badge className={priorityColors[event.priority]}>{event.priority}</Badge>}
        </div>
         {event.estimatedPomo && (
            <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center">
                     <p className="text-xs text-muted-foreground">Pomodoro Sessions</p>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handlePomoChange(-1)}><Minus className="h-4 w-4"/></Button>
                        <span className="text-sm font-medium">{event.actualPomo || 0} / {event.estimatedPomo}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handlePomoChange(1)}><Plus className="h-4 w-4"/></Button>
                    </div>
                </div>
                <Progress value={progress} className="h-1.5"/>
            </div>
         )}
         {event.checkItems && event.checkItems.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-2">
                {event.checkItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                        <Checkbox 
                            id={`check-${event.id}-${item.id}`} 
                            checked={item.isCompleted} 
                            onCheckedChange={(checked) => handleToggleCheckItem(item.id, !!checked)}
                        />
                        <Label htmlFor={`check-${event.id}-${item.id}`} className={cn("text-sm", item.isCompleted && "line-through text-muted-foreground")}>
                            {item.text}
                        </Label>
                    </div>
                ))}
            </div>
        )}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}
