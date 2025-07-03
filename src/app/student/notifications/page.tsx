
'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Award, Video, Megaphone, FileCheck2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getNotificationsByUserId, markAllNotificationsAsRead } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import type { Notification } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const iconMap = {
    Award,
    Video,
    Megaphone,
    FileCheck2
};

// Function to group notifications by date
const groupNotifications = (notifications: Notification[]) => {
    return notifications.reduce((acc, notification) => {
        const date = notification.date.toDate();
        let groupTitle = format(date, 'PPP');
        if (isToday(date)) {
            groupTitle = 'Today';
        } else if (isYesterday(date)) {
            groupTitle = 'Yesterday';
        }
        
        if (!acc[groupTitle]) {
            acc[groupTitle] = [];
        }
        acc[groupTitle].push(notification);
        return acc;
    }, {} as Record<string, Notification[]>);
};


export default function NotificationsPage() {
    const { userInfo, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!userInfo) return;
        try {
            const fetched = await getNotificationsByUserId(userInfo.uid);
            // Sort by date descending
            fetched.sort((a, b) => b.date.toMillis() - a.date.toMillis());
            setNotifications(fetched);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!authLoading) {
            fetchNotifications();
        }
    }, [userInfo, authLoading]);

    const handleMarkAllAsRead = async () => {
        if (!userInfo) return;
        await markAllNotificationsAsRead(userInfo.uid);
        // Re-fetch to update the UI
        fetchNotifications();
    };

    const groupedNotifications = groupNotifications(notifications);
    const hasUnread = notifications.some(n => !n.read);

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
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="mt-1 text-lg text-muted-foreground">
                        All your recent updates and alerts in one place.
                    </p>
                </div>
                 {hasUnread && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                 )}
            </div>

            {Object.keys(groupedNotifications).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedNotifications).map(([groupTitle, groupNotifications]) => (
                        <div key={groupTitle}>
                            <h2 className="text-sm font-semibold text-muted-foreground mb-2">{groupTitle}</h2>
                            <Card>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {groupNotifications.map((notification) => {
                                            const Icon = iconMap[notification.icon] || Megaphone;
                                            const NotificationItem = (
                                                <div className={cn("flex items-start gap-4 p-4", !notification.read && "bg-accent/30")}>
                                                     {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>}
                                                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                                        <Icon className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{notification.title}</p>
                                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(notification.date.toDate(), { addSuffix: true })}</p>
                                                    </div>
                                                </div>
                                            );

                                            return notification.link ? (
                                                <Link key={notification.id} href={notification.link} className="block hover:bg-muted/50">
                                                    {NotificationItem}
                                                </Link>
                                            ) : (
                                                <div key={notification.id}>
                                                    {NotificationItem}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-muted rounded-lg">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">You have no notifications.</p>
                </div>
            )}
        </div>
    );
}
