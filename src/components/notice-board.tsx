
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
import { Skeleton } from './ui/skeleton';

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

  const NoticeBoardSkeleton = () => (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-1/5 ml-auto" />
        </div>
      ))}
    </div>
  )

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
                       <NoticeBoardSkeleton />
                    ) : notices.length > 0 ? (
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
                    ) : (
                       <p className="text-sm text-center text-muted-foreground">No recent notices.</p>
                    )}
                </CardContent>
            </Card>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{selectedNotice?.title}</DialogTitle>
                    {selectedNotice?.publishedAt && (
                      <DialogDescription className="flex items-center gap-2 pt-2">
                          <Calendar className="w-4 h-4"/>
                          Published on {format(safeToDate(selectedNotice.publishedAt), 'PPP')}
                      </DialogDescription>
                    )}
                </DialogHeader>
                <div className="py-4 whitespace-pre-wrap text-muted-foreground max-h-[60vh] overflow-y-auto">
                    {selectedNotice?.content}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
