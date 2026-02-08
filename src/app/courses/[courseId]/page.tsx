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
  Clock,
  Layout,
  Globe,
  Share2,
  ArrowRight,
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
import { getCourse, getCourses, getEnrollmentsByCourseId, getOrganization, getOrganizations, getCourseCycles } from '@/lib/firebase/firestore';
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
    <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all shadow-md group rounded-3xl overflow-hidden">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <Badge variant="secondary" className="mb-2 uppercase tracking-widest text-[10px] px-3 rounded-full font-bold">Cycle {cycle.order}</Badge>
                    <CardTitle className="text-xl font-black group-hover:text-primary transition-colors">{cycle.title}</CardTitle>
                </div>
                <p className="text-2xl font-black text-primary">{cycle.price}</p>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{cycle.description}</p>
        </CardContent>
        <div className="p-6 pt-0">
             {isPrebookingActive ? (
                <Button className="w-full font-bold opacity-70 rounded-xl" disabled>Pre-booking Ongoing</Button>
             ) : (
                <Button asChild className="w-full font-bold bg-green-600 hover:bg-green-700 shadow-lg active:scale-95 transition-transform rounded-xl h-12">
                    <Link href={`/checkout/${courseId}?cycleId=${cycle.id}`}>Enroll in This Cycle</Link>
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
  const courseCycles = await getCourseCycles(courseId);

  const allCourses = await getCourses();
  const allOrgs = await getOrganizations();
  
  const relatedCourses = allCourses.filter(c => c.id !== course.id && !c.isArchived).slice(0, 4);
  const includedCourses = course.includedCourseIds
    ? allCourses.filter(c => course.includedCourseIds?.includes(c.id!))
    : [];

  const isPrebookingActive = course.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate as string) > new Date();
  const hasDiscount = course.discountPrice && parseFloat(course.discountPrice.replace(/[^0-9.]/g, '')) > 0;


  return (
    <div className="bg-background">
      {/* Course Hero Section */}
      <section className="bg-secondary/20 dark:bg-muted/10 pt-16 pb-12 border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 items-end">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {isPrebookingActive && (
                    <Badge variant="warning" className="px-4 py-1.5 font-black uppercase tracking-wider animate-pulse rounded-full border-none shadow-lg">
                        Pre-booking Until {format(new Date(course.prebookingEndDate!), 'MMM d')}
                    </Badge>
                )}
                {course.type && <Badge variant="outline" className="px-4 py-1.5 rounded-full font-bold border-primary/20">{course.type}</Badge>}
                <Badge variant="secondary" className="px-4 py-1.5 rounded-full font-bold">{course.category}</Badge>
              </div>
              
              {organization && (
                <div className="flex items-center gap-2 bg-background/50 w-fit px-3 py-1.5 rounded-full border border-primary/10 backdrop-blur-sm">
                  <Image src={organization.logoUrl} alt={organization.name} width={24} height={24} className="rounded-full bg-white p-0.5 object-contain"/>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Provider: <Link href={`/sites/${organization.subdomain}`} className="text-primary hover:underline">{organization.name}</Link>
                  </p>
                </div>
              )}
              
              <h1 className="font-headline text-4xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
                {course.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-4xl leading-relaxed font-medium">
                {course.description}
              </p>

               <div className="flex flex-wrap items-center gap-x-8 gap-y-6 pt-6">
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
                    <div className="flex items-center gap-8 border-l border-primary/10 pl-8">
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
        </div>
      </section>

      <CourseTabs course={course} />

      <main className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            
            {/* Video Intro */}
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden group shadow-[0_30px_100px_rgba(0,0,0,0.15)] border-8 border-primary/5">
              <Link href={course.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  data-ai-hint={course.dataAiHint}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-6 transition-all group-hover:bg-black/20">
                  <div className="relative">
                      <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-50 animate-pulse"></div>
                      <PlayCircle className="relative w-28 h-24 text-white group-hover:scale-110 transition-all cursor-pointer drop-shadow-2xl" />
                  </div>
                  <span className="text-white font-black text-sm uppercase tracking-widest bg-black/60 px-8 py-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl">Watch Sample Lesson</span>
                </div>
              </Link>
            </div>

            {/* Learning Outcomes */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <section id="features" className="scroll-mt-32 py-0">
                    <h2 className="font-headline text-3xl md:text-4xl font-black mb-8 tracking-tight flex items-center gap-4">
                        <div className="h-10 w-1.5 bg-primary rounded-full"></div>
                        What you'll master
                    </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-8 md:p-12 rounded-[2.5rem] border border-primary/5">
                        {course.whatYouWillLearn.map((item, index) => (
                            <div key={`learn-${index}`} className="flex items-start gap-5 group">
                                <div className="mt-1 p-1.5 bg-primary/10 rounded-xl shrink-0 group-hover:bg-primary transition-colors">
                                    <CheckCircle className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <p className='text-foreground font-bold text-base leading-snug'>{item}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Instructors */}
            {course.instructors && course.instructors.length > 0 && (
              <section id="instructors" className="scroll-mt-32 py-0">
                <h2 className="font-headline text-3xl md:text-4xl font-black mb-8 tracking-tight flex items-center gap-4">
                    <div className="h-10 w-1.5 bg-primary rounded-full"></div>
                    Meet Your Guides
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {course.instructors?.map((instructor) => (
                    <Link key={instructor.slug} href={`/teachers/${instructor.slug}`} className="flex items-center gap-5 p-5 rounded-[2rem] border bg-card/50 hover:border-primary/40 transition-all group shadow-sm hover:shadow-xl">
                      <Avatar className="w-20 h-20 border-4 border-primary/5 ring-4 ring-primary/5 shadow-inner">
                        <AvatarImage src={instructor.avatarUrl} alt={instructor.name} />
                        <AvatarFallback className="font-black">{instructor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-black text-lg group-hover:text-primary transition-colors leading-tight">{instructor.name}</h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">{instructor.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Cycles */}
             {courseCycles && courseCycles.length > 0 && (
                <section id="cycles" className="scroll-mt-32 py-0">
                    <h2 className="font-headline text-3xl md:text-4xl font-black mb-8 tracking-tight flex items-center gap-4">
                        <div className="h-10 w-1.5 bg-primary rounded-full"></div>
                        Flexible Modules
                    </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {courseCycles.sort((a,b) => a.order - b.order).map((cycle) => (
                            <CycleCard key={cycle.id} cycle={cycle} courseId={courseId} isPrebookingActive={isPrebookingActive}/>
                        ))}
                    </div>
                </section>
            )}
            
            {/* Syllabus */}
            {course.syllabus && course.syllabus.length > 0 && (
              <section id="syllabus" className="scroll-mt-32 py-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight flex items-center gap-4">
                        <div className="h-10 w-1.5 bg-primary rounded-full"></div>
                        Curriculum
                    </h2>
                    <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] py-2 px-4 rounded-full border-primary/20">
                        {course.syllabus.reduce((acc, mod) => acc + mod.lessons.length, 0)} High-Quality Lessons
                    </Badge>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-5">
                  {course.syllabus.map((item) => (
                    <AccordionItem value={item.id} key={item.id} className="border-none rounded-[2rem] overflow-hidden bg-muted/30 dark:bg-muted/10 shadow-sm transition-all hover:shadow-md">
                      <AccordionTrigger className="text-lg font-black px-8 py-6 hover:no-underline hover:bg-primary/5 data-[state=open]:text-primary transition-all text-left">
                        <div className="flex items-center gap-5">
                           <div className="p-3 bg-background rounded-2xl shadow-inner border border-primary/5">
                               <BookOpen className="w-6 h-6 shrink-0 opacity-70"/>
                           </div>
                           <span className="leading-tight">{item.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-8 pb-6 pt-2">
                        <ul className="space-y-2">
                            {item.lessons.map(lesson => (
                                <li key={lesson.id} className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-primary/5 hover:border-primary/20 hover:shadow-sm transition-all group">
                                    <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                                        <PlayCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"/>
                                    </div>
                                    <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <span className="font-bold text-sm">{lesson.title}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{lesson.duration}</span>
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

            {/* Reviews */}
            {course.reviewsData && course.reviewsData.length > 0 && (
              <section id="reviews" className="scroll-mt-32 py-0">
                <h2 className="font-headline text-3xl md:text-4xl font-black mb-8 tracking-tight flex items-center gap-4">
                    <div className="h-10 w-1.5 bg-primary rounded-full"></div>
                    Success Stories
                </h2>
                <div className="space-y-8 bg-card border border-primary/10 p-8 md:p-12 rounded-[2.5rem] shadow-xl">
                    {course.reviewsData.map((review) => (
                      <ReviewCard key={review.id} review={review} courseId={courseId} />
                    ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {course.faqs && course.faqs.length > 0 && (
              <section id="faq" className="scroll-mt-32 py-0">
                <h2 className="font-headline text-3xl md:text-4xl font-black mb-8 tracking-tight flex items-center gap-4">
                    <div className="h-10 w-1.5 bg-primary rounded-full"></div>
                    Common Queries
                </h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {course.faqs.map((faq, index) => (
                    <AccordionItem value={`faq-${index}`} key={`faq-${faq.question}-${index}`} className="border rounded-[2rem] bg-card overflow-hidden transition-all hover:border-primary/20">
                      <AccordionTrigger className="font-black text-left px-8 py-5 hover:no-underline text-base">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-8 pb-6 text-muted-foreground leading-relaxed font-medium">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
          </div>

          {/* Sticky Enrollment Sidebar */}
          <div className="lg:col-span-1">
             <Card className="sticky top-32 bg-card/80 backdrop-blur-2xl text-card-foreground shadow-[0_40px_100px_rgba(0,0,0,0.12)] border-2 border-primary/20 rounded-[3rem] overflow-hidden transition-all hover:shadow-[0_40px_120px_rgba(0,0,0,0.18)]">
                <CardHeader className="bg-primary/5 pb-10 pt-10 px-8">
                  {isPrebookingActive ? (
                      <div className="space-y-2">
                          <p className="text-muted-foreground line-through text-xs font-black uppercase tracking-widest opacity-60">Standard Admission: {course.price}</p>
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-5xl font-black text-primary tracking-tighter">{course.prebookingPrice}</span>
                            <Badge variant="warning" className="animate-bounce font-black text-[10px] uppercase rounded-full">Special Pre-book</Badge>
                          </div>
                      </div>
                  ) : hasDiscount ? (
                      <div className="space-y-2">
                          <div className="flex items-baseline gap-4 flex-wrap">
                              <span className="text-5xl font-black text-primary tracking-tighter">{course.discountPrice}</span>
                              <p className="text-lg text-muted-foreground line-through font-bold opacity-50">{course.price}</p>
                          </div>
                          <Badge variant="accent" className="bg-green-600 font-black text-[10px] uppercase rounded-full border-none shadow-lg px-4">Limited Offer</Badge>
                      </div>
                  ) : (
                      <CardTitle className="text-5xl font-black text-primary tracking-tighter">{course.price}</CardTitle>
                  )}
                </CardHeader>
                <CardContent className="space-y-10 pt-10 px-8">
                  <div className="flex flex-col gap-4">
                    <CourseEnrollmentButton
                        courseId={course.id!}
                        isPrebookingActive={isPrebookingActive}
                        checkoutUrl={`/checkout/${course.id!}`}
                        courseType={course.type}
                        size="lg"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <WishlistButton courseId={course.id!} />
                        <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest rounded-2xl h-14 border-primary/10 hover:bg-primary/5" aria-label="Share Course">
                            <Share2 className="mr-2 h-4 w-4 text-primary" /> Share
                        </Button>
                    </div>
                  </div>

                  {course.features && course.features.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-primary/60 border-b border-primary/5 pb-3">
                        LMS Features Included
                      </h3>
                      <ul className="space-y-4">
                        {course.features?.slice(0, 6).map((feature, index) => (
                          <li key={`feature-${index}`} className="flex items-center gap-4 text-sm font-bold">
                            <div className="p-1.5 bg-primary/10 rounded-xl shadow-inner">
                                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-6 border-t border-primary/5 space-y-4">
                    <Button variant="ghost" className="w-full font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl border-2 border-dashed border-primary/10 hover:bg-primary/5 hover:text-primary transition-all group">
                        <PlayCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                        Watch Course Intro
                    </Button>
                    {course.whatsappNumber && (
                        <Button variant="outline" className="w-full h-14 rounded-2xl bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm" asChild>
                            <Link href={`https://wa.me/${course.whatsappNumber.replace(/\D/g, '')}`} target="_blank">
                                <Phone className="mr-2 h-5 w-5 fill-current"/>
                                Chat with Advisor
                            </Link>
                        </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>

        {/* Bundled Content Section */}
        {includedCourses.length > 0 && (
          <section className="pt-20 border-t border-primary/5">
            <div className="text-center mb-16 space-y-4">
                <h2 className="font-headline text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Free Bonus Bundle</h2>
                <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-lg" />
                <p className="text-lg text-muted-foreground font-medium">You get full access to these courses completely free when you enroll.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {includedCourses.map(includedCourse => {
                const provider = allOrgs.find(p => p.id === includedCourse.organizationId);
                return <CourseCard key={includedCourse.id} {...includedCourse} provider={provider} partnerSubdomain={provider?.subdomain} />;
              })}
            </div>
          </section>
        )}

        {/* Recommendations */}
         <section className="pt-20">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12 border-b border-primary/10 pb-8 gap-6">
                <div className="text-center sm:text-left space-y-2">
                    <h2 className="font-headline text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Recommended for You</h2>
                    <p className="text-muted-foreground font-medium">Explore related programs to boost your growth.</p>
                </div>
                <Button variant="link" asChild className="font-black uppercase tracking-widest text-xs text-primary group h-auto p-0">
                    <Link href="/courses" className="flex items-center gap-2">
                        Explore All <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2"/>
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
