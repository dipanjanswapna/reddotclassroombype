import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle, PlayCircle, Star, Users } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { courses } from '@/lib/mock-data';

// In a real app, this would fetch from an API
// For now, we find it from our mock data
const getCourseById = (id: string) => {
  return courses.find((course) => course.id === id);
};

export async function generateMetadata({ params }: { params: { courseId: string } }): Promise<Metadata> {
  const course = getCourseById(params.courseId);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: `${course.title} | Red Dot Classroom`,
    description: course.description,
    openGraph: {
      title: `${course.title} | Red Dot Classroom`,
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

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const course = getCourseById(params.courseId);

  if (!course) {
    notFound();
  }

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "Red Dot Classroom",
      "sameAs": "https://reddotclassroom.com"
    },
    "courseCode": course.id,
    "image": course.imageUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": course.rating?.toString() || '5',
      "reviewCount": course.reviews?.toString() || '1'
    },
    "offers": {
        "@type": "Offer",
        "price": course.price.replace(/[^0-9.]/g, ''),
        "priceCurrency": "BDT"
    },
    "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online"
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Badge variant="secondary" className="mb-2">{course.category}</Badge>
          <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">{course.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">{course.description}</p>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-bold text-foreground">{course.rating || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span>({course.reviews || 0} reviews)</span>
            </div>
            <span className="text-muted-foreground">Created by <span className="text-primary">{course.instructor.name}</span></span>
          </div>

          {course.whatYouWillLearn && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="font-headline text-2xl font-bold mb-4">What you'll learn</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {course.whatYouWillLearn.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 mt-1 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {course.syllabus && (
            <>
              <h2 className="font-headline text-2xl font-bold mb-4">Course Syllabus</h2>
              <Accordion type="single" collapsible className="w-full">
                {course.syllabus.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="font-semibold">{item.title}</AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )}

          <div className="mt-12">
            <h2 className="font-headline text-2xl font-bold mb-4">About the Instructor</h2>
            <Card className="bg-card">
              <CardContent className="p-6 flex items-start gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={course.instructor.avatarUrl} alt={course.instructor.name} data-ai-hint={course.instructor.dataAiHint} />
                  <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-headline text-xl font-bold">{course.instructor.name}</h3>
                  <p className="text-muted-foreground mb-2">{course.instructor.title}</p>
                  <p>{course.instructor.bio}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <div className="relative aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                 <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover rounded-t-lg"
                    data-ai-hint={course.dataAiHint}
                />
                <div className="absolute inset-0 bg-black/40 rounded-t-lg flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white/80 hover:text-white transition-colors cursor-pointer" />
                </div>
            </div>
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold mb-4 text-primary">{course.price}</h2>
              <Button size="lg" className="w-full font-bold">Enroll Now</Button>
              <p className="text-center text-sm text-muted-foreground mt-2">30-Day Money-Back Guarantee</p>
              <ul className="space-y-2 mt-6 text-sm">
                <li className="flex items-center gap-2"><PlayCircle className="w-4 h-4 text-muted-foreground"/> 12 hours on-demand video</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-muted-foreground"/> 25 downloadable resources</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-muted-foreground"/> Full lifetime access</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-muted-foreground"/> Certificate of completion</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
