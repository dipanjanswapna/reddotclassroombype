
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Megaphone, Pin, Calendar, Loader2 } from 'lucide-react';
import { getNotices } from '@/lib/firebase/firestore';
import type { Notice } from '@/lib/types';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

function NoticeScroller({ notices }: { notices: Notice[] }) {
    if (notices.length === 0) {
        return <p className="text-sm text-center text-muted-foreground">No recent notices.</p>
    }
    return (
        <div className="relative flex overflow-hidden h-10">
            <div className="flex flex-col animate-marquee-y whitespace-nowrap h-fit">
                {notices.map((notice) => (
                    <div key={notice.id} className="flex items-center gap-2 text-sm h-10">
                        <Badge variant="destructive" className="shrink-0">New</Badge>
                        <span className="font-medium truncate">{notice.title}</span>
                    </div>
                ))}
            </div>
             <div className="absolute inset-0 flex flex-col animate-marquee-y2 whitespace-nowrap h-fit" aria-hidden="true">
                {notices.map((notice) => (
                    <div key={`${notice.id}-clone`} className="flex items-center gap-2 text-sm h-10">
                        <Badge variant="destructive" className="shrink-0">New</Badge>
                        <span className="font-medium truncate">{notice.title}</span>
                    </div>
                ))}
            </div>
             <style jsx>{`
                @keyframes marquee-y {
                    from { transform: translateY(0%); }
                    to { transform: translateY(-100%); }
                }
                .animate-marquee-y {
                    animation: marquee-y 15s linear infinite;
                }
                .animate-marquee-y2 {
                    animation: marquee-y 15s linear infinite;
                    animation-delay: 7.5s;
                }
             `}</style>
        </div>
    );
}

export function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const fetchedNotices = await getNotices({ limit: 5 });
        setNotices(fetchedNotices);
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotices();
  }, []);

  return (
    <div className="my-8">
        <Dialog open={!!selectedNotice} onOpenChange={(isOpen) => !isOpen && setSelectedNotice(null)}>
            <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
                <CardHeader>
                    <div className="flex items-center gap-3 text-primary">
                        <Megaphone className="w-6 h-6" />
                        <CardTitle className="text-xl font-bold">নোটিশ বোর্ড</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-10">
                            <Loader2 className="w-5 h-5 animate-spin"/>
                        </div>
                    ) : (
                         <div className="space-y-2">
                            {notices.map((notice) => (
                                <button 
                                    key={notice.id}
                                    onClick={() => setSelectedNotice(notice)}
                                    className="w-full text-left p-2 rounded-md hover:bg-primary/10"
                                >
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Pin className="h-4 w-4 text-primary" />
                                        <span className="truncate">{notice.title}</span>
                                        <span className="ml-auto text-xs text-muted-foreground shrink-0">{format(safeToDate(notice.publishedAt), 'dd MMM')}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{selectedNotice?.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 pt-2">
                        <Calendar className="w-4 h-4"/>
                        Published on {selectedNotice && format(safeToDate(selectedNotice.publishedAt), 'PPP')}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 whitespace-pre-wrap text-muted-foreground">
                    {selectedNotice?.content}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
