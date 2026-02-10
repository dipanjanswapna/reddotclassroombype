'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlannerTask } from '@/lib/types';

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';
type Durations = { work: number; shortBreak: number; longBreak: number; };

interface PomodoroTimerProps {
  tasks: PlannerTask[];
  onSessionComplete: (taskId: string, durationSeconds: number) => void;
  durations: Durations;
  onDurationsChange: (durations: Durations) => void;
}

export function PomodoroTimer({ tasks, onSessionComplete, durations, onDurationsChange }: PomodoroTimerProps) {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [minutes, setMinutes] = useState(durations.work);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('general');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (!isActive) {
      setMinutes(durations[mode]);
      setSeconds(0);
    }
  }, [durations, mode, isActive]);


  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(s => s - 1);
        } else if (minutes > 0) {
          setMinutes(m => m - 1);
          setSeconds(59);
        } else {
          if (audioRef.current) {
            audioRef.current.play();
          }
          if (mode === 'work' && selectedTask !== 'general') {
            const sessionDurationSeconds = durations.work * 60;
            onSessionComplete(selectedTask, sessionDurationSeconds);
          }
          const nextMode = mode === 'work' ? 'shortBreak' : 'work';
          switchMode(nextMode);
        }
      }, 1000);
    } else {
      if(timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if(timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds, minutes, mode, selectedTask, onSessionComplete, durations.work]);
  
  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setIsActive(false);
    setMinutes(durations[newMode]);
    setSeconds(0);
  };
  
  const handleDurationChange = (mode: PomodoroMode, value: string) => {
    const newDuration = parseInt(value, 10);
    if (!isNaN(newDuration) && newDuration > 0) {
        onDurationsChange({ ...durations, [mode]: newDuration });
    }
  }

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(durations[mode]);
    setSeconds(0);
  };

  const tasksForToday = useMemo(() => {
      return (tasks || []).filter(t => t.status === 'todo' || t.status === 'in_progress');
  }, [tasks]);


  return (
    <Card className="rounded-[20px] border-primary/20 shadow-xl overflow-hidden bg-card">
        <CardHeader className="text-center p-4 bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xs font-black uppercase tracking-widest">Focus Timer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 p-5">
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-full">
                <Button size="sm" variant={mode === 'work' ? 'default' : 'ghost'} className="flex-1 rounded-lg h-8 text-[9px] font-black uppercase tracking-tighter" onClick={() => switchMode('work')}>Work</Button>
                <Button size="sm" variant={mode === 'shortBreak' ? 'default' : 'ghost'} className="flex-1 rounded-lg h-8 text-[9px] font-black uppercase tracking-tighter" onClick={() => switchMode('shortBreak')}>Short</Button>
                <Button size="sm" variant={mode === 'longBreak' ? 'default' : 'ghost'} className="flex-1 rounded-lg h-8 text-[9px] font-black uppercase tracking-tighter" onClick={() => switchMode('longBreak')}>Long</Button>
            </div>
            <div className="text-5xl font-black font-mono text-center bg-muted/30 py-6 rounded-[20px] w-full border border-primary/5 text-foreground">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="flex gap-2 w-full">
                <Button onClick={toggleTimer} size="lg" className="flex-grow h-12 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95">
                    {isActive ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5 ml-1"/>}
                </Button>
                 <Button onClick={resetTimer} size="lg" variant="secondary" className="h-12 w-12 rounded-xl">
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>
             <div className="w-full space-y-3 pt-4 border-t border-primary/10">
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Focus</Label>
                    <Select value={selectedTask} onValueChange={setSelectedTask}>
                        <SelectTrigger className="h-9 rounded-xl text-xs font-bold border-primary/5"><SelectValue placeholder="Select a task..." /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="general" className="text-xs">General Study</SelectItem>
                            {tasksForToday.map(task => (
                                <SelectItem key={task.id} value={task.id!} className="text-xs">{task.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="space-y-1">
                        <Label htmlFor="work-duration" className="text-[8px] font-black uppercase tracking-tighter opacity-60">Work</Label>
                        <Input id="work-duration" type="number" value={durations.work} onChange={e => handleDurationChange('work', e.target.value)} className="h-8 text-center text-xs font-black rounded-lg border-primary/5" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="short-break-duration" className="text-[8px] font-black uppercase tracking-tighter opacity-60">Short</Label>
                        <Input id="short-break-duration" type="number" value={durations.shortBreak} onChange={e => handleDurationChange('shortBreak', e.target.value)} className="h-8 text-center text-xs font-black rounded-lg border-primary/5" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="long-break-duration" className="text-[8px] font-black uppercase tracking-tighter opacity-60">Long</Label>
                        <Input id="long-break-duration" type="number" value={durations.longBreak} onChange={e => handleDurationChange('longBreak', e.target.value)} className="h-8 text-center text-xs font-black rounded-lg border-primary/5"/>
                    </div>
                </div>
             </div>
             <audio ref={audioRef} src="/notification.mp3" preload="auto" />
        </CardContent>
    </Card>
  );
}
