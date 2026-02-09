
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import {
  CheckCircle,
  PlayCircle,
  Star,
  BookOpen,
  Phone,
  Users,
  Layers,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CourseTabs } from '@/components/course-tabs';
import { CourseCard } from '@/components/course-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Course, CourseCycle } from '@/lib/types';
import { getCourse, getCourses, getEnrollmentsByCourseId, getOrganization, getOrganizations } from '@/lib/firebase/firestore';
import { WishlistButton } from '@/components/wishlist-button';
import { CourseEnrollmentButton } from '@/components/course-enrollment-button';
import { ReviewCard } from '@/components/review-card';
import { cn, safeToDate } from '@/lib/utils';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getEnrollmentsByUserId } from '@/lib/firebase/firestore';

export async function generateMetadata({ params }: { params: { courseId: string } }): Promise<Metadata> {
  const awaitedParams = await params;
  const course = await getCourse(awaitedParams.courseId);

  if (!course) {
    return {
      title: 'Course Not Found',
    }
  }

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      images: [course.imageUrl],
    },
  }
}

const CycleCard = ({ cycle, courseId, isPrebookingActive }: { cycle: CourseCycle, courseId: string, isPrebookingActive: boolean }) => (
    <Card className="bg-card/50 border-white/10 hover:border-primary/30 transition-all duration-300">
        <CardHeader className="p-4">
            <div className="flex justify-between items-start">
                <div>
                    <Badge variant="secondary" className="mb-2 text-[10px] uppercase font-black tracking-tighter">Cycle {cycle.order}</Badge>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">{cycle.title}</CardTitle>
                </div>
                <p className="text-lg font-black text-primary">{cycle.price}</p>
            </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground line-clamp-2">{cycle.description}</p>
        </CardContent>
        <div className="p-4 pt-0">
             {isPrebookingActive ? (
                <Button className="w-full font-black text-[10px] uppercase tracking-widest h-9" disabled>Pre-booking Ongoing</Button>
             ) : (
                <Button asChild className="w-full font-black text-[10px] uppercase tracking-widest h-9 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20">
                    <Link href={`/checkout/${courseId}?cycleId=${cycle.id}`}>Enroll Cycle</Link>
                </Button>
             )}
        </div>
    </Card>
);


