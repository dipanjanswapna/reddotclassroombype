
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
import { cn } from '@/lib/utils';

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
  
  const formatDateSafe = (date: any, formatString: string) => {
      const d = safeToDate(date);
      return !isNaN(d.getTime()) ? format(d, formatString) : '';
  }

  return (
    <div className="my-8 px-1">
        <Dialog open={!!selectedNotice} onOpenChange={(isOpen) => !isOpen && setSelectedNotice(null)}>
            <Card className="bg-card dark:bg-card/10 border border-primary/20 rounded-[20px] shadow-lg transition-all duration-300">
                <CardHeader>
                    <div className="flex items-center gap-3 text-primary">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Megaphone className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-black font-headline uppercase tracking-tight text-foreground">Notice Board</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                       <NoticeBoardSkeleton />
                    ) : notices.length > 0 ? (
                         <div className="space-y-1">
                            {notices.map((notice) => (
                                <button 
                                    key={notice.id}
                                    onClick={() => setSelectedNotice(notice)}
                                    className="w-full text-left p-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3 text-sm font-semibold">
                                        <Pin className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                        <span className="truncate flex-grow text-foreground">{notice.title}</span>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground shrink-0">{formatDateSafe(notice.publishedAt, 'dd MMM')}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                       <p className="text-sm text-center text-muted-foreground py-4 font-medium">No recent notices.</p>
                    )}
                </CardContent>
            </Card>

            <DialogContent className="rounded-[20px] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{selectedNotice?.title}</DialogTitle>
                    {selectedNotice?.publishedAt && (
                      <DialogDescription className="flex items-center gap-2 pt-2 font-medium">
                          <Calendar className="w-4 h-4 text-primary"/>
                          Published on {formatDateSafe(selectedNotice.publishedAt, 'PPP')}
                      </DialogDescription>
                    )}
                </DialogHeader>
                <div className="py-4 whitespace-pre-wrap text-muted-foreground max-h-[60vh] overflow-y-auto font-medium leading-relaxed">
                    {selectedNotice?.content}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
