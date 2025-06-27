import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle,
  PlayCircle,
  Star,
  Users,
  Video,
  BookOpen,
  ClipboardList,
  FileText,
  Clock,
  HelpCircle,
  Trophy,
  MessageCircle,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

const getCourseById = (id: string) => {
  return courses.find((course) => course.id === id);
};

export async function generateMetadata({
  params,
}: {
  params: { courseId: string };
}): Promise<Metadata> {
  const course = getCourseById(params.courseId);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: `${course.title} | RDC Shop Courses`,
    description: course.description,
    openGraph: {
      title: `${course.title} | RDC Shop Courses`,
      description: course.description,
      images: [
        {
          url: course.imageUrl,
          width: 1280,
          height: 720,
          alt: course.title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = getCourseById(params.courseId);
  const relatedCourses = courses.filter((c) => c.id !== course?.id).slice(0, 4);

  if (!course) {
    notFound();
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Red Dot Classroom',
      sameAs: 'https://reddotclassroom.com',
    },
    courseCode: course.id,
    image: course.imageUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: course.rating?.toString() || '5',
      reviewCount: course.reviews?.toString() || '1',
    },
    offers: {
      '@type': 'Offer',
      price: course.price.replace(/[^0-9.]/g, ''),
      priceCurrency: 'BDT',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
    },
  };

  const featureIcons: { [key: string]: React.ElementType } = {
    'লাইভ ক্লাস': Video,
    'লেকচার শীট': FileText,
    'ডেইলি এক্সাম': ClipboardList,
    'সাপ্তাহিক পরীক্ষা': ClipboardList,
    'প্রশ্ন-উত্তর সেশন': HelpCircle,
    'ফাইনাল মডেল টেস্ট': Trophy,
  };

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      {/* Hero Section */}
      <section className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">
                {course.title}
              </h1>
              <p className="text-lg text-gray-300 mb-4">
                {course.description}
              </p>
              <div className="relative aspect-video rounded-lg overflow-hidden group mb-2">
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
              <Card className="sticky top-24 bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-primary">
                    {course.price}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full font-bold bg-green-600 hover:bg-green-700">
                    Enroll Now
                  </Button>
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

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* Features Section */}
            <section id="features">
              <Card className="bg-gray-900 text-white">
                <CardHeader>
                  <CardTitle>From this course you'll find out</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {course.features_detailed?.map((feature, index) => {
                      const Icon = featureIcons[feature.title] || HelpCircle;
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                          <Icon className="w-6 h-6 text-primary mt-1" />
                          <div>
                            <h4 className="font-semibold">{feature.title}</h4>
                            <p className="text-sm text-gray-400">{feature.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Instructors Section */}
            <section id="instructors">
              <h2 className="font-headline text-3xl font-bold mb-6">
                কোর্স ইন্সট্রাক্টর
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {course.instructors?.map((instructor, index) => (
                  <div key={index} className="text-center">
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
                    <h3 className="font-semibold">{instructor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {instructor.title}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Class Routine */}
            {course.classRoutine && (
                <section id="routine">
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

            {/* Syllabus Section */}
            {course.syllabus && (
              <section id="syllabus">
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
                        {item.content}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                 <div className="text-center mt-4">
                    <Button variant="outline">See More</Button>
                </div>
              </section>
            )}

            {/* FAQ Section */}
            {course.faqs && (
              <section id="faq">
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
            
            {/* Payment Process */}
            <section id="payment">
                <h2 className="font-headline text-3xl font-bold mb-6">পেমেন্ট প্রক্রিয়া</h2>
                <p className="text-muted-foreground">আমাদের পেমেন্ট প্রক্রিয়া খুবই সহজ। আপনি বিকাশ, নগদ, রকেট অথবা যেকোনো ডেবিট/ক্রেডিট কার্ডের মাধ্যমে পেমেন্ট করতে পারেন। বিস্তারিত জানতে <Link href="/contact" className="text-primary hover:underline">এখানে ক্লিক করুন</Link>।</p>
            </section>
          </div>

          <div className="lg:col-span-1">
            {/* This space can be used for another sticky element or ads if needed */}
          </div>
        </div>

        {/* Related Courses */}
         <section className="mt-16">
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
