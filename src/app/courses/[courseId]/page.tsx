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
  Clock,
  Share2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getCourse, getCourses, getEnrollmentsByCourseId, getOrganization, getOrganizations, getCourseCycles, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { WishlistButton } from '@/components/wishlist-button';
import { CourseEnrollmentButton } from '@/components/course-enrollment-button';
import { ReviewCard } from '@/components/review-card';
import { cn, safeToDate } from '@/lib/utils';
import { getCurrentUser } from '@/lib/firebase/auth';

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
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

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
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
  const courseCycles = await getCourseCycles(courseId);

  const allCourses = await getCourses();
  const allOrgs = await getOrganizations();
  
  const relatedCourses = allCourses.filter(c => c.id !== course.id && !c.isArchived).slice(0, 4);

  const isPrebookingActive = course.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate as string) > new Date();
  const hasDiscount = course.discountPrice && parseFloat(course.discountPrice.replace(/[^0-9.]/g, '')) > 0;

  return (
    <div className="bg-background min-h-screen overflow-x-hidden max-w-full">
      {/* Hero Section */}
      <section className="bg-secondary/20 dark:bg-muted/10 pt-10 md:pt-14 pb-10 border-b border-primary/10">
        <div className="container mx-auto px-4 max-w-full">
          <div className="max-w-5xl mx-auto lg:mx-0 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {isPrebookingActive && (
                    <Badge variant="warning" className="px-4 py-1.5 font-black uppercase tracking-wider animate-pulse rounded-full border-none shadow-lg">
                        Pre-booking Until {format(new Date(course.prebookingEndDate!), 'MMM d')}
                    </Badge>
                )}
                {course.type && <Badge variant="outline" className="px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest border-primary/20">{course.type}</Badge>}
                <Badge variant="secondary" className="px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">{course.category}</Badge>
              </div>
              
              <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground uppercase break-words">
                {course.title}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed font-medium">
                {course.description}
              </p>

               <div className="flex flex-wrap items-center gap-x-8 gap-y-6 pt-4">
                    {course.instructors && course.instructors.length > 0 && (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-primary/20 ring-4 ring-primary/5">
                                <AvatarImage src={course.instructors[0].avatarUrl} alt={course.instructors[0].name} />
                                <AvatarFallback className="font-bold">{course.instructors[0].name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Instructor</span>
                                <span className="text-base font-black">{course.instructors[0].name}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-8 border-l-none sm:border-l border-primary/10 sm:pl-8">
                        {course.showStudentCount && (
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Community</span>
                                <div className="flex items-center gap-1.5 text-base font-black">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span>{studentCount.toLocaleString()} Enrolled</span>
                                </div>
                            </div>
                        )}
                        {course.rating && (
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Success Rate</span>
                                <div className="flex items-center gap-1.5 text-base font-black">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    <span>{course.rating} / 5.0</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
          </div>
        </div>
      </section>

      <CourseTabs course={course} />

      <main className="container mx-auto px-4 py-10 md:py-14 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-8 space-y-12 md:space-y-16 overflow-hidden">
            
            {/* Video Intro */}
            <div className="relative aspect-video rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group shadow-2xl border-4 md:border-8 border-primary/5">
              <Link href={course.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  data-ai-hint={course.dataAiHint}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-6 transition-all group-hover:bg-black/20 backdrop-blur-[1px]">
                  <div className="relative">
                      <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-50 animate-pulse"></div>
                      <PlayCircle className="relative w-20 h-20 md:w-28 md:h-24 text-white group-hover:scale-110 transition-all cursor-pointer drop-shadow-2xl" />
                  </div>
                  <span className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.25em] bg-black/60 px-6 py-2 md:px-8 md:py-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl">Watch Sample Lesson</span>
                </div>
              </Link>
            </div>

            {/* Routine Section (Adaptive Cards on Mobile) */}
            {course.classRoutine && course.classRoutine.length > 0 && (
                <section id="routine" className="scroll-mt-32 py-0">
                    <h2 className="font-headline text-2xl md:text-4xl font-black mb-6 md:mb-8 tracking-tight flex items-center gap-4 uppercase">
                        <div className="h-8 md:h-10 w-1.5 bg-primary rounded-full shadow-sm"></div>
                        Class Routine
                    </h2>
                    <div className="hidden md:block overflow-hidden rounded-[2rem] border border-primary/10 shadow-lg">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] px-8 py-5 text-foreground">Day</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] px-8 py-5 text-foreground">Subject</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] px-8 py-5 text-foreground">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {course.classRoutine.map((item, index) => (
                                    <TableRow key={`routine-desktop-${index}`} className="hover:bg-primary/5 transition-colors border-b last:border-0 border-primary/5">
                                        <TableCell className="font-black px-8 py-5 text-sm">{item.day}</TableCell>
                                        <TableCell className="font-bold px-8 py-5 text-sm">{item.subject}</TableCell>
                                        <TableCell className="font-black text-primary px-8 py-5 text-sm">{item.time}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="md:hidden space-y-3">
                        {course.classRoutine.map((item, index) => (
                            <div key={`routine-mobile-${index}`} className="bg-card border border-primary/10 p-5 rounded-2xl shadow-sm flex justify-between items-center gap-4">
                                <div className="space-y-1 min-w-0">
                                    <p className="font-black text-[10px] uppercase text-primary tracking-[0.2em]">{item.day}</p>
                                    <p className="font-bold text-sm leading-tight break-words">{item.subject}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-xs font-black">{item.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Exam Schedule (Adaptive Cards on Mobile) */}
            {course.examTemplates && course.examTemplates.length > 0 && (
                <section id="exam-schedule" className="scroll-mt-32 py-0">
                    <h2 className="font-headline text-2xl md:text-4xl font-black mb-6 md:mb-8 tracking-tight flex items-center gap-4 uppercase">
                        <div className="h-8 md:h-10 w-1.5 bg-primary rounded-full shadow-sm"></div>
                        Exam Schedule
                    </h2>
                    <div className="hidden md:block overflow-hidden rounded-[2rem] border border-primary/10 shadow-lg">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] px-8 py-5 text-foreground">Title</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] px-8 py-5 text-foreground">Topic</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] px-8 py-5 text-foreground">Date</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] px-8 py-5 text-right text-foreground">Marks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {course.examTemplates.map((item, index) => (
                                    <TableRow key={`exam-desktop-${index}`} className="hover:bg-primary/5 transition-colors border-b last:border-0 border-primary/5">
                                        <TableCell className="font-bold px-8 py-5 text-sm">{item.title}</TableCell>
                                        <TableCell className="font-medium text-muted-foreground px-8 py-5 text-sm">{item.topic}</TableCell>
                                        <TableCell className="font-black px-8 py-5 text-sm">{item.examDate ? format(safeToDate(item.examDate), 'MMM d, yyyy') : 'TBD'}</TableCell>
                                        <TableCell className="font-black text-primary px-8 py-5 text-sm text-right">{item.totalMarks}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="md:hidden space-y-3">
                        {course.examTemplates.map((item, index) => (
                            <div key={`exam-mobile-${index}`} className="bg-card border border-primary/10 p-5 rounded-2xl shadow-sm space-y-3">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1 min-w-0">
                                        <p className="font-black text-[10px] uppercase text-primary tracking-[0.2em]">Exam {index + 1}</p>
                                        <h4 className="font-bold text-base leading-tight break-words">{item.title}</h4>
                                    </div>
                                    <Badge variant="secondary" className="font-black text-[10px] px-2.5 py-1 rounded-lg shrink-0">
                                        {item.totalMarks} M
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pt-2 border-t border-primary/5">
                                    <p className="truncate mr-4">{item.topic}</p>
                                    <p className="font-black shrink-0">{item.examDate ? format(safeToDate(item.examDate), 'MMM d') : 'TBD'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
            {/* Syllabus */}
            {course.syllabus && course.syllabus.length > 0 && (
              <section id="syllabus" className="scroll-mt-32 py-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
                    <h2 className="font-headline text-2xl md:text-4xl font-black tracking-tight flex items-center gap-4 uppercase">
                        <div className="h-8 md:h-10 w-1.5 bg-primary rounded-full shadow-sm"></div>
                        Curriculum
                    </h2>
                    <Badge variant="outline" className="font-black uppercase tracking-widest text-[9px] md:text-[10px] py-2 px-4 rounded-full border-primary/20 w-fit shadow-inner">
                        {course.syllabus.reduce((acc, mod) => acc + mod.lessons.length, 0)} Professional Lessons
                    </Badge>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {course.syllabus.map((item) => (
                    <AccordionItem value={item.id} key={item.id} className="border-none rounded-2xl md:rounded-[2rem] overflow-hidden bg-muted/30 dark:bg-muted/10 shadow-sm transition-all hover:shadow-md">
                      <AccordionTrigger className="text-base md:text-lg font-black px-6 py-5 md:px-8 md:py-6 hover:no-underline hover:bg-primary/5 data-[state=open]:text-primary transition-all text-left">
                        <div className="flex items-center gap-4 md:gap-5">
                           <div className="p-2 md:p-3 bg-background rounded-xl md:rounded-2xl shadow-inner border border-primary/5">
                               <BookOpen className="w-5 h-5 md:w-6 md:h-6 shrink-0 opacity-70 text-primary"/>
                           </div>
                           <span className="leading-tight break-words">{item.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-5 md:px-8 md:pb-6 pt-2">
                        <ul className="space-y-2">
                            {item.lessons.map(lesson => (
                                <li key={lesson.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-background border border-primary/5 hover:border-primary/20 hover:shadow-sm transition-all group">
                                    <div className="p-2 bg-muted rounded-lg md:rounded-xl group-hover:bg-primary/10 transition-colors">
                                        <PlayCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground group-hover:text-primary transition-colors"/>
                                    </div>
                                    <div className="min-w-0 flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <span className="font-bold text-xs md:text-sm truncate pr-2">{lesson.title}</span>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">{lesson.duration}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}

            {/* Payment Info Section */}
            <section id="payment" className="scroll-mt-32 py-0">
                <h2 className="font-headline text-2xl md:text-4xl font-black mb-6 md:mb-8 tracking-tight flex items-center gap-4 uppercase">
                    <div className="h-8 md:h-10 w-1.5 bg-primary rounded-full shadow-sm"></div>
                    Payment & Enrollment
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                    <Card className="rounded-[2rem] border-primary/10 bg-muted/20 shadow-sm p-6 space-y-4">
                        <div className="p-3 bg-primary/10 rounded-2xl w-fit">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">Secure Payment</h3>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">We support all major mobile banking platforms including bKash and Nagad. Your transaction is 100% secure.</p>
                    </Card>
                    <Card className="rounded-[2rem] border-primary/10 bg-muted/20 shadow-sm p-6 space-y-4">
                        <div className="p-3 bg-primary/10 rounded-2xl w-fit">
                            <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">Instant Access</h3>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">Once payment is confirmed, you get immediate access to all course materials and the secret community group.</p>
                    </Card>
                </div>
            </section>
          </div>

          {/* Enrollment Sidebar */}
          <div className="lg:col-span-4">
             <Card className="lg:sticky lg:top-32 bg-card text-card-foreground shadow-2xl border-2 border-primary/20 rounded-[2rem] md:rounded-[3rem] overflow-hidden transition-all hover:shadow-primary/5">
                <CardHeader className="bg-primary/5 pb-8 pt-8 md:pb-10 md:pt-10 px-6 md:px-8">
                  {isPrebookingActive ? (
                      <div className="space-y-2">
                          <p className="text-muted-foreground line-through text-[10px] font-black uppercase tracking-widest opacity-60">Regular: {course.price}</p>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{course.prebookingPrice}</span>
                            <Badge variant="warning" className="animate-bounce font-black text-[9px] md:text-[10px] uppercase rounded-full shadow-md">Pre-book Now</Badge>
                          </div>
                      </div>
                  ) : hasDiscount ? (
                      <div className="space-y-2">
                          <div className="flex items-baseline gap-3 flex-wrap">
                              <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{course.discountPrice}</span>
                              <p className="text-base md:text-lg text-muted-foreground line-through font-bold opacity-50">{course.price}</p>
                          </div>
                          <Badge variant="accent" className="bg-green-600 font-black text-[9px] md:text-[10px] uppercase rounded-full border-none shadow-lg px-4 py-1.5">Limited Time</Badge>
                      </div>
                  ) : (
                      <CardTitle className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{course.price}</CardTitle>
                  )}
                </CardHeader>
                <CardContent className="space-y-8 pt-8 md:pt-10 px-6 md:px-8">
                  <CourseEnrollmentButton
                      courseId={course.id!}
                      isPrebookingActive={isPrebookingActive}
                      checkoutUrl={`/checkout/${course.id!}`}
                      courseType={course.type}
                      size="lg"
                  />
                  <div className="grid grid-cols-2 gap-3">
                      <WishlistButton courseId={course.id!} />
                      <Button variant="outline" className="font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-2xl h-12 md:h-14 border-primary/10 hover:bg-primary/5 shadow-sm transition-all">
                          <Share2 className="mr-2 h-4 w-4 text-primary" /> Share
                      </Button>
                  </div>
                  
                  {course.whatsappNumber && (
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-bold gap-3 border-green-500/20 hover:bg-green-50 text-green-600 transition-all shadow-sm" asChild>
                        <a href={`https://wa.me/${course.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                            <MessageSquare className="w-5 h-5 fill-current" /> Talk to Advisor
                        </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
          </div>
        </div>

        {/* Global Recommendations */}
         <section className="pt-16 border-t border-primary/10">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 pb-6 gap-4">
                <div className="text-center sm:text-left space-y-1">
                    <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Recommended</h2>
                    <p className="text-sm md:text-base text-muted-foreground font-medium pt-1">Curated programs for your academic track.</p>
                </div>
                <Button variant="link" asChild className="font-black uppercase tracking-widest text-[10px] text-primary group h-auto p-0 hover:no-underline">
                    <Link href="/courses" className="flex items-center gap-2">
                        Explore All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2"/>
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {relatedCourses.map(course => {
                    const provider = allOrgs.find(p => p.id === course.organizationId);
                    return <CourseCard key={course.id} {...course} provider={provider} />;
                })}
            </div>
         </section>
      </main>
    </div>
  );
}