export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const awaitedParams = await params;
  const { courseId } = awaitedParams;
  const course = await getCourse(courseId);

  if (!course || course.isArchived) {
    notFound();
  }
  
  const user = await getCurrentUser();
  if (user && course.type === 'Exam') {
    const enrollments = await getEnrollmentsByUserId(user.uid);
    if (enrollments.some(e => e.courseId === courseId)) {
      redirect(`/student/my-courses/${courseId}`);
    }
  }
  
  const organization = course.organizationId ? await getOrganization(course.organizationId) : null;
  const enrollments = await getEnrollmentsByCourseId(courseId);
  const studentCount = enrollments.length;

  const allCourses = await getCourses();
  const allOrgs = await getOrganizations();
  
  const relatedCourses = allCourses.filter(c => c.id !== course.id && c.status === 'Published' && !c.isArchived).slice(0, 4);
  const includedCourses = course.includedCourseIds
    ? allCourses.filter(c => course.includedCourseIds?.includes(c.id!))
    : [];

  const isPrebookingActive = course.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate as string) > new Date();
  const hasDiscount = course.discountPrice && parseFloat(course.discountPrice.replace(/[^0-9.]/g, '')) > 0;

  return (
    <div className="bg-background min-h-screen">
      {/* Dynamic Breadcrumbs & Status Bar */}
      <div className="bg-muted/30 border-b border-white/5 py-2">
        <div className="container mx-auto px-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/courses" className="hover:text-primary transition-colors">Courses</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate">{course.title}</span>
        </div>
      </div>

      {/* Modern High-Density Hero */}
      <section className="relative pt-10 pb-12 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                {isPrebookingActive && (
                    <Badge variant="warning" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest animate-pulse border-orange-500/20">
                        Pre-booking Open Until {format(new Date(course.prebookingEndDate!), 'dd MMM yyyy')}
                    </Badge>
                )}
                
                {organization && (
                    <Link href={`/sites/${organization.subdomain}`} className="inline-flex items-center gap-2 bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 px-3 py-1 rounded-full group transition-all hover:bg-white dark:hover:bg-white/10">
                        <Image src={organization.logoUrl} alt={organization.name} width={20} height={20} className="rounded-full object-contain" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-primary">
                            Provider: {organization.name}
                        </span>
                    </Link>
                )}
                
                <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight uppercase max-w-4xl">
                    {course.title}
                </h1>
                
                <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed max-w-3xl">
                    {course.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    {course.instructors && course.instructors.length > 0 && (
                        <Link href={`/teachers/${course.instructors[0].slug}`} className="flex items-center gap-2 bg-muted/50 p-1.5 pr-4 rounded-full border border-white/5 hover:border-primary/30 transition-all">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={course.instructors[0].avatarUrl} alt={course.instructors[0].name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">{course.instructors[0].name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Lead Mentor</span>
                                <span className="text-[11px] font-bold">{course.instructors[0].name}</span>
                            </div>
                        </Link>
                    )}
                    
                    <div className="flex gap-4 ml-2">
                        {course.showStudentCount && (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Learners</span>
                                <span className="flex items-center gap-1.5 text-sm font-black text-foreground">
                                    <Users className="w-3.5 h-3.5 text-primary" />
                                    {studentCount.toLocaleString()}+
                                </span>
                            </div>
                        )}
                        {course.rating && (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Rate</span>
                                <span className="flex items-center gap-1.5 text-sm font-black text-foreground">
                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                    {course.rating} ({course.reviews})
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      <CourseTabs course={course} />

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            
            {/* Visual Intro */}
            <div className="relative aspect-video rounded-2xl overflow-hidden group shadow-2xl border-4 border-white/5 bg-black">
              <Link href={course.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  priority
                  className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                  data-ai-hint={course.dataAiHint}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-all">
                  <div className="bg-primary/90 p-5 rounded-full shadow-2xl shadow-primary/40 transform transition-transform group-hover:scale-110">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <Badge className="bg-black/60 backdrop-blur-md border-white/10 uppercase font-black text-[9px] tracking-widest">Intro Video</Badge>
                </div>
              </Link>
            </div>

            {/* Learning Outcomes */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <section id="features" className="scroll-mt-32 py-0">
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-6 mb-8">What you&apos;ll master</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {course.whatYouWillLearn.map((item, index) => (
                            <div key={`learn-${index}`} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl border border-white/5 hover:border-primary/20 transition-all">
                                <div className="bg-primary/10 p-1.5 rounded-lg shrink-0 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-primary" />
                                </div>
                                <p className='text-sm font-semibold leading-relaxed'>{item}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Mentors Section */}
            {course.instructors && course.instructors.length > 0 && (
              <section id="instructors" className="scroll-mt-32 py-0">
                <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-6 mb-8">
                  কোর্স ইন্সট্রাক্টর
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {course.instructors?.map((instructor) => (
                    <Link key={instructor.slug} href={`/teachers/${instructor.slug}`} className="text-center group">
                      <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 p-1 rounded-2xl border-2 border-white/10 group-hover:border-primary/50 transition-all duration-500 overflow-hidden">
                        <Image
                          src={instructor.avatarUrl}
                          alt={instructor.name}
                          fill
                          className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
                          data-ai-hint={instructor.dataAiHint}
                        />
                      </div>
                      <h3 className="font-black text-sm md:text-base uppercase tracking-tight group-hover:text-primary transition-colors">{instructor.name}</h3>
                      <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {instructor.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Dynamic Content: Routine, Syllabus, Exams */}
             {course.cycles && course.cycles.length > 0 && (
                <section id="cycles" className="scroll-mt-32 py-0">
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-6 mb-8 flex items-center gap-3">
                        <Layers className="text-primary" />
                        Cycle based enrollment
                    </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {course.cycles.sort((a,b) => a.order - b.order).map((cycle) => (
                            <CycleCard key={cycle.id} cycle={cycle} courseId={courseId} isPrebookingActive={isPrebookingActive}/>
                        ))}
                    </div>
                </section>
            )}
            
            {course.classRoutine && course.classRoutine.length > 0 && (
                <section id="routine" className="scroll-mt-32 py-0">
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-6 mb-8 flex items-center gap-3">
                        <Calendar className="text-primary" />
                        ক্লাস রুটিন
                    </h2>
                    <Card className="rounded-2xl border-white/5 overflow-hidden shadow-xl">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">বার (Day)</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">বিষয় (Subject)</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">সময় (Time)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {course.classRoutine.map((item, index) => (
                                        <TableRow key={`routine-${item.day}-${index}`} className="border-white/5 hover:bg-muted/20">
                                            <TableCell className="font-bold text-sm">{item.day}</TableCell>
                                            <TableCell className="font-medium text-sm text-primary">{item.subject}</TableCell>
                                            <TableCell className="font-bold text-sm text-muted-foreground">{item.time}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </section>
            )}

            {course.examTemplates && course.examTemplates.length > 0 && (
                <section id="exam-schedule" className="scroll-mt-32 py-0">
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-6 mb-8 flex items-center gap-3">
                        <Award className="text-primary" />
                        পরীক্ষার রুটিন
                    </h2>
                    <Card className="rounded-2xl border-white/5 overflow-hidden shadow-xl">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">পরীক্ষা (Exam)</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">তারিখ (Date)</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">নম্বর (Marks)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {course.examTemplates.map((item, index) => (
                                        <TableRow key={`exam-${item.id}-${index}`} className="border-white/5 hover:bg-muted/20">
                                            <TableCell className="py-4">
                                                <p className="font-bold text-sm">{item.title}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">{item.topic}</p>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">
                                                {item.examDate ? format(safeToDate(item.examDate), 'dd MMM yyyy') : 'TBA'}
                                            </TableCell>
                                            <TableCell className="text-right font-black text-primary">{item.totalMarks}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </section>
            )}

            {course.syllabus && course.syllabus.length > 0 && (
              <section id="syllabus" className="scroll-mt-32 py-0">
                <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-6 mb-8 flex items-center gap-3">
                  <BookOpen className="text-primary" />
                  সিলেবাস ও লেসন
                </h2>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {course.syllabus.map((item) => (
                    <AccordionItem value={item.id} key={item.id} className="border border-white/10 rounded-2xl overflow-hidden bg-card/30">
                      <AccordionTrigger className="text-base md:text-lg font-black uppercase tracking-tight px-6 py-5 hover:no-underline hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4 text-left">
                           <div className="bg-primary/10 p-2 rounded-xl">
                                <BookOpen className="w-5 h-5 text-primary"/>
                           </div>
                           <div className="flex flex-col">
                               <span>{item.title}</span>
                               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                                    {item.lessons.length} Modules Loaded
                               </span>
                           </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0 border-t border-white/5 bg-background/50">
                        <ul className="divide-y divide-white/5">
                            {item.lessons.map(lesson => (
                                <li key={lesson.id} className="flex items-center gap-4 px-8 py-4 hover:bg-primary/5 transition-colors group">
                                    <div className="bg-muted rounded-lg p-2 group-hover:bg-primary/10 transition-colors">
                                        <PlayCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary"/>
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <span className="text-sm font-bold group-hover:text-primary transition-colors">{lesson.title}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">{lesson.type}</span>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-black border-white/10 group-hover:border-primary/30 transition-all">
                                        {lesson.duration}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}

            {/* Social Proof: Feedback & FAQ */}
            {course.reviewsData && course.reviewsData.length > 0 && (
              <section id="reviews" className="scroll-mt-32 py-0">
                <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-6 mb-8">What students say</h2>
                <Card className="rounded-2xl border-white/5 bg-muted/20 shadow-xl overflow-hidden">
                  <CardContent className="pt-8 space-y-8">
                    {course.reviewsData.map((review) => (
                      <ReviewCard key={review.id} review={review} courseId={courseId} />
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}


            {course.faqs && course.faqs.length > 0 && (
              <section id="faq" className="scroll-mt-32 py-0">
                <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-6 mb-8">
                  সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)
                </h2>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {course.faqs.map((faq, index) => (
                    <AccordionItem value={`faq-${index}`} key={`faq-${faq.question}-${index}`} className="border-white/10 rounded-xl bg-card/20 overflow-hidden">
                      <AccordionTrigger className="font-bold text-sm md:text-base text-left px-6 py-4 hover:bg-white/5 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
            
            {course.price && (
              <section id="payment" className="scroll-mt-32 py-0">
                  <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-6 mb-6">পেমেন্ট প্রক্রিয়া</h2>
                  <div className="bg-muted/30 p-6 rounded-2xl border border-white/5 space-y-4">
                    <p className="text-muted-foreground font-medium leading-relaxed">
                        আমাদের পেমেন্ট প্রক্রিয়া খুবই সহজ। আপনি বিকাশ, নগদ, রকেট অথবা যেকোনো ডেবিট/ক্রেডিট কার্ডের মাধ্যমে পেমেন্ট করতে পারেন। ভর্তির সাথে সাথেই আপনি আপনার ড্যাশবোর্ডে কোর্সটি পেয়ে যাবেন।
                    </p>
                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                        <Link href="/contact" className="hover:underline flex items-center gap-2">
                            বিস্তারিত জানতে এখানে ক্লিক করুন <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                  </div>
              </section>
            )}
          </div>

          {/* High-Conversion Sticky Sidebar */}
          <div className="lg:col-span-1">
             <div className="sticky top-32 space-y-6">
                <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10 rounded-[2rem] bg-card">
                    <div className="relative aspect-video">
                        <Image src={course.imageUrl} alt="Course Preview" fill className="object-cover" data-ai-hint={course.dataAiHint} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                            <PlayCircle className="w-12 h-12 text-white/80" />
                        </div>
                    </div>
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive" className="animate-pulse rounded-full text-[9px] font-black uppercase">Limited Time Offer</Badge>
                        </div>
                        {isPrebookingActive ? (
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground line-through decoration-primary decoration-2">{course.price}</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-primary tracking-tighter">{course.prebookingPrice}</span>
                                    <span className="text-xs font-bold text-muted-foreground">Only</span>
                                </div>
                            </div>
                        ) : hasDiscount ? (
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground line-through decoration-primary decoration-2">{course.price}</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-primary tracking-tighter">{course.discountPrice}</span>
                                    <span className="text-xs font-bold text-muted-foreground">Off Today</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-primary tracking-tighter">{course.price}</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <CourseEnrollmentButton
                                courseId={course.id!}
                                isPrebookingActive={isPrebookingActive}
                                checkoutUrl={`/checkout/${course.id!}`}
                                courseType={course.type}
                                size="lg"
                            />
                            <div className="flex gap-2">
                                <WishlistButton courseId={course.id!} />
                                <Button variant="outline" className="flex-grow rounded-xl font-black uppercase tracking-widest text-[10px] h-12">
                                    Watch Demo
                                </Button>
                            </div>
                        </div>

                        <Separator className="bg-white/10" />

                        {course.features && course.features.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-black text-[11px] uppercase tracking-widest text-foreground border-l-2 border-primary pl-2">এই কোর্সে যা যা থাকছে</h3>
                                <ul className="space-y-3">
                                    {course.features?.slice(0, 6).map((feature, index) => (
                                        <li key={`feature-${index}`} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                                            <div className="bg-green-500/10 p-1 rounded-full">
                                                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="pt-2">
                            <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-tighter text-center text-muted-foreground">Need help enrolling?</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" className="rounded-xl h-10 bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-500/20 gap-2 font-black text-[9px] uppercase tracking-widest" asChild>
                                        <Link href={`https://wa.me/${course.whatsappNumber?.replace(/\D/g, '') || '8801641035736'}`} target="_blank">
                                            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="rounded-xl h-10 gap-2 font-black text-[9px] uppercase tracking-widest border-white/10" asChild>
                                        <a href="tel:01641035736">
                                            <Phone className="w-3.5 h-3.5" /> Call Now
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 p-4 flex justify-center gap-6 border-t border-white/5">
                        <div className="flex flex-col items-center gap-1 opacity-60">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Secure Pay</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 opacity-60">
                            <Clock className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Lifetime Access</span>
                        </div>
                    </CardFooter>
                </Card>

                {/* Micro Info Card */}
                <Card className="rounded-2xl border-white/5 bg-primary/5 p-4 border-l-4 border-l-primary">
                    <div className="flex gap-3">
                        <Info className="w-5 h-5 text-primary shrink-0" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-tight text-foreground">Admission Guarantee</p>
                            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                                Get exclusive mock tests designed by Dhaka University toppers.
                            </p>
                        </div>
                    </div>
                </Card>
             </div>
          </div>
        </div>

        {/* Free Included Content (Bonus) */}
        {includedCourses.length > 0 && (
          <section className="pt-24">
            <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-6">
                <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase">এই কোর্সের সাথে যা ফ্রি পাচ্ছেন (Bonus)</h2>
                <Badge variant="accent" className="hidden sm:inline-flex rounded-full px-4 font-black">Value: ৳৫,০০০+</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
              {includedCourses.map(includedCourse => {
                const provider = allOrgs.find(p => p.id === includedCourse.organizationId);
                return <CourseCard key={includedCourse.id} {...includedCourse} provider={provider} partnerSubdomain={provider?.subdomain} />;
              })}
            </div>
          </section>
        )}

        {/* Cross-Sell: Related Courses */}
         <section className="pt-24 pb-12">
            <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase border-l-4 border-primary pl-6 mb-8 text-left">আমাদের আরও কিছু জনপ্রিয় কোর্স</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
                {relatedCourses.map(course => {
                    const provider = allOrgs.find(p => p.id === course.organizationId);
                    return <CourseCard key={course.id} {...course} provider={provider} partnerSubdomain={provider?.subdomain} />;
                })}
            </div>
         </section>
      </main>
    </div>
  );
}
