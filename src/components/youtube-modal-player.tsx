'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlayCircle, Youtube, ChevronRight, X } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getYoutubeVideoId, cn } from '@/lib/utils';

type YoutubeClass = {
  id: string;
  title: string;
  youtubeUrl: string;
};

export function YoutubeModalPlayer({ videos }: { videos: YoutubeClass[] }) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('');

  const openVideo = (url: string, title: string) => {
    const id = getYoutubeVideoId(url);
    if (id) {
      setSelectedVideoId(id);
      setSelectedVideoTitle(title);
    }
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => {
          const videoId = getYoutubeVideoId(video.youtubeUrl);
          const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Video';

          return (
            <div 
              key={video.id || video.title} 
              onClick={() => openVideo(video.youtubeUrl, video.title)}
              className="group block cursor-pointer"
            >
              <Card className="overflow-hidden h-full flex flex-col rounded-2xl border-white/40 bg-card hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 shadow-md">
                <CardHeader className="p-0">
                  <div className="relative aspect-video">
                    <Image
                      src={thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      data-ai-hint="youtube video thumbnail"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]">
                      <div className="bg-primary p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                        <PlayCircle className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <Badge className="absolute top-4 left-4 bg-red-600 font-black text-[9px] uppercase tracking-widest border-none shadow-lg px-2">
                      <Youtube className="w-3.5 h-3.5 mr-1.5" /> LIVE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 flex-grow flex flex-col justify-center">
                  <h3 className="font-black text-sm md:text-base uppercase tracking-tight leading-tight line-clamp-2 group-hover:text-primary transition-colors text-left">
                    {video.title}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    Watch Now <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedVideoId} onOpenChange={(open) => !open && setSelectedVideoId(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-none rounded-2xl sm:rounded-3xl shadow-2xl">
          <div className="relative pt-[56.25%] w-full bg-black">
            {selectedVideoId && (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            )}
          </div>
          <div className="p-4 bg-card/95 backdrop-blur-md flex items-center justify-between gap-4">
             <DialogTitle className="text-sm md:text-lg font-black uppercase tracking-tight truncate flex-1">
                {selectedVideoTitle}
             </DialogTitle>
             <button 
                onClick={() => setSelectedVideoId(null)}
                className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
             >
                <X className="w-5 h-5" />
             </button>
          </div>
          <DialogDescription className="sr-only">
            Watching {selectedVideoTitle} on Red Dot Classroom.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
