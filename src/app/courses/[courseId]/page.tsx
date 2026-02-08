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
import { cn } from '@/lib/utils';
import { safeToDate } from '@/lib/utils';
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
    <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all shadow-md group">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <Badge variant="secondary" className="mb-2 uppercase tracking-widest text-[10px] px-3">Cycle {cycle.order}</Badge>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{cycle.title}</CardTitle>
                </div>
                <p className="text-2xl font-black text-primary">{cycle.price}</p>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{cycle.description}</p>
        </CardContent>
        <div className="p-6 pt-0">
             {isPrebookingActive ? (
                <Button className="w-full font-bold opacity-70" disabled>Pre-booking Ongoing</Button>
             ) : (
                <Button asChild className="w-full font-bold bg-green-600 hover:bg-green-700 shadow-lg active:scale-95 transition-transform">
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
  
  const relatedCourses = allCourses.filter(c => c.id !== course.id).slice(0, 4);
  const includedCourses = course.includedCourseIds
    ? allCourses.filter(c => course.includedCourseIds?.includes(c.id!))
    : [];

  const isPrebookingActive = course.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate as string) > new Date();
  const hasDiscount = course.discountPrice && parseFloat(course.discountPrice.replace(/[^0-9.]/g, '')) > 0;


  return (
    <div className="bg-background">
      {/* Course Hero Section */}
      <section className="bg-secondary/30 dark:bg-muted/20 pt-16 pb-12 border-b border-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 items-end">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {isPrebookingActive && (
                    <Badge variant="warning" className="px-4 py-1 font-bold animate-pulse">
                        Pre-booking Open Until {format(new Date(course.prebookingEndDate!), 'PPP')}
                    </Badge>
                )}
                {course.type && <Badge variant="outline" className="px-4 py-1">{course.type}</Badge>}
                <Badge variant="secondary" className="px-4 py-1">{course.category}</Badge>
              </div>
              
              {organization && (
                <div className="flex items-center gap-2">
                  <Image src={organization.logoUrl} alt={organization.name} width={28} height={28} className="rounded-full bg-white p-0.5 border shadow-sm object-contain"/>
                  <p className="text-sm font-bold">
                    Provider: <Link href={`/sites/${organization.subdomain}`} className="text-primary hover:underline">{organization.name}</Link>
                  </p>
                </div>
              )}
              
              <h1 className="font-headline text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {course.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-4xl leading-relaxed">
                {course.description}
              </p>

               <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4">
                    {course.instructors && course.instructors.length > 0 && (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                                <AvatarImage src={course.instructors[0].avatarUrl} alt={course.instructors[0].name} />
                                <AvatarFallback>{course.instructors[0].name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Instructor</span>
                                <span className="text-sm font-bold">{course.instructors[0].name}</span>
                            </div>
                        </div>
                    )}
                    {course.showStudentCount && (
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Students</span>
                            <div className="flex items-center gap-1.5 text-sm font-bold">
                                <Users className="h-4 w-4 text-primary" />
                                <span>{studentCount.toLocaleString()} Enrolled</span>
                            </div>
                        </div>
                    )}
                    {course.rating && (
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Rating</span>
                            <div className="flex items-center gap-1.5 text-sm font-bold">
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

      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-20">
            
            {/* Video Intro */}
            <div className="relative aspect-video rounded-3xl overflow-hidden group shadow-2xl border-4 border-primary/10">
              <Link href={course.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  data-ai-hint={course.dataAiHint}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 transition-all group-hover:bg-black/20">
                  <PlayCircle className="w-24 h-24 text-white/90 group-hover:text-white group-hover:scale-110 transition-all cursor-pointer drop-shadow-2xl" />
                  <span className="text-white font-bold bg-black/50 px-6 py-2 rounded-full backdrop-blur-md border border-white/20">Watch Demo Class</span>
                </div>
              </Link>
            </div>

            {/* Learning Outcomes */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <section id="features" className="scroll-mt-32 py-0">
                    <h2 className="font-headline text-3xl font-bold mb-8 flex items-center gap-3">
                        <CheckCircle className="text-primary h-8 w-8" />
                        What you'll learn
                    </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 bg-muted/30 p-8 rounded-3xl border border-primary/5">
                        {course.whatYouWillLearn.map((item, index) => (
                            <div key={`learn-${index}`} className="flex items-start gap-4">
                                <div className="mt-1.5 p-1 bg-green-500/10 rounded-full shrink-0">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <p className='text-foreground font-medium leading-relaxed'>{item}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Instructors */}
            {course.instructors && course.instructors.length > 0 && (
              <section id="instructors" className="scroll-mt-32 py-0">
                <h2 className="font-headline text-3xl font-bold mb-8">Course Instructors</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {course.instructors?.map((instructor) => (
                    <Link key={instructor.slug} href={`/teachers/${instructor.slug}`} className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:border-primary/40 transition-all group shadow-sm hover:shadow-md">
                      <Avatar className="w-16 h-16 border-2 border-primary/10">
                        <AvatarImage src={instructor.avatarUrl} alt={instructor.name} />
                        <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">{instructor.name}</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{instructor.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Cycles */}
             {courseCycles && courseCycles.length > 0 && (
                <section id="cycles" className="scroll-mt-32 py-0">
                    <h2 className="font-headline text-3xl font-bold mb-8 flex items-center gap-3">
                        <Layers className="text-primary h-8 w-8" />
                        Cycle Based Enrollment
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
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-headline text-3xl font-bold">Course Syllabus</h2>
                    <Badge variant="outline" className="font-bold">{course.syllabus.reduce((acc, mod) => acc + mod.lessons.length, 0)} Total Lessons</Badge>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {course.syllabus.map((item) => (
                    <AccordionItem value={item.id} key={item.id} className="border rounded-2xl overflow-hidden bg-card/50">
                      <AccordionTrigger className="text-lg font-bold px-6 py-5 hover:no-underline hover:bg-muted/20 data-[state=open]:bg-primary/5 data-[state=open]:text-primary transition-all">
                        <div className="flex items-center gap-4 text-left">
                           <BookOpen className="w-6 h-6 shrink-0 opacity-70"/>
                           <span>{item.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-2">
                        <ul className="space-y-1">
                            {item.lessons.map(lesson => (
                                <li key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                                        <PlayCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary"/>
                                    </div>
                                    <span className="font-medium flex-grow">{lesson.title}</span>
                                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">{lesson.duration}</span>
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
                <h2 className="font-headline text-3xl font-bold mb-8">Student Success Stories</h2>
                <Card className="rounded-3xl border-primary/10 bg-card/50 overflow-hidden">
                  <CardContent className="p-8 space-y-10">
                    {course.reviewsData.map((review) => (
                      <ReviewCard key={review.id} review={review} courseId={courseId} />
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* FAQ */}
            {course.faqs && course.faqs.length > 0 && (
              <section id="faq" className="scroll-mt-32 py-0">
                <h2 className="font-headline text-3xl font-bold mb-8">Common Questions</h2>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {course.faqs.map((faq, index) => (
                    <AccordionItem value={`faq-${index}`} key={`faq-${faq.question}-${index}`} className="border rounded-2xl bg-card">
                      <AccordionTrigger className="font-bold text-left px-6 py-4 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-muted-foreground leading-relaxed">
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
             <Card className="sticky top-32 bg-card text-card-foreground shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-primary/20 rounded-3xl overflow-hidden transition-all hover:shadow-2xl">
                <CardHeader className="bg-primary/5 pb-8">
                  {isPrebookingActive ? (
                      <div className="space-y-1">
                          <p className="text-muted-foreground line-through text-sm font-medium">Original: {course.price}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-primary">{course.prebookingPrice}</span>
                            <Badge variant="warning" className="animate-bounce">Special Offer</Badge>
                          </div>
                      </div>
                  ) : hasDiscount ? (
                      <div className="space-y-1">
                          <div className="flex items-baseline gap-3">
                              <span className="text-4xl font-black text-primary">{course.discountPrice}</span>
                              <p className="text-lg text-muted-foreground line-through font-medium">{course.price}</p>
                          </div>
                          <Badge variant="accent" className="bg-green-600">Flash Sale Active</Badge>
                      </div>
                  ) : (
                      <CardTitle className="text-4xl font-black text-primary">{course.price}</CardTitle>
                  )}
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                  <div className="flex flex-col gap-3">
                    <CourseEnrollmentButton
                        courseId={course.id!}
                        isPrebookingActive={isPrebookingActive}
                        checkoutUrl={`/checkout/${course.id!}`}
                        courseType={course.type}
                        size="lg"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <WishlistButton courseId={course.id!} />
                        <Button variant="outline" className="font-bold rounded-xl" aria-label="Share Course">
                            <Share2 className="mr-2 h-4 w-4" /> Share
                        </Button>
                    </div>
                  </div>

                  {course.features && course.features.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary/80">
                        This course includes
                      </h3>
                      <ul className="space-y-3">
                        {course.features?.slice(0, 6).map((feature, index) => (
                          <li key={`feature-${index}`} className="flex items-center gap-3 text-sm font-medium">
                            <div className="p-1 bg-primary/10 rounded-full">
                                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-3">
                    <Button variant="ghost" className="w-full font-bold h-12 rounded-xl border border-dashed border-primary/20 hover:bg-primary/5 hover:text-primary transition-all group">
                        <PlayCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                        Watch Course Intro
                    </Button>
                    {course.whatsappNumber && (
                        <Button variant="outline" className="w-full h-12 rounded-xl bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all font-bold" asChild>
                            <Link href={`https://wa.me/${course.whatsappNumber.replace(/\D/g, '')}`} target="_blank">
                                <Phone className="mr-2 h-5 w-5"/>
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
          <section className="pt-24 border-t border-primary/5">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl font-black mb-2">Free Bonus Bundle</h2>
                <p className="text-muted-foreground">You get full access to these courses completely free when you enroll.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {includedCourses.map(includedCourse => {
                const provider = allOrgs.find(p => p.id === includedCourse.organizationId);
                return <CourseCard key={includedCourse.id} {...includedCourse} provider={provider} partnerSubdomain={provider?.subdomain} />;
              })}
            </div>
          </section>
        )}

        {/* More from RDC */}
         <section className="pt-24">
            <div className="flex items-center justify-between mb-12 border-b pb-6">
                <h2 className="font-headline text-3xl font-black tracking-tight">Recommendation for You</h2>
                <Button variant="link" asChild className="font-bold text-primary group">
                    <Link href="/courses">Explore All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"/></Link>
                </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
