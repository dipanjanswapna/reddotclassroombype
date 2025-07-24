
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface ColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function Column({ id, title, children }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const items = React.useMemo(
    () => React.Children.toArray(children).map((child: any) => child?.props?.task?.id).filter(Boolean),
    [children]
  );

  return (
    <div ref={setNodeRef}>
        <Card className={cn("min-h-96", isOver ? 'bg-accent/20' : 'bg-muted/50')}>
            <CardHeader className="p-4">
                <CardTitle className="text-lg text-center">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                 <SortableContext
                    id={id}
                    items={items}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {children}
                    </div>
                </SortableContext>
            </CardContent>
        </Card>
    </div>
  );
}
