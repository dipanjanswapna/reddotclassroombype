
'use client';

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parse } from 'date-fns';
import { StudyPlanEvent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WeekViewProps {
  currentDate: Date;
  events: StudyPlanEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function WeekView({ currentDate, events, selectedDate, onSelectDate }: WeekViewProps) {
  const start = startOfWeek(currentDate);
  const end = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start, end });

  const getEventTime = (event: StudyPlanEvent) => {
    if (!event.time) return 'All-day';
    const startTime = format(parse(event.time, 'HH:mm', new Date()), 'h:mm a');
    if (!event.endTime) return startTime;
    const endTime = format(parse(event.endTime, 'HH:mm', new Date()), 'h:mm a');
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="grid grid-cols-7 border-t border-l">
      {weekDays.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const eventsOnDay = events.filter(e => e.date === dateStr);
        return (
          <div 
            key={day.toString()} 
            className={cn(
                "h-64 border-b border-r p-2 text-sm flex flex-col cursor-pointer overflow-hidden",
                isSameDay(day, new Date()) && 'bg-blue-100 dark:bg-blue-900/30',
                isSameDay(day, selectedDate) && 'border-2 border-primary'
            )}
            onClick={() => onSelectDate(day)}
          >
            <span className="font-semibold">{format(day, 'EEE d')}</span>
            <ScrollArea className="flex-grow mt-1 -mr-2">
                <div className="space-y-1 pr-2">
                    {eventsOnDay.map(e => (
                        <div key={e.id} className="p-1 text-xs bg-primary/10 text-primary rounded truncate">
                            {e.time && <span className="font-semibold mr-1">{format(parse(e.time, 'HH:mm', new Date()), 'h:mma')}</span>}
                            {e.title}
                        </div>
                    ))}
                </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
