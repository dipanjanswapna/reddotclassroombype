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
  BookOpen,
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
  Trash2,
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
import { Course, SyllabusModule, AssignmentTemplate, Instructor, Announcement, LiveClass, ExamTemplate, Question, Lesson, CourseCycle, Organization, User, QuizTemplate } from '@/lib/types';
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
import { Separator } from './ui/separator';

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
                  className="text-destructive hover:bg-destructive/10" 
                  aria-label="Remove Item"
                  onClick={() => removeItem(item.id)}
                >
                    <Trash2 className="h-4 w-4" />
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
                  className="text-destructive hover:bg-destructive/10" 
                  aria-label="Remove Item"
                  onClick={() => removeItem(item.id)}
                >
                    <Trash2 className="h-4 w-4" />
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
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
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
                <h1 className="font-headline text-3xl font-black uppercase tracking-tight text-green-700 dark:text-green-500">
                    {isNewCourse ? 'Create New Course' : `Edit: ${courseTitle}`}
                </h1>
                <p className="mt-1 text-lg text-muted-foreground font-medium">
                   {isNewCourse ? 'Build a new academic foundation.' : 'Optimize your program content.'}
                </p>
                <div className="h-1 w-16 bg-primary mt-2 rounded-full shadow-sm" />
            </div>
            <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={() => handleSave('Draft')} disabled={isSaving} className="font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl border-2 shadow-sm active:scale-95 transition-all">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Save Draft
                </Button>
                {userRole === 'Admin' ? (
                     <Button variant="accent" onClick={() => handleSave('Published')} disabled={isSaving} className="font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white active:scale-95 transition-all">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} 
                        {isPublished ? 'Update Published' : 'Publish Course'}
                    </Button>
                ) : (
                    <Button variant="accent" onClick={() => handleSave('Pending Approval')} disabled={isSaving || isPublished} className="font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white active:scale-95 transition-all">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} 
                        {isPublished ? 'Published' : 'Submit Approval'}
                    </Button>
                )}
            </div>
        </div>
        
        <Card className="rounded-[2.5rem] border-primary/10 shadow-2xl overflow-hidden">
            <CardHeader className="p-0 border-b border-primary/5 bg-muted/30">
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-1 p-1">
                        {tabs.map(tab => (
                            <Button 
                                key={tab.id}
                                variant="ghost"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "rounded-xl shrink-0 font-black uppercase text-[10px] tracking-widest px-6 h-14 transition-all",
                                    activeTab === tab.id ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-primary/5'
                                )}
                            >
                                <tab.icon className="mr-2 h-4 w-4"/>
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            
            <div className="p-6 md:p-10">
                {activeTab === 'details' && (
                    <div className="space-y-10">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Program Title</Label>
                        <Input id="title" placeholder="e.g., HSC 2025 Physics Crash Course" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="h-14 rounded-2xl text-lg font-bold border-2 focus-visible:ring-primary shadow-sm" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Executive Summary</Label>
                        <Textarea id="description" placeholder="Describe the program's value proposition..." rows={6} value={description} onChange={e => setDescription(e.target.value)} className="rounded-2xl text-base border-2 focus-visible:ring-primary p-4 shadow-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <Label htmlFor="category" className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Taxonomy Category</Label>
                            <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between h-14 rounded-2xl border-2 font-bold shadow-sm"
                                >
                                {category || "Select a category..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 rounded-2xl overflow-hidden shadow-2xl">
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
                        <Label htmlFor="sub-category" className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Sub-category</Label>
                        <Input 
                            id="sub-category" 
                            placeholder="e.g., Physics 1st Paper" 
                            value={subCategory} 
                            onChange={e => setSubCategory(e.target.value)} 
                            className="h-14 rounded-2xl border-2 font-bold shadow-sm"
                        />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="course-type" className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Delivery Mode</Label>
                            <Select value={courseType} onValueChange={(value: 'Online' | 'Offline' | 'Hybrid' | 'Exam') => setCourseType(value)}>
                                <SelectTrigger id="course-type" className="h-14 rounded-2xl border-2 font-bold shadow-sm">
                                    <SelectValue placeholder="Select course type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
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
                            <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Provider Organization (Optional)</Label>
                            <Select value={organizationId} onValueChange={setOrganizationId}>
                                <SelectTrigger className="h-14 rounded-2xl border-2 font-bold shadow-sm"><SelectValue placeholder="Select an organization..."/></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="none">None (RDC Original)</SelectItem>
                                    {allOrganizations.map(org => <SelectItem key={org.id} value={org.id!}>{org.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="whatsappNumber" className="flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] text-primary/60"><Phone className="h-3 w-3"/> Support WhatsApp (Optional)</Label>
                        <Input id="whatsappNumber" placeholder="e.g., 8801700000000" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className="h-14 rounded-2xl border-2 font-bold shadow-sm" />
                        <CardDescription className="font-medium text-xs">A direct hotline button will appear on the public page.</CardDescription>
                    </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="space-y-10">
                        <div className="bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10 flex items-center gap-4 shadow-inner">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-bold text-foreground leading-relaxed">Design your program roadmap. Modules can be assigned to individual payment cycles for flexible enrollment.</p>
                        </div>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={syllabus.map(item => item.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-4">
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
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <Button variant="outline" className="flex-1 h-14 border-dashed border-2 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:bg-primary/5 transition-all" onClick={() => addSyllabusItem('module')}><PlusCircle className="mr-2 h-5 w-5"/> Inject Module</Button>
                            <Button variant="outline" className="flex-1 h-14 border-dashed border-2 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:bg-primary/5 transition-all" onClick={() => addSyllabusItem('lesson')}><PlusCircle className="mr-2 h-5 w-5"/> Inject Lesson</Button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'pricing' && (
                    <div className="space-y-14">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <h3 className="font-black uppercase tracking-tight text-lg flex items-center gap-2"><DollarSign className="text-primary h-5 w-5"/> Standard Revenue</h3>
                                <div className="space-y-6 p-8 border-2 rounded-[2.5rem] bg-card shadow-xl">
                                    <div className="space-y-2">
                                        <Label htmlFor="price" className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Global List Price (BDT)</Label>
                                        <Input id="price" type="number" placeholder="4500" value={price} onChange={e => setPrice(e.target.value)} className="h-14 rounded-2xl border-2 font-bold text-xl text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="discountPrice" className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Limited Discount Price (BDT)</Label>
                                        <Input id="discountPrice" type="number" placeholder="3000" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} className="h-14 rounded-2xl border-2 font-bold text-xl text-green-600" />
                                        <CardDescription className="font-medium text-xs">Optional. The final price shown to the student.</CardDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-black uppercase tracking-tight text-lg flex items-center gap-2"><Calendar className="text-primary h-5 w-5"/> Pre-booking Phase</h3>
                                <div className="p-8 border-2 rounded-[2.5rem] bg-muted/10 shadow-xl space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="isPrebooking" className="font-black uppercase text-base tracking-tight">Active Campaign</Label>
                                            <p className="text-xs text-muted-foreground font-medium">Launch pre-sales before content is live.</p>
                                        </div>
                                        <Switch id="isPrebooking" checked={isPrebooking} onCheckedChange={setIsPrebooking} className="data-[state=checked]:bg-primary" />
                                    </div>
                                    {isPrebooking && (
                                        <div className="space-y-6 pt-6 border-t border-primary/10">
                                            <div className="space-y-2">
                                                <Label htmlFor="prebookingPrice" className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Campaign Price (BDT)</Label>
                                                <Input id="prebookingPrice" type="number" placeholder="500" value={prebookingPrice} onChange={e => setPrebookingPrice(e.target.value)} className="h-14 rounded-2xl border-2 font-bold text-xl text-primary" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Campaign Expiration</Label>
                                                <DatePicker date={prebookingEndDate} setDate={setPrebookingEndDate} className="h-14 rounded-2xl border-2" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="prebookingTarget" className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Enrollment Goal</Label>
                                                <Input id="prebookingTarget" type="number" placeholder="100" value={prebookingTarget} onChange={e => setPrebookingTarget(Number(e.target.value))} className="h-14 rounded-2xl border-2 font-bold text-xl" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <h3 className="font-black uppercase tracking-tight text-lg flex items-center gap-2"><BookOpen className="text-primary h-5 w-5"/> Cycle Structure</h3>
                            <div className="p-8 border-2 rounded-[3rem] bg-muted/20 space-y-8 shadow-inner">
                                {(cycles || []).map((cycle, index) => (
                                    <Card key={cycle.id} className="rounded-[2.5rem] border-primary/10 overflow-hidden shadow-2xl group transition-all hover:border-primary/40 bg-card">
                                        <CardHeader className="bg-primary/5 flex flex-row items-center justify-between p-8 border-b border-primary/5">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">{cycle.order || index + 1}</div>
                                                <CardTitle className="text-xl font-black uppercase tracking-tight text-primary">{cycle.title || 'New Enrollment Cycle'}</CardTitle>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeCycle(cycle.id)} className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl transition-all"><Trash2 className="h-5 w-5"/></Button>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Cycle Identifier</Label><Input value={cycle.title} onChange={e => updateCycle(cycle.id, 'title', e.target.value)} className="h-14 rounded-2xl border-2 font-bold text-lg focus-visible:ring-primary" placeholder="e.g., Physics Semester 1" /></div>
                                                <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Cycle Price (BDT)</Label><Input type="number" value={cycle.price} onChange={e => updateCycle(cycle.id, 'price', e.target.value)} className="h-14 rounded-2xl border-2 font-bold text-xl text-primary" placeholder="1500" /></div>
                                            </div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Cycle Summary</Label><Textarea value={cycle.description} onChange={e => updateCycle(cycle.id, 'description', e.target.value)} rows={3} className="rounded-2xl border-2 p-4 font-medium" placeholder="Explain what this specific cycle offers..." /></div>
                                            <div className="space-y-2 pt-4 border-t border-primary/5">
                                                <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary">Content Entitlement</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start text-left h-auto min-h-[4rem] rounded-2xl border-2 border-dashed p-4 hover:bg-primary/5 transition-all">
                                                            <div className="flex flex-wrap gap-2">
                                                                {(cycle.moduleIds && cycle.moduleIds.length > 0) ? cycle.moduleIds.map(id => {
                                                                    const module = syllabus.find(s => s.id === id);
                                                                    return module ? <Badge key={id} variant="secondary" className="rounded-xl px-3 py-1 font-bold text-[10px] uppercase tracking-wider">{module.title}</Badge> : null;
                                                                }) : <span className="text-muted-foreground font-medium italic opacity-60">Authorize specific modules for this cycle...</span>}
                                                            </div>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl overflow-hidden shadow-2xl border-primary/20">
                                                        <Command>
                                                            <CommandInput placeholder="Search modules..." className="h-12" />
                                                            <CommandEmpty className="p-4 text-center font-medium">No modules found.</CommandEmpty>
                                                            <CommandGroup className="p-2">
                                                                {syllabus.filter(s => s.type === 'module').map(m => (
                                                                    <CommandItem key={m.id} onSelect={() => {
                                                                        const currentIds = new Set(cycle.moduleIds || []);
                                                                        if(currentIds.has(m.id)) currentIds.delete(m.id);
                                                                        else currentIds.add(m.id);
                                                                        updateCycle(cycle.id, 'moduleIds', Array.from(currentIds));
                                                                    }} className="rounded-xl p-3 hover:bg-primary/5 cursor-pointer transition-colors">
                                                                        <Check className={cn("mr-3 h-5 w-5 text-primary", (cycle.moduleIds || []).includes(m.id) ? "opacity-100" : "opacity-0")} />
                                                                        <span className="font-bold">{m.title}</span>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button variant="outline" className="w-full h-16 border-dashed border-2 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-sm hover:bg-primary/5 transition-all group" onClick={addCycle}>
                                    <PlusCircle className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform"/> 
                                    Create Entitlement Cycle
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'instructors' && (
                    <div className="space-y-10">
                        <div className="text-center md:text-left">
                            <h3 className="font-black uppercase tracking-tight text-xl">Program Mentors</h3>
                            <p className="text-muted-foreground font-medium mt-1">Assign expert educators to lead this program.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {instructors.map(inst => (
                                <Card key={inst.slug} className="rounded-[2rem] border-primary/10 overflow-hidden group shadow-xl transition-all hover:border-primary/40">
                                    <CardHeader className="p-0">
                                        <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                                            <Image src={inst.avatarUrl} alt={inst.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute top-4 right-4">
                                                <Button variant="destructive" size="icon" onClick={() => removeInstructor(inst.slug)} className="rounded-2xl shadow-2xl h-10 w-10 hover:scale-110 active:scale-95 transition-all"><X className="h-5 w-5"/></Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 text-center">
                                        <p className="font-black uppercase tracking-tight text-base leading-tight group-hover:text-primary transition-colors">{inst.name}</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2 opacity-70">{inst.title}</p>
                                    </CardContent>
                                </Card>
                            ))}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="aspect-[4/5] h-full flex-col gap-6 border-dashed border-4 rounded-[2.5rem] border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary group/add">
                                        <div className="p-6 bg-muted/50 rounded-full group-hover/add:bg-primary/10 transition-colors">
                                            <PlusCircle className="h-12 w-12" />
                                        </div>
                                        <span className="font-black uppercase tracking-[0.25em] text-[10px]">Appoint Mentor</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0 rounded-[2rem] overflow-hidden shadow-2xl border-primary/20">
                                    <Command>
                                        <CommandInput placeholder="Find instructors..." className="h-12" />
                                        <CommandEmpty className="p-4 text-center font-medium">None found.</CommandEmpty>
                                        <CommandGroup className="p-2">
                                            {instructorForSelection.filter(inst => !instructors.some(i => i.slug === inst.slug)).map(inst => (
                                                <CommandItem key={inst.id} onSelect={() => addInstructor(inst)} className="p-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm"><AvatarImage src={inst.avatarUrl} /><AvatarFallback>{inst.name.charAt(0)}</AvatarFallback></Avatar>
                                                        <div>
                                                            <p className="font-black text-sm uppercase tracking-tight">{inst.name}</p>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{inst.title}</p>
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                )}

                {activeTab === 'doubtsolvers' && (
                    <div className="space-y-10">
                        <div className="text-center md:text-left">
                            <h3 className="font-black uppercase tracking-tight text-xl">Question Resolution Experts</h3>
                            <p className="text-muted-foreground font-medium mt-1">Assign dedicated solvers to handle 24/7 student queries.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {allDoubtSolvers.filter(ds => doubtSolverIds.includes(ds.uid)).map(solver => (
                                <Card key={solver.uid} className="rounded-[2.5rem] border-primary/10 overflow-hidden text-center group shadow-xl bg-card transition-all hover:border-primary/40">
                                    <CardContent className="p-8">
                                        <div className="relative inline-block">
                                            <Avatar className="h-24 w-24 mx-auto border-4 border-primary/5 shadow-inner">
                                                <AvatarImage src={solver.avatarUrl} />
                                                <AvatarFallback className="font-black text-xl">{solver.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <Button variant="destructive" size="icon" onClick={() => handleDoubtSolverToggle(solver.uid, false)} className="absolute -top-2 -right-2 h-8 w-8 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"><X className="h-4 w-4"/></Button>
                                        </div>
                                        <p className="font-black uppercase tracking-tight text-base mt-6 leading-tight">{solver.name}</p>
                                        <Badge variant="outline" className="mt-3 font-black text-[9px] uppercase tracking-[0.2em] border-primary/20 px-4 py-1 rounded-full">Expert Solver</Badge>
                                    </CardContent>
                                </Card>
                            ))}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-full min-h-[16rem] flex-col gap-4 border-dashed border-2 rounded-[2.5rem] border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary group/ds">
                                        <div className="p-5 bg-muted/50 rounded-full group-hover/ds:bg-primary/10 transition-colors">
                                            <PlusCircle className="h-10 w-10" />
                                        </div>
                                        <span className="font-black uppercase tracking-[0.2em] text-[9px]">Assign Support Expert</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0 rounded-[2rem] overflow-hidden shadow-2xl border-primary/20">
                                    <Command>
                                        <CommandInput placeholder="Find experts..." className="h-12" />
                                        <CommandEmpty className="p-4 text-center font-medium">None found.</CommandEmpty>
                                        <CommandGroup className="p-2">
                                            {allDoubtSolvers.filter(solver => !doubtSolverIds.includes(solver.uid)).map(solver => (
                                                <CommandItem key={solver.id} onSelect={() => handleDoubtSolverToggle(solver.uid, true)} className="p-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm"><AvatarImage src={solver.avatarUrl} /><AvatarFallback>{solver.name.charAt(0)}</AvatarFallback></Avatar>
                                                        <div>
                                                            <p className="font-black text-sm uppercase tracking-tight">{solver.name}</p>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{solver.email}</p>
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                )}

                {activeTab === 'assignments' && (
                    <div className="space-y-10">
                        <div className="text-center md:text-left">
                            <h3 className="font-black uppercase tracking-tight text-xl">Learning Tasks</h3>
                            <p className="text-muted-foreground font-medium mt-1">Define submission requirements for enrolled students.</p>
                        </div>
                        <div className="space-y-6">
                            {assignmentTemplates.map((assignment, index) => (
                                <Card key={assignment.id} className="rounded-[2.5rem] border-primary/10 shadow-lg overflow-hidden bg-card transition-all hover:border-primary/40">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="space-y-1">
                                                <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-[0.25em] rounded-full px-4 py-1 shadow-sm">Milestone Task {index + 1}</Badge>
                                                <h4 className="text-lg font-black uppercase tracking-tight pt-2">{assignment.title || 'Untitled Task'}</h4>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeAssignment(assignment.id)} className="text-destructive h-10 w-10 hover:bg-destructive/10 rounded-xl transition-all"><Trash2 className="h-5 w-5"/></Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Task Title</Label><Input value={assignment.title} onChange={e => updateAssignment(assignment.id, 'title', e.target.value)} className="h-14 rounded-2xl border-2 font-bold shadow-sm" placeholder="e.g., Quantum Mechanics Homework" /></div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Target Topic</Label><Input value={assignment.topic} onChange={e => updateAssignment(assignment.id, 'topic', e.target.value)} className="h-14 rounded-2xl border-2 font-bold shadow-sm" placeholder="e.g., Chapter 5: Atomic Models" /></div>
                                        </div>
                                        <div className="mt-8 max-w-xs"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60 block mb-3">Hard Deadline</Label><DatePicker date={assignment.deadline ? new Date(assignment.deadline as string) : new Date()} setDate={(date) => updateAssignment(assignment.id, 'deadline', date!)} className="h-14 rounded-2xl border-2 shadow-sm" /></div>
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" className="w-full h-16 border-dashed border-2 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-sm hover:bg-primary/5 transition-all group" onClick={addAssignment}>
                                <PlusCircle className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform"/> 
                                Define New Assignment Template
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-10">
                        <div className="text-center md:text-left">
                            <h3 className="font-black uppercase tracking-tight text-xl">Evaluation Roadmap</h3>
                            <p className="text-muted-foreground font-medium mt-1">Schedule academic assessments and mock tests.</p>
                        </div>
                        <div className="space-y-6">
                            {examTemplates.map((exam, index) => (
                                <Collapsible key={exam.id} className="rounded-[2.5rem] border-2 border-primary/10 bg-card shadow-xl group overflow-hidden transition-all hover:border-primary/40">
                                    <div className="flex justify-between items-center p-8 bg-primary/5 border-b border-primary/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-2xl shadow-inner">
                                                <Award className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="font-black uppercase text-base tracking-tight leading-tight block">{exam.title || `Mock Exam ${index + 1}`}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground italic">Template ID: {exam.id.slice(0,8)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button variant="ghost" size="icon" onClick={() => removeExam(exam.id)} className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl transition-all"><Trash2 className="h-5 w-5"/></Button>
                                            <CollapsibleTrigger asChild><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 transition-all group-data-[state=open]:bg-primary/10"><ChevronDown className="h-5 w-5 transition-transform duration-500 group-data-[state=open]:rotate-180"/></Button></CollapsibleTrigger>
                                        </div>
                                    </div>
                                    <CollapsibleContent className="p-8 space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-2 md:col-span-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Examination Title</Label><Input value={exam.title} onChange={e => updateExam(exam.id, 'title', e.target.value)} className="h-14 rounded-2xl border-2 font-bold text-lg focus-visible:ring-primary shadow-sm" placeholder="e.g., Monthly Assessment - October" /></div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Assesment Strategy</Label>
                                                <Select value={exam.examType} onValueChange={(value) => updateExam(exam.id, 'examType', value)}>
                                                    <SelectTrigger className="h-14 rounded-2xl border-2 font-bold shadow-sm"><SelectValue/></SelectTrigger>
                                                    <SelectContent className="rounded-xl"><SelectItem value="MCQ">MCQ (Auto-Graded)</SelectItem><SelectItem value="Written">Written (Manual)</SelectItem><SelectItem value="Oral">Oral</SelectItem><SelectItem value="Practical">Practical</SelectItem><SelectItem value="Essay">Essay</SelectItem><SelectItem value="Short Answer">Short Answer</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Module / Topic</Label><Input value={exam.topic} onChange={e => updateExam(exam.id, 'topic', e.target.value)} className="h-14 rounded-2xl border-2 font-bold shadow-sm" placeholder="e.g., Vector Dynamics" /></div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Full Marks</Label><Input type="number" value={exam.totalMarks} onChange={e => updateExam(exam.id, 'totalMarks', Number(e.target.value))} className="h-14 rounded-2xl border-2 font-black text-xl text-primary shadow-sm" /></div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Scheduled Date</Label><DatePicker date={exam.examDate ? new Date(exam.examDate as string) : new Date()} setDate={(date) => updateExam(exam.id, 'examDate', date!)} className="h-14 rounded-2xl border-2 shadow-sm" /></div>
                                        </div>
                                        <div className="pt-8 border-t border-primary/10 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <Label className="font-black uppercase tracking-tight text-base text-primary">Question Set</Label>
                                                <Badge variant="outline" className="font-black text-[10px] px-4 py-1 rounded-full border-primary/20">{(exam.questions || []).length} Injected</Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {(exam.questions || []).length > 0 ? (exam.questions || []).map(q => <Badge key={q.id} variant="secondary" className="rounded-xl px-4 py-2 font-bold shadow-sm border border-primary/5">{q.text.substring(0, 45)}...</Badge>) : <div className="text-center py-10 w-full bg-muted/30 rounded-[2rem] border-2 border-dashed flex flex-col items-center gap-3"><Database className="h-8 w-8 text-muted-foreground opacity-30"/><p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Question set is empty</p></div>}
                                            </div>
                                            <Button variant="outline" size="lg" onClick={() => openQuestionBank(exam)} className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 border-2 border-primary/20 hover:bg-primary/5 transition-all shadow-md group/bank">
                                                <Database className="mr-3 h-5 w-5 text-primary group-hover/bank:scale-110 transition-transform"/>
                                                Import from Global Question Bank
                                            </Button>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                            <Button variant="outline" className="w-full h-16 border-dashed border-2 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-sm hover:bg-primary/5 transition-all group" onClick={addExam}>
                                <PlusCircle className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform"/> 
                                Design New Assessment Matrix
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="space-y-10">
                        <div className="text-center md:text-left">
                            <h3 className="font-black uppercase tracking-tight text-xl">Visual Assets</h3>
                            <p className="text-muted-foreground font-medium mt-1">Brand the program with high-impact imagery and video.</p>
                        </div>
                        <div className="space-y-10 p-10 border-2 rounded-[3rem] bg-card shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                            <div className="space-y-6">
                                <Label htmlFor="thumbnail" className="font-black uppercase text-[10px] tracking-[0.25em] text-primary">Master Program Cover (HD Recommended)</Label>
                                <div className="flex flex-col md:flex-row gap-10 items-start">
                                    <div className="w-full md:w-[450px] aspect-[16/10] relative rounded-[2.5rem] overflow-hidden border-8 border-primary/5 shadow-2xl bg-muted shrink-0 group">
                                        <Image src={thumbnailUrl} alt="Program Thumbnail Preview" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <CloudUpload className="h-16 w-16 text-white drop-shadow-2xl" />
                                        </div>
                                    </div>
                                    <div className="flex-grow space-y-6 w-full">
                                        <Input id="thumbnail" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} className="h-14 rounded-2xl border-2 font-medium focus-visible:ring-primary shadow-sm" placeholder="Paste image URL here..." />
                                        <div className="p-6 bg-muted/30 rounded-2xl border-2 border-dashed border-primary/10">
                                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                                <span className="font-black text-primary uppercase text-[10px] block mb-1">PRO TIP</span>
                                                Use a 16:10 aspect ratio image for the best display on the course marketplace. Images should be crisp and high-contrast.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Separator className="opacity-50" />
                            <div className="space-y-4">
                                <Label htmlFor="introVideo" className="font-black uppercase text-[10px] tracking-[0.25em] text-primary">Cinematic Program Trailer (YouTube/Vimeo)</Label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-primary group-focus-within:scale-110 transition-transform">
                                        <Video />
                                    </div>
                                    <Input id="introVideo" value={introVideoUrl} onChange={e => setIntroVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="h-16 rounded-[1.5rem] pl-14 border-2 font-medium text-lg focus-visible:ring-primary shadow-sm" />
                                </div>
                                <CardDescription className="font-bold italic text-xs text-muted-foreground px-2">Showcase the program experience. A sample lesson or trailer significantly increases conversion.</CardDescription>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'routine' && (
                    <div className="space-y-10">
                        <div className="text-center md:text-left">
                            <h3 className="font-black uppercase tracking-tight text-xl">Academic Cycle</h3>
                            <p className="text-muted-foreground font-medium mt-1">Coordinate synchronous learning sessions.</p>
                        </div>
                        <div className="p-10 border-2 rounded-[3rem] bg-card shadow-xl space-y-6">
                            {classRoutine.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-6 items-center p-4 rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-colors">
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-primary/60 px-1">Weekly Slot</Label>
                                        <Select value={item.day} onValueChange={value => updateRoutineRow(item.id, 'day', value)}>
                                            <SelectTrigger className="h-12 rounded-xl border-none shadow-sm font-black uppercase text-xs tracking-widest bg-background"><SelectValue/></SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-primary/60 px-1">Session Subject</Label>
                                        <Input placeholder="Core Physics / Live Q&A" value={item.subject} onChange={e => updateRoutineRow(item.id, 'subject', e.target.value)} className="h-12 rounded-xl border-none shadow-sm font-bold bg-background" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-primary/60 px-1">Execution Time</Label>
                                        <Input placeholder="e.g., 7:00 PM" value={item.time} onChange={e => updateRoutineRow(item.id, 'time', e.target.value)} className="h-12 rounded-xl border-none shadow-sm font-bold bg-background" />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeRoutineRow(item.id)} className="text-destructive h-10 w-10 hover:bg-destructive/10 rounded-xl self-end mb-1"><Trash2 className="h-5 w-5"/></Button>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full h-16 border-dashed border-2 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-sm hover:bg-primary/5 transition-all group" onClick={addRoutineRow}>
                                <PlusCircle className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform"/> 
                                Register Routine Block
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'liveClasses' && (
                    <div className="space-y-10">
                        <div className="text-center md:text-left">
                            <h3 className="font-black uppercase tracking-tight text-xl">Real-time Engagement</h3>
                            <p className="text-muted-foreground font-medium mt-1">Schedule and broadcast live interactive sessions.</p>
                        </div>
                        <div className="space-y-6">
                            {liveClasses.map(lc => (
                                <Card key={lc.id} className="rounded-[3rem] border-primary/10 overflow-hidden shadow-2xl group bg-gradient-to-br from-card to-primary/5">
                                    <CardContent className="p-10 space-y-10">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                                                <Badge variant="accent" className="font-black text-[10px] uppercase tracking-widest rounded-lg px-6 py-1.5 bg-primary text-white border-none shadow-lg">Session Protocol</Badge>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeLiveClass(lc.id)} className="text-destructive h-10 w-10 hover:bg-destructive/10 rounded-xl transition-all"><Trash2 className="h-5 w-5"/></Button>
                                        </div>
                                        <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Class Domain Topic</Label><Input value={lc.topic} onChange={e => updateLiveClass(lc.id, 'topic', e.target.value)} className="h-14 rounded-2xl border-2 font-black text-lg focus-visible:ring-primary bg-background shadow-sm" placeholder="The Final Showdown: Exam Strategy" /></div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Broadcast Date</Label><Input type="date" value={lc.date} onChange={e => updateLiveClass(lc.id, 'date', e.target.value)} className="h-14 rounded-2xl border-2 font-bold bg-background shadow-sm" /></div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Broadcast Time</Label><Input type="time" value={lc.time} onChange={e => updateLiveClass(lc.id, 'time', e.target.value)} className="h-14 rounded-2xl border-2 font-bold bg-background shadow-sm" /></div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Transmission Engine</Label>
                                                <Select value={lc.platform} onValueChange={(value) => updateLiveClass(lc.id, 'platform', value)}>
                                                    <SelectTrigger className="h-14 rounded-2xl border-2 font-bold bg-background shadow-sm"><SelectValue/></SelectTrigger>
                                                    <SelectContent className="rounded-xl"><SelectItem value="YouTube Live">YouTube Live</SelectItem><SelectItem value="Facebook Live">Facebook Live</SelectItem><SelectItem value="Zoom">Zoom</SelectItem><SelectItem value="Google Meet">Google Meet</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Broadcast Integration URL</Label><Input value={lc.joinUrl} onChange={e => updateLiveClass(lc.id, 'joinUrl', e.target.value)} className="h-14 rounded-2xl border-2 font-medium bg-background shadow-sm" placeholder="https://..." /></div>
                                        <Button size="lg" onClick={() => handleScheduleLiveClass(lc)} disabled={isSaving} className="w-full font-black uppercase tracking-[0.25em] text-[10px] h-16 rounded-[1.5rem] shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all active:scale-[0.98] border-none">
                                            {isSaving ? <Loader2 className="mr-3 h-5 w-5 animate-spin"/> : <Send className="mr-3 h-5 w-5"/>}
                                            Initialize & Distribute Notification
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" className="w-full h-16 border-dashed border-2 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-sm hover:bg-primary/5 transition-all group" onClick={addLiveClass}>
                                <PlusCircle className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform"/> 
                                Provision New Live Session
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="space-y-10">
                        <div className="text-center md:text-left">
                            <h3 className="font-black uppercase tracking-tight text-xl">Program Updates</h3>
                            <p className="text-muted-foreground font-medium mt-1">Broadcast high-priority messages to all enrolled students.</p>
                        </div>
                        <div className="space-y-6">
                            {announcements.map(ann => (
                                <Card key={ann.id} className="rounded-[2.5rem] border-primary/10 bg-card shadow-xl overflow-hidden transition-all hover:border-primary/40">
                                    <CardContent className="p-10 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <Megaphone className="h-5 w-5 text-primary" />
                                                <Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60">Flash Post</Label>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeAnnouncement(ann.id)} className="text-destructive h-10 w-10 hover:bg-destructive/10 rounded-xl transition-all"><Trash2 className="h-5 w-5"/></Button>
                                        </div>
                                        <Input value={ann.title} onChange={e => updateAnnouncement(ann.id, 'title', e.target.value)} placeholder="Headline (e.g., Classes Postponed for Holidays)" className="h-14 rounded-2xl font-black text-lg border-2 shadow-sm focus-visible:ring-primary" />
                                        <Textarea value={ann.content} onChange={e => updateAnnouncement(ann.id, 'content', e.target.value)} placeholder="Elaborate on your message here..." rows={5} className="rounded-2xl border-2 p-6 font-medium shadow-sm focus-visible:ring-primary" />
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" className="w-full h-16 border-dashed border-2 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-sm hover:bg-primary/5 transition-all group" onClick={addAnnouncement}>
                                <PlusCircle className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform"/> 
                                Compose New Announcement
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'faq' && (
                    <div className="space-y-10">
                        <div className="text-center md:text-left">
                            <h3 className="font-black uppercase tracking-tight text-xl">Student Support Center</h3>
                            <p className="text-muted-foreground font-medium mt-1">Pre-emptively answer common student inquiries.</p>
                        </div>
                        <div className="space-y-6">
                            {faqs.map((faq, index) => (
                                <Card key={faq.id} className="rounded-[2.5rem] border-2 border-primary/5 bg-card shadow-lg transition-all hover:border-primary/20">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-[0.2em] rounded-full px-4 py-1 shadow-sm">Intelligence Query {index + 1}</Badge>
                                            <Button variant="ghost" size="icon" onClick={() => removeFaq(faq.id)} className="text-destructive h-9 w-9 hover:bg-destructive/10 rounded-xl transition-all"><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60 ml-1">Question</Label>
                                            <Input value={faq.question} onChange={e => updateFaq(faq.id, 'question', e.target.value)} placeholder="Q: What is the pre-requisite for this course?" className="h-14 rounded-2xl font-bold bg-muted/20 border-none shadow-inner" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60 ml-1">Resolution Response</Label>
                                            <Textarea value={faq.answer} onChange={e => updateFaq(faq.id, 'answer', e.target.value)} rows={4} placeholder="A: Students should have basic knowledge of..." className="rounded-2xl bg-muted/20 border-none p-6 font-medium shadow-inner" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" className="w-full h-16 border-dashed border-2 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-sm hover:bg-primary/5 transition-all group" onClick={addFaq}>
                                <PlusCircle className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform"/> 
                                Add Intelligence Entry
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-10">
                        <div className="text-center md:text-left">
                            <h3 className="font-black uppercase tracking-tight text-xl">Governance & Policy</h3>
                            <p className="text-muted-foreground font-medium mt-1">Configure global access controls and program lifecycle.</p>
                        </div>
                        <div className="space-y-10 p-10 border-2 rounded-[3rem] bg-card shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] opacity-50"></div>
                            <div className="space-y-4">
                                <Label htmlFor="communityUrl" className="flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.25em] text-primary">
                                    <LinkIcon className="h-4 w-4"/> Global Community Command URL
                                </Label>
                                <Input id="communityUrl" value={communityUrl} onChange={e => setCommunityUrl(e.target.value)} placeholder="https://facebook.com/groups/..." className="h-16 rounded-[1.5rem] border-2 font-medium text-lg focus-visible:ring-primary shadow-sm" />
                                <CardDescription className="font-bold text-xs italic text-muted-foreground px-2">The master community bridge for all enrolled learners.</CardDescription>
                            </div>
                            <Separator className="opacity-50" />
                            <div className="space-y-6">
                                <Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary">Cross-Program Bundling (Free Bonuses)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left h-auto min-h-[4.5rem] rounded-[1.5rem] border-2 border-dashed p-6 hover:bg-primary/5 hover:border-primary/40 transition-all shadow-sm">
                                            <div className="flex flex-wrap gap-3">
                                            {includedCourseIds.length > 0
                                                ? allCourses.filter(c => includedCourseIds.includes(c.id!)).map(c => <Badge key={c.id} variant="secondary" className="rounded-xl px-4 py-1.5 font-black uppercase text-[9px] tracking-wider shadow-sm">{c.title}</Badge>)
                                                : <span className="text-muted-foreground font-medium italic opacity-60">Authorize bonus program grants for this course...</span>}
                                            </div>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-[2.5rem] overflow-hidden shadow-2xl border-primary/20">
                                        <Command>
                                            <CommandInput placeholder="Search program catalog..." className="h-14 font-bold" />
                                            <CommandEmpty className="p-6 text-center font-bold text-muted-foreground">Catalog item not found.</CommandEmpty>
                                            <CommandGroup className="p-2 max-h-[300px] overflow-y-auto">
                                            {allCourses.filter(c => c.id !== courseId).map(c => (
                                                <CommandItem
                                                    key={c.id}
                                                    onSelect={() => {
                                                        const newSelection = includedCourseIds.includes(c.id!)
                                                        ? includedCourseIds.filter(id => id !== c.id)
                                                        : [...includedCourseIds, c.id!];
                                                        setIncludedCourseIds(newSelection);
                                                    }}
                                                    className="p-4 rounded-2xl hover:bg-primary/5 cursor-pointer transition-all mb-1"
                                                >
                                                    <Check className={cn("mr-4 h-6 w-6 text-primary shrink-0", includedCourseIds.includes(c.id!) ? "opacity-100" : "opacity-0")} />
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm uppercase tracking-tight">{c.title}</span>
                                                        <span className="text-[10px] text-muted-foreground font-bold">{c.category}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Separator className="opacity-50" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="flex items-center justify-between rounded-[2.5rem] border-2 border-primary/10 p-8 bg-muted/10 hover:bg-muted/20 transition-all shadow-sm group">
                                    <div className="space-y-1">
                                        <Label htmlFor="showStudentCount" className="font-black uppercase text-sm tracking-tight group-hover:text-primary transition-colors">Public Metrics</Label>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">Enrolled count display</p>
                                    </div>
                                    <Switch id="showStudentCount" checked={showStudentCount} onCheckedChange={setShowStudentCount} className="data-[state=checked]:bg-primary" />
                                </div>
                                <div className="flex items-center justify-between rounded-[2.5rem] border-2 border-destructive/20 p-8 bg-destructive/5 hover:bg-destructive/10 transition-all shadow-sm group">
                                    <div className="space-y-1">
                                        <Label htmlFor="archive" className="font-black uppercase text-sm tracking-tight text-destructive">Sunset Program</Label>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">Disable new admissions</p>
                                    </div>
                                    <Switch id="archive" checked={isArchived} onCheckedChange={setIsArchived} className="data-[state=checked]:bg-destructive" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>

        {/* AI Generator Dialog */}
        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
            <DialogContent className="rounded-[3rem] p-10 border-4 border-primary shadow-[0_0_80px_rgba(239,68,68,0.2)]">
                <DialogHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <Wand2 className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                    <DialogTitle className="text-3xl font-black uppercase tracking-tight text-primary">RDC AI Architect</DialogTitle>
                    <DialogDescription className="font-bold text-lg mt-2">Describe your vision and we will build the master draft.</DialogDescription>
                </DialogHeader>
                <div className="py-10">
                    <Label htmlFor="ai-topic" className="font-black uppercase text-[10px] tracking-[0.3em] text-muted-foreground mb-4 block text-center">Architectural Focus Topic</Label>
                    <Input id="ai-topic" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g., Quantum Mechanics for HSC Mastery" className="h-20 rounded-[2rem] border-4 bg-muted/20 focus-visible:ring-primary text-2xl font-black text-center shadow-inner" />
                </div>
                <DialogFooter className="sm:justify-center gap-4">
                    <Button variant="outline" onClick={() => setIsAiDialogOpen(false)} className="rounded-2xl h-14 font-black uppercase tracking-widest text-xs px-10 border-2">Abort</Button>
                    <Button onClick={handleGenerateCourse} disabled={isGenerating || !aiTopic} className="rounded-2xl h-14 font-black uppercase tracking-widest text-xs px-12 shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white active:scale-95 transition-all border-none">
                        {isGenerating ? <Loader2 className="mr-3 h-5 w-5 animate-spin"/> : <Wand2 className="mr-3 h-5 w-5"/>} 
                        Build Architectural Blueprint
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Question Bank Dialog */}
        <Dialog open={isQuestionBankOpen} onOpenChange={setIsQuestionBankOpen}>
          <DialogContent className="max-w-5xl rounded-[3rem] border-4 border-primary overflow-hidden p-0 shadow-[0_0_100px_rgba(0,0,0,0.2)]">
              <DialogHeader className="p-10 bg-primary/5 border-b-2 border-primary/10">
                  <div className="flex items-center gap-4">
                      <div className="p-4 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20">
                        <Database className="h-8 w-8" />
                      </div>
                      <div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight">Intelligence Repository</DialogTitle>
                        <DialogDescription className="font-bold text-base mt-1">Injecting curated questions into: <span className="text-primary">"{selectedExamForQB?.title}"</span></DialogDescription>
                      </div>
                  </div>
              </DialogHeader>
              <div className="flex flex-wrap gap-4 p-8 bg-muted/20 border-b-2 border-primary/5">
                 <Select value={qbFilters.subject} onValueChange={(v) => setQbFilters(f => ({...f, subject: v}))}><SelectTrigger className="w-full sm:w-[220px] h-14 rounded-2xl bg-background border-none shadow-lg font-black uppercase text-[10px] tracking-widest"><SelectValue placeholder="Subject" /></SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl"><SelectItem value="all">Global Subjects</SelectItem>{[...new Set(questionBank.map(q => q.subject).filter(Boolean))] .map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}</SelectContent>
                </Select>
                 <Select value={qbFilters.chapter} onValueChange={(v) => setQbFilters(f => ({...f, chapter: v}))}><SelectTrigger className="w-full sm:w-[220px] h-14 rounded-2xl bg-background border-none shadow-lg font-black uppercase text-[10px] tracking-widest"><SelectValue placeholder="Chapter" /></SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl"><SelectItem value="all">Global Chapters</SelectItem>{[...new Set(questionBank.map(q => q.chapter).filter(Boolean))] .map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}</SelectContent>
                </Select>
                 <Select value={qbFilters.difficulty} onValueChange={(v) => setQbFilters(f => ({...f, difficulty: v}))}><SelectTrigger className="w-full sm:w-[180px] h-14 rounded-2xl bg-background border-none shadow-lg font-black uppercase text-[10px] tracking-widest"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl"><SelectItem value="all">All Scales</SelectItem><SelectItem value="Easy">Easy Level</SelectItem><SelectItem value="Medium">Medium Level</SelectItem><SelectItem value="Hard">Hard Level</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="max-h-[40vh] overflow-y-auto p-8 scrollbar-hide">
                  <Table>
                      <TableHeader className="bg-muted/50 rounded-xl">
                          <TableRow className="border-none">
                              <TableHead className="w-16 px-6"></TableHead>
                              <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] px-6 text-foreground">Injected Data Intelligence</TableHead>
                              <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] px-6 text-foreground">Format</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-primary/5">
                          {filteredQbQuestions.map(q => (
                              <TableRow key={q.id} className="hover:bg-primary/5 transition-all group border-none">
                                  <TableCell className="px-6 py-6">
                                      <Checkbox 
                                        checked={qbSelectedQuestions.some(sq => sq.id === q.id)}
                                        onCheckedChange={(checked) => {
                                            if(checked) {
                                                setQbSelectedQuestions(prev => [...prev, q]);
                                            } else {
                                                setQbSelectedQuestions(prev => prev.filter(sq => sq.id !== q.id));
                                            }
                                        }}
                                        className="h-6 w-6 border-2 border-primary rounded-lg transition-all data-[state=checked]:scale-110"
                                      />
                                  </TableCell>
                                  <TableCell className="px-6 py-6 font-bold text-base leading-tight group-hover:text-primary transition-colors">{q.text}</TableCell>
                                  <TableCell className="px-6 py-6"><Badge variant="outline" className="rounded-xl px-4 py-1 font-black text-[9px] uppercase tracking-widest bg-background">{q.type}</Badge></TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </div>
              <DialogFooter className="p-10 border-t-2 border-primary/5 bg-muted/10">
                  <Button variant="outline" onClick={() => setIsQuestionBankOpen(false)} className="rounded-[1.25rem] h-14 font-black uppercase tracking-widest text-xs px-10 border-2">Cancel</Button>
                  <Button onClick={handleAddQuestionsFromBank} className="rounded-[1.25rem] h-14 font-black uppercase tracking-widest text-xs px-12 shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white transition-all active:scale-95 border-none">
                    Mass Inject {qbSelectedQuestions.length} Artifacts
                  </Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
