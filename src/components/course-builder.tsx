

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Phone,
  ChevronsUpDown,
  Check,
  Video,
  Award,
  Database,
  Settings,
  Link as LinkIcon,
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
  DragOverlay,
  Active,
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
import { Course, SyllabusModule, AssignmentTemplate, Instructor, Announcement, LiveClass, ExamTemplate, Question, Lesson, CourseCycle, Organization, User } from '@/lib/types';
import { getCourse, getCourses, getCategories, getInstructorByUid, getOrganizationByUserId, getInstructors, getQuestionBank, getOrganizations, getUsers } from '@/lib/firebase/firestore';
import { saveCourseAction } from '@/app/actions/course.actions';
import { scheduleLiveClassAction } from '@/app/actions/live-class.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import { generateCourseContent } from '@/ai/flows/ai-course-creator-flow';
import { generateQuizForLesson, AiQuizGeneratorInput } from '@/ai/flows/ai-quiz-generator-flow';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { removeUndefinedValues, cn, getYoutubeVideoId } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type LessonData = {
    id: string;
    type: 'video' | 'quiz' | 'document';
    title: string;
    duration: string;
    videoId?: string;
    lectureSheetUrl?: string;
    quizId?: string;
    instructorSlug?: string;
};

type ModuleData = {
    id: string;
    type: 'module';
    title: string;
    lessons: LessonData[];
};

type SyllabusItem = LessonData | Omit<ModuleData, 'lessons'>;

type FaqItem = {
  id: string;
  question: string;
  answer: string;
}

type ClassRoutineItem = {
  id: string;
  day: string;
  subject: string;
  time: string;
  instructorName?: string;
}

