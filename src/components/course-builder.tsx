'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
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
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { 
    Course, 
    SyllabusModule, 
    AssignmentTemplate, 
    Instructor, 
    Announcement, 
    LiveClass, 
    ExamTemplate, 
    Question, 
    Lesson, 
    CourseCycle, 
    Organization, 
    User, 
    QuizTemplate 
} from '@/lib/types';
import { 
    getCourse, 
    getCourses, 
    getCategories, 
    getInstructorByUid, 
    getOrganizationByUserId, 
    getInstructors, 
    getQuestionBank, 
    getOrganizations, 
    getUsers 
} from '@/lib/firebase/firestore';
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
import { removeUndefinedValues, cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
             <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-muted rounded-xl border-2">
                <div {...attributes} {...listeners} className="cursor-grab p-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <Badge variant='default' className="capitalize select-none rounded-lg">Module</Badge>
                <Input 
                  value={item.title} 
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                  className="flex-grow bg-transparent border-none font-bold focus-visible:ring-0" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10 rounded-lg" 
                  onClick={() => removeItem(item.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <Collapsible ref={setNodeRef} style={style} className="bg-background rounded-xl border-2 ml-6">
            <div className="flex items-center gap-2 p-2">
                <div {...attributes} {...listeners} className="cursor-grab p-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <Badge variant='secondary' className="capitalize select-none rounded-lg">{item.type}</Badge>
                <Input 
                  value={item.title} 
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                  className="flex-grow border-none focus-visible:ring-0" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10 rounded-lg" 
                  onClick={() => removeItem(item.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                 <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
                <div className="p-4 border-t-2 space-y-4 bg-muted/30 rounded-b-xl">
                     <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Lesson Type</Label>
                        <Select value={item.type} onValueChange={(value) => updateItem(item.id, 'type', value)}>
                            <SelectTrigger className="rounded-lg h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="video">Video Lesson</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="document">Document / Reading</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>

                    {item.type === 'video' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`videoId-${item.id}`} className="font-bold text-xs uppercase tracking-widest text-muted-foreground">YouTube Video ID/URL</Label>
                                <Input id={`videoId-${item.id}`} placeholder="e.g., dQw4w9WgXcQ" value={item.videoId || ''} onChange={(e) => updateItem(item.id, 'videoId', e.target.value)} className="rounded-lg" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`duration-${item.id}`} className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Duration</Label>
                                <Input id={`duration-${item.id}`} placeholder="e.g., 45 min" value={item.duration || ''} onChange={(e) => updateItem(item.id, 'duration', e.target.value)} className="rounded-lg" />
                            </div>
                        </div>
                    )}

                    {(item.type === 'video' || item.type === 'document') && (
                        <div className="space-y-2">
                            <Label htmlFor={`sheetUrl-${item.id}`} className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Document URL</Label>
                            <Input id={`sheetUrl-${item.id}`} placeholder="https://docs.google.com/..." value={item.lectureSheetUrl || ''} onChange={(e) => updateItem(item.id, 'lectureSheetUrl', e.target.value)} className="rounded-lg" />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor={`instructor-${item.id}`} className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Assigned Instructor</Label>
                        <Select
                            value={item.instructorSlug || ''}
                            onValueChange={(value) => updateItem(item.id, 'instructorSlug', value === 'default' ? '' : value)}
                        >
                            <SelectTrigger className="rounded-lg h-11">
                                <SelectValue placeholder="Default (First Instructor)" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="default">Default (First Instructor)</SelectItem>
                                {courseInstructors.map((inst: Instructor) => (
                                    <SelectItem key={inst.slug} value={inst.slug}>
                                        {inst.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                     {item.type !== 'quiz' && (
                        <div className="mt-2">
                            <Button size="sm" variant="outline" onClick={() => handleGenerateQuiz(item as LessonData)} disabled={isGeneratingQuiz} className="rounded-lg h-10 border-dashed border-2">
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
  
  // Static data
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [allDoubtSolvers, setAllDoubtSolvers] = useState<User[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [questionBank, setQuestionBank] = useState<Question[]>([]);

  // Course state
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

  const [communityUrl, setCommunityUrl] = useState('');
  const [includedCourseIds, setIncludedCourseIds] = useState<string[]>([]);
  const [isArchived, setIsArchived] = useState(false);
  const [showStudentCount, setShowStudentCount] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const [isPrebooking, setIsPrebooking] = useState(false);
  const [prebookingPrice, setPrebookingPrice] = useState('');
  const [prebookingEndDate, setPrebookingEndDate] = useState<Date | undefined>();
  const [prebookingTarget, setPrebookingTarget] = useState<number | undefined>();

  const [cycles, setCycles] = useState<Course['cycles']>([]);

  // AI & QB dialogs
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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
  
  const setCourseDataFn = useCallback((courseData: Course, allInstructorsList: Instructor[]) => {
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
        setThumbnailUrl(courseData.imageUrl || 'https://placehold.co/600x400.png');
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
                    setCourseDataFn(courseData, approvedInstructors);
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
            toast({ title: 'Error loading builder', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchAllData();
  }, [courseId, isNewCourse, toast, userInfo, userRole, setCourseDataFn]);


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  const addInstructorFn = (instructor: Instructor) => setInstructors(prev => [...prev, instructor]);
  const removeInstructorFn = (slug: string) => setInstructors(prev => prev.filter(ins => ins.slug !== slug));
  
  const addRoutineRow = () => setClassRoutine(prev => [...prev, { id: Date.now().toString(), day: 'Saturday', subject: '', time: '' }]);
  const updateRoutineRow = (id: string, field: keyof Omit<ClassRoutineItem, 'id'>, value: string) => {
    setClassRoutine(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };
  const removeRoutineRow = (id: string) => setClassRoutine(prev => prev.filter(row => row.id !== id));
  
  const addAnnouncement = () => setAnnouncements(prev => [{ id: `ann_${Date.now()}`, title: '', content: '', date: format(new Date(), 'yyyy-MM-dd') }, ...prev]);
  const updateAnnouncement = (id: string, field: keyof Omit<Announcement, 'id' | 'date'>, value: string) => {
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };
  const removeAnnouncement = (id: string) => setAnnouncements(prev => prev.filter(a => a.id !== id));

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

  const addAssignment = () => setAssignmentTemplates(p => [...p, { id: `as_${Date.now()}`, title: '', topic: '', deadline: format(new Date(), 'yyyy-MM-dd') }]);
  const updateAssignment = (id: string, field: keyof Omit<AssignmentTemplate, 'id'>, value: string | Date) => {
      setAssignmentTemplates(p => p.map(a => a.id === id ? { ...a, [field]: field === 'deadline' ? format(value as Date, 'yyyy-MM-dd') : value } : a));
  };
  const removeAssignment = (id: string) => setAssignmentTemplates(p => p.filter(a => a.id !== id));

  const addExam = () => setExamTemplates(p => [...p, { id: `ex_${Date.now()}`, title: '', topic: '', examType: 'MCQ', totalMarks: 100, examDate: format(new Date(), 'yyyy-MM-dd') }]);
  const updateExam = (id: string, field: keyof Omit<ExamTemplate, 'id'>, value: string | number | Date | boolean | Question[]) => {
      setExamTemplates(p => p.map(e => e.id === id ? { ...e, [field]: field === 'examDate' ? format(value as Date, 'yyyy-MM-dd') : value } : e));
  };
  const removeExam = (id: string) => setExamTemplates(p => p.filter(e => e.id !== id));
  
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
    setDoubtSolverIds(prev => add ? [...prev, solverId] : prev.filter(id => id !== solverId));
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
    
    const reconstructedSyllabus: SyllabusModule[] = [];
    let currentModule: SyllabusModule | null = null;
    syllabus.forEach(item => {
        if (item.type === 'module') {
            if (currentModule) reconstructedSyllabus.push(currentModule);
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
    if (currentModule) reconstructedSyllabus.push(currentModule);
    
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

    if (!isNewCourse) courseData.id = courseId;
    if (initialStatus === 'Published' && status !== 'Published' && userRole !== 'Admin') courseData.status = 'Published';
    
    const result = await saveCourseAction(removeUndefinedValues(courseData));

    if (result.success) {
      toast({ title: 'Course Data Saved Successfully', description: result.message });
      if (isNewCourse && result.courseId) router.replace(`${redirectPath}/builder/${result.courseId}`);
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
          newSyllabus.push({ id: Math.random().toString(), type: 'video', title: lesson.title, duration: '10 min' });
        });
      });
      setSyllabus(newSyllabus);
      toast({ title: 'AI Blueprints Generated!' });
      setIsAiDialogOpen(false);
    } catch (err) {
      toast({ title: 'AI Generation Failed', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const openQuestionBank = (exam: ExamTemplate) => {
    setSelectedExamForQB(exam);
    setQbSelectedQuestions(exam.questions || []);
    setIsQuestionBankOpen(true);
  };

  const handleAddQuestionsFromBank = () => {
    if (!selectedExamForQB) return;
    const existingIds = new Set(selectedExamForQB.questions?.map(q => q.id));
    const newQs = qbSelectedQuestions.filter(q => !existingIds.has(q.id));
    updateExam(selectedExamForQB.id, 'questions', [...(selectedExamForQB.questions || []), ...newQs]);
    setIsQuestionBankOpen(false);
    setQbSelectedQuestions([]);
    toast({ title: 'Mass Injection Complete' });
  };

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

  if (loading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner className="w-12 h-12" /></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="font-headline text-3xl font-black uppercase tracking-tight text-primary">
                    {isNewCourse ? 'Initiate Program' : `Forge: ${courseTitle}`}
                </h1>
                <div className="h-1 w-16 bg-primary mt-2 rounded-full shadow-md" />
            </div>
            <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={() => handleSave('Draft')} disabled={isSaving} className="font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl border-2 shadow-xl active:scale-95 transition-all">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Save Draft
                </Button>
                <Button variant="accent" onClick={() => handleSave(userRole === 'Admin' ? 'Published' : 'Pending Approval')} disabled={isSaving} className="font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white active:scale-95 transition-all border-none">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} 
                    {userRole === 'Admin' ? (initialStatus === 'Published' ? 'Synchronize' : 'Go Live') : 'Submit for Review'}
                </Button>
            </div>
        </div>
        
        <Card className="rounded-[1.5rem] border-primary/10 shadow-2xl overflow-hidden">
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
                            <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Program Master Title</Label>
                            <Input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="h-14 rounded-xl text-lg font-bold border-2 focus-visible:ring-primary" placeholder="e.g., HSC Physics Mastery 2025" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Executive Summary</Label>
                            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className="rounded-xl text-base border-2 focus-visible:ring-primary p-4" placeholder="Describe the curriculum's unique value..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Category</Label>
                                <Input value={category} onChange={e => setCategory(e.target.value)} className="h-14 rounded-xl border-2 font-bold" placeholder="e.g., HSC" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Sub-category</Label>
                                <Input value={subCategory} onChange={e => setSubCategory(e.target.value)} className="h-14 rounded-xl border-2 font-bold" placeholder="e.g., Physics" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Delivery Mode</Label>
                                <Select value={courseType} onValueChange={(v: any) => setCourseType(v)}>
                                    <SelectTrigger className="h-14 rounded-xl border-2 font-bold"><SelectValue/></SelectTrigger>
                                    <SelectContent className="rounded-xl"><SelectItem value="Online">Online</SelectItem><SelectItem value="Offline">Offline</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem><SelectItem value="Exam">Exam Batch</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="space-y-10">
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
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2">
                            <Button variant="outline" className="flex-1 h-14 border-dashed border-2 rounded-xl font-black uppercase tracking-widest text-xs shadow-md hover:bg-primary/5 transition-all" onClick={() => addSyllabusItem('module')}><PlusCircle className="mr-2 h-5 w-5"/> Inject Module</Button>
                            <Button variant="outline" className="flex-1 h-14 border-dashed border-2 rounded-xl font-black uppercase tracking-widest text-xs shadow-md hover:bg-primary/5 transition-all" onClick={() => addSyllabusItem('lesson')}><PlusCircle className="mr-2 h-5 w-5"/> Inject Lesson</Button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'pricing' && (
                    <div className="space-y-14">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <Card className="rounded-[1.5rem] border-2 border-primary/10 overflow-hidden shadow-xl">
                                <CardHeader className="bg-primary/5 p-8 border-b-2 border-primary/5"><CardTitle className="text-xl font-black uppercase tracking-tight text-primary">Revenue Structure</CardTitle></CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Base Listing Price (BDT)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="h-14 rounded-xl border-2 font-black text-2xl text-primary" placeholder="4500" /></div>
                                    <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Incentive Price (BDT)</Label><Input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} className="h-14 rounded-xl border-2 font-black text-2xl text-green-600" placeholder="3000" /></div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-[1.5rem] border-2 border-muted overflow-hidden shadow-xl">
                                <CardHeader className="bg-muted/30 p-8 border-b-2 border-primary/5 flex flex-row items-center justify-between"><CardTitle className="text-xl font-black uppercase tracking-tight">Pre-booking</CardTitle><Switch checked={isPrebooking} onCheckedChange={setIsPrebooking}/></CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    {isPrebooking ? (
                                        <>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Campaign Price (BDT)</Label><Input type="number" value={prebookingPrice} onChange={e => setPrebookingPrice(e.target.value)} className="h-14 rounded-xl border-2 font-black text-2xl" /></div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">End Date</Label><DatePicker date={prebookingEndDate} setDate={setPrebookingEndDate} className="h-14 rounded-xl border-2" /></div>
                                        </>
                                    ) : <div className="h-48 flex items-center justify-center text-muted-foreground font-medium italic">Pre-booking campaign inactive</div>}
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b-2 border-primary/10 pb-4">
                                <h3 className="font-black uppercase tracking-tight text-xl">Payment Entitlement Cycles</h3>
                                <Button onClick={addCycle} variant="outline" className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] border-2 border-dashed"><PlusCircle className="mr-2 h-4 w-4"/> New Cycle</Button>
                            </div>
                            <div className="grid gap-6">
                                {(cycles || []).map((cycle, index) => (
                                    <Card key={cycle.id} className="rounded-2xl border-2 border-primary/10 shadow-lg group overflow-hidden">
                                        <CardHeader className="bg-primary/5 p-6 flex flex-row items-center justify-between">
                                            <Badge className="font-black">Cycle {index + 1}</Badge>
                                            <Button variant="ghost" size="icon" onClick={() => removeCycle(cycle.id)} className="h-10 w-10 text-destructive rounded-xl hover:bg-destructive/10"><Trash2 className="h-5 w-5"/></Button>
                                        </CardHeader>
                                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Title</Label><Input value={cycle.title} onChange={e => updateCycle(cycle.id, 'title', e.target.value)} className="rounded-xl border-2 font-bold" /></div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Price (BDT)</Label><Input type="number" value={cycle.price} onChange={e => updateCycle(cycle.id, 'price', e.target.value)} className="rounded-xl border-2 font-black text-xl text-primary" /></div>
                                            <div className="col-span-full space-y-2">
                                                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Authorized Modules</Label>
                                                <div className="flex flex-wrap gap-2 p-4 border-2 border-dashed rounded-xl bg-muted/20">
                                                    {syllabus.filter(s => s.type === 'module').map(m => (
                                                        <Badge 
                                                            key={m.id} 
                                                            variant={(cycle.moduleIds || []).includes(m.id) ? 'accent' : 'outline'}
                                                            className="cursor-pointer rounded-lg px-4 py-1.5 font-bold uppercase text-[9px] transition-all"
                                                            onClick={() => {
                                                                const ids = new Set(cycle.moduleIds || []);
                                                                if(ids.has(m.id)) ids.delete(m.id); else ids.add(m.id);
                                                                updateCycle(cycle.id, 'moduleIds', Array.from(ids));
                                                            }}
                                                        >
                                                            {m.title}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'instructors' && (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            {instructors.map(inst => (
                                <Card key={inst.slug} className="rounded-2xl border-2 border-primary/10 overflow-hidden shadow-xl text-center group">
                                    <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                                        <Image src={inst.avatarUrl} alt={inst.name} fill className="object-cover transition-transform group-hover:scale-110" />
                                        <Button variant="destructive" size="icon" onClick={() => removeInstructorFn(inst.slug)} className="absolute top-2 right-2 rounded-xl shadow-2xl h-9 w-9"><X className="h-4 w-4"/></Button>
                                    </div>
                                    <div className="p-4"><p className="font-black uppercase text-sm leading-tight">{inst.name}</p></div>
                                </Card>
                            ))}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="aspect-[4/5] h-full flex-col gap-4 border-dashed border-4 rounded-2xl border-primary/10 hover:bg-primary/5">
                                        <PlusCircle className="h-10 w-10 text-primary" />
                                        <span className="font-black uppercase text-[10px] tracking-widest">Appoint Mentor</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0 rounded-2xl overflow-hidden shadow-2xl border-primary/20">
                                    <Command>
                                        <CommandInput placeholder="Search instructors..." className="h-12" />
                                        <CommandGroup className="p-2 max-h-[300px] overflow-y-auto">
                                            {instructorForSelection.filter(inst => !instructors.some(i => i.slug === inst.slug)).map(inst => (
                                                <CommandItem key={inst.id} onSelect={() => addInstructorFn(inst)} className="rounded-xl p-3 hover:bg-primary/5 cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm"><AvatarImage src={inst.avatarUrl} /><AvatarFallback>{inst.name.charAt(0)}</AvatarFallback></Avatar>
                                                        <p className="font-black text-xs uppercase">{inst.name}</p>
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

                {activeTab === 'exams' && (
                    <div className="space-y-10">
                        <div className="grid gap-6">
                            {examTemplates.map((exam, index) => (
                                <Collapsible key={exam.id} className="rounded-2xl border-2 border-primary/10 overflow-hidden shadow-xl bg-card">
                                    <div className="flex justify-between items-center p-6 bg-primary/5 border-b-2 border-primary/5">
                                        <div className="flex items-center gap-4"><Award className="h-6 w-6 text-primary"/><span className="font-black uppercase text-base">{exam.title || `Mock Assessment ${index + 1}`}</span></div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => removeExam(exam.id)} className="text-destructive rounded-xl hover:bg-destructive/10"><Trash2 className="h-5 w-5"/></Button>
                                            <CollapsibleTrigger asChild><Button variant="ghost" size="icon" className="rounded-xl"><ChevronDown className="h-5 w-5"/></Button></CollapsibleTrigger>
                                        </div>
                                    </div>
                                    <CollapsibleContent className="p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2 md:col-span-2"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Title</Label><Input value={exam.title} onChange={e => updateExam(exam.id, 'title', e.target.value)} className="h-14 rounded-xl border-2 font-bold" /></div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Execution Mode</Label>
                                                <Select value={exam.examType} onValueChange={(v: any) => updateExam(exam.id, 'examType', v)}>
                                                    <SelectTrigger className="h-14 rounded-xl border-2 font-bold"><SelectValue/></SelectTrigger>
                                                    <SelectContent className="rounded-xl"><SelectItem value="MCQ">MCQ (Auto)</SelectItem><SelectItem value="Written">Written (Manual)</SelectItem><SelectItem value="Oral">Oral</SelectItem><SelectItem value="Practical">Practical</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Topic</Label><Input value={exam.topic} onChange={e => updateExam(exam.id, 'topic', e.target.value)} className="h-14 rounded-xl border-2 font-bold" /></div>
                                            <div className="space-y-2"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Full Marks</Label><Input type="number" value={exam.totalMarks} onChange={e => updateExam(exam.id, 'totalMarks', Number(e.target.value))} className="h-14 rounded-xl border-2 font-black text-xl text-primary" /></div>
                                        </div>
                                        <div className="pt-6 border-t-2 border-primary/5 flex justify-end">
                                            <Button variant="outline" onClick={() => openQuestionBank(exam)} className="rounded-xl h-12 font-black uppercase text-[10px] tracking-widest border-2 border-dashed shadow-md"><Database className="mr-2 h-4 w-4"/> Inject Questions from Bank</Button>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                            <Button variant="outline" className="w-full h-16 border-dashed border-2 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-primary/5 transition-all" onClick={addExam}><PlusCircle className="mr-2 h-6 w-6"/> Define New Assessment</Button>
                        </div>
                    </div>
                )}

                {activeTab === 'routine' && (
                    <div className="space-y-10">
                        <div className="p-8 border-2 rounded-2xl bg-card shadow-xl space-y-6">
                            {classRoutine.map((item) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 rounded-xl bg-muted/20 border-2 border-transparent hover:border-primary/10 transition-all">
                                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Day</Label>
                                        <Select value={item.day} onValueChange={v => updateRoutineRow(item.id, 'day', v)}><SelectTrigger className="rounded-lg bg-background"><SelectValue/></SelectTrigger>
                                            <SelectContent className="rounded-xl">{['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Subject</Label><Input value={item.subject} onChange={e => updateRoutineRow(item.id, 'subject', e.target.value)} className="rounded-lg bg-background shadow-sm" /></div>
                                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Execution Time</Label><Input value={item.time} onChange={e => updateRoutineRow(item.id, 'time', e.target.value)} className="rounded-lg bg-background shadow-sm" /></div>
                                    <Button variant="ghost" size="icon" onClick={() => removeRoutineRow(item.id)} className="text-destructive h-10 w-10 rounded-xl hover:bg-destructive/10 mb-0.5"><Trash2 className="h-5 w-5"/></Button>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full h-14 border-dashed border-2 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-md hover:bg-primary/5" onClick={addRoutineRow}><PlusCircle className="mr-2 h-5 w-5"/> Add Weekly Slot</Button>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-10">
                        <div className="space-y-10 p-10 border-2 rounded-2xl bg-card shadow-2xl relative overflow-hidden">
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-primary"><LinkIcon className="h-4 w-4"/> Master Community URL</Label>
                                <Input value={communityUrl} onChange={e => setCommunityUrl(e.target.value)} placeholder="https://facebook.com/groups/..." className="h-14 rounded-xl border-2 font-medium shadow-sm" />
                            </div>
                            <Separator className="opacity-50" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-center justify-between rounded-xl border-2 border-primary/10 p-6 bg-muted/10 shadow-sm">
                                    <div className="space-y-1"><Label className="font-black uppercase text-sm tracking-tight">Public Metrics</Label><p className="text-[10px] text-muted-foreground font-bold uppercase">Display enrolled count</p></div>
                                    <Switch checked={showStudentCount} onCheckedChange={setShowStudentCount} />
                                </div>
                                <div className="flex items-center justify-between rounded-xl border-2 border-destructive/20 p-6 bg-destructive/5 shadow-sm">
                                    <div className="space-y-1"><Label className="font-black uppercase text-sm tracking-tight text-destructive">Sunset Program</Label><p className="text-[10px] text-muted-foreground font-bold uppercase">Disable admissions</p></div>
                                    <Switch checked={isArchived} onCheckedChange={setIsArchived} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>

        {/* AI & Question Bank Dialogs */}
        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
            <DialogContent className="rounded-3xl p-10 border-4 border-primary shadow-2xl">
                <DialogHeader className="text-center">
                    <Wand2 className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                    <DialogTitle className="text-3xl font-black uppercase tracking-tight text-primary">RDC AI Architect</DialogTitle>
                    <DialogDescription className="font-bold text-lg mt-2">Forge a master blueprint for your new curriculum.</DialogDescription>
                </DialogHeader>
                <div className="py-8"><Input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g., Physics Crash Course for HSC 2025" className="h-16 rounded-xl border-4 text-xl font-black text-center" /></div>
                <DialogFooter className="sm:justify-center gap-4">
                    <Button variant="outline" onClick={() => setIsAiDialogOpen(false)} className="rounded-xl h-14 px-10 font-black border-2">Abort</Button>
                    <Button onClick={handleGenerateCourse} disabled={isGenerating || !aiTopic} className="rounded-xl h-14 px-12 font-black bg-primary text-white shadow-2xl">
                        {isGenerating ? <Loader2 className="mr-3 h-5 w-5 animate-spin"/> : <Wand2 className="mr-3 h-5 w-5"/>} 
                        Build Blueprints
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isQuestionBankOpen} onOpenChange={setIsQuestionBankOpen}>
          <DialogContent className="max-w-5xl rounded-3xl border-4 border-primary overflow-hidden p-0 shadow-2xl">
              <DialogHeader className="p-8 bg-primary/5 border-b-2 border-primary/10"><DialogTitle className="text-3xl font-black uppercase">Intelligence Repository</DialogTitle></DialogHeader>
              <div className="flex flex-wrap gap-4 p-6 bg-muted/20 border-b-2">
                 <Select value={qbFilters.subject} onValueChange={(v) => setQbFilters(f => ({...f, subject: v}))}><SelectTrigger className="w-[200px] h-12 rounded-xl border-none shadow-lg font-black uppercase text-[10px] tracking-widest"><SelectValue placeholder="Subject"/></SelectTrigger>
                    <SelectContent className="rounded-xl">{[...new Set(questionBank.map(q => q.subject).filter(Boolean))].map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}</SelectContent>
                </Select>
                 <Select value={qbFilters.difficulty} onValueChange={(v) => setQbFilters(f => ({...f, difficulty: v}))}><SelectTrigger className="w-[150px] h-12 rounded-xl border-none shadow-lg font-black uppercase text-[10px] tracking-widest"><SelectValue placeholder="Difficulty"/></SelectTrigger>
                    <SelectContent className="rounded-xl"><SelectItem value="all">All Scales</SelectItem><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="max-h-[40vh] overflow-y-auto p-6 scrollbar-hide">
                  <Table><TableBody className="divide-y">
                      {filteredQbQuestions.map(q => (
                          <TableRow key={q.id} className="hover:bg-primary/5 border-none">
                              <TableCell className="w-12"><Checkbox checked={qbSelectedQuestions.some(sq => sq.id === q.id)} onCheckedChange={(checked) => checked ? setQbSelectedQuestions(p => [...p, q]) : setQbSelectedQuestions(p => p.filter(sq => sq.id !== q.id))} /></TableCell>
                              <TableCell className="font-bold text-base">{q.text}</TableCell>
                              <TableCell><Badge variant="outline" className="rounded-lg px-3 py-1 font-black text-[9px] uppercase">{q.type}</Badge></TableCell>
                          </TableRow>
                      ))}</TableBody></Table>
              </div>
              <DialogFooter className="p-8 border-t-2 border-primary/5 bg-muted/10">
                  <Button variant="outline" onClick={() => setIsQuestionBankOpen(false)} className="rounded-xl h-12 font-black px-10 border-2">Cancel</Button>
                  <Button onClick={handleAddQuestionsFromBank} className="rounded-xl h-12 font-black px-12 bg-primary text-white shadow-2xl">Inject {qbSelectedQuestions.length} Selected Artifacts</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
