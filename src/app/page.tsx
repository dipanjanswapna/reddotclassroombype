import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Star, Users, Video } from 'lucide-react';
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

const featuredCourses = [
  {
    id: '1',
    title: 'Advanced Web Development',
    instructor: 'Jubayer Ahmed',
    imageUrl: 'https://placehold.co/600x400',
    category: 'Development',
    rating: 4.8,
    reviews: 120,
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

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-primary">
            Unlock Your Potential with Red Dot Classroom
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            High-quality, interactive online education for academic excellence and skill development in Bangladesh.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="font-bold">
              <Link href="/courses">
                Browse Courses <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">
            Popular Course Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-headline text-xl font-semibold">Academic</h3>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Video className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-headline text-xl font-semibold">Skill Development</h3>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-headline text-xl font-semibold">Admission Test</h3>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="font-headline text-xl font-semibold">Language Learning</h3>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">
            Featured Courses
          </h2>
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

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl font-bold mb-4">Success Stories</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Hear from our students who have achieved their goals with Red Dot Classroom.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://placehold.co/100x100" data-ai-hint="male student" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Anik Sarker</CardTitle>
                    <div className="flex text-yellow-400">
                      <Star /><Star /><Star /><Star /><Star />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic">"The admission test prep course was a game-changer. I got into my dream university, and I owe it all to the amazing instructors and comprehensive material."</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://placehold.co/100x100" data-ai-hint="female student" />
                    <AvatarFallback>FH</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Fatima Haque</CardTitle>
                     <div className="flex text-yellow-400">
                      <Star /><Star /><Star /><Star /><Star />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic">"I never thought learning to code could be so intuitive. The web development course provided hands-on projects that prepared me for a real-world job."</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
