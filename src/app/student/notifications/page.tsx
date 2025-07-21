
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Notification } from '@/lib/types';
import { getNotificationsByUserId, markAllNotificationsAsRead } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCheck, Bell } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Award,
    Video,
    Megaphone,
    FileCheck2,
    ThumbsUp,
    Users,
    HelpCircle,
    MessageSquare,
    Star,
} from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
    Award,
    Video,
    Megaphone,
    FileCheck2,
    ThumbsUp,
    Users,
    HelpCircle,
    MessageSquare,
    Star,
};

export default function StudentNotificationsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo) {
            if (!authLoading) setLoading(false);
            return;
        }

        async function fetchNotifications() {
            const data = await getNotificationsByUserId(userInfo.uid);
            setNotifications(data);
            setLoading(false);
        }
        fetchNotifications();
    }, [userInfo, authLoading]);

    const handleMarkAllAsRead = async () => {
        if (!userInfo) return;
        await markAllNotificationsAsRead(userInfo.uid);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">All Notifications</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Your recent updates and alerts in one place.</p>
                </div>
                <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                    <CheckCheck className="mr-2 h-4 w-4"/> Mark All as Read
                </Button>
            </div>
            
            <Card>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {notifications.length > 0 ? notifications.map(notification => {
                             const Icon = iconMap[notification.icon] || Megaphone;
                             const content = (
                                 <div className={cn("flex items-start gap-4 p-4", !notification.read && "bg-accent/30")}>
                                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-1">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                         <p className="text-xs text-muted-foreground mt-1">{format(safeToDate(notification.date), "PPP p")}</p>
                                    </div>
                                     {!notification.read && (
                                        <div className="h-2 w-2 rounded-full bg-primary mt-2" title="Unread"></div>
                                     )}
                                 </div>
                             );

                             return (
                                 <li key={notification.id}>
                                     {notification.link ? (
                                         <Link href={notification.link} className="block hover:bg-muted/50">
                                             {content}
                                         </Link>
                                     ) : (
                                         content
                                     )}
                                 </li>
                             );
                        }) : (
                             <div className="text-center py-16 bg-muted rounded-lg">
                                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">You have no notifications.</p>
                            </div>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
