
'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PlannerTask } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onAddTask: (status: PlannerTask['status']) => void;
}

export function Column({ id, title, children, onAddTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="flex flex-col h-full">
        <Card className={cn(
            "min-h-[40rem] flex-grow flex flex-col rounded-2xl border-white/20 shadow-xl transition-all duration-300 bg-card",
            isOver ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''
        )}>
            <CardHeader className="p-4 border-b border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-t-2xl">
                <CardTitle className="text-sm font-black uppercase tracking-[0.1em] text-center text-foreground/80">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col flex-grow overflow-hidden">
                 <ScrollArea className="flex-grow pr-2">
                     <div className="space-y-3 py-2">
                        {children}
                    </div>
                 </ScrollArea>
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3 rounded-xl font-bold uppercase tracking-tighter text-[10px] border border-dashed border-primary/20 hover:bg-primary/5 hover:text-primary transition-all h-9" 
                    onClick={() => onAddTask(id as PlannerTask['status'])}
                >
                    <PlusCircle className="mr-2 h-3 w-3" /> Add Task
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
