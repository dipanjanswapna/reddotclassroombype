

'use client';

import { useState, useEffect, useMemo } from 'react';
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
  BarChart3,
  Database,
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
import { Course, SyllabusModule, AssignmentTemplate, Instructor, Announcement, LiveClass, ExamTemplate, Exam, Lesson as LessonType, Quiz as QuizType, Question } from '@/lib/types';
import { getCourse, getCourses, getCategories, getInstructorByUid, getOrganizationByUserId, getInstructors, getQuestionBank } from '@/lib/firebase/firestore';
import { saveCourseAction } from '@/app/actions/course.actions';
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
import { generateQuizForLesson } from '@/ai/flows/ai-quiz-generator-flow';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { postAnnouncementAction } from '@/app/actions/announcement.actions';
import { scheduleLiveClassAction } from '@/app/actions/live-class.actions';
import { removeUndefinedValues, cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { ExamLeaderboard } from './exam-leaderboard';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';


type LessonData = {
    id: string;
    type: 'video' | 'quiz' | 'document';
    title: string;
    duration: string;
    videoId?: string;
    lectureSheetUrl?: string;
    quizId?: string;
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

type ClassRoutineItem = {
  id: string;
  day: string;
  subject: string;
  time: string;
  instructorName?: string;
}

type AnnouncementItem = Announcement;

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
    quizzes,
    updateItem,
    removeItem,
    onGenerateQuiz,
    generatingQuizForLesson,
}: { 
    item: SyllabusItem,
    quizzes: QuizData[],
    updateItem: (id: string, field: string, value: any) => void,
    removeItem: (id: string) => void,
    onGenerateQuiz: (lessonId: string, lessonTitle: string) => void,
    generatingQuizForLesson: string | null,
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
                                <Label htmlFor={`videoId-${item.id}`}>YouTube Video ID</Label>
                                <Input id={`videoId-${item.id}`} placeholder="e.g., dQw4w9WgXcQ" value={item.videoId || ''} onChange={(e) => updateItem(item.id, 'videoId', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`duration-${item.id}`}>Lesson Duration</Label>
                                <Input id={`duration-${item.id}`} placeholder="e.g., 45 min" value={item.duration || ''} onChange={(e) => updateItem(item.id, 'duration', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {item.type === 'quiz' && (
                        <div className="space-y-2">
                            <Label>Select Quiz</Label>
                            <Select value={item.quizId || ''} onValueChange={(value) => updateItem(item.id, 'quizId', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a quiz to link..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {quizzes.length === 0 ? (
                                        <div className="p-4 text-sm text-muted-foreground text-center">No quizzes created yet.</div>
                                    ) : (
                                        quizzes.map(quiz => (
                                            <SelectItem key={quiz.id} value={quiz.id}>{quiz.title}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                You can create new quizzes in the "Quizzes" tab.
                            </p>
                        </div>
                    )}
                     
                    {(item.type === 'video' || item.type === 'document') && (
                        <>
                        <div className="space-y-2">
                            <Label htmlFor={`sheetUrl-${item.id}`}>Lecture Sheet / Document URL</Label>
                            <Input id={`sheetUrl-${item.id}`} placeholder="https://docs.google.com/..." value={item.lectureSheetUrl || ''} onChange={(e) => updateItem(item.id, 'lectureSheetUrl', e.target.value)} />
                        </div>
                        {!item.quizId && (
                            <div className="pt-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs h-auto py-1 px-2"
                                    onClick={() => onGenerateQuiz(item.id, item.title)}
                                    disabled={generatingQuizForLesson === item.id}
                                >
                                    {generatingQuizForLesson === item.id 
                                        ? <Loader2 className="mr-2 h-3 w-3 animate-spin"/> 
                                        : <Wand2 className="mr-2 h-3 w-3"/>
                                    }
                                    Generate Quiz with AI
                                </Button>
                            </div>
                        )}
                        </>
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

const questionTypes: Question['type'][] = ['MCQ', 'True/False', 'Fill in the Blanks', 'Short Answer', 'Essay', 'Matching'];
const difficultyColors: Record<Question['difficulty'], string> = {
  Easy: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-300',
  Hard: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300',
};


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
  const [subCategory, setSubCategory] = useState('');
  const [courseType, setCourseType] = useState<'Online' | 'Offline' | 'Hybrid' | 'Exam'>('Online');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://placehold.co/600x400.png');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([]);
  const [includedCourseIds, setIncludedCourseIds] = useState<string[]>([]);
  const [allArchivedCourses, setAllArchivedCourses] = useState<Course[]>([]);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [classRoutine, setClassRoutine] = useState<ClassRoutineItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [assignmentTemplates, setAssignmentTemplates] = useState<AssignmentTemplate[]>([]);
  const [examTemplates, setExamTemplates] = useState<ExamTemplate[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);
  const [initialStatus, setInitialStatus] = useState<Course['status'] | null>(null);
  const [showStudentCount, setShowStudentCount] = useState(false);

  // Pre-booking states
  const [isPrebooking, setIsPrebooking] = useState(false);
  const [prebookingPrice, setPrebookingPrice] = useState('');
  const [prebookingEndDate, setPrebookingEndDate] = useState<Date | undefined>();
  const [prebookingTarget, setPrebookingTarget] = useState<number | undefined>();

  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingQuizForLesson, setGeneratingQuizForLesson] = useState<string | null>(null);

  const [isLiveClassDialogOpen, setIsLiveClassDialogOpen] = useState(false);
  const [newLiveClassTopic, setNewLiveClassTopic] = useState('');
  const [newLiveClassDate, setNewLiveClassDate] = useState<Date | undefined>(new Date());
  const [newLiveClassTime, setNewLiveClassTime] = useState('');
  const [newLiveClassPlatform, setNewLiveClassPlatform] = useState<LiveClass['platform']>('Zoom');
  const [newLiveClassJoinUrl, setNewLiveClassJoinUrl] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const [isExamResultsOpen, setIsExamResultsOpen] = useState(false);
  const [selectedExamTemplateForResults, setSelectedExamTemplateForResults] = useState<ExamTemplate | null>(null);
  
  // Question Bank states
  const [allQuestionsFromBank, setAllQuestionsFromBank] = useState<Question[]>([]);
  const [isQuestionBankDialogOpen, setIsQuestionBankDialogOpen] = useState(false);
  const [activeExamTemplateId, setActiveExamTemplateId] = useState<string | null>(null);
  const [selectedBankQuestions, setSelectedBankQuestions] = useState<Set<string>>(new Set());
  const [bankSubjectFilter, setBankSubjectFilter] = useState('all');
  const [bankChapterFilter, setBankChapterFilter] = useState('all');
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState('all');
  const [bankTypeFilter, setBankTypeFilter] = useState('all');

  
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
    async function fetchInitialData() {
        try {
            const [ fetchedCategories, allCourses, allInstructorsData, fetchedQuestions ] = await Promise.all([
                getCategories(),
                getCourses(),
                getInstructors(),
                getQuestionBank(),
            ]);
            setAllCategories(fetchedCategories);
            setAllArchivedCourses(allCourses.filter(c => c.isArchived));
            setAllInstructors(allInstructorsData.filter(i => i.status === 'Approved'));
            setAllQuestionsFromBank(fetchedQuestions);

            if (!isNewCourse) {
                const courseData = await getCourse(courseId);
                if (courseData) {
                    setInitialStatus(courseData.status);
                    setCourseTitle(courseData.title || '');
                    setDescription(courseData.description || '');
                    setCategory(courseData.category || '');
                    setSubCategory(courseData.subCategory || '');
                    setCourseType(courseData.type || 'Online');
                    setPrice(courseData.price?.replace(/[^0-9.]/g, '') || '');
                    setDiscountPrice(courseData.discountPrice?.replace(/[^0-9.]/g, '') || '');
                    setIsPrebooking(courseData.isPrebooking || false);
                    setPrebookingPrice(courseData.prebookingPrice?.replace(/[^0-9.]/g, '') || '');
                    setPrebookingEndDate(courseData.prebookingEndDate ? new Date(courseData.prebookingEndDate) : undefined);
                    setPrebookingTarget(courseData.prebookingTarget || undefined);
                    let imageUrl = courseData.imageUrl || 'https://placehold.co/600x400.png';
                    if (imageUrl.includes('placehold.c/')) {
                      imageUrl = imageUrl.replace('placehold.c/', 'placehold.co/');
                    }
                    setThumbnailUrl(imageUrl);
                    setIntroVideoUrl(courseData.videoUrl || '');
                    setWhatsappNumber(courseData.whatsappNumber || '');
                    setWhatYouWillLearn(courseData.whatYouWillLearn || []);
                    setIncludedCourseIds(courseData.includedArchivedCourseIds || []);
                    setSyllabus(getSyllabusItems(courseData));
                    setFaqs(courseData.faqs?.map(f => ({...f, id: Math.random().toString()})) || []);
                    
                    const courseInstructors = courseData.instructors.map(courseInst => {
                        return allInstructorsData.find(i => i.slug === courseInst.slug);
                    }).filter((i): i is Instructor => !!i);
                    setInstructors(courseInstructors);

                    setClassRoutine(courseData.classRoutine?.map(cr => ({...cr, id: Math.random().toString()})) || []);
                    setAnnouncements(courseData.announcements?.map(a => ({...a})) || []);
                    setLiveClasses(courseData.liveClasses || []);
                    setQuizzes(courseData.quizzes?.map(q => ({...q, id: q.id || Math.random().toString()})) || []);
                    setAssignmentTemplates(courseData.assignmentTemplates?.map(a => ({...a, id: a.id || Math.random().toString(), deadline: a.deadline ? new Date(a.deadline as string) : undefined })) || []);
                    setExamTemplates(courseData.examTemplates?.map(e => ({...e, id: e.id || Math.random().toString(), examDate: e.examDate ? new Date(e.examDate as string) : undefined })) || []);
                    setAllExams(courseData.exams || []);
                    setOrganizationId(courseData.organizationId);
                    setShowStudentCount(courseData.showStudentCount || false);
                } else {
                    notFound();
                }
            } else {
                // Pre-fill based on user role for new course
                if (userInfo) {
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
            }
        } catch (err) {
            console.error(err);
            toast({ title: 'Error loading data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchInitialData();
  }, [courseId, isNewCourse, toast, userInfo, userRole]);


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

  const addRoutineItem = () => setClassRoutine(prev => [...prev, { id: Date.now().toString(), day: '', subject: '', time: '', instructorName: '' }]);
  const updateRoutineItem = (id: string, field: keyof Omit<ClassRoutineItem, 'id'>, value: string) => {
      setClassRoutine(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeRoutineItem = (id: string) => setClassRoutine(prev => prev.filter(item => item.id !== id));
  
  const removeLiveClass = (id: string) => {
    setLiveClasses(prev => prev.filter(lc => lc.id !== id));
  };
  
  // Quiz Management
  const addQuiz = () => setQuizzes(prev => [...prev, { id: `quiz_${Date.now()}`, title: 'New Quiz', topic: '', questions: [] }]);
  const removeQuiz = (id: string) => setQuizzes(prev => prev.filter(q => q.id !== id));
  const updateQuiz = (id: string, field: 'title' | 'topic', value: string) => setQuizzes(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  
  // Exam Management
  const addExamQuestion = (examId: string) => {
    setExamTemplates(prev => prev.map(exam => {
      if (exam.id === examId) {
        const newQuestionId = `new_q_${Date.now()}`;
        const newQuestion: Question = {
          id: newQuestionId,
          text: 'New Question',
          type: 'MCQ',
          options: [],
          points: 1,
          difficulty: 'Medium',
        };
        return { ...exam, questions: [...(exam.questions || []), newQuestion] };
      }
      return exam;
    }));
  };

  const removeExamQuestion = (examId: string, questionId: string) => {
    setExamTemplates(prev => prev.map(exam => 
      exam.id === examId 
        ? { ...exam, questions: (exam.questions || []).filter(q => q.id !== questionId) } 
        : exam
    ));
  };
  
  const updateExamQuestionField = (examId: string, questionId: string, field: keyof Question, value: any) => {
    setExamTemplates(prev => prev.map(exam => 
      exam.id === examId 
        ? { ...exam, questions: (exam.questions || []).map(q => q.id === questionId ? { ...q, [field]: value } : q) } 
        : exam
    ));
  };

  const updateExamQuestionOption = (examId: string, questionId: string, optionId: string, field: 'text' | 'isCorrect', value: string | boolean) => {
    setExamTemplates(prev => prev.map(exam => {
      if (exam.id === examId) {
        const newQuestions = (exam.questions || []).map(q => {
          if (q.id === questionId) {
            const newOptions = (q.options || []).map(opt => opt.id === optionId ? { ...opt, [field]: value } : opt);
            return { ...q, options: newOptions };
          }
          return q;
        });
        return { ...exam, questions: newQuestions };
      }
      return exam;
    }));
  };
  
  const addExamOption = (examId: string, questionId: string) => {
    setExamTemplates(prev => prev.map(exam => {
      if (exam.id === examId) {
        const newQuestions = (exam.questions || []).map(q => {
          if (q.id === questionId) {
            return { ...q, options: [...(q.options || []), { id: `opt_${Date.now()}`, text: '', isCorrect: false }] };
          }
          return q;
        });
        return { ...exam, questions: newQuestions };
      }
      return exam;
    }));
  };

  const removeExamOption = (examId: string, questionId: string, optionId: string) => {
    setExamTemplates(prev => prev.map(exam => {
      if (exam.id === examId) {
        const newQuestions = (exam.questions || []).map(q => {
          if (q.id === questionId) {
            return { ...q, options: (q.options || []).filter(opt => opt.id !== optionId) };
          }
          return q;
        });
        return { ...exam, questions: newQuestions };
      }
      return exam;
    }));
  };

  const addAssignmentTemplate = () => setAssignmentTemplates(prev => [...prev, { id: Date.now().toString(), title: '', topic: '' }]);
  const removeAssignmentTemplate = (id: string) => setAssignmentTemplates(prev => prev.filter(a => a.id !== id));
  const updateAssignmentTemplate = (id: string, field: 'title' | 'topic' | 'deadline', value: string | Date | undefined) => {
    setAssignmentTemplates(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addExamTemplate = () => setExamTemplates(prev => [...prev, { id: Date.now().toString(), title: '', topic: '', examType: 'Written', totalMarks: 100, questions: [] }]);
  const removeExamTemplate = (id: string) => setExamTemplates(prev => prev.filter(e => e.id !== id));
  const updateExamTemplate = (id: string, field: keyof Omit<ExamTemplate, 'id' | 'questions'>, value: string | number | Date | boolean | undefined) => {
    setExamTemplates(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
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

  const handlePostAnnouncement = async () => {
    if (!newAnnouncementTitle || !newAnnouncementContent) {
      toast({ title: 'Error', description: 'Title and content cannot be empty.', variant: 'destructive' });
      return;
    }
    if (isNewCourse) {
      toast({ title: 'Save Course First', description: 'You must save the course as a draft before posting announcements.', variant: 'destructive' });
      return;
    }
    setIsPostingAnnouncement(true);
    const result = await postAnnouncementAction(courseId, newAnnouncementTitle, newAnnouncementContent);
    
    if (result.success && result.newAnnouncement) {
        setAnnouncements(prev => [result.newAnnouncement!, ...prev]);
        setNewAnnouncementTitle('');
        setNewAnnouncementContent('');
        toast({ title: 'Success', description: 'Announcement posted and notifications sent.' });
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsPostingAnnouncement(false);
  };

  const removeAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleScheduleLiveClass = async () => {
    if (isNewCourse) {
      toast({ title: 'Save Course First', description: 'You must save the course as a draft before scheduling live classes.', variant: 'destructive' });
      return;
    }
    if (!newLiveClassTopic || !newLiveClassDate || !newLiveClassTime || !newLiveClassPlatform || !newLiveClassJoinUrl) {
        toast({ title: 'Error', description: 'Please fill out all fields for the live class.', variant: 'destructive' });
        return;
    }
    
    setIsScheduling(true);

    const liveClassData: Omit<LiveClass, 'id'> = {
        topic: newLiveClassTopic,
        date: format(newLiveClassDate, 'yyyy-MM-dd'),
        time: newLiveClassTime,
        platform: newLiveClassPlatform,
        joinUrl: newLiveClassJoinUrl,
    };

    const result = await scheduleLiveClassAction(courseId, liveClassData);
    
    if (result.success && result.newLiveClass) {
        setLiveClasses(prev => [...prev, result.newLiveClass!]);
        toast({ title: 'Success!', description: `Scheduled "${newLiveClassTopic}" successfully.` });
        setIsLiveClassDialogOpen(false);
        // Reset form
        setNewLiveClassTopic('');
        setNewLiveClassDate(new Date());
        setNewLiveClassTime('');
        setNewLiveClassPlatform('Zoom');
        setNewLiveClassJoinUrl('');
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsScheduling(false);
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
                quizId: item.quizId || ''
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
        isPrebooking,
        prebookingPrice: isPrebooking ? `BDT ${prebookingPrice || 0}` : '',
        prebookingEndDate: isPrebooking && prebookingEndDate ? format(prebookingEndDate, 'yyyy-MM-dd') : '',
        prebookingTarget: isPrebooking ? prebookingTarget || 0 : 0,
        imageUrl: thumbnailUrl,
        videoUrl: introVideoUrl,
        whatsappNumber: whatsappNumber,
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
        classRoutine: classRoutine.map(({ id, ...rest }) => rest).filter(r => r.day && r.subject && r.time),
        includedArchivedCourseIds: includedCourseIds,
        announcements: announcements,
        liveClasses: liveClasses,
        quizzes: quizzes,
        assignmentTemplates: assignmentTemplates.map(a => {
            const { deadline, ...rest } = a;
            const formattedDeadline = deadline instanceof Date && !isNaN(deadline.getTime())
                ? format(deadline, 'yyyy-MM-dd')
                : deadline?.toString() || '';
            return {
                ...rest,
                deadline: formattedDeadline,
            };
        }).filter(a => a.title),
        examTemplates: examTemplates.map(e => {
            const { examDate, ...rest } = e;
            const formattedDate = examDate instanceof Date && !isNaN(examDate.getTime())
                ? format(examDate, 'yyyy-MM-dd')
                : examDate?.toString() || '';
            return {
                ...rest,
                examDate: formattedDate,
            };
        }).filter(e => e.title),
        status,
        organizationId: organizationId,
        showStudentCount: showStudentCount,
    };

    if (!isNewCourse) {
        courseData.id = courseId;
    }
    
    if (initialStatus === 'Published' && status !== 'Published') {
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
          toastTitle = 'Course Updated';
      }
      toast({ 
          title: toastTitle, 
          description: result.message 
      });
      if (status === 'Pending Approval' || (isNewCourse && result.courseId)) {
        router.push(redirectPath);
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
  
    const handleGenerateQuiz = async (lessonId: string, lessonTitle: string) => {
        setGeneratingQuizForLesson(lessonId);
        try {
            const result = await generateQuizForLesson({
                lessonTitle: lessonTitle,
                courseContext: `Course Title: ${courseTitle}\nDescription: ${description}`
            });
            
            const newQuizId = `quiz_${Date.now()}`;
            const newQuiz: QuizData = {
                id: newQuizId,
                title: result.title,
                topic: lessonTitle,
                questions: result.questions.map(q => ({
                    ...q,
                    id: `${newQuizId}-${q.id}`
                }))
            };

            setQuizzes(prev => [...prev, newQuiz]);
            
            const newLesson: LessonData = {
              id: `lesson_${Date.now()}`,
              type: 'quiz',
              title: `Quiz: ${lessonTitle}`,
              duration: `${result.questions.length} Questions`,
              quizId: newQuizId,
            };
            
            const lessonIndex = syllabus.findIndex(item => item.id === lessonId);
            if (lessonIndex > -1) {
                const newSyllabus = [...syllabus];
                newSyllabus.splice(lessonIndex + 1, 0, newLesson);
                setSyllabus(newSyllabus);
            }

            updateSyllabusItem(lessonId, 'quizId', newQuizId);

            toast({
                title: 'Quiz Generated!',
                description: `An AI-powered quiz for "${lessonTitle}" has been created and added to the syllabus.`
            });

        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to generate quiz with AI.", variant: "destructive"});
        } finally {
            setGeneratingQuizForLesson(null);
        }
    };
    
    // Question Bank Dialog Logic
    const bankSubjects = useMemo(() => [...new Set(allQuestionsFromBank.map(q => q.subject).filter(Boolean))] as string[], [allQuestionsFromBank]);
    const bankChapters = useMemo(() => [...new Set(allQuestionsFromBank.map(q => q.chapter).filter(Boolean))] as string[], [allQuestionsFromBank]);

    const filteredBankQuestions = useMemo(() => {
        return allQuestionsFromBank.filter(q => 
            (bankSubjectFilter === 'all' || q.subject === bankSubjectFilter) &&
            (bankChapterFilter === 'all' || q.chapter === bankChapterFilter) &&
            (bankDifficultyFilter === 'all' || q.difficulty === bankDifficultyFilter) &&
            (bankTypeFilter === 'all' || q.type === bankTypeFilter)
        );
    }, [allQuestionsFromBank, bankSubjectFilter, bankChapterFilter, bankDifficultyFilter, bankTypeFilter]);

    const handleSelectBankQuestion = (questionId: string, checked: boolean) => {
        setSelectedBankQuestions(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(questionId);
            } else {
                newSet.delete(questionId);
            }
            return newSet;
        });
    };
    
    const handleAddFromBank = () => {
        if (!activeExamTemplateId) return;

        const questionsToAdd = allQuestionsFromBank.filter(q => selectedBankQuestions.has(q.id!));

        setExamTemplates(prev => prev.map(exam => {
            if (exam.id === activeExamTemplateId) {
                const existingQuestionIds = new Set((exam.questions || []).map(q => q.id));
                const newQuestions = questionsToAdd.filter(q => !existingQuestionIds.has(q.id!));
                
                if (newQuestions.length !== questionsToAdd.length) {
                    toast({ title: 'Notice', description: 'Duplicate questions were not added.' });
                }

                return { ...exam, questions: [...(exam.questions || []), ...newQuestions] };
            }
            return exam;
        }));
        
        setSelectedBankQuestions(new Set());
        setActiveExamTemplateId(null);
        setIsQuestionBankDialogOpen(false);
    };

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'syllabus', label: 'Syllabus', icon: BookCopy },
    { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
    { id: 'assignments', label: 'Assignments', icon: ClipboardEdit },
    { id: 'exams', label: 'Exams', icon: Award },
    { id: 'live-classes', label: 'Live Classes', icon: Video },
    { id: 'outcomes', label: 'Outcomes', icon: Book },
    { id: 'instructors', label: 'Instructors', icon: Users },
    { id: 'routine', label: 'Routine', icon: Calendar },
    { id: 'media', label: 'Media', icon: CloudUpload },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'bundles', label: 'Bundles', icon: Archive },
  ];

  const filteredTabs = courseType === 'Exam'
    ? tabs.filter(tab => !['syllabus', 'quizzes', 'assignments', 'routine', 'outcomes', 'bundles'].includes(tab.id))
    : tabs;

  const isPublished = !isNewCourse && initialStatus === 'Published';

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
                {isPublished && userRole === 'Admin' ? (
                    <Button variant="accent" onClick={() => handleSave('Published')} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Save Changes
                    </Button>
                ) : (
                    <>
                        <Button variant="outline" onClick={() => handleSave('Draft')} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Save Draft
                        </Button>
                        <Button variant="accent" onClick={() => handleSave('Pending Approval')} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} Submit for Approval
                        </Button>
                    </>
                )}
            </div>
        </div>
        
        <Card>
            <CardHeader className="p-0">
                <div className="border-b">
                    <div className="flex items-center gap-1 overflow-x-auto p-1">
                        {filteredTabs.map(tab => (
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
                  <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label htmlFor="showStudentCount" className="font-semibold">Show Student Count</Label>
                            <p className="text-sm text-muted-foreground">
                                Display the total number of enrolled students on the public course page.
                            </p>
                        </div>
                        <Switch
                            id="showStudentCount"
                            checked={showStudentCount}
                            onCheckedChange={setShowStudentCount}
                        />
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
                                    quizzes={quizzes}
                                    updateItem={updateSyllabusItem}
                                    removeItem={removeSyllabusItem}
                                    onGenerateQuiz={handleGenerateQuiz}
                                    generatingQuizForLesson={generatingQuizForLesson}
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
            
            {activeTab === 'instructors' && (
                <CardContent className="pt-6">
                    <CardDescription className="mb-4">Select the instructors who will be teaching this course.</CardDescription>
                     <div className="space-y-4">
                        {instructors.map(instructor => (
                            <div key={instructor.slug} className="p-2 border rounded-md flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={instructor.avatarUrl} alt={instructor.name} />
                                    <AvatarFallback>{instructor.name.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold">{instructor.name}</p>
                                    <p className="text-sm text-muted-foreground">{instructor.title}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeInstructor(instructor.slug!)}><X className="text-destructive h-4 w-4"/></Button>
                            </div>
                        ))}
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="mt-4 w-full border-dashed"><PlusCircle className="mr-2"/>Add Instructor</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search instructor..." />
                                <CommandEmpty>No instructor found.</CommandEmpty>
                                <CommandGroup>
                                    {allInstructors
                                        .filter(inst => !instructors.some(selected => selected.slug === inst.slug))
                                        .map(inst => (
                                        <CommandItem
                                            key={inst.id}
                                            value={inst.name}
                                            onSelect={() => addInstructor(inst)}
                                        >
                                           {inst.name} ({inst.title})
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </CardContent>
            )}

            {activeTab === 'live-classes' && (
              <CardContent className="pt-6 space-y-4">
                <CardDescription>Schedule and manage live classes for this course. Scheduled classes are added immediately.</CardDescription>
                <div className="space-y-2">
                    {liveClasses.map(lc => (
                        <div key={lc.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                            <Video className="h-5 w-5 text-muted-foreground"/>
                            <div className="flex-grow">
                                <p className="font-semibold">{lc.topic}</p>
                                <p className="text-xs text-muted-foreground">{lc.date} at {lc.time} via {lc.platform}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeLiveClass(lc.id)}><X className="text-destructive h-4 w-4"/></Button>
                        </div>
                    ))}
                </div>
                <Button variant="outline" className="w-full" onClick={() => setIsLiveClassDialogOpen(true)}><PlusCircle className="mr-2"/>Schedule New Live Class</Button>
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
                           <p className="text-sm text-muted-foreground">Questions will be added in a future update.</p>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addQuiz}><PlusCircle className="mr-2"/>Add New Quiz</Button>
                </CardContent>
            )}

            {activeTab === 'assignments' && (
                <CardContent className="pt-6 space-y-4">
                    <CardDescription>Create assignment templates for this course. When a student enrolls, a personal copy of each assignment will be generated for them.</CardDescription>
                    <div className="space-y-2">
                        {assignmentTemplates.map(assignment => (
                        <Collapsible key={assignment.id} className="p-4 border rounded-md bg-muted/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-grow">
                                    <ClipboardEdit className="h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        value={assignment.title}
                                        onChange={e => updateAssignmentTemplate(assignment.id, 'title', e.target.value)}
                                        placeholder="Assignment Title"
                                        className="font-semibold bg-transparent border-0 focus-visible:ring-1"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => removeAssignmentTemplate(assignment.id)}>
                                        <X className="text-destructive h-4 w-4"/>
                                    </Button>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                            </div>
                            <CollapsibleContent className="pt-4 mt-4 border-t space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor={`as-topic-${assignment.id}`}>Topic</Label>
                                    <Input id={`as-topic-${assignment.id}`} value={assignment.topic} onChange={e => updateAssignmentTemplate(assignment.id, 'topic', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`as-deadline-${assignment.id}`}>Deadline</Label>
                                    <DatePicker date={assignment.deadline as Date | undefined} setDate={(date) => updateAssignmentTemplate(assignment.id, 'deadline', date)} />
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full" onClick={addAssignmentTemplate}><PlusCircle className="mr-2"/>Add Assignment Template</Button>
                </CardContent>
            )}

             {activeTab === 'exams' && (
                <CardContent className="pt-6 space-y-4">
                    <CardDescription>Create exam templates. When a student enrolls, a personal copy of each exam will be generated for them.</CardDescription>
                    <div className="space-y-2">
                        {examTemplates.map(exam => (
                        <Collapsible key={exam.id} className="p-4 border rounded-md bg-muted/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-grow">
                                    <Award className="h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        value={exam.title}
                                        onChange={e => updateExamTemplate(exam.id, 'title', e.target.value)}
                                        placeholder="Exam Title"
                                        className="font-semibold bg-transparent border-0 focus-visible:ring-1"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-8" onClick={() => { setSelectedExamTemplateForResults(exam); setIsExamResultsOpen(true); }}><BarChart3 className="mr-2 h-4 w-4" />View Submissions</Button>
                                    <Button variant="ghost" size="icon" onClick={() => removeExamTemplate(exam.id)}>
                                        <X className="text-destructive h-4 w-4"/>
                                    </Button>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                            </div>
                            <CollapsibleContent className="pt-4 mt-4 border-t space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Topic</Label>
                                        <Input value={exam.topic} onChange={e => updateExamTemplate(exam.id, 'topic', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Exam Type</Label>
                                        <Select value={exam.examType} onValueChange={(value: ExamTemplate['examType']) => updateExamTemplate(exam.id, 'examType', value)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Written">Written</SelectItem>
                                                <SelectItem value="MCQ">MCQ</SelectItem>
                                                <SelectItem value="Oral">Oral</SelectItem>
                                                <SelectItem value="Practical">Practical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <Label>Total Marks</Label>
                                        <Input type="number" value={exam.totalMarks} onChange={e => updateExamTemplate(exam.id, 'totalMarks', Number(e.target.value))} />
                                    </div>
                                     <div className="space-y-1">
                                        <Label>Duration (Minutes)</Label>
                                        <Input type="number" value={exam.duration || ''} onChange={e => updateExamTemplate(exam.id, 'duration', Number(e.target.value))} placeholder="e.g., 60"/>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Exam Date</Label>
                                        <DatePicker date={exam.examDate as Date | undefined} setDate={(date) => updateExamTemplate(exam.id, 'examDate', date)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Pass Marks</Label>
                                        <Input type="number" value={exam.passMarks || ''} onChange={e => updateExamTemplate(exam.id, 'passMarks', Number(e.target.value))} placeholder="e.g., 40"/>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Max Attempts</Label>
                                        <Input type="number" value={exam.maxAttempts || ''} onChange={e => updateExamTemplate(exam.id, 'maxAttempts', Number(e.target.value))} placeholder="e.g., 1"/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2 pt-6">
                                        <Switch id={`shuffle-questions-${exam.id}`} checked={exam.shuffleQuestions} onCheckedChange={checked => updateExamTemplate(exam.id, 'shuffleQuestions', checked)} />
                                        <Label htmlFor={`shuffle-questions-${exam.id}`}>Shuffle Questions</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-6">
                                        <Switch id={`shuffle-options-${exam.id}`} checked={exam.shuffleOptions} onCheckedChange={checked => updateExamTemplate(exam.id, 'shuffleOptions', checked)} />
                                        <Label htmlFor={`shuffle-options-${exam.id}`}>Shuffle Options</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-6">
                                        <Switch id={`allow-back-${exam.id}`} checked={exam.allowBackNavigation} onCheckedChange={checked => updateExamTemplate(exam.id, 'allowBackNavigation', checked)} />
                                        <Label htmlFor={`allow-back-${exam.id}`}>Allow Back Navigation</Label>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 pt-4">
                                    <Switch id={`webcam-proctor-${exam.id}`} checked={exam.webcamProctoring} onCheckedChange={checked => updateExamTemplate(exam.id, 'webcamProctoring', checked)} />
                                    <Label htmlFor={`webcam-proctor-${exam.id}`}>Enable Webcam Proctoring</Label>
                                </div>
                                <div className="pt-4 border-t">
                                    <h4 className="text-md font-semibold mb-2">Questions</h4>
                                    <div className="space-y-4">
                                        {(exam.questions || []).map((q, qIndex) => (
                                            <div key={q.id} className="p-3 border bg-background rounded-md space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold">Question {qIndex + 1}</p>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExamQuestion(exam.id, q.id!)}><X className="h-3 w-3 text-destructive"/></Button>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Image (Optional)</Label>
                                                    {q.mediaUrl ? (
                                                        <div className="relative w-full h-48 border rounded-md overflow-hidden">
                                                            <Image src={q.mediaUrl} alt="Question media" layout="fill" objectFit="contain" />
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute top-1 right-1 h-7 w-7"
                                                                onClick={() => {
                                                                    updateExamQuestionField(exam.id, q.id!, 'mediaUrl', undefined);
                                                                    updateExamQuestionField(exam.id, q.id!, 'mediaType', undefined);
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            className="h-auto"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        updateExamQuestionField(exam.id, q.id!, 'mediaUrl', reader.result as string);
                                                                        updateExamQuestionField(exam.id, q.id!, 'mediaType', 'image');
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <Textarea value={q.text} onChange={(e) => updateExamQuestionField(exam.id, q.id!, 'text', e.target.value)} placeholder="Question text"/>
                                            </div>
                                        ))}
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <Button variant="outline" className="w-full" onClick={() => addExamQuestion(exam.id)}>
                                                <PlusCircle className="mr-2"/>Add New Question
                                            </Button>
                                            <Button variant="outline" className="w-full" onClick={() => {
                                                setActiveExamTemplateId(exam.id);
                                                setIsQuestionBankDialogOpen(true);
                                            }}>
                                                <Database className="mr-2 h-4 w-4"/>Add from Bank
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full" onClick={addExamTemplate}><PlusCircle className="mr-2"/>Add Exam Template</Button>
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
                            <Button onClick={handlePostAnnouncement} disabled={isPostingAnnouncement}>
                                {isPostingAnnouncement ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                Post Announcement
                            </Button>
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

            {activeTab === 'contact' && (
                <CardContent className="pt-6">
                    <div className="space-y-2 max-w-sm">
                        <Label htmlFor="whatsappNumber">WhatsApp Contact Number</Label>
                        <Input id="whatsappNumber" type="text" placeholder="e.g., 8801712345678" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} />
                        <CardDescription>Provide a WhatsApp number for students to contact for support. Include country code.</CardDescription>
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
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Standard Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Original Price (BDT)</Label>
                            <Input id="price" type="number" placeholder="e.g., 4500" value={price} onChange={e => setPrice(e.target.value)} />
                            <CardDescription>The regular price of the course. Will be shown with a strikethrough if a discount is active.</CardDescription>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discountPrice">Discount Price (BDT)</Label>
                            <Input id="discountPrice" type="number" placeholder="e.g., 3000" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} />
                            <CardDescription>Optional. If set, this will be the new price.</CardDescription>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pre-booking Campaign</CardTitle>
                        <CardDescription>Run a pre-booking campaign with special pricing and goals.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="isPrebooking" checked={isPrebooking} onCheckedChange={setIsPrebooking} />
                            <Label htmlFor="isPrebooking">Enable Pre-booking</Label>
                        </div>
                        {isPrebooking && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="prebookingPrice">Pre-booking Price (BDT)</Label>
                                    <Input id="prebookingPrice" type="number" placeholder="e.g., 2500" value={prebookingPrice} onChange={e => setPrebookingPrice(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prebookingEndDate">Pre-booking End Date</Label>
                                    <DatePicker date={prebookingEndDate} setDate={setPrebookingEndDate} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prebookingTarget">Pre-booking Target (Students)</Label>
                                    <Input id="prebookingTarget" type="number" placeholder="e.g., 100" value={prebookingTarget || ''} onChange={e => setPrebookingTarget(Number(e.target.value))} />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
              </CardContent>
            )}

            {activeTab === 'bundles' && (
                <CardContent className="pt-6">
                    <CardDescription className="mb-4">
                        Select any archived courses to bundle for free with this course.
                        Students who purchase this course will get free access to the selected archived content.
                    </CardDescription>
                    <div className="space-y-2">
                        {allArchivedCourses.map(course => (
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
                        {allArchivedCourses.length === 0 && (
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

        <Dialog open={isLiveClassDialogOpen} onOpenChange={setIsLiveClassDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule a New Live Class</DialogTitle>
                    <DialogDescription>The class will be scheduled and students notified immediately.</DialogDescription>
                </DialogHeader>
                 <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="topic" className="text-right">Topic</Label>
                        <Input id="topic" value={newLiveClassTopic} onChange={e => setNewLiveClassTopic(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Date</Label>
                        <DatePicker date={newLiveClassDate} setDate={setNewLiveClassDate} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">Time</Label>
                        <Input id="time" type="time" value={newLiveClassTime} onChange={e => setNewLiveClassTime(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="platform" className="text-right">Platform</Label>
                            <Select onValueChange={(value: LiveClass['platform']) => setNewLiveClassPlatform(value)} value={newLiveClassPlatform}>
                            <SelectTrigger id="platform" className="col-span-3">
                                <SelectValue placeholder="Select a platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Zoom">Zoom</SelectItem>
                                <SelectItem value="Google Meet">Google Meet</SelectItem>
                                <SelectItem value="YouTube Live">YouTube Live</SelectItem>
                                <SelectItem value="Facebook Live">Facebook Live</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right">Join URL</Label>
                        <Input id="url" value={newLiveClassJoinUrl} onChange={e => setNewLiveClassJoinUrl(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleScheduleLiveClass} disabled={isScheduling}>
                        {isScheduling && <Loader2 className="mr-2 animate-spin"/>}
                        Schedule Class
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isExamResultsOpen} onOpenChange={setIsExamResultsOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Submissions for: {selectedExamTemplateForResults?.title}</DialogTitle>
                    <DialogDescription>
                        Review student performance and see the leaderboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    <ExamLeaderboard exams={allExams.filter(e => e.id.startsWith(selectedExamTemplateForResults?.id || ''))} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isQuestionBankDialogOpen} onOpenChange={setIsQuestionBankDialogOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Add Questions from Bank</DialogTitle>
                    <DialogDescription>Select questions to add to your exam template. Use filters to find relevant questions.</DialogDescription>
                </DialogHeader>
                 <div className="flex flex-wrap gap-2 pt-4">
                    <Select value={bankSubjectFilter} onValueChange={setBankSubjectFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Subject" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All Subjects</SelectItem>{bankSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={bankChapterFilter} onValueChange={setBankChapterFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Chapter" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All Chapters</SelectItem>{bankChapters.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={bankDifficultyFilter} onValueChange={setBankDifficultyFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter by Difficulty" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All Difficulties</SelectItem><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                    </Select>
                    <Select value={bankTypeFilter} onValueChange={setBankTypeFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter by Type" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All Types</SelectItem>{questionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <ScrollArea className="h-[50vh] border rounded-md mt-4">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Difficulty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBankQuestions.map(q => (
                                <TableRow key={q.id}>
                                    <TableCell><Checkbox checked={selectedBankQuestions.has(q.id!)} onCheckedChange={(checked) => handleSelectBankQuestion(q.id!, !!checked)}/></TableCell>
                                    <TableCell className="font-medium max-w-sm truncate">{q.text}</TableCell>
                                    <TableCell><Badge variant="secondary">{q.type}</Badge></TableCell>
                                    <TableCell><Badge className={(difficultyColors as any)[q.difficulty]}>{q.difficulty}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleAddFromBank} disabled={selectedBankQuestions.size === 0}>
                        Add {selectedBankQuestions.size} Questions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
