
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
  ChevronDown,
  BookCopy,
  HelpCircle,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const allCategories = [...new Set(courses.map(course => course.category))];

type LessonData = {
    id: string;
    type: 'lesson';
    title: string;
    duration: string;
    videoId: string;
    lectureSheetUrl: string;
};

type ModuleData = {
    id: string;
    type: 'module';
    title: string;
};

type SyllabusItem = LessonData | ModuleData;

type FaqItem = {
  id: string;
  question: string;
  answer: string;
}

function SortableSyllabusItem({ 
    item,
    updateItem,
    removeItem 
}: { 
    item: SyllabusItem,
    updateItem: (id: string, field: string, value: string) => void,
    removeItem: (id: string) => void,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: item.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (item.type === 'module') {
        return (
             <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-muted rounded-md border">
                <div {...attributes} {...listeners} className="cursor-grab p-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <Badge variant='default' className="capitalize select-none">{item.type}</Badge>
                <Input 
                  value={item.title} 
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                  className="flex-grow bg-muted" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive" 
                  aria-label="Remove Item"
                  onClick={() => removeItem(item.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <Collapsible ref={setNodeRef} style={style} className="bg-background rounded-md border">
            <div className="flex items-center gap-2 p-2">
                <div {...attributes} {...listeners} className="cursor-grab p-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <Badge variant='secondary' className="capitalize select-none">{item.type}</Badge>
                <Input 
                  value={item.title} 
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                  className="flex-grow" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive" 
                  aria-label="Remove Item"
                  onClick={() => removeItem(item.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
                 <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
                <div className="p-4 border-t space-y-4 bg-muted/50 rounded-b-md">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`videoId-${item.id}`}>YouTube Video ID</Label>
                            <Input id={`videoId-${item.id}`} placeholder="e.g., dQw4w9WgXcQ" value={item.videoId} onChange={(e) => updateItem(item.id, 'videoId', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`duration-${item.id}`}>Lesson Duration</Label>
                            <Input id={`duration-${item.id}`} placeholder="e.g., 45 min" value={item.duration} onChange={(e) => updateItem(item.id, 'duration', e.target.value)} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor={`sheetUrl-${item.id}`}>Lecture Sheet URL</Label>
                        <Input id={`sheetUrl-${item.id}`} placeholder="https://docs.google.com/..." value={item.lectureSheetUrl} onChange={(e) => updateItem(item.id, 'lectureSheetUrl', e.target.value)} />
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
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
  
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([
    'Build enterprise-level React applications',
    'Master server-side rendering with Next.js',
  ]);

  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([
    { id: '1', type: 'module', title: 'Module 1: Introduction' },
    { id: '2', type: 'lesson', title: 'Lesson 1.1: What is this course about?', duration: '10 min', videoId: 'intro-vid', lectureSheetUrl: '' },
    { id: '3', type: 'lesson', title: 'Lesson 1.2: Core Concepts', duration: '45 min', videoId: 'core-concepts', lectureSheetUrl: 'https://example.com/sheet1' },
    { id: '4', type: 'module', title: 'Module 2: Deep Dive' },
  ]);

  const [faqs, setFaqs] = useState<FaqItem[]>([
      { id: 'faq1', question: 'Is this course for beginners?', answer: 'Yes, it is designed for all levels.' }
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
    const newItem: SyllabusItem = type === 'module' 
      ? { id: Date.now().toString(), type, title: 'New Module' }
      : { id: Date.now().toString(), type, title: 'New Lesson', duration: '', videoId: '', lectureSheetUrl: '' };
    setSyllabus(prev => [...prev, newItem]);
  };
  
  const updateSyllabusItem = (id: string, field: string, value: string) => {
    setSyllabus(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };


  const removeSyllabusItem = (id: string) => {
    setSyllabus(prev => prev.filter(item => item.id !== id));
  };
  
  // Handlers for What You Will Learn
  const addOutcome = () => setWhatYouWillLearn(prev => [...prev, '']);
  const updateOutcome = (index: number, value: string) => {
      const newOutcomes = [...whatYouWillLearn];
      newOutcomes[index] = value;
      setWhatYouWillLearn(newOutcomes);
  };
  const removeOutcome = (index: number) => setWhatYouWillLearn(prev => prev.filter((_, i) => i !== index));

  // Handlers for FAQs
  const addFaq = () => setFaqs(prev => [...prev, { id: Date.now().toString(), question: '', answer: '' }]);
  const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
      setFaqs(prev => prev.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
  };
  const removeFaq = (id: string) => setFaqs(prev => prev.filter(faq => faq.id !== id));


  const handleSaveDraft = () => {
    const courseData = { title, description, category, price, thumbnailUrl, introVideoUrl, syllabus, whatYouWillLearn, faqs };
    console.log("Saving Draft:", courseData);
    toast({
      title: "Draft Saved!",
      description: "Your course has been saved as a draft.",
    });
  };

  const handleSubmitForApproval = () => {
    const courseData = { title, description, category, price, thumbnailUrl, introVideoUrl, syllabus, whatYouWillLearn, faqs };
    console.log("Submitting for Approval:", courseData);
    toast({
      title: "Submitted for Approval",
      description: "Your course has been submitted and is pending review.",
    });
  };
  
  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'syllabus', label: 'Syllabus', icon: BookCopy },
    { id: 'outcomes', label: 'Outcomes', icon: Book },
    { id: 'media', label: 'Media', icon: CloudUpload },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
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
            
            {activeTab === 'details' && (
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
            )}

            {activeTab === 'syllabus' && (
              <CardContent className="pt-6">
                <CardDescription className="mb-4">Drag and drop to reorder modules and lessons. Add details for each lesson in the collapsible area.</CardDescription>
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
            )}
            
            {activeTab === 'outcomes' && (
                <CardContent className="pt-6">
                    <CardDescription className="mb-4">List the key skills and knowledge students will gain from this course.</CardDescription>
                    <div className="space-y-2">
                        {whatYouWillLearn.map((outcome, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input value={outcome} onChange={e => updateOutcome(index, e.target.value)} />
                                <Button variant="ghost" size="icon" onClick={() => removeOutcome(index)}><X className="text-destructive h-4 w-4"/></Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="mt-4" onClick={addOutcome}><PlusCircle className="mr-2"/>Add Outcome</Button>
                </CardContent>
            )}

            {activeTab === 'media' && (
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
            )}
            
            {activeTab === 'faq' && (
                 <CardContent className="pt-6">
                    <CardDescription className="mb-4">Add frequently asked questions to help students.</CardDescription>
                    <div className="space-y-4">
                        {faqs.map(faq => (
                            <div key={faq.id} className="p-4 border rounded-md space-y-2 relative">
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeFaq(faq.id)}><X className="text-destructive h-4 w-4"/></Button>
                                <div className="space-y-1">
                                    <Label htmlFor={`faq-q-${faq.id}`}>Question</Label>
                                    <Input id={`faq-q-${faq.id}`} value={faq.question} onChange={e => updateFaq(faq.id, 'question', e.target.value)} />
                                </div>
                                 <div className="space-y-1">
                                    <Label htmlFor={`faq-a-${faq.id}`}>Answer</Label>
                                    <Textarea id={`faq-a-${faq.id}`} value={faq.answer} onChange={e => updateFaq(faq.id, 'answer', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="mt-4" onClick={addFaq}><PlusCircle className="mr-2"/>Add FAQ</Button>
                </CardContent>
            )}

            {activeTab === 'pricing' && (
                <CardContent className="pt-6">
                    <div className="space-y-2 max-w-sm">
                        <Label htmlFor="price">Price (BDT)</Label>
                        <Input id="price" type="number" placeholder="e.g., 4500" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                </CardContent>
            )}

        </Card>

    </div>
  );
}

    