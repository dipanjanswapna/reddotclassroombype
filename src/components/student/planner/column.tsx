

'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onAddTask: () => void;
}

export function Column({ id, title, children, onAddTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="flex flex-col">
        <Card className={cn("min-h-[40rem] flex-grow", isOver ? 'bg-accent/20' : 'bg-muted/50')}>
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-lg text-center">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                 <div className="space-y-4 min-h-[20rem]">
                    {children}
                </div>
                 <Button variant="outline" size="sm" className="w-full" onClick={onAddTask}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
