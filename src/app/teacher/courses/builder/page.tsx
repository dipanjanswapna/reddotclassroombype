
'use client';

import { useState } from 'react';
import {
  Book,
  FileText,
  DollarSign,
  CloudUpload,
  Save,
  Send,
  PlusCircle,
  X,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { courses } from '@/lib/mock-data';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';


const allCategories = [...new Set(courses.map(course => course.category))];

type SyllabusItem = {
    id: string;
    type: 'module' | 'lesson';
    title: string;
    children?: SyllabusItem[];
};

function SortableSyllabusItem({ id, item }: { id: string, item: SyllabusItem }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-background rounded-md border">
            <div {...attributes} {...listeners} className="cursor-grab p-1">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input defaultValue={item.title} className="flex-grow" />
            <Button variant="ghost" size="icon" aria-label="Add Lesson">
                <PlusCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Remove Item">
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}


export default function CourseBuilderPage() {
  const [activeTab, setActiveTab] = useState('details');
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([
    { id: '1', type: 'module', title: 'Module 1: Introduction' },
    { id: '2', type: 'lesson', title: 'Lesson 1.1: What is this course about?' },
    { id: '3', type: 'lesson', title: 'Lesson 1.2: Core Concepts' },
    { id: '4', type: 'module', title: 'Module 2: Deep Dive' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      setSyllabus((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <CardContent className="grid md:grid-cols-3 gap-6 pt-6">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" placeholder="e.g., HSC 2025 Physics Crash Course" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea id="description" placeholder="A brief summary of what this course is about..." rows={5} />
              </div>
            </div>
            <div className="md:col-span-1 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Price (BDT)</Label>
                    <Input id="price" type="number" placeholder="e.g., 4500" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
                    <Input id="thumbnail" placeholder="https://placehold.co/600x400.png" />
                </div>
            </div>
          </CardContent>
        );
      case 'syllabus':
        return (
          <CardContent className="pt-6">
            <CardDescription className="mb-4">Drag and drop to reorder modules and lessons. Click the plus icon to add new content.</CardDescription>
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext 
                    items={syllabus}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {syllabus.map(item => <SortableSyllabusItem key={item.id} id={item.id} item={item} />)}
                    </div>
                </SortableContext>
            </DndContext>
            <Button variant="outline" className="mt-4 w-full">
                <PlusCircle className="mr-2" />
                Add Module or Lesson
            </Button>
          </CardContent>
        );
      default:
        return <CardContent className="pt-6"><p>This section is under construction.</p></CardContent>;
    }
  };
  
  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'syllabus', label: 'Syllabus', icon: Book },
    { id: 'media', label: 'Media', icon: CloudUpload },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Course Builder
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                   Create and manage your course content with ease.
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline"><Save className="mr-2"/> Save Draft</Button>
                <Button variant="accent"><Send className="mr-2"/> Submit for Approval</Button>
            </div>
        </div>
        
        <Card>
            <CardHeader className="p-0">
                <div className="border-b px-2">
                    <div className="flex items-center gap-1">
                        {tabs.map(tab => (
                            <Button 
                                key={tab.id}
                                variant="ghost"
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-none border-b-2 font-semibold px-4 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                            >
                                <tab.icon className="mr-2"/>
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            {renderContent()}
        </Card>

    </div>
  );
}
