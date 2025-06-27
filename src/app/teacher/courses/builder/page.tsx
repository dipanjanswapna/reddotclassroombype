
'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';


const allCategories = [...new Set(courses.map(course => course.category))];

type SyllabusItem = {
    id: string;
    type: 'module' | 'lesson';
    title: string;
};

function SortableSyllabusItem({ 
    id, 
    item,
    updateItem,
    removeItem 
}: { 
    id: string, 
    item: SyllabusItem,
    updateItem: (id: string, title: string) => void,
    removeItem: (id: string) => void,
}) {
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
            <Badge variant={item.type === 'module' ? 'default' : 'secondary'} className="capitalize select-none">{item.type}</Badge>
            <Input 
              value={item.title} 
              onChange={(e) => updateItem(id, e.target.value)}
              className="flex-grow" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:text-destructive" 
              aria-label="Remove Item"
              onClick={() => removeItem(id)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}

export default function CourseBuilderPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');

  // State for all course fields
  const [title, setTitle] = useState('HSC 2025 Physics Crash Course');
  const [description, setDescription] = useState('A complete online batch for HSC 2025 science candidates. Get the best preparation with live classes, lecture sheets, and regular exams from experienced teachers.');
  const [category, setCategory] = useState('HSC');
  const [price, setPrice] = useState('4500');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://placehold.co/600x400.png');
  const [introVideoUrl, setIntroVideoUrl] = useState('');

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

  const addSyllabusItem = (type: 'module' | 'lesson') => {
    const newItem: SyllabusItem = {
      id: Date.now().toString(),
      type,
      title: `New ${type}`,
    };
    setSyllabus(prev => [...prev, newItem]);
  };

  const updateSyllabusItem = (id: string, newTitle: string) => {
    setSyllabus(prev => prev.map(item => item.id === id ? { ...item, title: newTitle } : item));
  };

  const removeSyllabusItem = (id: string) => {
    setSyllabus(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveDraft = () => {
    const courseData = { title, description, category, price, thumbnailUrl, introVideoUrl, syllabus };
    console.log("Saving Draft:", courseData);
    toast({
      title: "Draft Saved!",
      description: "Your course has been saved as a draft.",
    });
  };

  const handleSubmitForApproval = () => {
    const courseData = { title, description, category, price, thumbnailUrl, introVideoUrl, syllabus };
    console.log("Submitting for Approval:", courseData);
    toast({
      title: "Submitted for Approval",
      description: "Your course has been submitted and is pending review.",
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" placeholder="e.g., HSC 2025 Physics Crash Course" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea id="description" placeholder="A brief summary of what this course is about..." rows={5} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={setCategory} value={category}>
                      <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                          {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
            </div>
          </CardContent>
        );
      case 'syllabus':
        return (
          <CardContent className="pt-6">
            <CardDescription className="mb-4">Drag and drop to reorder modules and lessons. Use the buttons below to add new content.</CardDescription>
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext 
                    items={syllabus.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {syllabus.map(item => (
                            <SortableSyllabusItem 
                                key={item.id} 
                                id={item.id} 
                                item={item}
                                updateItem={updateSyllabusItem}
                                removeItem={removeSyllabusItem}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <div className="mt-4 flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => addSyllabusItem('module')}>
                    <PlusCircle className="mr-2" />
                    Add Module
                </Button>
                <Button variant="outline" className="w-full" onClick={() => addSyllabusItem('lesson')}>
                    <PlusCircle className="mr-2" />
                    Add Lesson
                </Button>
            </div>
          </CardContent>
        );
      case 'media':
        return (
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
                    <Input id="thumbnail" placeholder="https://placehold.co/600x400.png" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
                </div>
                {thumbnailUrl && (
                    <div>
                        <Label>Thumbnail Preview</Label>
                        <div className="mt-2 rounded-lg border overflow-hidden aspect-video relative bg-muted">
                             <Image 
                                src={thumbnailUrl} 
                                alt="Thumbnail Preview"
                                fill
                                className="object-cover"
                                onError={() => setThumbnailUrl(`https://placehold.co/600x400.png?text=Invalid+Image`)}
                              />
                        </div>
                    </div>
                )}
                 <div className="space-y-2">
                    <Label htmlFor="introVideo">Introductory Video URL (e.g., YouTube)</Label>
                    <Input id="introVideo" placeholder="https://www.youtube.com/watch?v=..." value={introVideoUrl} onChange={e => setIntroVideoUrl(e.target.value)} />
                </div>
            </CardContent>
        );
      case 'pricing':
        return (
            <CardContent className="pt-6">
                 <div className="space-y-2 max-w-sm">
                    <Label htmlFor="price">Price (BDT)</Label>
                    <Input id="price" type="number" placeholder="e.g., 4500" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Course Builder
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                   Create and manage your course content with ease.
                </p>
            </div>
            <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={handleSaveDraft}><Save className="mr-2"/> Save Draft</Button>
                <Button variant="accent" onClick={handleSubmitForApproval}><Send className="mr-2"/> Submit for Approval</Button>
            </div>
        </div>
        
        <Card>
            <CardHeader className="p-0">
                <div className="border-b">
                    <div className="flex items-center gap-1 overflow-x-auto p-1">
                        {tabs.map(tab => (
                            <Button 
                                key={tab.id}
                                variant="ghost"
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-md shrink-0 border-b-2 font-semibold px-4 ${activeTab === tab.id ? 'border-primary text-primary bg-accent/50' : 'border-transparent text-muted-foreground'}`}
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
