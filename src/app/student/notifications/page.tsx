
'use client';

import { useState } from 'react';
import { Bell, Award, Video, Megaphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { courses } from '@/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';

// Helper to generate notifications from mock data
const generateNotifications = () => {
    const allNotifications: any[] = [];
    const studentId = 's1'; // Mock current student

    // Course Announcements
    courses.forEach(course => {
        course.announcements?.forEach(ann => {
            allNotifications.push({
                id: `ann-${course.id}-${ann.id}`,
                icon: Megaphone,
                title: `New Announcement in ${course.title}`,
                description: ann.title,
                date: new Date(ann.date),
                read: false,
            });
        });
    });

    // Graded Assignments
    courses.forEach(course => {
        course.assignments?.forEach(ass => {
            if (ass.status === 'Graded' && ass.studentId === studentId && ass.submissionDate) {
                allNotifications.push({
                    id: `grade-${course.id}-${ass.id}`,
                    icon: Award,
                    title: `Grade Published: ${ass.title}`,
                    description: `Your assignment has been graded. You received: ${ass.grade}`,
                    date: new Date(ass.submissionDate),
                    read: true,
                });
            }
        });
    });

    // Upcoming Live Classes
    courses.forEach(course => {
        course.liveClasses?.forEach(lc => {
            const classDate = new Date(`${lc.date} ${lc.time}`);
            if (classDate > new Date()) {
                allNotifications.push({
                    id: `live-${course.id}-${lc.id}`,
                    icon: Video,
                    title: `Live Class Reminder: ${lc.topic}`,
                    description: `For course "${course.title}". Don't miss it!`,
                    date: classDate,
                    read: false,
                });
            }
        });
    });

    // Sort notifications by date (most recent first)
    return allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(generateNotifications());

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleMarkOneAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Stay updated with everything happening on your learning journey.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Notifications</CardTitle>
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={notifications.every(n => n.read)}>Mark all as read</Button>
          </div>
        </CardHeader>
        <CardContent>
            {notifications.length > 0 ? (
                <ul className="divide-y">
                    {notifications.map((notification) => (
                    <li key={notification.id} className={`flex items-start gap-4 p-4 ${!notification.read ? 'bg-muted/50' : ''}`}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <notification.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => handleMarkOneAsRead(notification.id)}>
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(notification.date, { addSuffix: true })}</div>
                    </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-16">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">You have no new notifications.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
