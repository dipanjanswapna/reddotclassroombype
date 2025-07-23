
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudyPlanEvent } from "@/ai/schemas/study-plan-schemas";
import { BookOpen, Calendar, Edit, FileText, HelpCircle, Trash2, Clock, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type TaskItemProps = {
  event: StudyPlanEvent & { completedPomos?: number, estimatedPomos?: number };
  onEdit: () => void;
  onDelete: () => void;
};

const eventIcons: { [key in StudyPlanEvent['type']]: React.ReactNode } = {
    'study-session': <BookOpen className="h-5 w-5" />,
    'assignment-deadline': <FileText className="h-5 w-5" />,
    'quiz-reminder': <HelpCircle className="h-5 w-5" />,
    'exam-prep': <Calendar className="h-5 w-5" />,
};

export function TaskItem({ event, onEdit, onDelete }: TaskItemProps) {
  const { completedPomos = 0, estimatedPomos = 0 } = event as any;
  const progress = estimatedPomos > 0 ? (completedPomos / estimatedPomos) * 100 : 0;
  const isCompleted = progress >= 100;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            {isCompleted ? <CheckCircle className="h-5 w-5" /> : eventIcons[event.type]}
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
      </div>
      {(event.type === 'study-session' || event.type === 'exam-prep') && estimatedPomos > 0 && (
        <div className="mt-3 pl-14">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <div className="flex items-center gap-1"><Clock className="h-3 w-3"/> Pomodoro Sessions</div>
                <span>{completedPomos} / {estimatedPomos}</span>
            </div>
            <Progress value={progress} className="h-1.5"/>
        </div>
      )}
    </Card>
  );
}
