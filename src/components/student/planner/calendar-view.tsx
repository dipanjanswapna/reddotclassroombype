
'use client';

import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { PlannerTask } from '@/lib/types';

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
    events: PlannerTask[];
    onEditEvent: (event: PlannerTask) => void;
}

export function CalendarView({ events, onEditEvent }: CalendarViewProps) {

  const calendarEvents = events.map(event => {
    const startDateTime = new Date(`${event.date}T${event.time || '00:00:00'}`);
    const endDateTime = event.endTime
      ? new Date(`${event.date}T${event.endTime}`)
      : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default to 1 hour duration

    return {
      title: event.title,
      start: startDateTime,
      end: endDateTime,
      allDay: !event.time,
      resource: event, // Keep original event data
    };
  });

  return (
    <div className="h-[70vh]">
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
