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
  ListCollapse,
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
import { Checkbox } from './ui/checkbox';

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
    courseInstructors,
}: { 
    item: SyllabusItem, 
    updateItem: (id: string, field: string, value: any) => void, 
    removeItem: (id: string) => void, 
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

    if (item.type === 'module') {
        return (
             <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 bg-muted rounded-xl border-2">
                <div {...attributes} {...listeners} className="cursor-grab p-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <Badge variant='default' className="capitalize select-none rounded-lg px-3 py-1 font-black text-[10px] tracking-widest">Module</Badge>
                <Input 
                  value={item.title} 
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                  className="flex-grow bg-transparent border-none font-black uppercase text-sm focus-visible:ring-0" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10 rounded-lg h-9 w-9" 
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
                <Badge variant='secondary' className="capitalize select-none rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">{item.type}</Badge>
                <Input 
                  value={item.title} 
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                  className="flex-grow border-none focus-visible:ring-0 font-bold text-sm" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10 rounded-lg h-8 w-8" 
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
                        <Label className="font-black text-[9px] uppercase tracking-[0.2em] text-primary/60">Lesson Artifact Type</Label>
                        <Select value={item.type} onValueChange={(value) => updateItem(item.id, 'type', value)}>
                            <SelectTrigger className="rounded-lg h-11 border-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="video">Streaming Lesson</SelectItem>
                                <SelectItem value="quiz">Interactive Quiz</SelectItem>
                                <SelectItem value="document">Knowledge Resource</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>

                    {item.type === 'video' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`videoId-${item.id}`} className="font-black text-[9px] uppercase tracking-[0.2em] text-primary/60">Video Identifier (YouTube)</Label>
                                <Input id={`videoId-${item.id}`} placeholder="e.g., dQw4w9WgXcQ" value={item.videoId || ''} onChange={(e) => updateItem(item.id, 'videoId', e.target.value)} className="rounded-lg border-2" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`duration-${item.id}`} className="font-black text-[9px] uppercase tracking-[0.2em] text-primary/60">Execution Time</Label>
                                <Input id={`duration-${item.id}`} placeholder="e.g., 45 min" value={item.duration || ''} onChange={(e) => updateItem(item.id, 'duration', e.target.value)} className="rounded-lg border-2" />
                            </div>
                        </div>
                    )}

                    {(item.type === 'video' || item.type === 'document') && (
                        <div className="space-y-2">
                            <Label htmlFor={`sheetUrl-${item.id}`} className="font-black text-[9px] uppercase tracking-[0.2em] text-primary/60">Resource Direct Link</Label>
                            <Input id={`sheetUrl-${item.id}`} placeholder="https://docs.google.com/..." value={item.lectureSheetUrl || ''} onChange={(e) => updateItem(item.id, 'lectureSheetUrl', e.target.value)} className="rounded-lg border-2" />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor={`instructor-${item.id}`} className="font-black text-[9px] uppercase tracking-[0.2em] text-primary/60">Assigned Faculty</Label>
                        <Select
                            value={item.instructorSlug || ''}
                            onValueChange={(value) => updateItem(item.id, 'instructorSlug', value === 'default' ? '' : value)}
                        >
                            <SelectTrigger className="rounded-lg h-11 border-2">
                                <SelectValue placeholder="Default (Lead Instructor)" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="default">Lead Instructor (Auto)</SelectItem>
                                {courseInstructors.map((inst: Instructor) => (
                                    <SelectItem key={inst.slug} value={inst.slug}>
                                        {inst.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

interface CourseBuilderProps {
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
  const [questionBank, setAllQuestionBank] = useState<Question[]>([]);

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
            setAllQuestionBank(fetchedQuestionBank);

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
      ? { id: Date.now().toString(), type, title: 'New Master Module' }
      : { id: Date.now().toString(), type: 'video', title: 'New Tactical Lesson', duration: '', videoId: '', lectureSheetUrl: '' };
    
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
          toast({ title: 'Validation Error', description: 'Please fill all mandatory fields for the live session.', variant: 'destructive'});
          return;
      }
      setIsSaving(true);
      const result = await scheduleLiveClassAction(courseId, liveClass);
      if (result.success) {
          toast({ title: 'Session Synchronized!', description: result.message });
          setLiveClasses(prev => prev.map(lc => lc.id === liveClass.id ? result.newLiveClass! : lc));
      } else {
          toast({ title: 'Sync Error', description: result.message, variant: 'destructive' });
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
      setExamTemplates(p => p.map(e => e.id === id ? { ...e, [field]: field === 'examDate' ? (typeof value === 'object' && value instanceof Date ? format(value, 'yyyy-MM-dd') : value) : value } : e));
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
      toast({ title: 'Validation Warning', description: 'Curriculum title is required.', variant: 'destructive' });
      setActiveTab('details');
      return;
    }
    if (instructors.length === 0) {
        toast({ title: 'Validation Warning', description: 'Assign at least one faculty member.', variant: 'destructive' });
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
      toast({ title: 'Sync Successful', description: result.message });
      if (isNewCourse && result.courseId) router.replace(`${redirectPath}/builder/${result.courseId}`);
    } else {
        toast({ title: 'Sync Error', description: result.message, variant: 'destructive' });
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
          newSyllabus.push({ id: Math.random().toString(), type: 'video', title: lesson.title, duration: '15 min' });
        });
      });
      setSyllabus(newSyllabus);
      toast({ title: 'AI Architect: Blueprint Forged' });
      setIsAiDialogOpen(false);
    } catch (err) {
      toast({ title: 'AI Synthesis Failed', variant: 'destructive' });
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
    toast({ title: 'Data Injected: Questions Loaded' });
  };

  const filteredQbQuestions = useMemo(() => {
    return questionBank.filter(q => 
        (qbFilters.subject === 'all' || q.subject === qbFilters.subject) &&
        (qbFilters.difficulty === 'all' || q.difficulty === qbFilters.difficulty)
    );
  }, [questionBank, qbFilters]);

  const instructorForSelection = allInstructors;

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'syllabus', label: 'Syllabus', icon: ListCollapse },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'outcomes', label: 'Outcomes', icon: Book },
    { id: 'instructors', label: 'Faculty', icon: Users },
    { id: 'doubtsolvers', label: 'Experts', icon: HelpCircle },
    { id: 'assignments', label: 'Tasks', icon: ClipboardEdit },
    { id: 'exams', label: 'Exams', icon: Award },
    { id: 'media', label: 'Media', icon: Video },
    { id: 'routine', label: 'Routine', icon: Calendar },
    { id: 'liveClasses', label: 'Live', icon: Video },
    { id: 'announcements', label: 'Notices', icon: Megaphone },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'settings', label: 'System', icon: Settings },
  ];

  if (loading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner className="w-12 h-12" /></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-full">
                <h1 className="font-headline text-3xl font-black uppercase tracking-tight text-primary truncate leading-tight">
                    {isNewCourse ? 'Initiate Core Program' : `Forge: ${courseTitle}`}
                </h1>
                <div className="h-1.5 w-24 bg-primary mt-2 rounded-full shadow-md" />
            </div>
            <div className="flex gap-3 shrink-0 w-full sm:w-auto">
                <Button variant="outline" onClick={() => handleSave('Draft')} disabled={isSaving} className="flex-1 sm:flex-none font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl border-2 shadow-xl active:scale-95 transition-all">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Draft
                </Button>
                <Button variant="accent" onClick={() => handleSave(userRole === 'Admin' ? 'Published' : 'Pending Approval')} disabled={isSaving} className="flex-1 sm:flex-none font-black uppercase tracking-widest text-[10px] h-12 px-10 rounded-xl shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white active:scale-95 transition-all border-none">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} 
                    {userRole === 'Admin' ? (initialStatus === 'Published' ? 'Sync Live' : 'Go Live') : 'Submit'}
                </Button>
            </div>
        </div>
        
        <Card className="rounded-xl border-primary/10 shadow-2xl overflow-hidden bg-card">
            <CardHeader className="p-0 border-b border-primary/5 bg-muted/30">
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-1 p-2">
                        {tabs.map(tab => (
                            <Button 
                                key={tab.id}
                                variant="ghost"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "rounded-lg shrink-0 font-black uppercase text-[10px] tracking-widest px-6 h-14 transition-all",
                                    activeTab === tab.id ? 'bg-primary/10 text-primary shadow-inner' : 'text-muted-foreground hover:bg-primary/5'
                                )}
                            >
                                <tab.icon className="mr-2 h-4 w-4"/>
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            
            <div className="p-6 md:p-12">
                {activeTab === 'details' && (
                    <div className="space-y-10 text-left">
                        <div className="space-y-3">
                            <Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60 ml-1">Program Authority Title</Label>
                            <Input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="h-14 md:h-16 rounded-xl text-lg md:text-xl font-black border-2 focus-visible:ring-primary shadow-sm" placeholder="e.g., MEDICAL ADMISSION COMMANDO BATCH 2025" />
                        </div>
                        <div className="space-y-3">
                            <Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60 ml-1">Curriculum Brief</Label>
                            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={8} className="rounded-xl text-base border-2 focus-visible:ring-primary p-6 shadow-sm font-medium" placeholder="Synthesize the educational value proposition here..." />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60 ml-1">Academic Category</Label>
                                <Input value={category} onChange={e => setCategory(e.target.value)} className="h-14 rounded-xl border-2 font-black uppercase text-sm" placeholder="e.g., ADMISSION" />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60 ml-1">Specialization</Label>
                                <Input value={subCategory} onChange={e => setSubCategory(e.target.value)} className="h-14 rounded-xl border-2 font-black uppercase text-sm" placeholder="e.g., MEDICAL" />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60 ml-1">Delivery Protocol</Label>
                                <Select value={courseType} onValueChange={(v: any) => setCourseType(v)}>
                                    <SelectTrigger className="h-14 rounded-xl border-2 font-black uppercase text-xs"><SelectValue/></SelectTrigger>
                                    <SelectContent className="rounded-lg"><SelectItem value="Online">Online Sync</SelectItem><SelectItem value="Offline">On-Site Hub</SelectItem><SelectItem value="Hybrid">Hybrid Force</SelectItem><SelectItem value="Exam">Exam Arsenal</SelectItem></SelectContent>
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
                                        courseInstructors={instructors}
                                    />
                                ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-2 border-primary/5">
                            <Button variant="outline" className="flex-1 h-16 border-dashed border-2 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-primary/5 transition-all" onClick={() => addSyllabusItem('module')}><PlusCircle className="mr-2 h-5 w-5 text-primary"/> Instate Module</Button>
                            <Button variant="outline" className="flex-1 h-16 border-dashed border-2 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-primary/5 transition-all" onClick={() => addSyllabusItem('lesson')}><PlusCircle className="mr-2 h-5 w-5 text-primary"/> Instate Lesson</Button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'pricing' && (
                    <div className="space-y-16 text-left">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <Card className="rounded-2xl border-2 border-primary/10 overflow-hidden shadow-2xl bg-card">
                                <CardHeader className="bg-primary/5 p-8 border-b-2 border-primary/5"><CardTitle className="text-xl font-black uppercase tracking-tight text-primary">Full Enrollment Pricing</CardTitle></CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-3"><Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60">Standard Listing (BDT)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="h-14 rounded-xl border-2 font-black text-2xl text-primary" placeholder="4500" /></div>
                                    <div className="space-y-3"><Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60">Flash Incentive (BDT)</Label><Input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} className="h-14 rounded-xl border-2 font-black text-2xl text-green-600" placeholder="3000" /></div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-2xl border-2 border-muted overflow-hidden shadow-2xl bg-card">
                                <CardHeader className="bg-muted/30 p-8 border-b-2 border-primary/5 flex flex-row items-center justify-between"><CardTitle className="text-xl font-black uppercase tracking-tight">Pre-booking Protocol</CardTitle><Switch checked={isPrebooking} onCheckedChange={setIsPrebooking}/></CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    {isPrebooking ? (
                                        <>
                                            <div className="space-y-3"><Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60">Early Bird Price (BDT)</Label><Input type="number" value={prebookingPrice} onChange={e => setPrebookingPrice(e.target.value)} className="h-14 rounded-xl border-2 font-black text-2xl" /></div>
                                            <div className="space-y-3"><Label className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60">Protocol Expiry</Label><DatePicker date={prebookingEndDate} setDate={setPrebookingEndDate} className="h-14 rounded-xl border-2 font-bold" /></div>
                                        </>
                                    ) : <div className="h-48 flex items-center justify-center text-muted-foreground font-black uppercase text-[10px] tracking-widest bg-muted/10 rounded-xl border-2 border-dashed">Protocol Offline</div>}
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 border-primary/10 pb-6 gap-4">
                                <h3 className="font-black uppercase tracking-tight text-2xl">Entitlement Cycles</h3>
                                <Button onClick={addCycle} variant="outline" className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] border-2 border-dashed shadow-lg active:scale-95"><PlusCircle className="mr-2 h-4 w-4 text-primary"/> Add New Cycle</Button>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                {(cycles || []).map((cycle, index) => (
                                    <Card key={cycle.id} className="rounded-2xl border-2 border-primary/5 shadow-xl group overflow-hidden bg-card hover:border-primary/20 transition-all">
                                        <CardHeader className="bg-primary/5 p-6 flex flex-row items-center justify-between">
                                            <Badge className="font-black rounded-lg px-4 py-1 uppercase text-[10px] tracking-widest">Cycle {index + 1}</Badge>
                                            <Button variant="ghost" size="icon" onClick={() => removeCycle(cycle.id)} className="h-10 w-10 text-destructive rounded-lg hover:bg-destructive/10"><Trash2 className="h-5 w-5"/></Button>
                                        </CardHeader>
                                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3 text-left"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Public Label</Label><Input value={cycle.title} onChange={e => updateCycle(cycle.id, 'title', e.target.value)} className="rounded-xl border-2 font-black uppercase text-sm" placeholder="e.g., JANUARY MODULE" /></div>
                                            <div className="space-y-3 text-left"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Cycle Price (BDT)</Label><Input type="number" value={cycle.price} onChange={e => updateCycle(cycle.id, 'price', e.target.value)} className="rounded-xl border-2 font-black text-2xl text-primary" placeholder="1000" /></div>
                                            <div className="col-span-full space-y-3 text-left">
                                                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Authorized Knowledge Modules</Label>
                                                <div className="flex flex-wrap gap-2 p-6 border-2 border-dashed rounded-xl bg-muted/20">
                                                    {syllabus.filter(s => s.type === 'module').map(m => (
                                                        <Badge 
                                                            key={m.id} 
                                                            variant={(cycle.moduleIds || []).includes(m.id) ? 'accent' : 'outline'}
                                                            className="cursor-pointer rounded-lg px-5 py-2 font-black uppercase text-[9px] tracking-wider transition-all select-none shadow-sm"
                                                            onClick={() => {
                                                                const ids = new Set(cycle.moduleIds || []);
                                                                if(ids.has(m.id)) ids.delete(m.id); else ids.add(m.id);
                                                                updateCycle(cycle.id, 'moduleIds', Array.from(ids));
                                                            }}
                                                        >
                                                            {m.title}
                                                        </Badge>
                                                    ))}
                                                    {syllabus.filter(s => s.type === 'module').length === 0 && <p className="text-xs text-muted-foreground font-bold italic">No modules defined in syllabus yet.</p>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'outcomes' && (
                    <div className="space-y-10 text-left">
                        <div className="p-8 md:p-12 border-2 rounded-2xl bg-card shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32"></div>
                            <Label className="font-black uppercase text-base tracking-tight text-primary flex items-center gap-3">
                                <Award className="h-6 w-6"/> Global Knowledge Milestones
                            </Label>
                            <div className="space-y-4">
                                {whatYouWillLearn.map((outcome, index) => (
                                    <div key={index} className="flex items-center gap-4 group">
                                        <div className="h-12 w-12 rounded-xl flex items-center justify-center font-black bg-primary text-white shrink-0 shadow-lg shadow-primary/20">{index + 1}</div>
                                        <Input value={outcome} onChange={e => updateOutcome(index, e.target.value)} className="h-14 rounded-xl border-2 focus-visible:ring-primary flex-grow font-bold shadow-sm" placeholder="Student will master the principles of..." />
                                        <Button variant="ghost" size="icon" onClick={() => removeOutcome(index)} className="text-destructive rounded-lg h-12 w-12 hover:bg-destructive/10 shrink-0"><Trash2 className="h-5 w-5"/></Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full h-16 border-dashed border-4 rounded-xl font-black uppercase tracking-[0.25em] text-[10px] shadow-xl hover:bg-primary/5 transition-all border-primary/10" onClick={addOutcome}><PlusCircle className="mr-2 h-6 w-6 text-primary"/> Register Milestone</Button>
                        </div>
                    </div>
                )}

                {activeTab === 'instructors' && (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                            {instructors.map(inst => (
                                <Card key={inst.slug} className="rounded-xl border-2 border-primary/10 overflow-hidden shadow-2xl text-center group bg-card transition-all hover:border-primary/40">
                                    <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                                        <Image src={inst.avatarUrl} alt={inst.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <Button variant="destructive" size="icon" onClick={() => removeInstructorFn(inst.slug)} className="absolute top-3 right-3 rounded-lg shadow-2xl h-10 w-10 border-2 border-white/20"><X className="h-5 w-5"/></Button>
                                    </div>
                                    <div className="p-5">
                                        <p className="font-black uppercase text-sm leading-tight break-words">{inst.name}</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{inst.title}</p>
                                    </div>
                                </Card>
                            ))}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="aspect-[4/5] h-full flex-col gap-6 border-dashed border-4 rounded-2xl border-primary/10 hover:bg-primary/5 hover:border-primary/30 transition-all min-h-[300px] shadow-xl">
                                        <PlusCircle className="h-12 w-12 text-primary opacity-40 group-hover:opacity-100" />
                                        <span className="font-black uppercase text-[10px] tracking-[0.3em] text-primary/60">Appoint Faculty</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0 rounded-xl overflow-hidden shadow-2xl border-primary/20 bg-background/95 backdrop-blur-xl">
                                    <Command>
                                        <CommandInput placeholder="Search faculty directory..." className="h-14 font-bold" />
                                        <CommandGroup className="p-2 max-h-[350px] overflow-y-auto scrollbar-hide">
                                            {instructorForSelection.filter(inst => !instructors.some(i => i.slug === inst.slug)).map(inst => (
                                                <CommandItem key={inst.id} onSelect={() => addInstructorFn(inst)} className="rounded-lg p-3 hover:bg-primary/5 cursor-pointer transition-colors mb-1">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-md"><AvatarImage src={inst.avatarUrl} /><AvatarFallback className="font-black">{inst.name.charAt(0)}</AvatarFallback></Avatar>
                                                        <div className="text-left"><p className="font-black text-xs uppercase tracking-tight">{inst.name}</p><p className="text-[9px] font-bold text-muted-foreground uppercase">{inst.title}</p></div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                            {instructorForSelection.filter(inst => !instructors.some(i => i.slug === inst.slug)).length === 0 && <p className="text-center p-4 text-xs font-bold text-muted-foreground italic">All faculty currently assigned.</p>}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-10 text-left">
                        <div className="grid gap-8">
                            {examTemplates.map((exam, index) => (
                                <Collapsible key={exam.id} className="rounded-2xl border-2 border-primary/10 shadow-xl overflow-hidden bg-card transition-all hover:border-primary/20">
                                    <div className="flex justify-between items-center p-8 bg-primary/5 border-b-2 border-primary/5">
                                        <div className="flex items-center gap-5"><Award className="h-8 w-8 text-primary shrink-0"/><span className="font-black uppercase text-lg tracking-tight truncate">{exam.title || `STRATEGIC ASSESSMENT ${index + 1}`}</span></div>
                                        <div className="flex items-center gap-3">
                                            <Button variant="ghost" size="icon" onClick={() => removeExam(exam.id)} className="text-destructive rounded-lg h-11 w-11 hover:bg-destructive/10"><Trash2 className="h-6 w-6"/></Button>
                                            <CollapsibleTrigger asChild><Button variant="ghost" size="icon" className="rounded-lg h-11 w-11"><ChevronDown className="h-6 w-6 transition-transform"/></Button></CollapsibleTrigger>
                                        </div>
                                    </div>
                                    <CollapsibleContent className="p-8 md:p-12 space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3 md:col-span-2 text-left"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Assessment Label</Label><Input value={exam.title} onChange={e => updateExam(exam.id, 'title', e.target.value)} className="h-14 rounded-xl border-2 font-black uppercase text-base shadow-sm" /></div>
                                            <div className="space-y-3 text-left"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Execution Protocol</Label>
                                                <Select value={exam.examType} onValueChange={(v: any) => updateExam(exam.id, 'examType', v)}>
                                                    <SelectTrigger className="h-14 rounded-xl border-2 font-black uppercase text-xs shadow-sm"><SelectValue/></SelectTrigger>
                                                    <SelectContent className="rounded-lg"><SelectItem value="MCQ">MCQ (AUTOMATED)</SelectItem><SelectItem value="Written">WRITTEN (MANUAL)</SelectItem><SelectItem value="Oral">ORAL VIVA</SelectItem><SelectItem value="Practical">PRACTICAL LAB</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3 text-left md:col-span-2"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Subject Matter</Label><Input value={exam.topic} onChange={e => updateExam(exam.id, 'topic', e.target.value)} className="h-14 rounded-xl border-2 font-bold shadow-sm" /></div>
                                            <div className="space-y-3 text-left"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Total Marks</Label><Input type="number" value={exam.totalMarks} onChange={e => updateExam(exam.id, 'totalMarks', Number(e.target.value))} className="h-14 rounded-xl border-2 font-black text-2xl text-primary shadow-sm" /></div>
                                        </div>
                                        <div className="pt-10 border-t-2 border-primary/5 flex flex-col sm:flex-row justify-end gap-4">
                                            <Button variant="outline" onClick={() => openQuestionBank(exam)} className="rounded-xl h-14 px-10 font-black uppercase text-[10px] tracking-[0.25em] border-2 border-dashed shadow-xl active:scale-95 transition-all"><Database className="mr-3 h-5 w-5 text-primary"/> Instate Items from Bank</Button>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                            <Button variant="outline" className="w-full h-20 border-dashed border-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-primary/5 transition-all border-primary/10" onClick={addExam}><PlusCircle className="mr-3 h-8 w-8 text-primary"/> Define Strategic Assessment</Button>
                        </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="space-y-10 text-left">
                        <Card className="rounded-2xl border-2 border-primary/10 overflow-hidden shadow-2xl bg-card relative">
                            <CardHeader className="bg-primary/5 p-8 border-b-2 border-primary/5"><CardTitle className="text-xl font-black uppercase tracking-tight text-primary">Visual Identification & Previews</CardTitle></CardHeader>
                            <CardContent className="p-8 md:p-12 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="space-y-3"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Master Thumbnail URL</Label><Input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} className="h-14 rounded-xl border-2 font-medium shadow-sm" /></div>
                                        <div className="space-y-3"><Label className="font-black uppercase text-[10px] tracking-widest text-primary/60">Introductory Trailer (YouTube)</Label><Input value={introVideoUrl} onChange={e => setIntroVideoUrl(e.target.value)} className="h-14 rounded-xl border-2 font-medium shadow-sm" placeholder="https://youtube.com/watch?v=..." /></div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-black uppercase text-[10px] tracking-widest text-primary/60 ml-1">Arrival Preview</Label>
                                        <div className="relative aspect-video rounded-2xl border-4 border-primary/5 overflow-hidden bg-muted shadow-2xl group">
                                            <Image src={thumbnailUrl} alt="Program Preview" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-10 text-left">
                        <div className="space-y-12 p-8 md:p-16 border-2 rounded-2xl bg-card shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48"></div>
                            <div className="space-y-4 max-w-3xl">
                                <Label className="flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.25em] text-primary">
                                    <LinkIcon className="h-5 w-5"/> Synchronized Community Hub URL
                                </Label>
                                <Input value={communityUrl} onChange={e => setCommunityUrl(e.target.value)} placeholder="https://facebook.com/groups/..." className="h-14 md:h-16 rounded-xl border-2 font-bold text-lg shadow-inner bg-muted/10" />
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest pl-1">Authorized access point for student collaboration.</p>
                            </div>
                            <Separator className="opacity-50" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="flex items-center justify-between rounded-xl border-2 border-primary/10 p-8 bg-muted/10 shadow-sm group hover:border-primary/30 transition-all">
                                    <div className="space-y-1.5"><Label className="font-black uppercase text-base tracking-tight leading-none">Public Enrollment Metrics</Label><p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Display real-time student force count</p></div>
                                    <Switch checked={showStudentCount} onCheckedChange={setShowStudentCount} />
                                </div>
                                <div className="flex items-center justify-between rounded-xl border-2 border-destructive/20 p-8 bg-destructive/5 shadow-sm group hover:border-destructive/40 transition-all">
                                    <div className="space-y-1.5"><Label className="font-black uppercase text-base tracking-tight text-destructive leading-none">Curriculum Sunset</Label><p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Terminate all active admissions</p></div>
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
            <DialogContent className="rounded-2xl p-10 md:p-16 border-4 border-primary shadow-2xl bg-background/95 backdrop-blur-2xl">
                <DialogHeader className="text-center">
                    <Wand2 className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
                    <DialogTitle className="text-3xl md:text-4xl font-black uppercase tracking-tight text-primary">RDC AI SYNERGIST</DialogTitle>
                    <DialogDescription className="font-black uppercase text-xs md:text-sm tracking-widest mt-4 opacity-70">Synthesize a master curriculum blueprint from a single topic.</DialogDescription>
                </DialogHeader>
                <div className="py-10"><Input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g., ADMISSION ARSENAL: PHYSICS 2025" className="h-16 md:h-20 rounded-xl border-4 text-xl md:text-2xl font-black text-center shadow-inner" /></div>
                <DialogFooter className="sm:justify-center gap-6 flex-col sm:flex-row">
                    <Button variant="outline" onClick={() => setIsAiDialogOpen(false)} className="rounded-xl h-16 px-12 font-black uppercase tracking-widest text-[10px] border-2 w-full sm:w-auto active:scale-95 transition-all">Abort Protocol</Button>
                    <Button onClick={handleGenerateCourse} disabled={isGenerating || !aiTopic} className="rounded-xl h-16 px-14 font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-2xl shadow-primary/20 w-full sm:w-auto active:scale-95 transition-all border-none">
                        {isGenerating ? <Loader2 className="mr-3 h-6 w-6 animate-spin"/> : <Wand2 className="mr-3 h-6 w-6"/>} 
                        Execute Synthesis
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isQuestionBankOpen} onOpenChange={setIsQuestionBankOpen}>
          <DialogContent className="max-w-6xl rounded-2xl border-4 border-primary overflow-hidden p-0 shadow-2xl w-[95vw] bg-background">
              <DialogHeader className="p-8 md:p-12 bg-primary/5 border-b-2 border-primary/10 flex flex-col items-center text-center"><Database className="h-12 w-12 text-primary mb-4"/><DialogTitle className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Knowledge Core Injection</DialogTitle><DialogDescription className="font-black uppercase text-[10px] tracking-[0.3em] mt-2 opacity-60">Mass-injecting strategic items from the central question bank.</DialogDescription></DialogHeader>
              <div className="flex flex-wrap gap-4 p-6 md:p-10 bg-muted/20 border-b-2 border-primary/5">
                 <Select value={qbFilters.subject} onValueChange={(v) => setQbFilters(f => ({...f, subject: v}))}><SelectTrigger className="w-full sm:w-[250px] h-14 rounded-xl border-none shadow-2xl font-black uppercase text-[10px] tracking-widest bg-background"><SelectValue placeholder="Target Subject"/></SelectTrigger>
                    <SelectContent className="rounded-lg">{[...new Set(questionBank.map(q => q.subject).filter(Boolean))].map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}</SelectContent>
                </Select>
                 <Select value={qbFilters.difficulty} onValueChange={(v) => setQbFilters(f => ({...f, difficulty: v}))}><SelectTrigger className="w-full sm:w-[200px] h-14 rounded-xl border-none shadow-2xl font-black uppercase text-[10px] tracking-widest bg-background"><SelectValue placeholder="Intelligence Scale"/></SelectTrigger>
                    <SelectContent className="rounded-lg"><SelectItem value="all">Full Spectrum</SelectItem><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="max-h-[45vh] overflow-y-auto p-6 md:p-10 scrollbar-hide">
                  <Table><TableBody className="divide-y divide-primary/5">
                      {filteredQbQuestions.map(q => (
                          <TableRow key={q.id} className="hover:bg-primary/5 border-none transition-colors group">
                              <TableCell className="w-16"><Checkbox checked={qbSelectedQuestions.some(sq => sq.id === q.id)} onCheckedChange={(checked) => checked ? setQbSelectedQuestions(p => [...p, q]) : setQbSelectedQuestions(p => p.filter(sq => sq.id !== q.id))} className="h-6 w-6 border-2"/></TableCell>
                              <TableCell className="font-bold text-base md:text-lg break-words py-6 pr-10">{q.text}</TableCell>
                              <TableCell className="text-right"><Badge variant="outline" className="rounded-lg px-4 py-1.5 font-black text-[9px] uppercase tracking-widest border-primary/20 bg-primary/5">{q.type}</Badge></TableCell>
                          </TableRow>
                      ))}</TableBody></Table>
                  {filteredQbQuestions.length === 0 && <div className="py-20 text-center font-black uppercase text-xs tracking-widest text-muted-foreground italic opacity-40">Zero items identified in local sector.</div>}
              </div>
              <DialogFooter className="p-8 md:p-12 border-t-2 border-primary/5 bg-muted/10 flex-col sm:flex-row gap-6">
                  <Button variant="outline" onClick={() => setIsQuestionBankOpen(false)} className="rounded-xl h-16 px-12 font-black uppercase tracking-widest text-[10px] border-2 w-full sm:w-auto active:scale-95 transition-all">Abort Protocol</Button>
                  <Button onClick={handleAddQuestionsFromBank} className="rounded-xl h-16 px-16 font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-2xl shadow-primary/20 w-full sm:w-auto truncate active:scale-95 transition-all border-none">Execute {qbSelectedQuestions.length} Artifact Injections</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