function SortableSyllabusItem({ 
    item, 
    updateItem, 
    removeItem, 
    onGenerateQuiz, 
    courseInstructors,
}: { 
    item: SyllabusItem, 
    updateItem: (id: string, field: string, value: any) => void, 
    removeItem: (id: string) => void, 
    onGenerateQuiz: (lesson: LessonData) => void, 
    courseInstructors: Instructor[],
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
    
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    const handleGenerateQuiz = async (lesson: LessonData) => {
        setIsGeneratingQuiz(true);
        await onGenerateQuiz(lesson);
        setIsGeneratingQuiz(false);
    }

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
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
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
                     <div className="space-y-2">
                        <Label>Lesson Type</Label>
                        <Select value={item.type} onValueChange={(value) => updateItem(item.id, 'type', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="video">Video Lesson</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="document">Document / Reading</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>

                    {item.type === 'video' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`videoId-${item.id}`}>YouTube Video URL or ID</Label>
                                <Input id={`videoId-${item.id}`} placeholder="e.g., dQw4w9WgXcQ" value={item.videoId || ''} onChange={(e) => updateItem(item.id, 'videoId', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`duration-${item.id}`}>Lesson Duration</Label>
                                <Input id={`duration-${item.id}`} placeholder="e.g., 45 min" value={item.duration || ''} onChange={(e) => updateItem(item.id, 'duration', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {(item.type === 'video' || item.type === 'document') && (
                        <div className="space-y-2">
                            <Label htmlFor={`sheetUrl-${item.id}`}>Lecture Sheet / Document URL</Label>
                            <Input id={`sheetUrl-${item.id}`} placeholder="https://docs.google.com/..." value={item.lectureSheetUrl || ''} onChange={(e) => updateItem(item.id, 'lectureSheetUrl', e.target.value)} />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor={`instructor-${item.id}`}>Lesson Instructor</Label>
                        <Select
                            value={item.instructorSlug || ''}
                            onValueChange={(value) => updateItem(item.id, 'instructorSlug', value === 'default' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an instructor..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default (First Instructor)</SelectItem>
                                {courseInstructors.map((inst: Instructor) => (
                                    <SelectItem key={inst.slug} value={inst.slug}>
                                        {inst.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <CardDescription className="text-xs">Assign a specific instructor. If not set, the first course instructor is shown.</CardDescription>
                    </div>
                    
                     {item.type !== 'quiz' && (
                        <div className="mt-2">
                            <Button size="sm" variant="outline" onClick={() => handleGenerateQuiz(item as LessonData)} disabled={isGeneratingQuiz}>
                                {isGeneratingQuiz ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                                Generate Quiz with AI
                            </Button>
                        </div>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

type CourseBuilderProps = {
    userRole: 'Admin' | 'Seller' | 'Teacher';
    redirectPath: string;
}

export function CourseBuilder({ userRole, redirectPath }: CourseBuilderProps) {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const isNewCourse = courseId === 'new';

  const { toast } = useToast();
  const { userInfo } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // All static data fetched once
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [allDoubtSolvers, setAllDoubtSolvers] = useState<User[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [questionBank, setQuestionBank] = useState<Question[]>([]);

  // Course-specific state
  const [courseTitle, setCourseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [courseType, setCourseType] = useState<'Online' | 'Offline' | 'Hybrid' | 'Exam'>('Online');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://placehold.co/600x400.png');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([]);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [doubtSolverIds, setDoubtSolverIds] = useState<string[]>([]);
  const [classRoutine, setClassRoutine] = useState<ClassRoutineItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [quizTemplates, setQuizTemplates] = useState<QuizTemplate[]>([]);
  const [assignmentTemplates, setAssignmentTemplates] = useState<AssignmentTemplate[]>([]);
  const [examTemplates, setExamTemplates] = useState<ExamTemplate[]>([]);
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);
  const [initialStatus, setInitialStatus] = useState<Course['status'] | null>(null);

  // Settings tab states
  const [communityUrl, setCommunityUrl] = useState('');
  const [includedCourseIds, setIncludedCourseIds] = useState<string[]>([]);
  const [isArchived, setIsArchived] = useState(false);
  const [showStudentCount, setShowStudentCount] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Pre-booking states
  const [isPrebooking, setIsPrebooking] = useState(false);
  const [prebookingPrice, setPrebookingPrice] = useState('');
  const [prebookingEndDate, setPrebookingEndDate] = useState<Date | undefined>();
  const [prebookingTarget, setPrebookingTarget] = useState<number | undefined>();

  // Cycle Management states
  const [cycles, setCycles] = useState<Course['cycles']>([]);

  // AI Dialog states
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Question Bank Dialog states
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [selectedExamForQB, setSelectedExamForQB] = useState<ExamTemplate | null>(null);
  const [qbFilters, setQbFilters] = useState({ subject: 'all', chapter: 'all', difficulty: 'all' });
  const [qbSelectedQuestions, setQbSelectedQuestions] = useState<Question[]>([]);

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
  
  const setCourseData = useCallback((courseData: Course, allInstructorsList: Instructor[]) => {
    if (courseData) {
        setInitialStatus(courseData.status);
        setCourseTitle(courseData.title || '');
        setDescription(courseData.description || '');
        setCategory(courseData.category || '');
        setSubCategory(courseData.subCategory || '');
        setCourseType(courseData.type || 'Online');
        setPrice(courseData.price?.replace(/[^0-9.]/g, '') || '');
        setDiscountPrice(courseData.discountPrice?.replace(/[^0-9.]/g, '') || '');
        setWhatsappNumber(courseData.whatsappNumber || '');
        setIsPrebooking(courseData.isPrebooking || false);
        setPrebookingPrice(courseData.prebookingPrice?.replace(/[^0-9.]/g, '') || '');
        setPrebookingEndDate(courseData.prebookingEndDate ? new Date(courseData.prebookingEndDate) : undefined);
        setPrebookingTarget(courseData.prebookingTarget || undefined);
        setCycles(courseData.cycles || []);
        let imageUrl = courseData.imageUrl || 'https://placehold.co/600x400.png';
        if (imageUrl.includes('placehold.c/')) {
            imageUrl = imageUrl.replace('placehold.c/', 'placehold.co/');
        }
        setThumbnailUrl(imageUrl);
        setIntroVideoUrl(courseData.videoUrl || '');
        setWhatYouWillLearn(courseData.whatYouWillLearn || []);
        setSyllabus(getSyllabusItems(courseData));
        setFaqs(courseData.faqs?.map(f => ({...f, id: Math.random().toString()})) || []);
        const courseInstructors = courseData.instructors?.map(courseInst => {
            return allInstructorsList.find(i => i.slug === courseInst.slug);
        }).filter((i): i is Instructor => !!i) || [];
        setInstructors(courseInstructors);
        setDoubtSolverIds(courseData.doubtSolverIds || []);
        setClassRoutine(courseData.classRoutine?.map(cr => ({...cr, id: Math.random().toString()})) || []);
        setAnnouncements(courseData.announcements?.map(a => ({...a})) || []);
        setLiveClasses(courseData.liveClasses || []);
        setQuizTemplates(courseData.quizTemplates?.map(q => ({...q, id: q.id || Math.random().toString()})) || []);
        setAssignmentTemplates(courseData.assignmentTemplates?.map(a => ({...a, id: a.id || Math.random().toString() })) || []);
        setExamTemplates(courseData.examTemplates?.map(e => ({...e, id: e.id || Math.random().toString() })) || []);
        setOrganizationId(courseData.organizationId);
        setCommunityUrl(courseData.communityUrl || '');
        setIncludedCourseIds(courseData.includedCourseIds || []);
        setIsArchived(courseData.isArchived || false);
        setShowStudentCount(courseData.showStudentCount ?? true);
    }
  }, []);

  useEffect(() => {
    async function fetchAllData() {
        setLoading(true);
        try {
            const [fetchedCategories, fetchedCourses, fetchedInstructors, fetchedQuestionBank, fetchedOrganizations, allUsers] = await Promise.all([
                getCategories(), getCourses(), getInstructors(), getQuestionBank(), getOrganizations(), getUsers()
            ]);

            const approvedInstructors = fetchedInstructors.filter(i => i.status === 'Approved');
            const approvedOrgs = fetchedOrganizations.filter(o => o.status === 'approved');
            const doubtSolvers = allUsers.filter(u => u.role === 'Doubt Solver' && u.status === 'Active');

            setAllCategories(fetchedCategories);
            setAllCourses(fetchedCourses);
            setAllInstructors(approvedInstructors);
            setAllDoubtSolvers(doubtSolvers);
            setAllOrganizations(approvedOrgs);
            setQuestionBank(fetchedQuestionBank);

            if (!isNewCourse) {
                const courseData = await getCourse(courseId);
                if (courseData) {
                    setCourseData(courseData, approvedInstructors);
                } else {
                    notFound();
                }
            } else if (userInfo) {
                if (userRole === 'Seller') {
                    const org = await getOrganizationByUserId(userInfo.uid);
                    if (org?.id) setOrganizationId(org.id);
                } else if (userRole === 'Teacher') {
                    const inst = await getInstructorByUid(userInfo.uid);
                    if (inst) {
                        if (inst.organizationId) setOrganizationId(inst.organizationId);
                        setInstructors([inst]);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            toast({ title: 'Error loading page data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchAllData();
  }, [courseId, isNewCourse, toast, userInfo, userRole, setCourseData]);


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
  
  const updateSyllabusItem = (id: string, field: string, value: any) => {
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

  const addInstructor = (instructor: Instructor) => setInstructors(prev => [...prev, instructor]);
  const removeInstructor = (slug: string) => setInstructors(prev => prev.filter(ins => ins.slug !== slug));
  
  // Routine Handlers
  const addRoutineRow = () => setClassRoutine(prev => [...prev, { id: Date.now().toString(), day: 'Saturday', subject: '', time: '' }]);
  const updateRoutineRow = (id: string, field: keyof Omit<ClassRoutineItem, 'id'>, value: string) => {
    setClassRoutine(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };
  const removeRoutineRow = (id: string) => setClassRoutine(prev => prev.filter(row => row.id !== id));
  
  // Announcement Handlers
  const addAnnouncement = () => setAnnouncements(prev => [{ id: `ann_${Date.now()}`, title: '', content: '', date: format(new Date(), 'yyyy-MM-dd') }, ...prev]);
  const updateAnnouncement = (id: string, field: keyof Omit<Announcement, 'id' | 'date'>, value: string) => {
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };
  const removeAnnouncement = (id: string) => setAnnouncements(prev => prev.filter(a => a.id !== id));

  // Live Class Handlers
  const addLiveClass = () => setLiveClasses(prev => [...prev, { id: `lc_${Date.now()}`, topic: '', date: format(new Date(), 'yyyy-MM-dd'), time: '', platform: 'YouTube Live', joinUrl: '' }]);
  const handleScheduleLiveClass = async (liveClass: LiveClass) => {
      if (!liveClass.topic || !liveClass.date || !liveClass.time || !liveClass.joinUrl) {
          toast({ title: 'Error', description: 'Please fill all fields for the live class.', variant: 'destructive'});
          return;
      }
      setIsSaving(true);
      const result = await scheduleLiveClassAction(courseId, liveClass);
      if (result.success) {
          toast({ title: 'Success!', description: result.message });
          setLiveClasses(prev => prev.map(lc => lc.id === liveClass.id ? result.newLiveClass! : lc));
      } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setIsSaving(false);
  }
  const updateLiveClass = (id: string, field: keyof Omit<LiveClass, 'id'>, value: string) => {
      setLiveClasses(prev => prev.map(lc => lc.id === id ? { ...lc, [field]: value } : lc));
  };
  const removeLiveClass = (id: string) => setLiveClasses(prev => prev.filter(lc => lc.id !== id));

  // Assignment Handlers
  const addAssignment = () => setAssignmentTemplates(p => [...p, { id: `as_${Date.now()}`, title: '', topic: '', deadline: format(new Date(), 'yyyy-MM-dd') }]);
  const updateAssignment = (id: string, field: keyof Omit<AssignmentTemplate, 'id'>, value: string | Date) => {
      setAssignmentTemplates(p => p.map(a => a.id === id ? { ...a, [field]: field === 'deadline' ? format(value as Date, 'yyyy-MM-dd') : value } : a));
  };
  const removeAssignment = (id: string) => setAssignmentTemplates(p => p.filter(a => a.id !== id));

  // Exam Handlers
  const addExam = () => setExamTemplates(p => [...p, { id: `ex_${Date.now()}`, title: '', topic: '', examType: 'MCQ', totalMarks: 100, examDate: format(new Date(), 'yyyy-MM-dd') }]);
  const updateExam = (id: string, field: keyof Omit<ExamTemplate, 'id'>, value: string | number | Date | boolean | Question[]) => {
      setExamTemplates(p => p.map(e => e.id === id ? { ...e, [field]: field === 'examDate' ? format(value as Date, 'yyyy-MM-dd') : value } : e));
  };
  const removeExam = (id: string) => setExamTemplates(p => p.filter(e => e.id !== id));
  
    // Cycle Handlers
  const addCycle = () => {
    setCycles(prev => [...(prev || []), { id: `cy_${Date.now()}`, title: '', description: '', price: '', order: (prev?.length || 0) + 1, moduleIds: [] }]);
  };

  const updateCycle = (id: string, field: keyof Omit<CourseCycle, 'id'>, value: string | number | string[]) => {
    setCycles(prev => prev?.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  const removeCycle = (id: string) => {
    setCycles(prev => prev?.filter(c => c.id !== id));
  };

  const handleDoubtSolverToggle = (solverId: string, add: boolean) => {
    setDoubtSolverIds(prev => {
        if (add) {
            return [...prev, solverId];
        } else {
            return prev.filter(id => id !== solverId);
        }
    });
  };

  const handleSave = async (status: 'Draft' | 'Pending Approval' | 'Published') => {
    if (!courseTitle) {
      toast({ title: 'Validation Error', description: 'Course title cannot be empty.', variant: 'destructive' });
      setActiveTab('details');
      return;
    }
    if (instructors.length === 0) {
        toast({ title: 'Validation Error', description: 'At least one instructor must be added.', variant: 'destructive' });
        setActiveTab('instructors');
        return;
    }

    setIsSaving(true);
    
    // Reconstruct syllabus
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
                quizId: item.quizId || '',
                instructorSlug: item.instructorSlug || '',
            });
        }
    });
    if (currentModule) {
        reconstructedSyllabus.push(currentModule);
    }
    
    const courseData: Partial<Course> = {
        title: courseTitle,
        description: description,
        category: category,
        subCategory: subCategory,
        type: courseType,
        price: `BDT ${price || 0}`,
        discountPrice: discountPrice ? `BDT ${discountPrice}` : '',
        whatsappNumber: whatsappNumber,
        isPrebooking,
        prebookingPrice: isPrebooking ? `BDT ${prebookingPrice || 0}` : '',
        prebookingEndDate: isPrebooking && prebookingEndDate ? format(prebookingEndDate, 'yyyy-MM-dd') : '',
        prebookingTarget: isPrebooking ? prebookingTarget || 0 : 0,
        cycles: cycles?.filter(c => c.title && c.price),
        imageUrl: thumbnailUrl,
        videoUrl: introVideoUrl,
        whatYouWillLearn: whatYouWillLearn.filter(o => o),
        syllabus: reconstructedSyllabus,
        faqs: faqs.map(({ id, ...rest }) => rest).filter(f => f.question && f.answer),
        instructors: instructors.map(i => ({
          name: i.name,
          title: i.title,
          avatarUrl: i.avatarUrl,
          dataAiHint: i.dataAiHint,
          slug: i.slug
        })),
        doubtSolverIds,
        classRoutine: classRoutine.filter(r => r.day && r.subject && r.time),
        announcements: announcements.filter(a => a.title && a.content),
        liveClasses: liveClasses.filter(lc => lc.topic && lc.joinUrl),
        quizTemplates,
        assignmentTemplates: assignmentTemplates.filter(a => a.title),
        examTemplates: examTemplates.filter(e => e.title),
        status,
        organizationId: organizationId,
        communityUrl,
        includedCourseIds,
        isArchived,
        showStudentCount,
    };

    if (!isNewCourse) {
        courseData.id = courseId;
    }
    
    if (initialStatus === 'Published' && status !== 'Published' && userRole !== 'Admin') {
        courseData.status = 'Published';
    }
    
    // Clean data before sending to the server action
    const cleanCourseData = removeUndefinedValues(courseData);
    
    const result = await saveCourseAction(cleanCourseData);

    if (result.success) {
      let toastTitle = 'Draft Saved';
      if (status === 'Pending Approval') {
          toastTitle = 'Course Submitted';
      } else if (status === 'Published') {
          toastTitle = 'Course Published';
      } else if (initialStatus === 'Published') {
          toastTitle = 'Course Updated';
      }
      toast({ 
          title: toastTitle, 
          description: result.message 
      });
      if (isNewCourse && result.courseId) {
        router.replace(`${redirectPath}/builder/${result.courseId}`);
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
  
  const handleGenerateQuiz = async (lesson: LessonData) => {
    try {
      const input: AiQuizGeneratorInput = {
        lessonTitle: lesson.title,
        courseContext: `This lesson is part of the course "${courseTitle}". The course is about: ${description}.`,
      };
      const result = await generateQuizForLesson(input);
      const newQuizTemplate: QuizTemplate = {
          ...result,
          id: `quiz_${Date.now()}`
      };
      
      setQuizTemplates(prev => [...prev, newQuizTemplate]);
      
      updateSyllabusItem(lesson.id, 'quizId', newQuizTemplate.id);
      updateSyllabusItem(lesson.id, 'type', 'quiz'); 

      toast({ title: 'Quiz Generated!', description: `A quiz for "${lesson.title}" has been created and linked.` });
    } catch(err) {
      console.error(err);
      toast({ title: "Error", description: "Could not generate quiz with AI.", variant: "destructive" });
    }
  };
  
  const openQuestionBank = (exam: ExamTemplate) => {
    setSelectedExamForQB(exam);
    setQbSelectedQuestions(exam.questions || []);
    setIsQuestionBankOpen(true);
  };

  const handleAddQuestionsFromBank = () => {
    if (!selectedExamForQB) return;
    const existingQuestionIds = new Set(selectedExamForQB.questions?.map(q => q.id));
    const newQuestions = qbSelectedQuestions.filter(q => !existingQuestionIds.has(q.id));
    const updatedQuestions = [...(selectedExamForQB.questions || []), ...newQuestions];
    updateExam(selectedExamForQB.id, 'questions', updatedQuestions);
    setIsQuestionBankOpen(false);
    setQbSelectedQuestions([]);
    toast({ title: 'Success', description: `${newQuestions.length} questions added to the exam.`});
  };

  const filteredQbQuestions = useMemo(() => {
    return questionBank.filter(q => 
        (qbFilters.subject === 'all' || q.subject === qbFilters.subject) &&
        (qbFilters.chapter === 'all' || q.chapter === qbFilters.chapter) &&
        (qbFilters.difficulty === 'all' || q.difficulty === qbFilters.difficulty)
    );
  }, [questionBank, qbFilters]);


  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'syllabus', label: 'Syllabus', icon: BookCopy },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'outcomes', label: 'Outcomes', icon: Book },
    { id: 'instructors', label: 'Instructors', icon: Users },
    { id: 'doubtsolvers', label: 'Doubt Solvers', icon: HelpCircle },
    { id: 'assignments', label: 'Assignments', icon: ClipboardEdit },
    { id: 'exams', label: 'Exams', icon: Award },
    { id: 'media', label: 'Media', icon: CloudUpload },
    { id: 'routine', label: 'Routine', icon: Calendar },
    { id: 'liveClasses', label: 'Live Classes', icon: Video },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const isPublished = !isNewCourse && initialStatus === 'Published';
  
  const instructorForSelection = useMemo(() => {
    if (userRole === 'Admin') return allInstructors;
    if (userRole === 'Seller') return allInstructors.filter(i => i.organizationId === organizationId);
    return [];
  }, [userRole, allInstructors, organizationId]);

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
                {initialStatus && <Badge className="mt-2">{initialStatus}</Badge>}
            </div>
            <div className="flex gap-2 shrink-0">
                {userRole === 'Admin' && (
                    <Button variant="outline" onClick={() => setIsAiDialogOpen(true)} disabled={isSaving}>
                        <Wand2 className="mr-2 h-4 w-4"/> Generate with AI
                    </Button>
                )}
                <Button variant="outline" onClick={() => handleSave('Draft')} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Save Draft
                </Button>
                {userRole === 'Admin' ? (
                     <Button variant="accent" onClick={() => handleSave('Published')} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} 
                        {isPublished ? 'Update Published Course' : 'Publish Course'}
                    </Button>
                ) : (
                    <Button variant="accent" onClick={() => handleSave('Pending Approval')} disabled={isSaving || isPublished}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} 
                        {isPublished ? 'Published' : 'Submit for Approval'}
                    </Button>
                )}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                              <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                              >
                              {category || "Select a category..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                              <Command onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !allCategories.includes(e.currentTarget.querySelector('input')?.value || '')) {
                                    (e.currentTarget.querySelector('input') as HTMLElement)?.blur();
                                  }
                              }}>
                              <CommandInput placeholder="Search or create..." onValueChange={setCategory}/>
                              <CommandEmpty>No category found. Type to create a new one.</CommandEmpty>
                              <CommandGroup>
                                  {allCategories.map((cat) => (
                                  <CommandItem
                                      key={cat}
                                      value={cat}
                                      onSelect={(currentValue) => {
                                      setCategory(currentValue === category ? "" : currentValue)
                                      }}
                                  >
                                      <Check
                                      className={cn(
                                          "mr-2 h-4 w-4",
                                          category === cat ? "opacity-100" : "opacity-0"
                                      )}
                                      />
                                      {cat}
                                  </CommandItem>
                                  ))}
                              </CommandGroup>
                              </Command>
                          </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub-category">Sub-category</Label>
                      <Input 
                          id="sub-category" 
                          placeholder="e.g., Physics 1st Paper" 
                          value={subCategory} 
                          onChange={e => setSubCategory(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="course-type">Course Type</Label>
                        <Select value={courseType} onValueChange={(value: 'Online' | 'Offline' | 'Hybrid' | 'Exam') => setCourseType(value)}>
                            <SelectTrigger id="course-type">
                                <SelectValue placeholder="Select course type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Online">Online</SelectItem>
                                <SelectItem value="Offline">Offline</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                <SelectItem value="Exam">Exam Batch</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                  {userRole === 'Admin' && (
                    <div className="space-y-2">
                        <Label>Organization (Optional)</Label>
                        <Select value={organizationId} onValueChange={setOrganizationId}>
                            <SelectTrigger><SelectValue placeholder="Select an organization..."/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (RDC Original)</SelectItem>
                                {allOrganizations.map(org => <SelectItem key={org.id} value={org.id!}>{org.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber" className="flex items-center gap-2"><Phone className="h-4 w-4"/> WhatsApp Contact Number (Optional)</Label>
                    <Input id="whatsappNumber" placeholder="e.g., 8801700000000" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} />
                    <CardDescription>If provided, a contact button will appear on the course page.</CardDescription>
                  </div>
                </div>
              </CardContent>
            )}

            {activeTab === 'syllabus' && (
              <CardContent className="pt-6">
                 <p className="text-sm text-muted-foreground mb-4">Assign modules to a cycle in the 'Pricing' tab.</p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                    <SortableContext items={syllabus.map(item => item.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                           {syllabus.map(item => (
                               <SortableSyllabusItem 
                                 key={item.id} 
                                 item={item}
                                 updateItem={updateSyllabusItem}
                                 removeItem={removeSyllabusItem}
                                 onGenerateQuiz={handleGenerateQuiz}
                                 courseInstructors={instructors}
                               />
                           ))}
                        </div>
                    </SortableContext>
                </DndContext>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="w-full border-dashed" onClick={() => addSyllabusItem('module')}><PlusCircle className="mr-2"/> Add Module</Button>
                  <Button variant="outline" className="w-full border-dashed" onClick={() => addSyllabusItem('lesson')}><PlusCircle className="mr-2"/> Add Lesson</Button>
                </div>
              </CardContent>
            )}
            
            {activeTab === 'pricing' && (
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-2 text-lg">Standard Pricing</h3>
                        <div className="space-y-4 p-4 border rounded-md">
                            <div className="space-y-2">
                                <Label htmlFor="price">Full Course Price (BDT)</Label>
                                <Input id="price" type="number" placeholder="e.g., 4500" value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="discountPrice">Discount Price (BDT)</Label>
                                <Input id="discountPrice" type="number" placeholder="e.g., 3000" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} />
                                <CardDescription>Optional. If set, this will be the new full course price.</CardDescription>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-lg">Pre-booking</h3>
                        <div className="p-4 border rounded-md space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="isPrebooking" className="font-semibold">Enable Pre-booking</Label>
                                <Switch id="isPrebooking" checked={isPrebooking} onCheckedChange={setIsPrebooking} />
                            </div>
                            {isPrebooking && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="prebookingPrice">Pre-booking Price (BDT)</Label>
                                        <Input id="prebookingPrice" type="number" placeholder="e.g., 500" value={prebookingPrice} onChange={e => setPrebookingPrice(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pre-booking End Date</Label>
                                        <DatePicker date={prebookingEndDate} setDate={setPrebookingEndDate} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="prebookingTarget">Enrollment Target</Label>
                                        <Input id="prebookingTarget" type="number" placeholder="e.g., 100" value={prebookingTarget} onChange={e => setPrebookingTarget(Number(e.target.value))} />
                                        <CardDescription>Number of students required to launch the course.</CardDescription>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="lg:col-span-2">
                        <h3 className="font-semibold mb-2 text-lg">Cycle Management</h3>
                        <div className="p-4 border rounded-md space-y-4">
                           {(cycles || []).map((cycle, index) => (
                               <Collapsible key={cycle.id} className="p-3 border rounded-md space-y-2 bg-muted/50">
                                   <div className="flex justify-between items-center">
                                       <Label className="font-semibold">Cycle {cycle.order || index + 1}: {cycle.title || 'New Cycle'}</Label>
                                       <div>
                                            <Button variant="ghost" size="icon" onClick={() => removeCycle(cycle.id)}><X className="text-destructive h-4 w-4"/></Button>
                                            <CollapsibleTrigger asChild><Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4"/></Button></CollapsibleTrigger>
                                       </div>
                                   </div>
                                    <CollapsibleContent className="space-y-4 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Title</Label><Input value={cycle.title} onChange={e => updateCycle(cycle.id, 'title', e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Price (BDT)</Label><Input type="number" value={cycle.price} onChange={e => updateCycle(cycle.id, 'price', e.target.value)} /></div>
                                        </div>
                                        <div className="space-y-2"><Label>Description</Label><Textarea value={cycle.description} onChange={e => updateCycle(cycle.id, 'description', e.target.value)} rows={2}/></div>
                                        <div className="space-y-2"><Label>Community URL</Label><Input value={cycle.communityUrl || ''} onChange={e => updateCycle(cycle.id, 'communityUrl', e.target.value)} placeholder="https://facebook.com/groups/..." /></div>
                                        <div className="space-y-2">
                                            <Label>Modules in this Cycle</Label>
                                             <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left h-auto min-h-10">
                                                        <div className="flex flex-wrap gap-1">
                                                            {(cycle.moduleIds && cycle.moduleIds.length > 0) ? cycle.moduleIds.map(id => {
                                                                const module = syllabus.find(s => s.id === id);
                                                                return module ? <Badge key={id} variant="secondary">{module.title}</Badge> : null;
                                                            }) : 'Select Modules...'}
                                                        </div>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search modules..." />
                                                        <CommandEmpty>No modules found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {syllabus.filter(s => s.type === 'module').map(m => (
                                                                <CommandItem key={m.id} onSelect={() => {
                                                                    const currentIds = new Set(cycle.moduleIds || []);
                                                                    if(currentIds.has(m.id)) currentIds.delete(m.id);
                                                                    else currentIds.add(m.id);
                                                                    updateCycle(cycle.id, 'moduleIds', Array.from(currentIds));
                                                                }}>
                                                                     <Check className={cn("mr-2 h-4 w-4", (cycle.moduleIds || []).includes(m.id) ? "opacity-100" : "opacity-0")} />
                                                                     {m.title}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </CollapsibleContent>
                               </Collapsible>
                           ))}
                           <Button variant="outline" className="w-full" onClick={addCycle}><PlusCircle className="mr-2"/>Add Cycle</Button>
                        </div>
                    </div>
                </div>
              </CardContent>
            )}

            {activeTab === 'outcomes' && (
              <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                      <Label>What students will learn</Label>
                      {whatYouWillLearn.map((outcome, index) => (
                          <div key={index} className="flex items-center gap-2">
                              <Input value={outcome} onChange={e => updateOutcome(index, e.target.value)} placeholder="e.g., Fundamentals of React" />
                              <Button variant="ghost" size="icon" onClick={() => removeOutcome(index)}><X className="text-destructive"/></Button>
                          </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={addOutcome}><PlusCircle className="mr-2"/>Add Learning Outcome</Button>
                  </div>
              </CardContent>
            )}

            {activeTab === 'instructors' && (
              <CardContent className="pt-6 space-y-4">
                   <div className="space-y-2">
                        <Label>Assigned Instructors</Label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-12">
                            {instructors.length === 0 && <p className="text-sm text-muted-foreground">No instructors assigned.</p>}
                            {instructors.map(inst => (
                                <Badge key={inst.slug} variant="outline" className="p-2 gap-2">
                                    <Avatar className="h-6 w-6"><AvatarImage src={inst.avatarUrl} /><AvatarFallback>{inst.name.charAt(0)}</AvatarFallback></Avatar>
                                    {inst.name}
                                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => removeInstructor(inst.slug)}><X className="h-3 w-3"/></Button>
                                </Badge>
                            ))}
                        </div>
                   </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full"><PlusCircle className="mr-2"/>Add Instructor</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search instructors..." />
                                <CommandEmpty>No instructor found.</CommandEmpty>
                                <CommandGroup>
                                    {instructorForSelection.filter(inst => !instructors.some(i => i.slug === inst.slug)).map(inst => (
                                        <CommandItem key={inst.id} onSelect={() => addInstructor(inst)}>
                                            <Avatar className="h-6 w-6 mr-2"><AvatarImage src={inst.avatarUrl} /><AvatarFallback>{inst.name.charAt(0)}</AvatarFallback></Avatar>
                                            {inst.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
              </CardContent>
            )}

            {activeTab === 'doubtsolvers' && (
              <CardContent className="pt-6 space-y-4">
                   <div className="space-y-2">
                        <Label>Assigned Doubt Solvers</Label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-12">
                            {doubtSolverIds.length === 0 && <p className="text-sm text-muted-foreground">No doubt solvers assigned.</p>}
                            {allDoubtSolvers.filter(ds => doubtSolverIds.includes(ds.uid)).map(solver => (
                                <Badge key={solver.uid} variant="outline" className="p-2 gap-2">
                                    <Avatar className="h-6 w-6"><AvatarImage src={solver.avatarUrl} /><AvatarFallback>{solver.name.charAt(0)}</AvatarFallback></Avatar>
                                    {solver.name}
                                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => handleDoubtSolverToggle(solver.uid, false)}><X className="h-3 w-3"/></Button>
                                </Badge>
                            ))}
                        </div>
                   </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full"><PlusCircle className="mr-2"/>Assign Doubt Solver</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search doubt solvers..." />
                                <CommandEmpty>No doubt solvers found.</CommandEmpty>
                                <CommandGroup>
                                    {allDoubtSolvers.filter(solver => !doubtSolverIds.includes(solver.uid)).map(solver => (
                                        <CommandItem key={solver.id} onSelect={() => handleDoubtSolverToggle(solver.uid, true)}>
                                            <Avatar className="h-6 w-6 mr-2"><AvatarImage src={solver.avatarUrl} /><AvatarFallback>{solver.name.charAt(0)}</AvatarFallback></Avatar>
                                            {solver.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
              </CardContent>
            )}

            {activeTab === 'assignments' && (
                <CardContent className="pt-6 space-y-4">
                    {assignmentTemplates.map((assignment, index) => (
                        <div key={assignment.id} className="p-4 border rounded-md space-y-2 bg-muted/50">
                            <div className="flex justify-between items-center"><Label className="font-semibold">Assignment {index + 1}</Label><Button variant="ghost" size="icon" onClick={() => removeAssignment(assignment.id)}><X className="text-destructive h-4 w-4"/></Button></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Title</Label><Input value={assignment.title} onChange={e => updateAssignment(assignment.id, 'title', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Topic</Label><Input value={assignment.topic} onChange={e => updateAssignment(assignment.id, 'topic', e.target.value)} /></div>
                            </div>
                            <div className="space-y-2"><Label>Deadline</Label><DatePicker date={assignment.deadline ? new Date(assignment.deadline as string) : new Date()} setDate={(date) => updateAssignment(assignment.id, 'deadline', date!)} /></div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addAssignment}><PlusCircle className="mr-2"/>Add Assignment Template</Button>
                </CardContent>
            )}

            {activeTab === 'exams' && (
                <CardContent className="pt-6 space-y-4">
                    {examTemplates.map((exam, index) => (
                         <Collapsible key={exam.id} className="p-4 border rounded-lg space-y-2 relative bg-muted/50">
                            <div className="flex justify-between items-center"><Label className="font-semibold">Exam: {exam.title || `Exam ${index + 1}`}</Label>
                                <div>
                                    <Button variant="ghost" size="icon" onClick={() => removeExam(exam.id)}><X className="text-destructive h-4 w-4"/></Button>
                                    <CollapsibleTrigger asChild><Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4"/></Button></CollapsibleTrigger>
                                </div>
                            </div>
                            <CollapsibleContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={exam.title} onChange={e => updateExam(exam.id, 'title', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Exam Type</Label>
                                        <Select value={exam.examType} onValueChange={(value) => updateExam(exam.id, 'examType', value)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent><SelectItem value="MCQ">MCQ</SelectItem><SelectItem value="Written">Written</SelectItem><SelectItem value="Oral">Oral</SelectItem><SelectItem value="Practical">Practical</SelectItem><SelectItem value="Essay">Essay</SelectItem><SelectItem value="Short Answer">Short Answer</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2"><Label>Topic</Label><Input value={exam.topic} onChange={e => updateExam(exam.id, 'topic', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Total Marks</Label><Input type="number" value={exam.totalMarks} onChange={e => updateExam(exam.id, 'totalMarks', Number(e.target.value))} /></div>
                                    <div className="space-y-2"><Label>Exam Date</Label><DatePicker date={exam.examDate ? new Date(exam.examDate as string) : new Date()} setDate={(date) => updateExam(exam.id, 'examDate', date!)} /></div>
                                </div>
                                 <div className="space-y-2 pt-4 border-t">
                                    <Label className="font-semibold">Questions</Label>
                                    <div className="space-y-2">
                                        {(exam.questions || []).map(q => <Badge key={q.id}>{q.text.substring(0, 30)}...</Badge>)}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => openQuestionBank(exam)}>
                                        <Database className="mr-2 h-4 w-4"/>
                                        Add from Question Bank
                                    </Button>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addExam}><PlusCircle className="mr-2"/>Add Exam Template</Button>
                </CardContent>
            )}

            {activeTab === 'media' && (
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
                    <Input id="thumbnail" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
                    <div className="mt-2 rounded-lg border overflow-hidden aspect-video relative max-w-sm bg-muted">
                      <Image src={thumbnailUrl} alt="Thumbnail Preview" fill className="object-cover" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="introVideo">Intro Video URL</Label>
                    <Input id="introVideo" value={introVideoUrl} onChange={e => setIntroVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."/>
                </div>
              </CardContent>
            )}
            
            {activeTab === 'routine' && (
                <CardContent className="pt-6 space-y-4">
                    {classRoutine.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                            <Select value={item.day} onValueChange={value => updateRoutineRow(item.id, 'day', value)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Saturday">Saturday</SelectItem>
                                    <SelectItem value="Sunday">Sunday</SelectItem>
                                    <SelectItem value="Monday">Monday</SelectItem>
                                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                                    <SelectItem value="Thursday">Thursday</SelectItem>
                                    <SelectItem value="Friday">Friday</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input placeholder="Subject Name" value={item.subject} onChange={e => updateRoutineRow(item.id, 'subject', e.target.value)} />
                            <Input placeholder="Time (e.g., 7:00 PM)" value={item.time} onChange={e => updateRoutineRow(item.id, 'time', e.target.value)} />
                            <Button variant="ghost" size="icon" onClick={() => removeRoutineRow(item.id)}><X className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addRoutineRow}><PlusCircle className="mr-2"/>Add Routine Row</Button>
                </CardContent>
            )}

            {activeTab === 'liveClasses' && (
                <CardContent className="pt-6 space-y-4">
                    {liveClasses.map(lc => (
                        <Collapsible key={lc.id} className="p-4 border rounded-lg space-y-2 relative bg-muted/50">
                            <div className="flex justify-between items-start"><h4 className="font-semibold pt-2">{lc.topic || 'New Live Class'}</h4><div><Button variant="ghost" size="icon" onClick={() => removeLiveClass(lc.id)}><X className="text-destructive h-4 w-4"/></Button><CollapsibleTrigger asChild><Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4"/></Button></CollapsibleTrigger></div></div>
                            <CollapsibleContent className="space-y-4 pt-2">
                                <div className="space-y-2"><Label>Topic</Label><Input value={lc.topic} onChange={e => updateLiveClass(lc.id, 'topic', e.target.value)} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Date</Label><Input type="date" value={lc.date} onChange={e => updateLiveClass(lc.id, 'date', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Time</Label><Input type="time" value={lc.time} onChange={e => updateLiveClass(lc.id, 'time', e.target.value)} /></div>
                                </div>
                                 <div className="space-y-2"><Label>Platform</Label>
                                    <Select value={lc.platform} onValueChange={(value) => updateLiveClass(lc.id, 'platform', value)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent><SelectItem value="YouTube Live">YouTube Live</SelectItem><SelectItem value="Facebook Live">Facebook Live</SelectItem><SelectItem value="Zoom">Zoom</SelectItem><SelectItem value="Google Meet">Google Meet</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label>Join URL</Label><Input value={lc.joinUrl} onChange={e => updateLiveClass(lc.id, 'joinUrl', e.target.value)} /></div>
                                <Button size="sm" onClick={() => handleScheduleLiveClass(lc)} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                    Schedule & Notify Students
                                </Button>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addLiveClass}><PlusCircle className="mr-2"/>Add Live Class</Button>
                </CardContent>
            )}

            {activeTab === 'announcements' && (
                <CardContent className="pt-6 space-y-4">
                    {announcements.map(ann => (
                        <div key={ann.id} className="p-4 border rounded-md space-y-2 bg-muted/50">
                            <div className="flex justify-between items-center"><Label className="font-semibold">Announcement</Label><Button variant="ghost" size="icon" onClick={() => removeAnnouncement(ann.id)}><X className="text-destructive h-4 w-4"/></Button></div>
                            <div className="space-y-2"><Label>Title</Label><Input value={ann.title} onChange={e => updateAnnouncement(ann.id, 'title', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Content</Label><Textarea value={ann.content} onChange={e => updateAnnouncement(ann.id, 'content', e.target.value)} /></div>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addAnnouncement}><PlusCircle className="mr-2"/>Add Announcement</Button>
                </CardContent>
            )}

            {activeTab === 'faq' && (
                <CardContent className="pt-6 space-y-4">
                    {faqs.map((faq, index) => (
                         <Collapsible key={faq.id} className="p-4 border rounded-lg space-y-2 relative bg-muted/50">
                            <div className="flex justify-between items-start"><h4 className="font-semibold pt-2">FAQ {index + 1}</h4><div><Button variant="ghost" size="icon" onClick={() => removeFaq(faq.id)}><X className="text-destructive h-4 w-4"/></Button><CollapsibleTrigger asChild><Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4"/></Button></CollapsibleTrigger></div></div>
                            <CollapsibleContent className="space-y-4">
                                <div className="space-y-2"><Label>Question</Label><Input value={faq.question} onChange={e => updateFaq(faq.id, 'question', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Answer</Label><Textarea value={faq.answer} onChange={e => updateFaq(faq.id, 'answer', e.target.value)} rows={3}/></div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addFaq}><PlusCircle className="mr-2"/>Add FAQ</Button>
                </CardContent>
            )}

            {activeTab === 'settings' && (
                <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="communityUrl" className="flex items-center gap-2"><LinkIcon className="h-4 w-4"/> Full Course Community URL</Label>
                        <Input id="communityUrl" value={communityUrl} onChange={e => setCommunityUrl(e.target.value)} placeholder="https://facebook.com/groups/..." />
                        <CardDescription>The main Facebook/Discord group link for the entire course. Cycle-specific links can be set under the 'Pricing' tab.</CardDescription>
                    </div>
                    <div className="space-y-4">
                        <Label>Bundled Courses</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left h-auto min-h-10">
                                    <div className="flex flex-wrap gap-1">
                                    {includedCourseIds.length > 0
                                        ? allCourses.filter(c => includedCourseIds.includes(c.id!)).map(c => <Badge key={c.id} variant="secondary">{c.title}</Badge>)
                                        : "Select courses to bundle..."}
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search courses..."/>
                                    <CommandEmpty>No courses found.</CommandEmpty>
                                    <CommandGroup>
                                    {allCourses.filter(c => c.id !== courseId).map(c => (
                                        <CommandItem
                                            key={c.id}
                                            onSelect={() => {
                                                const newSelection = includedCourseIds.includes(c.id!)
                                                ? includedCourseIds.filter(id => id !== c.id)
                                                : [...includedCourseIds, c.id!];
                                                setIncludedCourseIds(newSelection);
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", includedCourseIds.includes(c.id!) ? "opacity-100" : "opacity-0")} />
                                            {c.title}
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <p className="text-sm text-muted-foreground">Students enrolling in this course will automatically get access to the selected bundled courses.</p>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="showStudentCount" className="font-semibold">Show Student Count</Label>
                            <p className="text-sm text-muted-foreground">Display the total number of enrolled students on the public course page.</p>
                        </div>
                        <Switch id="showStudentCount" checked={showStudentCount} onCheckedChange={setShowStudentCount} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="archive" className="font-semibold text-destructive">Archive This Course</Label>
                            <p className="text-sm text-muted-foreground">Archived courses will not be visible to the public or for new enrollments.</p>
                        </div>
                        <Switch id="archive" checked={isArchived} onCheckedChange={setIsArchived} />
                    </div>
                </CardContent>
            )}
        </Card>

        {/* AI Generator Dialog */}
        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate Course with AI</DialogTitle>
                    <DialogDescription>Enter a topic and let AI generate a draft for your course structure.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ai-topic">Course Topic</Label>
                        <Input id="ai-topic" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g., Introduction to Quantum Physics"/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleGenerateCourse} disabled={isGenerating || !aiTopic}>
                        {isGenerating && <Loader2 className="mr-2 animate-spin"/>} Generate Content
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Question Bank Dialog */}
        <Dialog open={isQuestionBankOpen} onOpenChange={setIsQuestionBankOpen}>
          <DialogContent className="max-w-4xl">
              <DialogHeader>
                  <DialogTitle>Add Questions from Bank</DialogTitle>
                  <DialogDescription>Select questions to add to the exam: "{selectedExamForQB?.title}".</DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-2 p-4 border-b">
                 <Select value={qbFilters.subject} onValueChange={(v) => setQbFilters(f => ({...f, subject: v}))}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Subject" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Subjects</SelectItem>{[...new Set(questionBank.map(q => q.subject).filter(Boolean))] .map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}</SelectContent>
                </Select>
                 <Select value={qbFilters.chapter} onValueChange={(v) => setQbFilters(f => ({...f, chapter: v}))}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Chapter" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Chapters</SelectItem>{[...new Set(questionBank.map(q => q.chapter).filter(Boolean))] .map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}</SelectContent>
                </Select>
                 <Select value={qbFilters.difficulty} onValueChange={(v) => setQbFilters(f => ({...f, difficulty: v}))}><SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Filter by Difficulty" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Difficulties</SelectItem><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="max-h-[50vh] overflow-y-auto p-4">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>Question</TableHead>
                              <TableHead>Type</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {filteredQbQuestions.map(q => (
                              <TableRow key={q.id}>
                                  <TableCell>
                                      <Checkbox 
                                        checked={qbSelectedQuestions.some(sq => sq.id === q.id)}
                                        onCheckedChange={(checked) => {
                                            if(checked) {
                                                setQbSelectedQuestions(prev => [...prev, q]);
                                            } else {
                                                setQbSelectedQuestions(prev => prev.filter(sq => sq.id !== q.id));
                                            }
                                        }}
                                      />
                                  </TableCell>
                                  <TableCell>{q.text}</TableCell>
                                  <TableCell><Badge variant="outline">{q.type}</Badge></TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsQuestionBankOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddQuestionsFromBank}>Add Selected Questions</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}

    