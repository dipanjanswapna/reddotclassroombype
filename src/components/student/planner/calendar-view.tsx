
'use client';

import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { PlannerTask } from '@/lib/types';
import { useMemo } from 'react';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // Sunday
  getDay,
  locales,
});

interface CalendarViewProps {
    tasks: PlannerTask[];
    onEditEvent: (event: PlannerTask) => void;
}

export function CalendarView({ tasks, onEditEvent }: CalendarViewProps) {

  const calendarEvents = useMemo(() => tasks.map(task => {
    const startDateTime = new Date(`${task.date}T${task.time || '00:00:00'}`);
    const endDateTime = task.endTime
      ? new Date(`${task.date}T${task.endTime}`)
      : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default to 1 hour duration

    return {
      title: task.title,
      start: startDateTime,
      end: endDateTime,
      allDay: !task.time,
      resource: task, // Keep original event data
    };
  }), [tasks]);

  return (
    <div className="h-[70vh] bg-background p-4 rounded-lg">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={(event) => onEditEvent(event.resource as PlannerTask)}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
      />
    </div>
  );
}
