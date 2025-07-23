
'use client';

import { StudyPlanEvent } from '@/ai/schemas/study-plan-schemas';
import { TaskItem } from './task-item';
import { format } from 'date-fns';

interface DayViewProps {
  selectedDate: Date;
  events: StudyPlanEvent[];
  onEdit: (event: StudyPlanEvent) => void;
  onDelete: (id: string) => void;
  onTaskUpdate: (event: StudyPlanEvent) => void;
}

export function DayView({ selectedDate, events, onEdit, onDelete, onTaskUpdate }: DayViewProps) {
    const allDayEvents = events.filter(e => !e.time);
    const timedEvents = events
        .filter(e => !!e.time)
        .sort((a,b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">{format(selectedDate, 'PPP')}</h3>
        <div className="space-y-4">
            {allDayEvents.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">All-day</h4>
                    <div className="space-y-2">
                         {allDayEvents.map(event => (
                            <TaskItem key={event.id} event={event} onEdit={() => onEdit(event)} onDelete={() => onDelete(event.id!)} onTaskUpdate={onTaskUpdate}/>
                        ))}
                    </div>
                </div>
            )}
             {timedEvents.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Scheduled</h4>
                    <div className="space-y-2">
                        {timedEvents.map(event => (
                            <TaskItem key={event.id} event={event} onEdit={() => onEdit(event)} onDelete={() => onDelete(event.id!)} onTaskUpdate={onTaskUpdate} />
                        ))}
                    </div>
                </div>
            )}
            {events.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No tasks scheduled for this day.</p>
            )}
        </div>
    </div>
  );
}
