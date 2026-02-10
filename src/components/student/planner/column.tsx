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
            "min-h-[30rem] lg:min-h-[40rem] flex-grow flex flex-col rounded-[20px] border-primary/20 shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm",
            isOver ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background scale-[1.01]' : ''
        )}>
            <CardHeader className="p-3 border-b border-primary/10 bg-primary/5 rounded-t-[20px]">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-primary">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex flex-col flex-grow overflow-hidden">
                 <ScrollArea className="flex-grow pr-1">
                     <div className="space-y-2 py-1">
                        {children}
                    </div>
                 </ScrollArea>
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2 rounded-xl font-black uppercase tracking-widest text-[8px] border border-dashed border-primary/20 hover:bg-primary/10 hover:text-primary transition-all h-8" 
                    onClick={() => onAddTask(id as PlannerTask['status'])}
                >
                    <PlusCircle className="mr-1.5 h-3 w-3" /> New Task
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
