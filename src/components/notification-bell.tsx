
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Award, Video, Megaphone, FileCheck2 } from 'lucide-react';
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
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { Notification } from '@/lib/types';
import { markAllNotificationsAsRead } from '@/lib/firebase/firestore';

const iconMap = {
    Award,
    Video,
    Megaphone,
    FileCheck2
};

// Mock user ID. In a real app, this would come from an auth context.
const currentUserId = 'usr_stud_001';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!currentUserId) return;

    // Query only by userId to avoid needing a composite index
    const q = query(
        collection(db, "notifications"), 
        where("userId", "==", currentUserId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const fetchedNotifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        const notification = { id: doc.id, ...doc.data() } as Notification;
        
        // Filter by date on the client side
        if (notification.date.toMillis() >= twentyFourHoursAgo) {
            fetchedNotifications.push(notification);
        }
      });
      
      // Sort client-side
      fetchedNotifications.sort((a, b) => b.date.toMillis() - a.date.toMillis());
      setNotifications(fetchedNotifications);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(currentUserId);
      // The onSnapshot listener will automatically update the UI
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

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
