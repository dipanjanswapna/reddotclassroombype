
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlannerTask } from '@/lib/types';
import { useAuth } from '@/context/auth-context';

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';
type Durations = { work: number; shortBreak: number; longBreak: number; };

interface PomodoroTimerProps {
  tasks: PlannerTask[];
  onSessionComplete: (taskId: string, durationSeconds: number) => void;
  durations: Durations;
  onDurationsChange: (durations: Durations) => void;
}

export function PomodoroTimer({ tasks, onSessionComplete, durations, onDurationsChange }: PomodoroTimerProps) {
  const { userInfo } = useAuth();
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
    <Card className="w-full">
        <CardHeader>
            <CardTitle>Pomodoro Timer</CardTitle>
            <CardDescription>Stay focused and manage your study sessions effectively.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
            <div className="flex gap-2">
                <Button size="sm" variant={mode === 'work' ? 'default' : 'outline'} onClick={() => switchMode('work')}>Work</Button>
                <Button size="sm" variant={mode === 'shortBreak' ? 'default' : 'outline'} onClick={() => switchMode('shortBreak')}>Short Break</Button>
                <Button size="sm" variant={mode === 'longBreak' ? 'default' : 'outline'} onClick={() => switchMode('longBreak')}>Long Break</Button>
            </div>
            <div className="text-7xl font-bold font-mono text-center bg-muted p-4 rounded-lg w-full">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="flex gap-4">
                <Button onClick={toggleTimer} size="lg" className="w-28 h-12 text-lg">
                    {isActive ? <Pause /> : <Play />}
                </Button>
                 <Button onClick={resetTimer} size="lg" variant="secondary" className="w-28 h-12">
                    <RotateCcw />
                </Button>
            </div>
             <div className="w-full space-y-4 pt-4 border-t">
                 <div className="space-y-2">
                    <Label>Associated Task</Label>
                    <Select value={selectedTask} onValueChange={setSelectedTask}>
                        <SelectTrigger><SelectValue placeholder="Select a task..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="general">General Study</SelectItem>
                            {tasksForToday.map(task => (
                                <SelectItem key={task.id} value={task.id!}>{task.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <Label htmlFor="work-duration" className="text-xs">Work</Label>
                        <Input id="work-duration" type="number" value={durations.work} onChange={e => handleDurationChange('work', e.target.value)} className="w-full h-9 text-center" />
                    </div>
                    <div>
                        <Label htmlFor="short-break-duration" className="text-xs">Short Break</Label>
                        <Input id="short-break-duration" type="number" value={durations.shortBreak} onChange={e => handleDurationChange('shortBreak', e.target.value)} className="w-full h-9 text-center" />
                    </div>
                    <div>
                        <Label htmlFor="long-break-duration" className="text-xs">Long Break</Label>
                        <Input id="long-break-duration" type="number" value={durations.longBreak} onChange={e => handleDurationChange('longBreak', e.target.value)} className="w-full h-9 text-center"/>
                    </div>
                </div>
             </div>
             <audio ref={audioRef} src="/notification.mp3" preload="auto" />
        </CardContent>
    </Card>
  );
}

