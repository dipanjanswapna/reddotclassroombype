

'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

const noiseSources: { [key: string]: string } = {
  rain: '/sounds/rain.mp3',
  forest: '/sounds/forest.mp3',
  cafe: '/sounds/cafe.mp3',
};

interface WhiteNoisePlayerProps {
  noiseType: string;
}

export function WhiteNoisePlayer({ noiseType }: WhiteNoisePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
        if (noiseType !== 'none' && noiseSources[noiseType]) {
            audioRef.current.src = noiseSources[noiseType];
            if(isPlaying) {
                audioRef.current.play().catch(e => console.error("Audio play failed", e));
            }
        } else {
            audioRef.current.pause();
        }
    }
  }, [noiseType, isPlaying]);
  
  const togglePlay = () => {
      if (!audioRef.current || noiseType === 'none') return;

      if (isPlaying) {
          audioRef.current.pause();
      } else {
          audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
      setIsPlaying(!isPlaying);
  }

  if (noiseType === 'none') {
    return null;
  }

  return (
    <Card className="fixed bottom-24 right-6 z-50 w-64">
        <CardHeader className="p-4">
            <CardTitle className="text-base">Focus Sound</CardTitle>
            <CardDescription className="text-xs">Playing: {noiseType.charAt(0).toUpperCase() + noiseType.slice(1)}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex items-center gap-4">
           <Button onClick={togglePlay} size="icon" variant="outline">
                {isPlaying ? <Volume2/> : <VolumeX/>}
           </Button>
           <audio ref={audioRef} loop />
        </CardContent>
    </Card>
  );
}

