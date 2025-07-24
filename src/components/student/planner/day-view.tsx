'use client';

import { PlannerTask } from '@/lib/types';
import { TaskItem } from './task-item';
import { format } from 'date-fns';

interface DayViewProps {
  selectedDate: Date;
  events: PlannerTask[];
  onEdit: (event: PlannerTask) => void;
  onDelete: (id: string) => void;
  onTaskUpdate: (task: PlannerTask) => void;
}

export function DayView({ selectedDate, events, onEdit, onDelete, onTaskUpdate }: DayViewProps) {
  return (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{format(selectedDate, 'PPP')}</h3>
        <div className="space-y-4">
            {events.length > 0 ? (
                 events.map(event => (
                    <TaskItem 
                        key={event.id} 
                        event={event} 
                        onEdit={() => onEdit(event)} 
                        onDelete={() => onDelete(event.id!)}
                        onUpdate={onTaskUpdate} 
                    />
                ))
            ) : (
                <p className="text-muted-foreground text-center py-8">No tasks scheduled for this day.</p>
            )}
        </div>
    </div>
  );
}
