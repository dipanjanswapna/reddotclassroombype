import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Briefcase, Languages, BarChart, Search, PlayCircle, Bot, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseCard } from '@/components/course-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';

const featuredCourses = [
  {
    id: '1',
    title: 'Advanced Web Development',
    instructor: 'Jubayer Ahmed',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Development',
    rating: 4.8,
    reviews: 120,
    price: 'BDT 4500',
    dataAiHint: 'programming code',
  },
  {
    id: '2',
    title: 'IELTS Preparation Course',
    instructor: 'Sadia Islam',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Language',
    rating: 4.9,
    reviews: 250,
    price: 'BDT 3000',
    dataAiHint: 'lecture notes',
  },
  {
    id: '3',
    title: 'University Admission Test Prep',
    instructor: 'Raihan Chowdhury',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Academic',
    rating: 4.7,
    reviews: 300,
    price: 'BDT 5000',
    dataAiHint: 'university campus',
  },
  {
    id: '4',
    title: 'Digital Marketing Fundamentals',
    instructor: 'Ayesha Khan',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Marketing',
    rating: 4.8,
    reviews: 180,
    price: 'BDT 2500',
    dataAiHint: 'marketing chart',
  },
];

const instructors = [
  {
    name: 'Jubayer Ahmed',
    title: 'Lead Developer & Instructor',
    avatarUrl: 'https://placehold.co/100x100',
    dataAiHint: 'male teacher',
  },
  {
    name: 'Sadia Islam',
    title: 'IELTS Specialist',
    avatarUrl: 'https://placehold.co/100x100',
    dataAiHint: 'female teacher',
  },
  {
    name: 'Raihan Chowdhury',
    title: 'Admission Test Expert',
    avatarUrl: 'https://placehold.co/100x100',
    dataAiHint: 'male professor',
  },
];

const featureCards = [
    { icon: PlayCircle, title: 'Video Lectures', description: 'High-quality, engaging video lessons.' },
    { icon: BookOpen, title: 'Interactive Quizzes', description: 'Test your knowledge and track progress.' },
    { icon: Bot, title: 'AI Tutor', description: 'Get instant help from our virtual assistant.' },
    { icon: Users, title: 'Community Support', description: 'Learn with peers and expert mentors.' }
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Start your learning journey with Red Dot Classroom
            </h1>
            <p className="mt-4 max-w-xl mx-auto md:mx-0 text-lg md:text-xl text-muted-foreground">
              High-quality, interactive online education for academic excellence and skill development in Bangladesh.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto md:mx-0">
              <Input placeholder="Search for courses..." className="h-12 text-base" />
              <Button size="lg" className="h-12 font-bold text-base">
                <Search className="mr-2" /> Search
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {featureCards.map(feature => (
                <div key={feature.title}>
                  <feature.icon className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="font-semibold text-sm">{feature.title}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <Image 
              src="https://placehold.co/600x500" 
              alt="A student learning online with Red Dot Classroom" 
              width={600} 
              height={500} 
              className="rounded-xl shadow-lg"
              data-ai-hint="student online learning"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">
            Popular Course Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-primary/20 hover:shadow-lg transition-shadow p-6">
                <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-headline text-xl font-semibold">Academic</h3>
            </Card>
            <Card className="text-center hover:shadow-primary/20 hover:shadow-lg transition-shadow p-6">
                <Briefcase className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-headline text-xl font-semibold">Skill Development</h3>
            </Card>
            <Card className="text-center hover:shadow-primary/20 hover:shadow-lg transition-shadow p-6">
                <Languages className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-headline text-xl font-semibold">Language Learning</h3>
            </Card>
            <Card className="text-center hover:shadow-primary/20 hover:shadow-lg transition-shadow p-6">
                <BarChart className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-headline text-xl font-semibold">Admission Test</h3>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold">
              Featured Courses
            </h2>
            <p className="text-muted-foreground mt-2">Explore our most popular courses</p>
          </div>
          <Carousel opts={{ align: 'start', loop: true }}>
            <CarouselContent>
              {featuredCourses.map((course) => (
                <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <CourseCard {...course} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
           <div className="text-center mt-12">
            <Button asChild size="lg" className="font-bold">
                <Link href="/courses">
                  Browse All Courses <ArrowRight className="ml-2" />
                </Link>
              </Button>
           </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">
            Meet Our Expert Instructors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {instructors.map((instructor) => (
              <Card key={instructor.name} className="text-center p-6">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                  <AvatarImage src={instructor.avatarUrl} alt={instructor.name} data-ai-hint={instructor.dataAiHint} />
                  <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-headline text-xl font-semibold">{instructor.name}</h3>
                <p className="text-muted-foreground">{instructor.title}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
