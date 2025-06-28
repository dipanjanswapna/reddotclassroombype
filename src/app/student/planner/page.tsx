
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookMarked, Video, FileText, BrainCircuit, CheckCircle } from 'lucide-react';
import { mockStudyPlan, StudyPlanEvent, courses } from '@/lib/mock-data';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const eventIcons: { [key in StudyPlanEvent['type']]: React.ReactNode } = {
  'live-class': <Video className="h-4 w-4 text-red-500" />,
  'assignment': <FileText className="h-4 w-4 text-blue-500" />,
  'exam': <BookMarked className="h-4 w-4 text-yellow-500" />,
  'study-session': <BrainCircuit className="h-4 w-4 text-green-500" />,
};

const enrolledCourses = courses.slice(0, 3); // Mock enrolled courses

export default function PlannerPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<StudyPlanEvent[]>(mockStudyPlan);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state for new event
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCourseId, setNewEventCourseId] = useState<string | undefined>();

  const selectedDayEvents = events
    .filter((event) => date && format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const handleAddEvent = () => {
    if (!newEventTitle || !date) {
        toast({ title: 'Error', description: 'Please enter a title for your study session.', variant: 'destructive'});
        return;
    }

    const newEvent: StudyPlanEvent = {
        id: `evt-${Date.now()}`,
        date: date,
        title: newEventTitle,
        type: 'study-session',
        courseId: newEventCourseId,
        courseTitle: courses.find(c => c.id === newEventCourseId)?.title,
    };

    setEvents(prev => [...prev, newEvent]);
    toast({ title: 'Success!', description: 'Your study session has been added to the planner.'});

    // Reset form and close dialog
    setNewEventTitle('');
    setNewEventCourseId(undefined);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Study Planner</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Organize your study schedule, track deadlines, and plan your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-0"
                    modifiers={{
                        hasEvent: events.map(e => e.date)
                    }}
                    modifiersClassNames={{
                        hasEvent: 'has-event'
                    }}
                    styles={{
                        day: { position: 'relative' },
                        '.has-event:not([aria-selected="true"])::after': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            bottom: '2px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: 'hsl(var(--primary))',
                        },
                    }}
                />
            </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Schedule for {date ? format(date, 'PPP') : 'Today'}</CardTitle>
                    <CardDescription>All tasks and events for the selected day.</CardDescription>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><PlusCircle className="mr-2"/> Add Study Session</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a New Study Session</DialogTitle>
                            <DialogDescription>Plan your personal study time. This will only be visible to you.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="event-title">Title</Label>
                                <Input id="event-title" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="e.g., Review Physics Chapter 3"/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="event-course">Related Course (Optional)</Label>
                                 <Select value={newEventCourseId} onValueChange={(value) => setNewEventCourseId(value === 'none' ? undefined : value)}>
                                    <SelectTrigger id="event-course">
                                        <SelectValue placeholder="Select a course"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No specific course</SelectItem>
                                        {enrolledCourses.map(course => (
                                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Date</Label>
                                <Input value={date ? format(date, 'PPP') : ''} readOnly disabled/>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleAddEvent}>Add to Planner</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <ul className="space-y-3">
                {selectedDayEvents.map(event => (
                  <li key={event.id} className="flex items-center gap-4 p-3 rounded-md bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                      {eventIcons[event.type]}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{event.title}</p>
                      {event.courseTitle && <p className="text-xs text-muted-foreground">{event.courseTitle}</p>}
                    </div>
                    <Badge variant="outline" className="capitalize">{event.type.replace('-', ' ')}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
                <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
                    <CheckCircle className="w-12 h-12 mb-4 text-green-500" />
                    <p className="font-semibold">Nothing scheduled for today!</p>
                    <p className="text-sm">Enjoy your day or plan a new study session.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
