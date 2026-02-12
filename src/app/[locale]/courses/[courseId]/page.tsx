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

export default async function CourseDetailPage({
  params,
}: {
  params: { locale: string; courseId: string };
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
    <div className={cn("bg-background min-h-screen px-1", isBn && "font-bengali")}>
      {/* Dynamic Breadcrumbs */}
      <div className="bg-muted/30 border-b border-white/5 py-3">
        <div className="container mx-auto px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Link href={`/${language}`} className="hover:text-primary transition-colors">{getT('nav_home')}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${language}/courses`} className="hover:text-primary transition-colors">{getT('nav_courses')}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate max-w-[200px]">{course.title}</span>
        </div>
      </div>

      {/* Premium Hero */}
      <section className="relative pt-10 pb-12 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-6 text-left">
                {isPrebookingActive && (
                    <Badge variant="warning" className="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest animate-pulse border-orange-500/20 shadow-lg">
                        {getT('prebook_now')} - {format(new Date(course.prebookingEndDate!), 'dd MMM yyyy')}
                    </Badge>
                )}
                
                <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tight leading-[1.1] uppercase text-foreground">
                    {course.title}
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
                    {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Learners</p>
                            <p className="text-sm font-black">{studentCount.toLocaleString()}+</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-400/10 p-2 rounded-xl">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Rate</p>
                            <p className="text-sm font-black">{course.rating || '4.9'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-accent/10 p-2 rounded-xl">
                            <Award className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Certificate</p>
                            <p className="text-sm font-black">Verified</p>
                        </div>
                    </div>
                </div>
              </div>

              {/* Course Detail Components */}
              <div className="pt-10 space-y-16">
                  {/* Learning Outcomes */}
                  {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                    <section id="features" className="py-0 px-0">
                        <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight border-l-4 border-primary pl-6 mb-8">{getT('curriculum')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {course.whatYouWillLearn.map((item, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl border border-white/5">
                                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                    <p className="text-sm font-semibold leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                  )}

                  {/* Routine */}
                  {course.classRoutine && course.classRoutine.length > 0 && (
                    <section id="routine" className="py-0 px-0">
                        <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight border-l-4 border-primary pl-6 mb-8">{getT('routine')}</h2>
                        <Card className="rounded-[25px] overflow-hidden border-primary/10 shadow-xl bg-card">
                            <Table>
                                <TableHeader className="bg-primary/5">
                                    <TableRow className="border-primary/10">
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] px-6">{getT('day')}</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">{getT('subject')}</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right px-6">{getT('time')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {course.classRoutine.map((item, index) => (
                                        <TableRow key={index} className="border-primary/5 hover:bg-primary/[0.02]">
                                            <TableCell className="px-6 font-black text-sm uppercase">{item.day}</TableCell>
                                            <TableCell className="font-bold text-sm text-primary">{item.subject}</TableCell>
                                            <TableCell className="text-right px-6 font-black text-sm text-muted-foreground">{item.time}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </section>
                  )}

                  {/* Syllabus */}
                  {course.syllabus && course.syllabus.length > 0 && (
                    <section id="syllabus" className="py-0 px-0">
                        <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight border-l-4 border-primary pl-6 mb-8">{getT('syllabus')}</h2>
                        <Accordion type="single" collapsible className="w-full space-y-3">
                            {course.syllabus.map((item) => (
                                <AccordionItem key={item.id} value={item.id} className="border border-primary/10 rounded-[20px] overflow-hidden bg-card/50 shadow-sm">
                                    <AccordionTrigger className="px-6 py-5 hover:no-underline font-black uppercase tracking-tight text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 p-2 rounded-xl"><BookOpen className="w-5 h-5 text-primary"/></div>
                                            <span>{item.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-0 border-t border-primary/5 bg-background">
                                        <ul className="divide-y divide-primary/5">
                                            {item.lessons.map(lesson => (
                                                <li key={lesson.id} className="flex items-center gap-4 px-8 py-4 hover:bg-primary/5 transition-colors group">
                                                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10"><PlayCircle className="w-4 h-4"/></div>
                                                    <span className="font-bold text-sm flex-grow group-hover:text-primary">{lesson.title}</span>
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase">{lesson.duration}</Badge>
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
            </div>

            {/* Sidebar Pricing & CTA */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
                <Card className="rounded-[32px] border-2 border-primary/20 shadow-2xl overflow-hidden bg-card p-1">
                    <div className="relative aspect-video rounded-[28px] overflow-hidden m-1 shadow-inner">
                        <Image src={course.imageUrl} alt={course.title} fill className="object-cover" data-ai-hint={course.dataAiHint} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><PlayCircle className="w-16 h-16 text-white/80" /></div>
                    </div>
                    <CardHeader className="p-6 pb-2 text-left">
                        <div className="space-y-1">
                            {isPrebookingActive ? (
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground line-through opacity-50">{course.price}</span>
                                    <span className="text-4xl font-black text-primary tracking-tighter">{course.prebookingPrice}</span>
                                </div>
                            ) : hasDiscount ? (
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground line-through opacity-50">{course.price}</span>
                                    <span className="text-4xl font-black text-primary tracking-tighter">{course.discountPrice}</span>
                                </div>
                            ) : (
                                <span className="text-4xl font-black text-primary tracking-tighter">{course.price}</span>
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
                            <div className="flex gap-2">
                                <WishlistButton courseId={course.id!} />
                                <Button variant="outline" className="flex-grow rounded-xl font-black h-12 text-[10px] uppercase tracking-widest">{getT('demo_class')}</Button>
                            </div>
                        </div>
                        
                        <Separator className="bg-primary/5" />
                        
                        <div className="space-y-4">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground border-l-2 border-primary pl-3">{getT('includes_heading')}</h3>
                            <ul className="space-y-3">
                                {course.features?.slice(0, 5).map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                                        <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-primary/5 p-4 flex justify-center gap-6 border-t border-primary/10">
                        <div className="flex flex-col items-center gap-1 opacity-60">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Secure Pay</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 opacity-60">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Lifetime Access</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
