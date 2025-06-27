
import { Bell, FileText, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View all your notifications from Red Dot Classroom.',
};

const notifications = [
  {
    id: 1,
    icon: FileText,
    title: "New Lecture Sheet Added",
    description: "A new lecture sheet for 'Chapter 5: Programming' has been added to the HSC ICT Masterclass.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    icon: Video,
    title: "Live Class Starting Soon",
    description: "Your 'Problem Solving' live class for HSC 2025 Crash Course is starting in 15 minutes.",
    time: "1 day ago",
    read: false,
  },
  {
    id: 3,
    icon: Bell,
    title: "Grade Published",
    description: "Your grade for 'Physics Model Test 1' has been published. You got an A+.",
    time: "3 days ago",
    read: true,
  },
];

export default function NotificationsPage() {
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
            <Button variant="outline" size="sm">Mark all as read</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {notifications.map((notification) => (
              <li key={notification.id} className={`flex items-start gap-4 p-4 ${!notification.read ? 'bg-muted/50' : ''}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <notification.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{notification.time}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
