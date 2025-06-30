
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useRouter, useParams } from 'next/navigation';
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
  Archive,
  Megaphone,
  ClipboardEdit,
  Loader2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/components/ui/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { Course, SyllabusModule, AssignmentTemplate, CourseInstructor } from '@/lib/types';
import { getCourse, getCourses, getCategories, getInstructorByUid, getOrganizationByUserId } from '@/lib/firebase/firestore';
import { saveCourseAction } from '@/app/actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { generateCourseContent } from '@/ai/flows/ai-course-creator-flow';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';

type LessonData = {
    id: string;
    type: 'video' | 'quiz' | 'document';
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
  slug?: string;
}

type ClassRoutineItem = {
  id: string;
  day: string;
  subject: string;
  time: string;
  instructorName?: string;
}

type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  date: string;
}

type QuizQuestionData = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctAnswerId: string;
};

type QuizData = {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestionData[];
};

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
                            <Input id={`videoId-${item.id}`} placeholder="e.g., dQw4w9WgXcQ" value={item.videoId || ''} onChange={(e) => updateItem(item.id, 'videoId', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`duration-${item.id}`}>Lesson Duration</Label>
                            <Input id={`duration-${item.id}`} placeholder="e.g., 45 min" value={item.duration || ''} onChange={(e) => updateItem(item.id, 'duration', e.target.value)} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor={`sheetUrl-${item.id}`}>Lecture Sheet URL</Label>
                        <Input id={`sheetUrl-${item.id}`} placeholder="https://docs.google.com/..." value={item.lectureSheetUrl || ''} onChange={(e) => updateItem(item.id, 'lectureSheetUrl', e.target.value)} />
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

type CourseBuilderProps = {
    userRole: 'Admin' | 'Partner' | 'Teacher';
    redirectPath: string;
}

export function CourseBuilder({ userRole, redirectPath }: CourseBuilderProps) {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const isNewCourse = courseId === 'new';

  const { toast } = useToast();
  const { userInfo } = useAuth();
  
  const [loading, setLoading] = useState(!isNewCourse);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const [courseTitle, setCourseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://placehold.co/600x400.png');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([]);
  const [includedCourseIds, setIncludedCourseIds] = useState<string[]>([]);
  const [archivedCourses, setArchivedCourses] = useState<Course[]>([]);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [instructors, setInstructors] = useState<InstructorItem[]>([]);
  const [classRoutine, setClassRoutine] = useState<ClassRoutineItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [assignmentTemplates, setAssignmentTemplates] = useState<AssignmentTemplate[]>([]);
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);

  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const getSyllabusItems = (course: Course): SyllabusItem[] => {
    if (!course?.syllabus) return [];
    const items: SyllabusItem[] = [];
    course.syllabus.forEach(module => {
        items.push({ id: module.id, type: 'module', title: module.title });
        module.lessons.forEach(lesson => {
            items.push({ ...lesson });
        });
    });
    return items;
  }
  
  useEffect(() => {
    if (userInfo) {
        if (userRole === 'Partner') {
            getOrganizationByUserId(userInfo.uid).then(org => {
                if (org?.id) setOrganizationId(org.id);
            });
        } else if (userRole === 'Teacher') {
            getInstructorByUid(userInfo.uid).then(inst => {
                if (inst?.organizationId) setOrganizationId(inst.organizationId);
                // If it's a new course, auto-add this teacher
                if (isNewCourse && inst) {
                    setInstructors([{
                        id: inst.id || Date.now().toString(),
                        name: inst.name,
                        title: inst.title,
                        avatarUrl: inst.avatarUrl,
                        dataAiHint: inst.dataAiHint,
                        slug: inst.slug
                    }]);
                }
            });
        }
    }
  }, [userInfo, userRole, isNewCourse]);

  useEffect(() => {
    async function fetchInitialData() {
        try {
            const [ fetchedCategories, allCourses ] = await Promise.all([
                getCategories(),
                getCourses()
            ]);
            setAllCategories(fetchedCategories);
            setArchivedCourses(allCourses.filter(c => c.isArchived));

            if (!isNewCourse) {
                const courseData = await getCourse(courseId);
                if (courseData) {
                    setCourseTitle(courseData.title || '');
                    setDescription(courseData.description || '');
                    setCategory(courseData.category || '');
                    setPrice(courseData.price?.replace(/[^0-9.]/g, '') || '');
                    setThumbnailUrl(courseData.imageUrl || 'https://placehold.co/600x400.png');
                    setIntroVideoUrl(courseData.videoUrl || '');
                    setWhatYouWillLearn(courseData.whatYouWillLearn || []);
                    setIncludedCourseIds(courseData.includedArchivedCourseIds || []);
                    setSyllabus(getSyllabusItems(courseData));
                    setFaqs(courseData.faqs?.map(f => ({...f, id: f.id || Math.random().toString()})) || []);
                    setInstructors(courseData.instructors?.map(i => ({...i, id: i.id || Math.random().toString()})) || []);
                    setClassRoutine(courseData.classRoutine?.map(cr => ({...cr, id: cr.id || Math.random().toString()})) || []);
                    setAnnouncements(courseData.announcements?.map(a => ({...a, id: a.id || Math.random().toString()})) || []);
                    setQuizzes(courseData.quizzes?.map(q => ({...q, id: q.id || Math.random().toString()})) || []);
                    setAssignmentTemplates(courseData.assignmentTemplates?.map(a => ({...a, id: a.id || Math.random().toString(), deadline: a.deadline ? new Date(a.deadline as string) : undefined })) || []);
                    setOrganizationId(courseData.organizationId);
                } else {
                    notFound();
                }
            }
        } catch (err) {
            console.error(err);
            toast({ title: 'Error loading data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchInitialData();
  }, [courseId, isNewCourse, toast]);


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
      : { id: Date.now().toString(), type: 'video', title: 'New Lesson', duration: '', videoId: '', lectureSheetUrl: '' };
    
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
  const updateInstructor = (id: string, field: keyof Omit<InstructorItem, 'id' | 'slug'>, value: string) => {
      setInstructors(prev => prev.map(ins => ins.id === id ? { ...ins, [field]: value } : ins));
  };
  const removeInstructor = (id: string) => setInstructors(prev => prev.filter(ins => ins.id !== id));

  const addRoutineItem = () => setClassRoutine(prev => [...prev, { id: Date.now().toString(), day: '', subject: '', time: '', instructorName: '' }]);
  const updateRoutineItem = (id: string, field: keyof Omit<ClassRoutineItem, 'id'>, value: string) => {
      setClassRoutine(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeRoutineItem = (id: string) => setClassRoutine(prev => prev.filter(item => item.id !== id));

  const addQuiz = () => setQuizzes(prev => [...prev, { id: Date.now().toString(), title: 'New Quiz', topic: '', questions: [] }]);
  const removeQuiz = (id: string) => setQuizzes(prev => prev.filter(q => q.id !== id));
  const updateQuiz = (id: string, field: 'title' | 'topic', value: string) => {
    setQuizzes(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };
  const addQuestion = (quizId: string) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id === quizId) {
        const newQuestionId = Date.now().toString();
        const newOptionId = `${newQuestionId}-opt-0`;
        return { ...q, questions: [...q.questions, { id: newQuestionId, text: '', options: [{id: newOptionId, text: ''}], correctAnswerId: newOptionId }] };
      }
      return q;
    }));
  };
  const removeQuestion = (quizId: string, questionId: string) => {
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, questions: q.questions.filter(qu => qu.id !== questionId) } : q));
  };
  const updateQuestionText = (quizId: string, questionId: string, text: string) => {
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, questions: q.questions.map(qu => qu.id === questionId ? { ...qu, text } : qu) } : q));
  };
  const addOption = (quizId: string, questionId: string) => {
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, questions: q.questions.map(qu => qu.id === questionId ? { ...qu, options: [...qu.options, { id: Date.now().toString(), text: '' }] } : qu) } : q));
  };
  const removeOption = (quizId: string, questionId: string, optionId: string) => {
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, questions: q.questions.map(qu => qu.id === questionId ? { ...qu, options: qu.options.filter(opt => opt.id !== optionId) } : q) } : q));
  };
  const updateOptionText = (quizId: string, questionId: string, optionId: string, text: string) => {
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, questions: q.questions.map(qu => qu.id === questionId ? { ...qu, options: qu.options.map(opt => opt.id === optionId ? { ...opt, text } : opt) } : q) } : q));
  };
  const setCorrectAnswer = (quizId: string, questionId: string, optionId: string) => {
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, questions: q.questions.map(qu => qu.id === questionId ? { ...qu, correctAnswerId: optionId } : qu) } : q));
  };

  const addAssignmentTemplate = () => setAssignmentTemplates(prev => [...prev, { id: Date.now().toString(), title: '', topic: '' }]);
  const removeAssignmentTemplate = (id: string) => setAssignmentTemplates(prev => prev.filter(a => a.id !== id));
  const updateAssignmentTemplate = (id: string, field: 'title' | 'topic' | 'deadline', value: string | Date | undefined) => {
    setAssignmentTemplates(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleBundledCourseChange = (courseId: string, isChecked: boolean) => {
    setIncludedCourseIds(prev => {
        if (isChecked) {
            return [...prev, courseId];
        } else {
            return prev.filter(id => id !== courseId);
        }
    });
  };

  const handlePostAnnouncement = () => {
    if (!newAnnouncementTitle || !newAnnouncementContent) {
      toast({ title: 'Error', description: 'Title and content cannot be empty.', variant: 'destructive' });
      return;
    }
    const newAnnouncement: AnnouncementItem = {
      id: Date.now().toString(),
      title: newAnnouncementTitle,
      content: newAnnouncementContent,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
    toast({ title: 'Success', description: 'Announcement posted.' });
  };

  const removeAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = async (status: 'Draft' | 'Pending Approval') => {
    if (!courseTitle) {
      toast({ title: 'Validation Error', description: 'Course title cannot be empty.', variant: 'destructive' });
      setActiveTab('details');
      return;
    }
    if (instructors.some(inst => !inst.name || !inst.title)) {
        toast({ title: 'Validation Error', description: 'All instructors must have a name and title.', variant: 'destructive' });
        setActiveTab('instructors');
        return;
    }

    setIsSaving(true);
    
    const reconstructedSyllabus: SyllabusModule[] = [];
    let currentModule: SyllabusModule | null = null;
    syllabus.forEach(item => {
        if (item.type === 'module') {
            if (currentModule) {
                reconstructedSyllabus.push(currentModule);
            }
            currentModule = { id: item.id, title: item.title, lessons: [] };
        } else if (currentModule && item.type !== 'module') {
            currentModule.lessons.push({
                id: item.id,
                type: item.type as 'video' | 'quiz' | 'document',
                title: item.title,
                duration: item.duration || '',
                videoId: item.videoId || '',
                lectureSheetUrl: item.lectureSheetUrl || '',
            });
        }
    });
    if (currentModule) {
        reconstructedSyllabus.push(currentModule);
    }

    const courseData: Partial<Course> = {
        id: isNewCourse ? undefined : courseId,
        title: courseTitle,
        description,
        category,
        price: `BDT ${price || 0}`,
        imageUrl: thumbnailUrl,
        videoUrl: introVideoUrl,
        whatYouWillLearn,
        syllabus: reconstructedSyllabus,
        faqs: faqs.map(({ id, ...rest }) => rest),
        instructors: instructors.map(({ id, slug, ...rest }) => ({...rest, slug: slug || rest.name.toLowerCase().replace(/\s+/g, '-') })),
        classRoutine: classRoutine.map(({ id, ...rest }) => rest),
        includedArchivedCourseIds,
        announcements: announcements.map(({ id, ...rest }) => rest),
        quizzes,
        assignmentTemplates: assignmentTemplates.map(a => {
            const { id, deadline, ...rest } = a;
            const newAssignment: Partial<AssignmentTemplate> = { ...rest };
            if (deadline) {
                const date = new Date(deadline);
                if (!isNaN(date.getTime())) {
                    newAssignment.deadline = format(date, 'yyyy-MM-dd');
                }
            }
            return newAssignment;
        }),
        status,
        organizationId,
    };
    
    const result = await saveCourseAction(courseData);
    if (result.success) {
      toast({ 
          title: status === 'Pending Approval' ? 'Course Submitted' : 'Draft Saved', 
          description: result.message 
      });
      if (status === 'Pending Approval' || (isNewCourse && result.courseId)) {
        router.push(redirectPath.replace('/new', ''));
      }
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSaving(false);
  };
  
  const handleGenerateCourse = async () => {
    setIsGenerating(true);
    try {
      const result = await generateCourseContent(aiTopic);
      
      setCourseTitle(result.title);
      setDescription(result.description);
      setWhatYouWillLearn(result.outcomes);
      setFaqs(result.faqs.map(faq => ({ ...faq, id: Math.random().toString() })));

      const newSyllabus: SyllabusItem[] = [];
      result.syllabus.forEach(module => {
        newSyllabus.push({ id: Math.random().toString(), type: 'module', title: module.title });
        module.lessons.forEach(lesson => {
          newSyllabus.push({
            id: Math.random().toString(),
            type: 'video',
            title: lesson.title,
            duration: '10 min',
            videoId: '',
            lectureSheetUrl: '',
          });
        });
      });
      setSyllabus(newSyllabus);

      toast({ title: 'Success', description: 'AI has generated the course content.' });
      setIsAiDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to generate content with AI.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'syllabus', label: 'Syllabus', icon: BookCopy },
    { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
    { id: 'assignments', label: 'Assignments', icon: ClipboardEdit },
    { id: 'outcomes', label: 'Outcomes', icon: Book },
    { id: 'instructors', label: 'Instructors', icon: Users },
    { id: 'routine', label: 'Routine', icon: Calendar },
    { id: 'media', label: 'Media', icon: CloudUpload },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'bundles', label: 'Bundles', icon: Archive },
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <LoadingSpinner className="w-12 h-12" />
        </div>
      );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    {isNewCourse ? 'Create New Course' : `Edit: ${courseTitle}`}
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                   {isNewCourse ? 'Create a new course from scratch.' : 'Manage your course content with ease.'}
                </p>
            </div>
            <div className="flex gap-2 shrink-0">
                 <Button variant="outline" onClick={() => setIsAiDialogOpen(true)} disabled={isSaving}>
                    <Wand2 className="mr-2 h-4 w-4"/> Generate with AI
                </Button>
                <Button variant="outline" onClick={() => handleSave('Draft')} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Save Draft
                </Button>
                <Button variant="accent" onClick={() => handleSave('Pending Approval')} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} Submit for Approval
                </Button>
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
                    <Input id="title" placeholder="e.g., HSC 2025 Physics Crash Course" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} />
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

            {activeTab === 'quizzes' && (
                <CardContent className="pt-6 space-y-4">
                    <CardDescription>Create and manage quizzes for this course.</CardDescription>
                    {quizzes.map((quiz) => (
                      <Card key={quiz.id} className="bg-muted/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl">Quiz: {quiz.title}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => removeQuiz(quiz.id)}><X className="text-destructive h-4 w-4"/></Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <Input value={quiz.title} onChange={e => updateQuiz(quiz.id, 'title', e.target.value)} placeholder="Quiz Title" />
                                <Input value={quiz.topic} onChange={e => updateQuiz(quiz.id, 'topic', e.target.value)} placeholder="Quiz Topic" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {quiz.questions.map((q, qIndex) => (
                                <Collapsible key={q.id} className="p-4 border rounded-md bg-background">
                                    <div className="flex items-center justify-between">
                                      <p className="font-semibold">Question {qIndex + 1}</p>
                                      <div>
                                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(quiz.id, q.id)}><X className="text-destructive h-4 w-4"/></Button>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" /></Button>
                                        </CollapsibleTrigger>
                                      </div>
                                    </div>
                                    <CollapsibleContent className="mt-4 space-y-2">
                                        <Label>Question Text</Label>
                                        <Textarea value={q.text} onChange={e => updateQuestionText(quiz.id, q.id, e.target.value)} />
                                        <Label>Options (select the correct one)</Label>
                                        <RadioGroup value={q.correctAnswerId} onValueChange={(value) => setCorrectAnswer(quiz.id, q.id, value)}>
                                            {q.options.map((opt) => (
                                                <div key={opt.id} className="flex items-center gap-2">
                                                    <RadioGroupItem value={opt.id} id={opt.id} />
                                                    <Input value={opt.text} onChange={e => updateOptionText(quiz.id, q.id, opt.id, e.target.value)} className="flex-grow"/>
                                                    <Button variant="ghost" size="icon" onClick={() => removeOption(quiz.id, q.id, opt.id)}><X className="h-4 w-4 text-destructive"/></Button>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                        <Button variant="outline" size="sm" onClick={() => addOption(quiz.id, q.id)}>Add Option</Button>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={() => addQuestion(quiz.id)}><PlusCircle className="mr-2"/>Add Question</Button>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addQuiz}><PlusCircle className="mr-2"/>Add New Quiz</Button>
                </CardContent>
            )}

            {activeTab === 'assignments' && (
                <CardContent className="pt-6 space-y-4">
                    <CardDescription>Create and manage assignments for this course.</CardDescription>
                     {assignmentTemplates.map(assignment => (
                        <div key={assignment.id} className="flex items-end gap-2 p-4 border rounded-md">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                                <div className="space-y-1">
                                    <Label htmlFor={`as-title-${assignment.id}`}>Assignment Title</Label>
                                    <Input id={`as-title-${assignment.id}`} value={assignment.title} onChange={e => updateAssignmentTemplate(assignment.id, 'title', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`as-topic-${assignment.id}`}>Topic</Label>
                                    <Input id={`as-topic-${assignment.id}`} value={assignment.topic} onChange={e => updateAssignmentTemplate(assignment.id, 'topic', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`as-deadline-${assignment.id}`}>Deadline</Label>
                                    <DatePicker date={assignment.deadline ? new Date(assignment.deadline as string) : undefined} setDate={(date) => updateAssignmentTemplate(assignment.id, 'deadline', date)} />
                                </div>
                            </div>
                             <Button variant="ghost" size="icon" onClick={() => removeAssignmentTemplate(assignment.id)}><X className="text-destructive h-4 w-4"/></Button>
                        </div>
                     ))}
                    <Button variant="outline" className="w-full" onClick={addAssignmentTemplate}><PlusCircle className="mr-2"/>Add New Assignment</Button>
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
                    <CardDescription className="mb-4">Set the weekly class schedule. Select an instructor from the list of instructors you added.</CardDescription>
                     <div className="space-y-2">
                        {classRoutine.map(item => (
                            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                                <Input placeholder="Day (e.g., Saturday)" value={item.day} onChange={e => updateRoutineItem(item.id, 'day', e.target.value)} />
                                <Input placeholder="Subject" value={item.subject} onChange={e => updateRoutineItem(item.id, 'subject', e.target.value)} />
                                <Input placeholder="Time (e.g., 7:00 PM)" value={item.time} onChange={e => updateRoutineItem(item.id, 'time', e.target.value)} />
                                 <Select
                                    value={item.instructorName}
                                    onValueChange={(value) => updateRoutineItem(item.id, 'instructorName', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Instructor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instructors.map((ins) => (
                                            <SelectItem key={ins.id} value={ins.name}>
                                                {ins.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
            
            {activeTab === 'announcements' && (
                <CardContent className="pt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Post a New Announcement</CardTitle>
                            <CardDescription>This will be visible to all students enrolled in this course.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ann-title">Title</Label>
                                <Input id="ann-title" value={newAnnouncementTitle} onChange={e => setNewAnnouncementTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ann-content">Content</Label>
                                <Textarea id="ann-content" value={newAnnouncementContent} onChange={e => setNewAnnouncementContent(e.target.value)} rows={4} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handlePostAnnouncement}>Post Announcement</Button>
                        </CardFooter>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Posted Announcements</h3>
                        {announcements.length > 0 ? (
                            announcements.map(ann => (
                                <Card key={ann.id} className="bg-muted/50">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{ann.title}</CardTitle>
                                                <CardDescription>Posted on {ann.date}</CardDescription>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeAnnouncement(ann.id)}>
                                                <X className="text-destructive h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap">{ann.content}</p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No announcements posted yet.</p>
                        )}
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

            {activeTab === 'bundles' && (
                <CardContent className="pt-6">
                    <CardDescription className="mb-4">
                        Select any archived courses to bundle for free with this course.
                        Students who purchase this course will get free access to the selected archived content.
                    </CardDescription>
                    <div className="space-y-2">
                        {archivedCourses.map(course => (
                            <div key={course.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                                <Checkbox
                                    id={`bundle-${course.id}`}
                                    checked={includedCourseIds.includes(course.id!)}
                                    onCheckedChange={(checked) => handleBundledCourseChange(course.id!, !!checked)}
                                />
                                <Label htmlFor={`bundle-${course.id}`} className="cursor-pointer">
                                    {course.title} <span className="text-muted-foreground text-xs">({course.category})</span>
                                </Label>
                            </div>
                        ))}
                        {archivedCourses.length === 0 && (
                            <p className="text-sm text-muted-foreground p-2">No archived courses available to bundle.</p>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate Course with AI</DialogTitle>
                    <DialogDescription>
                        Enter a topic, and the AI will generate a draft for your course title, description, syllabus, and more.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="ai-topic">Course Topic</Label>
                    <Input 
                        id="ai-topic" 
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g., Introduction to Rocket Science" 
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleGenerateCourse} disabled={isGenerating || !aiTopic}>
                        {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <Wand2 className="mr-2"/>}
                        Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

    