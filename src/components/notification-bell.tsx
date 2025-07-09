
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Award, Video, Megaphone, FileCheck2, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Notification } from '@/lib/types';
import { markAllNotificationsAsRead } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from './ui/skeleton';

const iconMap = {
    Award,
    Video,
    Megaphone,
    FileCheck2,
    ThumbsUp
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


export function NotificationBell() {
  const { userInfo, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!userInfo) {
        setNotifications([]);
        return;
    };

    const q = query(
        collection(db, "notifications"), 
        where("userId", "==", userInfo.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedNotifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        fetchedNotifications.push({ id: doc.id, ...doc.data() } as Notification);
      });
      // Sort notifications on the client side to avoid needing a composite index
      fetchedNotifications.sort((a, b) => b.date.toMillis() - a.date.toMillis());
      setNotifications(fetchedNotifications);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });

    return () => unsubscribe();
  }, [userInfo]);

  const handleMarkAllAsRead = async () => {
    if (!userInfo) return;
    try {
      await markAllNotificationsAsRead(userInfo.uid);
      // The onSnapshot listener will automatically update the UI
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  if (authLoading) {
      return <Skeleton className="h-9 w-9 rounded-full" />
  }
  
  if (!userInfo) {
      return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-auto p-1" onClick={handleMarkAllAsRead}>
                   <CheckCheck className="mr-1 h-3 w-3"/> Mark all as read
                </Button>
            )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
            <DropdownMenuGroup>
                {notifications.length > 0 ? (
                    notifications.map(notification => {
                        const Icon = iconMap[notification.icon] || Megaphone;
                        const DropdownItemContent = (
                            <div className={`w-full flex items-start gap-3 p-2 h-auto ${!notification.read ? 'bg-accent/50' : ''}`}>
                                 {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>}
                                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mt-1 shrink-0">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium leading-tight whitespace-normal">{notification.title}</p>
                                    <p className="text-xs text-muted-foreground whitespace-normal">{notification.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(notification.date.toDate(), { addSuffix: true })}</p>
                                </div>
                            </div>
                        );

                        return (
                            <DropdownMenuItem key={notification.id} asChild className="p-0 cursor-pointer">
                                {notification.link ? (
                                    <Link href={notification.link} className="w-full">
                                        {DropdownItemContent}
                                    </Link>
                                ) : (
                                    DropdownItemContent
                                )}
                            </DropdownMenuItem>
                        )
                    })
                ) : (
                    <p className="text-sm text-center text-muted-foreground p-4">No recent notifications.</p>
                )}
            </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
         <DropdownMenuItem asChild>
            <Link href="/student/notifications" className="flex items-center justify-center font-semibold">
               View All Notifications
            </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
