
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
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
  Users,
  Calendar,
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
import { courses, Course } from '@/lib/mock-data';
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
    type: 'lesson' | 'quiz' | 'document';
    title: string;
    duration: string;
    videoId?: string;
    lectureSheetUrl?: string;
};

type ModuleData = {
    id: string;
    type: 'module';
    title: string;
    lessons: LessonData[];
};

type SyllabusItem = ModuleData['lessons'][0] | Omit<ModuleData, 'lessons'>;

type FaqItem = {
  id: string;
  question: string;
  answer: string;
}

type InstructorItem = {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  dataAiHint: string;
}

type ClassRoutineItem = {
  id: string;
  day: string;
  subject: string;
  time: string;
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
        <Collapsible ref={setNodeRef} style={style} className="bg-background rounded-md border ml-6">
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

export default function CourseBuilderPage({ params }: { params: { courseId: string } }) {
  const isNewCourse = params.courseId === 'new';
  const courseToEdit = isNewCourse ? null : courses.find(c => c.id === params.courseId);

  if (!isNewCourse && !courseToEdit) {
    notFound();
  }
    
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');

  const [title, setTitle] = useState(courseToEdit?.title || '');
  const [description, setDescription] = useState(courseToEdit?.description || '');
  const [category, setCategory] = useState(courseToEdit?.category || allCategories[0] || '');
  const [price, setPrice] = useState(courseToEdit?.price?.replace(/[^0-9.]/g, '') || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(courseToEdit?.imageUrl || 'https://placehold.co/600x400.png');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(courseToEdit?.whatYouWillLearn || []);

  const getSyllabusItems = (): SyllabusItem[] => {
    if (!courseToEdit?.syllabus) return [];
    const items: SyllabusItem[] = [];
    courseToEdit.syllabus.forEach(module => {
        items.push({ id: module.id, type: 'module', title: module.title });
        module.lessons.forEach(lesson => {
            items.push({ ...lesson });
        });
    });
    return items;
  }

  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(getSyllabusItems());

  const [faqs, setFaqs] = useState<FaqItem[]>(courseToEdit?.faqs?.map(f => ({...f, id: Math.random().toString()})) || []);
  const [instructors, setInstructors] = useState<InstructorItem[]>(courseToEdit?.instructors?.map(i => ({...i, id: Math.random().toString()})) || []);
  const [classRoutine, setClassRoutine] = useState<ClassRoutineItem[]>(courseToEdit?.classRoutine?.map(cr => ({...cr, id: Math.random().toString()})) || []);

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
    
    // Logic to add a lesson under the last module if one exists
    if (type === 'lesson') {
        let lastModuleIndex = -1;
        for (let i = syllabus.length - 1; i >= 0; i--) {
            if (syllabus[i].type === 'module') {
                lastModuleIndex = i;
                break;
            }
        }
        if (lastModuleIndex !== -1) {
            const newSyllabus = [...syllabus];
            newSyllabus.splice(lastModuleIndex + 1, 0, newItem);
            setSyllabus(newSyllabus);
            return;
        }
    }
    setSyllabus(prev => [...prev, newItem]);
  };
  
  const updateSyllabusItem = (id: string, field: string, value: string) => {
    setSyllabus(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };


  const removeSyllabusItem = (id: string) => {
    setSyllabus(prev => prev.filter(item => item.id !== id));
  };
  
  const addOutcome = () => setWhatYouWillLearn(prev => [...prev, '']);
  const updateOutcome = (index: number, value: string) => {
      const newOutcomes = [...whatYouWillLearn];
      newOutcomes[index] = value;
      setWhatYouWillLearn(newOutcomes);
  };
  const removeOutcome = (index: number) => setWhatYouWillLearn(prev => prev.filter((_, i) => i !== index));

  const addFaq = () => setFaqs(prev => [...prev, { id: Date.now().toString(), question: '', answer: '' }]);
  const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
      setFaqs(prev => prev.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
  };
  const removeFaq = (id: string) => setFaqs(prev => prev.filter(faq => faq.id !== id));

  const addInstructor = () => setInstructors(prev => [...prev, { id: Date.now().toString(), name: '', title: '', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'person' }]);
  const updateInstructor = (id: string, field: keyof Omit<InstructorItem, 'id'>, value: string) => {
      setInstructors(prev => prev.map(ins => ins.id === id ? { ...ins, [field]: value } : ins));
  };
  const removeInstructor = (id: string) => setInstructors(prev => prev.filter(ins => ins.id !== id));

  const addRoutineItem = () => setClassRoutine(prev => [...prev, { id: Date.now().toString(), day: '', subject: '', time: '' }]);
  const updateRoutineItem = (id: string, field: keyof Omit<ClassRoutineItem, 'id'>, value: string) => {
      setClassRoutine(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeRoutineItem = (id: string) => setClassRoutine(prev => prev.filter(item => item.id !== id));

  const handleSaveDraft = () => {
    console.log("Saving Draft:", { title, description, category, price, thumbnailUrl, introVideoUrl, syllabus, whatYouWillLearn, faqs, instructors, classRoutine });
    toast({
      title: "Draft Saved!",
      description: "Your course has been saved as a draft.",
    });
  };

  const handleSubmitForApproval = () => {
    console.log("Submitting for Approval:", { title, description, category, price, thumbnailUrl, introVideoUrl, syllabus, whatYouWillLearn, faqs, instructors, classRoutine });
    toast({
      title: "Submitted for Approval",
      description: "Your course has been submitted and is pending review.",
    });
  };
  
  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'syllabus', label: 'Syllabus', icon: BookCopy },
    { id: 'outcomes', label: 'Outcomes', icon: Book },
    { id: 'instructors', label: 'Instructors', icon: Users },
    { id: 'routine', label: 'Routine', icon: Calendar },
    { id: 'media', label: 'Media', icon: CloudUpload },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    {isNewCourse ? 'Create New Course' : `Edit: ${courseToEdit?.title}`}
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                   {isNewCourse ? 'Create a new course from scratch.' : 'Manage your course content with ease.'}
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
            
            {activeTab === 'instructors' && (
                <CardContent className="pt-6">
                    <CardDescription className="mb-4">Add and manage instructors for this course.</CardDescription>
                     <div className="space-y-4">
                        {instructors.map(instructor => (
                            <div key={instructor.id} className="p-4 border rounded-md space-y-4 relative">
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeInstructor(instructor.id)}><X className="text-destructive h-4 w-4"/></Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                      <Label htmlFor={`ins-name-${instructor.id}`}>Instructor Name</Label>
                                      <Input id={`ins-name-${instructor.id}`} value={instructor.name} onChange={e => updateInstructor(instructor.id, 'name', e.target.value)} />
                                  </div>
                                  <div className="space-y-1">
                                      <Label htmlFor={`ins-title-${instructor.id}`}>Title/Subject</Label>
                                      <Input id={`ins-title-${instructor.id}`} value={instructor.title} onChange={e => updateInstructor(instructor.id, 'title', e.target.value)} />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`ins-avatar-${instructor.id}`}>Avatar URL</Label>
                                    <Input id={`ins-avatar-${instructor.id}`} value={instructor.avatarUrl} onChange={e => updateInstructor(instructor.id, 'avatarUrl', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="mt-4" onClick={addInstructor}><PlusCircle className="mr-2"/>Add Instructor</Button>
                </CardContent>
            )}

            {activeTab === 'routine' && (
                <CardContent className="pt-6">
                    <CardDescription className="mb-4">Set the weekly class schedule for this course.</CardDescription>
                     <div className="space-y-2">
                        {classRoutine.map(item => (
                            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                                <Input placeholder="Day (e.g., Saturday)" value={item.day} onChange={e => updateRoutineItem(item.id, 'day', e.target.value)} />
                                <Input placeholder="Subject" value={item.subject} onChange={e => updateRoutineItem(item.id, 'subject', e.target.value)} />
                                <Input placeholder="Time (e.g., 7:00 PM)" value={item.time} onChange={e => updateRoutineItem(item.id, 'time', e.target.value)} />
                                <Button variant="ghost" size="icon" onClick={() => removeRoutineItem(item.id)}><X className="text-destructive h-4 w-4"/></Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="mt-4" onClick={addRoutineItem}><PlusCircle className="mr-2"/>Add Routine Item</Button>
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
