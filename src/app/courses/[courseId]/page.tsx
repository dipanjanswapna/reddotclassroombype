

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
    <Card className="bg-muted/50">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <Badge variant="secondary" className="mb-2">Cycle {cycle.order}</Badge>
                    <CardTitle className="text-xl">{cycle.title}</CardTitle>
                </div>
                <p className="text-xl font-bold text-primary">{cycle.price}</p>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{cycle.description}</p>
        </CardContent>
        <div className="p-6 pt-0">
             {isPrebookingActive ? (
                <Button className="w-full font-bold" disabled>Pre-booking Ongoing</Button>
             ) : (
                <Button asChild className="w-full font-bold bg-green-600 hover:bg-green-700">
                    <Link href={`/checkout/${courseId}?cycleId=${cycle.id}`}>Enroll Now</Link>
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
  
  // If the course is an Exam Batch, and the user is enrolled, redirect them.
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
  
  const relatedCourses = allCourses.filter(c => c.id !== course.id).slice(0, 4);
  const includedCourses = course.includedCourseIds
    ? allCourses.filter(c => course.includedCourseIds?.includes(c.id!))
    : [];

  const isPrebookingActive = course.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate as string) > new Date();
  const hasDiscount = course.discountPrice && parseFloat(course.discountPrice.replace(/[^0-9.]/g, '')) > 0;


  return (
    <div className="bg-background">
      <section className="bg-secondary/50 pt-12 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {isPrebookingActive && <Badge className="mb-2" variant="warning">Pre-booking Open Until {format(new Date(course.prebookingEndDate!), 'PPP')}</Badge>}
              
              {organization && (
                <div className="flex items-center gap-2 mb-2">
                  <Image src={organization.logoUrl} alt={organization.name} width={24} height={24} className="rounded-full bg-muted object-contain"/>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Sold by <Link href={`/sites/${organization.subdomain}`} className="text-primary hover:underline">{organization.name}</Link>
                  </p>
                </div>
              )}
              
              <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">
                {course.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4 max-w-4xl">
                {course.description}
              </p>
               <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
                    {course.instructors && course.instructors.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={course.instructors[0].avatarUrl} alt={course.instructors[0].name} />
                                <AvatarFallback>{course.instructors[0].name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>By {course.instructors[0].name}</span>
                        </div>
                    )}
                    {course.showStudentCount && (
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{studentCount.toLocaleString()} Students</span>
                        </div>
                    )}
                    {course.rating && (
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span>{course.rating} ({course.reviews} reviews)</span>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </section>

      <CourseTabs course={course} />

      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            
            <div className="relative aspect-video rounded-lg overflow-hidden group shadow-lg">
              <Link href={course.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full" aria-label={`Watch intro video for ${course.title}`}>
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  priority
                  className="object-cover"
                  data-ai-hint={course.dataAiHint}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle className="w-20 h-20 text-white/80 group-hover:text-white transition-colors cursor-pointer" />
                </div>
              </Link>
            </div>

            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <section id="features" className="scroll-mt-24 py-0">
                    <h2 className="font-headline text-3xl font-bold mb-6">What you'll learn</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {course.whatYouWillLearn.map((item, index) => (
                            <div key={`learn-${index}`} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary mt-1 shrink-0" />
                                <p className='text-muted-foreground'>{item}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {course.instructors && course.instructors.length > 0 && (
              <section id="instructors" className="scroll-mt-24 py-0">
                <h2 className="font-headline text-3xl font-bold mb-6">
                  কোর্স ইন্সট্রাক্টর
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {course.instructors?.map((instructor) => (
                    <Link key={instructor.slug} href={`/teachers/${instructor.slug}`} className="text-center flex flex-col items-center group">
                      <Avatar className="w-24 h-24 mx-auto mb-2">
                        <AvatarImage
                          src={instructor.avatarUrl}
                          alt={instructor.name}
                          data-ai-hint={instructor.dataAiHint}
                        />
                        <AvatarFallback>
                          {instructor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{instructor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {instructor.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

             {course.cycles && course.cycles.length > 0 && (
                <section id="cycles" className="scroll-mt-24 py-0">
                    <h2 className="font-headline text-3xl font-bold mb-6 flex items-center gap-3">
                        <Layers />
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
                <section id="routine" className="scroll-mt-24 py-0">
                    <h2 className="font-headline text-3xl font-bold mb-6">ক্লাস রুটিন</h2>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>বার</TableHead>
                                        <TableHead>বিষয়</TableHead>
                                        <TableHead>সময়</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {course.classRoutine.map((item, index) => (
                                        <TableRow key={`routine-${item.day}-${index}`}>
                                            <TableCell className="font-medium">{item.day}</TableCell>
                                            <TableCell>{item.subject}</TableCell>
                                            <TableCell>{item.time}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </section>
            )}

            {course.examTemplates && course.examTemplates.length > 0 && (
                <section id="exam-schedule" className="scroll-mt-24 py-0">
                    <h2 className="font-headline text-3xl font-bold mb-6">পরীক্ষার রুটিন</h2>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>পরীক্ষার নাম</TableHead>
                                        <TableHead>বিষয়</TableHead>
                                        <TableHead>তারিখ</TableHead>
                                        <TableHead>মোট নম্বর</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {course.examTemplates.map((item, index) => (
                                        <TableRow key={`exam-${item.id}-${index}`}>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell>{item.topic}</TableCell>
                                            <TableCell>{item.examDate ? format(safeToDate(item.examDate), 'PPP') : 'N/A'}</TableCell>
                                            <TableCell>{item.totalMarks}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </section>
            )}

            {course.syllabus && course.syllabus.length > 0 && (
              <section id="syllabus" className="scroll-mt-24 py-0">
                <h2 className="font-headline text-3xl font-bold mb-6">
                  সিলেবাস
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {course.syllabus.map((item) => (
                    <AccordionItem value={item.id} key={item.id}>
                      <AccordionTrigger className="text-lg font-semibold">
                        <div className="flex items-center gap-3">
                           <BookOpen className="w-6 h-6 text-primary"/>
                           <span>{item.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-12">
                        <ul className="space-y-2">
                            {item.lessons.map(lesson => (
                                <li key={lesson.id} className="flex items-center gap-2 text-muted-foreground">
                                    <PlayCircle className="w-4 h-4"/>
                                    <span>{lesson.title}</span>
                                    <span className="ml-auto text-xs">{lesson.duration}</span>
                                </li>
                            ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                 <div className="text-center mt-4">
                    <Button variant="outline">See More</Button>
                </div>
              </section>
            )}

            {course.reviewsData && course.reviewsData.length > 0 && (
              <section id="reviews" className="scroll-mt-24 py-0">
                <h2 className="font-headline text-3xl font-bold mb-6">Student Feedback</h2>
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {course.reviewsData.map((review) => (
                      <ReviewCard key={review.id} review={review} courseId={courseId} />
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}


            {course.faqs && course.faqs.length > 0 && (
              <section id="faq" className="scroll-mt-24 py-0">
                <h2 className="font-headline text-3xl font-bold mb-6">
                  Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {course.faqs.map((faq, index) => (
                    <AccordionItem value={`faq-${index}`} key={`faq-${faq.question}-${index}`}>
                      <AccordionTrigger className="font-semibold text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
            
            {course.price &&
              <section id="payment" className="scroll-mt-24 py-0">
                  <h2 className="font-headline text-3xl font-bold mb-6">পেমেন্ট প্রক্রিয়া</h2>
                  <p className="text-muted-foreground">আমাদের পেমেন্ট প্রক্রিয়া খুবই সহজ। আপনি বিকাশ, নগদ, রকেট অথবা যেকোনো ডেবিট/ক্রেডিট কার্ডের মাধ্যমে পেমেন্ট করতে পারেন। বিস্তারিত জানতে <Link href="/contact" className="text-primary hover:underline">এখানে ক্লিক করুন</Link>।</p>
              </section>
            }
          </div>

          <div className="lg:col-span-1">
             <Card className="sticky top-24 bg-card text-card-foreground shadow-xl">
                <CardHeader>
                  {isPrebookingActive ? (
                      <>
                          <p className="text-muted-foreground line-through">{course.price}</p>
                          <CardTitle className="text-3xl font-bold text-primary">{course.prebookingPrice}</CardTitle>
                      </>
                  ) : hasDiscount ? (
                      <div className="flex items-baseline gap-3">
                          <CardTitle className="text-3xl font-bold text-primary">{course.discountPrice}</CardTitle>
                          <p className="text-xl text-muted-foreground line-through">{course.price}</p>
                      </div>
                  ) : (
                      <CardTitle className="text-3xl font-bold text-primary">{course.price}</CardTitle>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex w-full items-center gap-2">
                    <CourseEnrollmentButton
                        courseId={course.id!}
                        isPrebookingActive={isPrebookingActive}
                        checkoutUrl={`/checkout/${course.id!}`}
                        courseType={course.type}
                    />
                    <WishlistButton courseId={course.id!} />
                  </div>
                  {course.features && course.features.length > 0 &&
                    <div className="mt-6">
                      <h3 className="font-headline font-semibold mb-3">
                        এই কোর্সে যা যা থাকছে
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {course.features?.slice(0, 5).map((feature, index) => (
                          <li key={`feature-${index}`} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  }
                  <Button variant="outline" className="w-full mt-4">
                    See Demo Class
                  </Button>
                  {course.whatsappNumber && (
                    <Button variant="outline" className="w-full mt-2 bg-green-100 border-green-300 text-green-800 hover:bg-green-200" asChild>
                        <Link href={`https://wa.me/${course.whatsappNumber.replace(/\D/g, '')}`} target="_blank">
                            <Phone className="mr-2 h-5 w-5"/>
                            Contact on WhatsApp
                        </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
          </div>
        </div>

        {includedCourses.length > 0 && (
          <section className="pt-16">
            <h2 className="font-headline text-3xl font-bold mb-6">এই কোর্সের সাথে যা ফ্রি পাচ্ছেন</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {includedCourses.map(includedCourse => {
                const provider = allOrgs.find(p => p.id === includedCourse.organizationId);
                return <CourseCard key={includedCourse.id} {...includedCourse} provider={provider} partnerSubdomain={provider?.subdomain} />;
              })}
            </div>
          </section>
        )}

         <section className="pt-16">
            <h2 className="font-headline text-3xl font-bold mb-6">আমাদের আরও কিছু কোর্স</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
