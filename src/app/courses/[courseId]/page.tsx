import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import {
  Star,
  Users,
  Clock,
  Share2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  BookOpen,
  PlayCircle,
  Award,
  CheckCircle2,
  CalendarCheck,
  Megaphone,
  HelpCircle,
  FileText,
  Layers3,
  ChevronRight,
  Zap
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
import { getCourse, getCourses, getEnrollmentsByCourseId, getOrganizations, getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { WishlistButton } from '@/components/wishlist-button';
import { CourseEnrollmentButton } from '@/components/course-enrollment-button';
import { cn, safeToDate } from '@/lib/utils';
import { getCurrentUser } from '@/lib/firebase/auth';

/**
 * @fileOverview Elite Responsive Course Detail Page.
 * Optimised for conversions with aggressive enrollment CTAs and modular course cycles.
 * Fully compliant with Next.js 15 async parameter requirements.
 */

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const awaitedParams = await params;
  const course = await getCourse(awaitedParams.courseId);

  if (!course) {
    return { title: 'Course Not Found' };
  }

  return {
    title: course.title,
    description: course.description,
    openGraph: { images: [course.imageUrl] },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const awaitedParams = await params;
  const courseId = awaitedParams.courseId;
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
  
  const enrollments = await getEnrollmentsByCourseId(courseId);
  const studentCount = enrollments.length;
  const allCourses = await getCourses({ status: 'Published' });
  const relatedCourses = allCourses.filter(c => c.id !== course.id).slice(0, 4);

  const isPrebookingActive = course.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate as string) > new Date();
  const hasDiscount = course.discountPrice && parseFloat(course.discountPrice.replace(/[^0-9.]/g, '')) > 0;

  return (
    <div className="bg-background min-h-screen overflow-x-hidden max-w-full">
      {/* Hero Section */}
      <section className="bg-secondary/20 pt-10 md:pt-14 pb-10 border-b border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] -mr-24 -mt-24 rounded-full"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-8 space-y-6 text-left">
                  <div className="flex flex-wrap items-center gap-3">
                    {isPrebookingActive && (
                        <Badge variant="warning" className="px-4 py-1.5 font-black uppercase tracking-wider animate-pulse rounded-full border-none shadow-lg">
                            Pre-booking Active
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
                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Mentor</span>
                                    <span className="text-base font-black uppercase tracking-tight">{course.instructors[0].name}</span>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-8 border-l border-primary/10 pl-8 hidden md:flex">
                            {course.showStudentCount && (
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Community</span>
                                    <div className="flex items-center gap-1.5 text-base font-black">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span>{studentCount.toLocaleString()}+ Enrolled</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Rating</span>
                                <div className="flex items-center gap-1.5 text-base font-black">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    <span>{course.rating || '4.9'} / 5.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
              </div>
              
              {/* Early Buy Prompt for Desktop */}
              <div className="hidden lg:block lg:col-span-4">
                  <Card className="rounded-[2.5rem] shadow-2xl border-2 border-primary/20 bg-card overflow-hidden">
                      <div className="p-8 bg-primary/5 border-b border-primary/5">
                          <p className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60 mb-2">Sync Access</p>
                          <h3 className="text-4xl font-black text-primary tracking-tighter">{isPrebookingActive ? course.prebookingPrice : (hasDiscount ? course.discountPrice : course.price)}</h3>
                      </div>
                      <div className="p-8 space-y-4">
                          <CourseEnrollmentButton 
                            courseId={course.id!} 
                            isPrebookingActive={isPrebookingActive} 
                            checkoutUrl={`/checkout/${course.id!}`} 
                            size="lg"
                          />
                          <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secure Enterprise Encryption</p>
                      </div>
                  </Card>
              </div>
          </div>
        </div>
      </section>

      <CourseTabs course={course} />

      <main className="container mx-auto px-4 py-10 md:py-14 max-w-7xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-8 space-y-12 md:space-y-16">
            
            {/* Promo Media System */}
            {(course.videoUrl || course.imageUrl) && (
                <section id="media" className="scroll-mt-32">
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden group shadow-2xl border-4 md:border-8 border-primary/5">
                        <Link href={course.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                            <Image
                            src={course.imageUrl}
                            alt={course.title}
                            fill
                            priority
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            {course.videoUrl && (
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-6 transition-all group-hover:bg-black/20 backdrop-blur-[1px]">
                                    <PlayCircle className="w-20 h-20 md:w-28 text-white group-hover:scale-110 transition-all cursor-pointer drop-shadow-2xl" />
                                    <span className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.25em] bg-black/60 px-6 py-2 md:px-8 md:py-3 rounded-xl backdrop-blur-xl border border-white/20 shadow-2xl">Visual Blueprint Preview</span>
                                </div>
                            )}
                        </Link>
                    </div>
                </section>
            )}

            {/* Modular Course Cycles System */}
            {course.cycles && course.cycles.length > 0 && (
                <section id="cycles" className="scroll-mt-32 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-2 bg-primary rounded-full shadow-lg"></div>
                        <h2 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tight">Access Tiers</h2>
                    </div>
                    <div className="grid gap-4">
                        {course.cycles.map((cycle: CourseCycle) => (
                            <div key={cycle.id} className="group relative rounded-3xl border-2 border-primary/10 bg-card p-6 md:p-10 shadow-xl transition-all hover:border-primary/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl transition-transform group-hover:scale-150"></div>
                                <div className="space-y-2 text-left relative z-10">
                                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">{cycle.title}</h3>
                                    <p className="text-sm text-muted-foreground font-medium max-w-xl">{cycle.description}</p>
                                    <div className="flex items-center gap-2 pt-2">
                                        <Layers3 className="h-4 w-4 text-primary opacity-60" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{cycle.moduleIds?.length || 0} Modules Authorized</span>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 relative z-10">
                                    <div className="text-left md:text-right">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Cycle Cost</p>
                                        <p className="text-2xl md:text-3xl font-black text-primary tracking-tighter">৳{cycle.price}</p>
                                    </div>
                                    <Button asChild className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 active:scale-95 bg-primary hover:bg-primary/90 text-white border-none">
                                        <Link href={`/checkout/${course.id}?cycleId=${cycle.id}`}>
                                            Secure Tier <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Outcomes Section */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <section id="features" className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-2 bg-primary rounded-full shadow-lg"></div>
                        <h2 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tight">Milestones</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {course.whatYouWillLearn.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-primary/10 shadow-lg hover:shadow-xl transition-all group">
                                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary transition-colors duration-300">
                                    <CheckCircle2 className="w-5 h-5 text-primary group-hover:text-white" />
                                </div>
                                <p className="font-bold text-sm leading-relaxed text-left break-words">{item}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Syllabus */}
            {course.syllabus && course.syllabus.length > 0 && (
              <section id="syllabus" className="scroll-mt-32">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h2 className="font-headline text-2xl md:text-4xl font-black tracking-tight flex items-center gap-4 uppercase text-left">
                        <div className="h-8 md:h-10 w-1.5 bg-primary rounded-full shadow-sm"></div>
                        Curriculum
                    </h2>
                    <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] py-2 px-6 rounded-full border-primary/20 shadow-inner w-fit">
                        {course.syllabus.reduce((acc, mod) => acc + mod.lessons.length, 0)} Professional Artifacts
                    </Badge>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {course.syllabus.map((item) => (
                    <AccordionItem value={item.id} key={item.id} className="border-none rounded-3xl overflow-hidden bg-muted/30 shadow-sm transition-all hover:shadow-md">
                      <AccordionTrigger className="text-lg font-black px-6 md:px-10 py-8 hover:no-underline hover:bg-primary/5 data-[state=open]:text-primary transition-all text-left">
                        <div className="flex items-center gap-5 overflow-hidden">
                           <BookOpen className="w-6 h-6 shrink-0 opacity-70 text-primary"/>
                           <span className="uppercase tracking-tight break-words">{item.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 md:px-10 pb-8 pt-2">
                        <ul className="space-y-2 text-left">
                            {item.lessons.map(lesson => (
                                <li key={lesson.id} className="flex items-center gap-4 p-5 rounded-2xl bg-background border border-primary/5 hover:border-primary/20 transition-all group">
                                    <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors shrink-0">
                                        <PlayCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"/>
                                    </div>
                                    <div className="min-w-0 flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <span className="font-black text-sm break-words uppercase pr-2">{lesson.title}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full shrink-0 w-fit shadow-inner">{lesson.duration}</span>
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
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-4">
             <Card className="lg:sticky lg:top-32 bg-card text-card-foreground shadow-2xl border-2 border-primary/20 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-primary/5">
                <CardHeader className="bg-primary/5 p-8 md:p-10 border-b-2 border-primary/5">
                  <p className="font-black uppercase text-[10px] tracking-[0.25em] text-primary/60 mb-2">Institutional Pricing</p>
                  {isPrebookingActive ? (
                      <div className="space-y-2 text-left">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{course.prebookingPrice}</span>
                            <Badge variant="warning" className="animate-bounce font-black text-[9px] uppercase rounded-full shadow-md px-3 py-1">Save 40%</Badge>
                          </div>
                          <p className="text-muted-foreground line-through text-[10px] font-black uppercase tracking-widest opacity-60">Regular: {course.price}</p>
                      </div>
                  ) : hasDiscount ? (
                      <div className="space-y-2 text-left">
                          <div className="flex items-baseline gap-3 flex-wrap">
                              <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{course.discountPrice}</span>
                              <Badge variant="accent" className="bg-green-600 font-black text-[10px] uppercase rounded-full border-none shadow-lg px-4 py-1.5">Limited Activation</Badge>
                          </div>
                          <p className="text-base md:text-lg text-muted-foreground line-through font-bold opacity-50">{course.price}</p>
                      </div>
                  ) : (
                      <CardTitle className="text-4xl md:text-5xl font-black text-primary tracking-tighter text-left">{course.price}</CardTitle>
                  )}
                </CardHeader>
                <CardContent className="space-y-8 p-8 md:p-10">
                  <div className="space-y-4">
                    <CourseEnrollmentButton
                        courseId={course.id!}
                        isPrebookingActive={isPrebookingActive}
                        checkoutUrl={`/checkout/${course.id!}`}
                        courseType={course.type}
                        size="lg"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <WishlistButton courseId={course.id!} />
                        <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest rounded-xl h-14 border-primary/10 hover:bg-primary/5 shadow-sm transition-all">
                            <Share2 className="mr-2 h-4 w-4 text-primary" /> Export
                        </Button>
                    </div>
                  </div>
                  
                  {course.whatsappNumber && (
                    <Button variant="outline" className="w-full h-14 rounded-xl font-bold gap-3 border-green-500/20 hover:bg-green-50 text-green-600 transition-all shadow-sm" asChild>
                        <a href={`https://wa.me/${course.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                            <MessageSquare className="w-5 h-5 fill-current" /> Sync Support
                        </a>
                    </Button>
                  )}

                  <div className="space-y-4 pt-6 border-t-2 border-primary/5 text-left">
                      <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-80">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                          <span>Lifetime Vault Access</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-80">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <span>Encrypted Payment</span>
                      </div>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
