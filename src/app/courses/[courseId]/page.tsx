import type { Metadata } from 'next';
import Image from 'next/image';
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

// Mock data, in a real app this would come from an API
const courseData = {
  id: '1',
  title: 'Advanced Web Development',
  description: 'Master modern web development with React, Next.js, and advanced backend techniques. This course covers everything from building dynamic user interfaces to deploying scalable applications.',
  instructor: {
    name: 'Jubayer Ahmed',
    title: 'Lead Developer & Instructor',
    avatarUrl: 'https://placehold.co/100x100',
    bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
    dataAiHint: 'male teacher',
  },
  imageUrl: 'https://placehold.co/1280x720',
  dataAiHint: 'web development',
  category: 'Development',
  rating: 4.8,
  reviews: 120,
  price: 'BDT 4500',
  whatYouWillLearn: [
    'Build enterprise-level React applications',
    'Master server-side rendering with Next.js',
    'Design and consume RESTful APIs',
    'Implement robust authentication and authorization',
    'Deploy applications using Docker and Vercel',
  ],
  syllabus: [
    { title: 'Module 1: React Fundamentals Deep Dive', content: 'Advanced hooks, context API, performance optimization.' },
    { title: 'Module 2: Introduction to Next.js', content: 'Pages router, data fetching, static site generation.' },
    { title: 'Module 3: Backend with Node.js & Express', content: 'Building REST APIs, middleware, database integration.' },
    { title: 'Module 4: Authentication & Security', content: 'JWT, OAuth, password hashing, common vulnerabilities.' },
    { title: 'Module 5: Deployment & DevOps', content: 'Docker basics, CI/CD pipelines, deploying to the cloud.' },
  ],
};

export async function generateMetadata({ params }: { params: { courseId: string } }): Promise<Metadata> {
  // In a real app, you would fetch course data based on params.courseId
  const course = courseData;

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
  // We use the same mock data for any courseId for this example
  const course = courseData;

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
      "ratingValue": course.rating.toString(),
      "reviewCount": course.reviews.toString()
    },
    "offers": {
        "@type": "Offer",
        "price": course.price.replace('BDT ', ''),
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
              <span className="font-bold text-foreground">{course.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span>({course.reviews} reviews)</span>
            </div>
            <span className="text-muted-foreground">Created by <span className="text-primary">{course.instructor.name}</span></span>
          </div>

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

          <h2 className="font-headline text-2xl font-bold mb-4">Course Syllabus</h2>
          <Accordion type="single" collapsible className="w-full">
            {course.syllabus.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="font-semibold">{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

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
            <Image
              src={course.imageUrl}
              alt={course.title}
              width={1280}
              height={720}
              className="rounded-t-lg"
              data-ai-hint={course.dataAiHint}
            />
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold mb-4">{course.price}</h2>
              <Button size="lg" className="w-full font-bold bg-accent hover:bg-accent/90 text-accent-foreground">Enroll Now</Button>
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
