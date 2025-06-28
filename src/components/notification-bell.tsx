'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
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
import { generateNotifications } from '@/lib/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';

export function NotificationBell() {
  const [notifications, setNotifications] = useState(generateNotifications());
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
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
                    notifications.map(notification => (
                        <DropdownMenuItem key={notification.id} className={`flex items-start gap-3 p-2 h-auto ${!notification.read ? 'bg-accent/50' : ''}`}>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mt-1 shrink-0">
                                <notification.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium leading-tight whitespace-normal">{notification.title}</p>
                                <p className="text-xs text-muted-foreground whitespace-normal">{notification.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(notification.date, { addSuffix: true })}</p>
                            </div>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <p className="text-sm text-center text-muted-foreground p-4">No notifications yet.</p>
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
