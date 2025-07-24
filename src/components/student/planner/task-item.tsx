
'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudyPlanEvent } from "@/lib/types";
import { BookOpen, FileText, HelpCircle, Edit, Trash2, Award, Repeat, Minus, Plus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { saveUserAction } from "@/app/actions/user.actions";
import { Progress } from "@/components/ui/progress";

type TaskItemProps = {
  event: StudyPlanEvent;
  onEdit: () => void;
  onDelete: () => void;
};

const eventIcons: { [key in StudyPlanEvent['type']]: React.ReactNode } = {
    'study-session': <BookOpen className="h-5 w-5" />,
    'assignment-deadline': <FileText className="h-5 w-5" />,
    'quiz-reminder': <HelpCircle className="h-5 w-5" />,
    'exam-prep': <Award className="h-5 w-5" />,
    'habit': <Repeat className="h-5 w-5" />,
};

export function TaskItem({ event, onEdit, onDelete }: TaskItemProps) {
  const { userInfo, refreshUserInfo } = useAuth();

  const handlePomoChange = async (change: number) => {
    if (!userInfo) return;

    const newPomoCount = (event.actualPomo || 0) + change;
    const updatedEvent = { ...event, actualPomo: Math.max(0, newPomoCount) };
    
    const newStudyPlan = userInfo.studyPlan?.map(e => e.id === event.id ? updatedEvent : e) || [];
    const newPoints = (userInfo.studyPoints || 0) + change;
    
    await saveUserAction({ id: userInfo.uid, studyPlan: newStudyPlan, studyPoints: newPoints });
    await refreshUserInfo();
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
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}
