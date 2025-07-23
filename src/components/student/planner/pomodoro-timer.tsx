
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else {
          if (minutes === 0) {
            clearInterval(timerRef.current!);
            // Handle mode change or alert
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if(timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if(timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds, minutes]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    switch (mode) {
      case 'work': setMinutes(25); break;
      case 'shortBreak': setMinutes(5); break;
      case 'longBreak': setMinutes(15); break;
    }
    setSeconds(0);
  };

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsActive(false);
     switch (newMode) {
      case 'work': setMinutes(25); break;
      case 'shortBreak': setMinutes(5); break;
      case 'longBreak': setMinutes(15); break;
    }
    setSeconds(0);
  }

  return (
    <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle>Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
                <Button variant={mode === 'work' ? 'default' : 'outline'} onClick={() => switchMode('work')}>Work</Button>
                <Button variant={mode === 'shortBreak' ? 'default' : 'outline'} onClick={() => switchMode('shortBreak')}>Short Break</Button>
                <Button variant={mode === 'longBreak' ? 'default' : 'outline'} onClick={() => switchMode('longBreak')}>Long Break</Button>
            </div>
            <div className="text-6xl font-bold font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="flex gap-4">
                <Button onClick={toggleTimer} size="lg" className="w-24">
                    {isActive ? <Pause /> : <Play />}
                </Button>
                 <Button onClick={resetTimer} size="lg" variant="secondary" className="w-24">
                    <RotateCcw />
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
