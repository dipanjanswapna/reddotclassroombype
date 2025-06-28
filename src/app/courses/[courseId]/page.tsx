
'use client';

import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  CheckCircle,
  PlayCircle,
  Star,
  BookOpen,
  Heart,
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
import { courses } from '@/lib/mock-data';
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
import { useState } from 'react';
import { cn } from '@/lib/utils';

const getCourseById = (id: string) => {
  return courses.find((course) => course.id === id);
};

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = getCourseById(params.courseId);
  const relatedCourses = courses.filter((c) => c.id !== course?.id).slice(0, 4);
  const includedCourses = courses.filter(c => course?.includedArchivedCourseIds?.includes(c.id));

  if (!course) {
    notFound();
  }
  
  const [isWishlisted, setIsWishlisted] = useState(course.isWishlisted || false);

  const isPrebookingActive = course.isPrebooking && course.prebookingEndDate && new Date(course.prebookingEndDate) > new Date();

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-secondary/50 pt-12 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {isPrebookingActive && <Badge className="mb-2" variant="warning">Pre-booking Open Until {format(new Date(course.prebookingEndDate!), 'PPP')}</Badge>}
              <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">
                {course.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {course.description}
              </p>
              <div className="relative aspect-video rounded-lg overflow-hidden group mb-2 shadow-lg">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  data-ai-hint={course.dataAiHint}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle className="w-20 h-20 text-white/80 group-hover:text-white transition-colors cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Image
                    key={i}
                    src={`https://placehold.co/160x90.png`}
                    alt={`Thumbnail ${i}`}
                    width={160}
                    height={90}
                    className="rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    data-ai-hint="video thumbnail"
                  />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-card text-card-foreground shadow-xl">
                <CardHeader>
                    {isPrebookingActive && (
                        <p className="text-muted-foreground line-through">{course.price}</p>
                    )}
                  <CardTitle className="text-3xl font-bold text-primary">
                    {isPrebookingActive ? course.prebookingPrice : course.price}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex w-full items-center gap-2">
                    <Button size="lg" className="w-full font-bold bg-green-600 hover:bg-green-700" asChild>
                        <Link href={isPrebookingActive ? `/pre-book/${course.id}` : `/checkout/${course.id}`}>
                            {isPrebookingActive ? 'Pre-book Now' : 'Enroll Now'}
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="px-3" onClick={() => setIsWishlisted(!isWishlisted)}>
                        <Heart className={cn("w-5 h-5", isWishlisted && "fill-destructive text-destructive")} />
                        <span className="sr-only">Add to wishlist</span>
                    </Button>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-headline font-semibold mb-3">
                      এই কোর্সে যা যা থাকছে
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {course.features?.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    See Demo Class
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <CourseTabs />

      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            
            {course.whatYouWillLearn && (
                <section id="features" className="scroll-mt-24 py-0">
                    <h2 className="font-headline text-3xl font-bold mb-6">What you'll learn</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {course.whatYouWillLearn.map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary mt-1 shrink-0" />
                                <p className='text-muted-foreground'>{item}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section id="instructors" className="scroll-mt-24 py-0">
              <h2 className="font-headline text-3xl font-bold mb-6">
                কোর্স ইন্সট্রাক্টর
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {course.instructors?.map((instructor, index) => (
                  <Link key={instructor.slug || index} href={`/teachers/${instructor.slug}`} className="text-center flex flex-col items-center group">
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
            
            {course.classRoutine && (
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
                                        <TableRow key={index}>
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

            {course.syllabus && (
              <section id="syllabus" className="scroll-mt-24 py-0">
                <h2 className="font-headline text-3xl font-bold mb-6">
                  সিলেবাস
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {course.syllabus.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
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

            {course.reviewsData && (
              <section id="reviews" className="scroll-mt-24 py-0">
                <h2 className="font-headline text-3xl font-bold mb-6">Student Feedback</h2>
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {course.reviewsData.map((review) => (
                      <div key={review.id} className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.user.avatarUrl} alt={review.user.name} data-ai-hint={review.user.dataAiHint} />
                          <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{review.user.name}</p>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 text-yellow-400 ${i < review.rating ? 'fill-current' : ''}`} />
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}


            {course.faqs && (
              <section id="faq" className="scroll-mt-24 py-0">
                <h2 className="font-headline text-3xl font-bold mb-6">
                  Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {course.faqs.map((faq, index) => (
                    <AccordionItem value={`faq-${index}`} key={index}>
                      <AccordionTrigger className="font-semibold text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
            
            <section id="payment" className="scroll-mt-24 py-0">
                <h2 className="font-headline text-3xl font-bold mb-6">পেমেন্ট প্রক্রিয়া</h2>
                <p className="text-muted-foreground">আমাদের পেমেন্ট প্রক্রিয়া খুবই সহজ। আপনি বিকাশ, নগদ, রকেট অথবা যেকোনো ডেবিট/ক্রেডিট কার্ডের মাধ্যমে পেমেন্ট করতে পারেন। বিস্তারিত জানতে <Link href="/contact" className="text-primary hover:underline">এখানে ক্লিক করুন</Link>।</p>
            </section>
          </div>

          <div className="lg:col-span-1">
          </div>
        </div>

        {includedCourses.length > 0 && (
          <section className="pt-16">
            <h2 className="font-headline text-3xl font-bold mb-6">এই কোর্সের সাথে যা ফ্রি পাচ্ছেন</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {includedCourses.map(includedCourse => (
                <CourseCard key={includedCourse.id} {...includedCourse} />
              ))}
            </div>
          </section>
        )}

         <section className="pt-16">
            <h2 className="font-headline text-3xl font-bold mb-6">আমাদের আরও কিছু কোর্স</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedCourses.map(course => (
                    <CourseCard key={course.id} {...course} />
                ))}
            </div>
         </section>
      </main>
    </div>
  );
}

    