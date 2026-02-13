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
  Award,
  MessageSquare,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Course, CourseCycle } from '@/lib/types';
import { getCourse, getCourses, getEnrollmentsByCourseId, getOrganization, getOrganizations } from '@/lib/firebase/firestore';
import { WishlistButton } from '@/components/wishlist-button';
import { CourseEnrollmentButton } from '@/components/course-enrollment-button';
import { ReviewCard } from '@/components/review-card';
import { cn, safeToDate } from '@/lib/utils';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { t } from '@/lib/i18n';

type Language = 'en' | 'bn';

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

/**
 * @fileOverview Fully Responsive & Dynamic Course Detail Page
 * Sections: Overview, Instructors, Cycles, Syllabus, FAQ, Payment, Popular Courses.
 * Optimized for all devices with px-1 wall-to-wall design.
 */
export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const awaitedParams = await params;
  const { courseId, locale } = awaitedParams;
  const language = (locale as Language) || 'en';
  const isBn = language === 'bn';
  
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

  const isPrebookingActive = course.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate as string) > new Date();
  const hasDiscount = course.discountPrice && parseFloat(course.discountPrice.replace(/[^0-9.]/g, '')) > 0;

  const getT = (key: string) => t[key]?.[language] || t[key]?.['en'] || key;

  return (
    <div className={cn("bg-background min-h-screen px-1 pb-20", isBn && "font-bengali")}>
      {/* Breadcrumb - High Density */}
      <div className="bg-muted/30 border-b border-white/5 py-3 -mx-1">
        <div className="container mx-auto px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Link href={`/${language}`} className="hover:text-primary transition-colors">{getT('nav_home')}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${language}/courses`} className="hover:text-primary transition-colors">{getT('nav_courses')}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate max-w-[150px]">{course.title}</span>
        </div>
      </div>

      {/* Hero Header - Responsive Stacking */}
      <section id="overview" className="relative pt-8 pb-10 border-b border-white/5 overflow-hidden scroll-mt-32 -mx-1">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 space-y-10">
              <div className="space-y-6 text-left">
                <div className="flex flex-wrap items-center gap-3">
                    {isPrebookingActive && (
                        <Badge variant="warning" className="rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest animate-pulse border-orange-500/20 shadow-lg">
                            {getT('prebook_now')}
                        </Badge>
                    )}
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-black text-[9px] uppercase tracking-widest px-3 py-1.5">{course.category}</Badge>
                </div>
                
                <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] uppercase text-foreground">
                    {course.title}
                </h1>
                
                <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed max-w-3xl">
                    {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Learners</p>
                            <p className="text-sm font-black">{studentCount.toLocaleString()}+</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-400/10 p-2 rounded-xl">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Success Rate</p>
                            <p className="text-sm font-black">{course.rating || '4.9'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-accent/10 p-2 rounded-xl">
                            <Award className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Status</p>
                            <p className="text-sm font-black">Verified</p>
                        </div>
                    </div>
                </div>
              </div>

              {/* Video Intro */}
              <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/5 bg-black group">
                <Link href={course.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    <Image
                    src={course.imageUrl}
                    alt="Intro"
                    fill
                    className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-primary/90 p-5 rounded-full shadow-2xl shadow-primary/40 transform transition-transform group-hover:scale-110">
                            <PlayCircle className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </Link>
              </div>

              {/* Learning Outcomes */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <div className="space-y-8">
                    <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight border-l-4 border-primary pl-6">{getT('curriculum')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {course.whatYouWillLearn.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 bg-[#eef2ed] dark:bg-card/40 rounded-[20px] border border-primary/5 hover:border-primary/20 transition-all group">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-semibold leading-relaxed">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {/* Instructors Section */}
              {course.instructors && course.instructors.length > 0 && (
                <div id="instructors" className="space-y-8 scroll-mt-32">
                    <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight border-l-4 border-primary pl-6">{getT('instructors')}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {course.instructors.map((inst) => (
                            <Link key={inst.slug} href={`/teachers/${inst.slug}`} className="group text-center">
                                <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 p-1 rounded-[2rem] border-2 border-primary/10 group-hover:border-primary transition-all duration-500 overflow-hidden bg-white">
                                    <Image src={inst.avatarUrl} alt={inst.name} fill className="object-cover rounded-[1.8rem] transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <h3 className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{inst.name}</h3>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">{inst.title}</p>
                            </Link>
                        ))}
                    </div>
                </div>
              )}

              {/* Course Cycles */}
              {course.cycles && course.cycles.length > 0 && (
                <div id="cycles" className="space-y-8 scroll-mt-32">
                    <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight border-l-4 border-primary pl-6">{getT('cycles')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {course.cycles.sort((a,b) => a.order - b.order).map((cycle) => (
                            <Card key={cycle.id} className="rounded-[2.5rem] border-primary/10 overflow-hidden bg-card shadow-xl hover:border-primary transition-all group flex flex-col">
                                <CardHeader className="bg-primary/5 p-6 border-b border-primary/5">
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-primary/20 text-primary">Cycle {cycle.order}</Badge>
                                        <span className="font-black text-xl text-primary">{cycle.price}</span>
                                    </div>
                                    <CardTitle className="text-lg font-black uppercase mt-4 tracking-tight group-hover:text-primary transition-colors">{cycle.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 flex-grow">
                                    <p className="text-sm text-muted-foreground leading-relaxed font-medium line-clamp-3">{cycle.description}</p>
                                </CardContent>
                                <CardFooter className="p-6 pt-0 mt-auto">
                                    <Button asChild className="w-full rounded-xl font-black uppercase tracking-widest h-12 shadow-lg shadow-primary/20">
                                        <Link href={`/checkout/${courseId}?cycleId=${cycle.id}`}>Enroll in Cycle</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
              )}

              {/* Interactive Syllabus */}
              {course.syllabus && course.syllabus.length > 0 && (
                <div id="syllabus" className="space-y-8 scroll-mt-32">
                    <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight border-l-4 border-primary pl-6">{getT('syllabus')}</h2>
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        {course.syllabus.map((item) => (
                            <AccordionItem key={item.id} value={item.id} className="border border-primary/10 rounded-[25px] overflow-hidden bg-card/50 shadow-sm">
                                <AccordionTrigger className="px-6 py-5 hover:no-underline font-black uppercase tracking-tight text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-2.5 rounded-xl"><BookOpen className="w-5 h-5 text-primary"/></div>
                                        <div className="flex flex-col">
                                            <span>{item.title}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{item.lessons.length} Learning Sessions</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0 border-t border-primary/5 bg-background">
                                    <ul className="divide-y divide-primary/5">
                                        {item.lessons.map(lesson => (
                                            <li key={lesson.id} className="flex items-center gap-4 px-8 py-4 hover:bg-primary/5 transition-colors group">
                                                <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/10"><PlayCircle className="w-4 h-4 text-primary"/></div>
                                                <div className="flex-grow">
                                                    <span className="font-bold text-sm block group-hover:text-primary transition-colors">{lesson.title}</span>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter mt-0.5">{lesson.type}</span>
                                                </div>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/10">{lesson.duration}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
              )}

              {/* FAQ Section */}
              {course.faqs && course.faqs.length > 0 && (
                <div id="faq" className="space-y-8 scroll-mt-32">
                    <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight border-l-4 border-primary pl-6">{getT('nav_faq')}</h2>
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        {course.faqs.map((faq, idx) => (
                            <AccordionItem key={idx} value={`faq-${idx}`} className="border border-primary/10 rounded-[20px] overflow-hidden bg-card shadow-sm">
                                <AccordionTrigger className="px-6 py-5 font-bold text-left hover:no-underline hover:bg-primary/5 uppercase tracking-tight text-sm md:text-base">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="px-8 pb-8 pt-4 text-muted-foreground font-medium leading-relaxed border-t border-primary/5">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
              )}

              {/* Secure Payment */}
              <div id="payment" className="space-y-8 scroll-mt-32">
                  <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight border-l-4 border-primary pl-6">{getT('payment_info')}</h2>
                  <Card className="rounded-[2.5rem] border-primary/10 bg-primary/5 overflow-hidden shadow-inner">
                      <CardContent className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                          <div className="h-24 w-24 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30 shrink-0 transform -rotate-6">
                              <ShieldCheck className="w-12 h-12" />
                          </div>
                          <div className="space-y-4 text-center md:text-left">
                              <h3 className="font-black text-2xl uppercase tracking-tight text-foreground">{isBn ? 'নিরাপদ পেমেন্ট গেটওয়ে' : '100% Secure Payment'}</h3>
                              <p className="text-muted-foreground font-medium leading-relaxed text-sm md:text-base">
                                  {getT('payment_desc')}
                              </p>
                              <div className="flex flex-wrap justify-center md:justify-start gap-3 opacity-60">
                                  {['bKash', 'Nagad', 'Rocket', 'Visa', 'MasterCard'].map(m => (
                                      <Badge key={m} variant="outline" className="font-black text-[8px] uppercase tracking-widest">{m}</Badge>
                                  ))}
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              </div>
            </div>

            {/* Sticky Pricing Sidebar - Optimized for all devices */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
                <Card className="rounded-[2.5rem] border-2 border-primary/20 shadow-2xl overflow-hidden bg-card p-1.5">
                    <div className="relative aspect-video rounded-[2rem] overflow-hidden m-1 shadow-inner bg-black">
                        <Image src={course.imageUrl} alt={course.title} fill className="object-cover opacity-90" priority />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><PlayCircle className="w-16 h-16 text-white/80" /></div>
                    </div>
                    
                    <CardHeader className="p-6 pb-2 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive" className="animate-pulse rounded-full text-[8px] font-black uppercase px-2">Limited Slots</Badge>
                        </div>
                        <div className="space-y-1">
                            {isPrebookingActive ? (
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground line-through opacity-50 decoration-primary">{course.price}</span>
                                    <span className="text-4xl lg:text-5xl font-black text-primary tracking-tighter">{course.prebookingPrice}</span>
                                </div>
                            ) : hasDiscount ? (
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground line-through opacity-50 decoration-primary">{course.price}</span>
                                    <span className="text-4xl lg:text-5xl font-black text-primary tracking-tighter">{course.discountPrice}</span>
                                </div>
                            ) : (
                                <span className="text-4xl lg:text-5xl font-black text-primary tracking-tighter">{course.price}</span>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        <div className="flex flex-col gap-3">
                            <CourseEnrollmentButton
                                courseId={course.id!}
                                isPrebookingActive={isPrebookingActive}
                                checkoutUrl={`/${language}/checkout/${course.id!}`}
                                courseType={course.type}
                                size="lg"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <WishlistButton courseId={course.id!} />
                                <Button variant="outline" className="rounded-xl font-black h-12 text-[10px] uppercase tracking-widest border-primary/10">Demo Class</Button>
                            </div>
                        </div>
                        
                        <Separator className="bg-primary/5" />
                        
                        <div className="space-y-4">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground border-l-2 border-primary pl-3">Inside the batch</h3>
                            <ul className="space-y-3">
                                {course.features?.slice(0, 6).map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                                        <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        <span className="line-clamp-1">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="bg-primary/5 p-5 flex justify-center gap-8 border-t border-primary/10">
                        <div className="flex flex-col items-center gap-1.5 opacity-60">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <span className="text-[8px] font-black uppercase tracking-widest">SSL Encrypted</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 opacity-60">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Full Access</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Section - Final Dynamic Grid */}
      <section className="py-12 md:py-16 px-0 border-t border-white/5 -mx-1">
          <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-l-4 border-primary pl-6">
                  <div className="text-left">
                    <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight">{getT('popular_courses')}</h2>
                    <p className="text-muted-foreground font-medium text-sm md:text-lg mt-1">Students are excelling in these batches right now.</p>
                  </div>
                  <Button asChild variant="outline" className="rounded-xl font-black h-11 uppercase text-[10px] px-6 border-primary/20">
                      <Link href={`/${language}/courses`}>View All Shop</Link>
                  </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-1">
                  {relatedCourses.map((c) => {
                      const provider = allOrgs.find(o => o.id === c.organizationId);
                      return <CourseCard key={c.id} {...c} provider={provider} />;
                  })}
              </div>
          </div>
      </section>
    </div>
  );
}
