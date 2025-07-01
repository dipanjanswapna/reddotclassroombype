
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getInstructorBySlug, getCourses } from '@/lib/firebase/firestore';
import type { Course, Instructor } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Facebook, Twitter, CheckCircle, Star, Users } from 'lucide-react';
import { CourseCard } from '@/components/course-card';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { teacherSlug: string } }): Promise<Metadata> {
  const teacher = await getInstructorBySlug(params.teacherSlug);

  if (!teacher) {
    return {
      title: 'Teacher Not Found',
    }
  }

  return {
    title: `${teacher.name} - ${teacher.title}`,
    description: teacher.bio,
    openGraph: {
      title: `${teacher.name} - ${teacher.title}`,
      description: teacher.bio,
      images: [teacher.avatarUrl],
    },
  }
}


export default async function TeacherProfilePage({ params }: { params: { teacherSlug: string } }) {
    const teacher = await getInstructorBySlug(params.teacherSlug);

    if (!teacher || teacher.status !== 'Approved') {
        notFound();
    }

    const allCourses = await getCourses();
    const courses = allCourses.filter(c => 
        c.status === 'Published' && c.instructors?.some(i => i.slug === params.teacherSlug)
    );

    // --- Dynamic Stats Calculation ---
    const ratedCourses = courses.filter(c => c.rating && c.rating > 0);
    const totalRatingSum = ratedCourses.reduce((sum, course) => sum + (course.rating || 0), 0);
    const averageRating = ratedCourses.length > 0 ? (totalRatingSum / ratedCourses.length).toFixed(1) : "N/A";
    
    // Simple mock for student count to avoid heavy queries.
    const totalReviews = courses.reduce((sum, course) => sum + (course.reviews || 0), 0);
    const studentCount = totalReviews > 0 ? totalReviews * 10 + courses.length * 5 : 0;


    return (
        <div className="bg-background">
            {/* Hero/About Section */}
            <section className="bg-card py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-1 flex flex-col items-center text-center">
                            <Avatar className="w-48 h-48 border-4 border-primary/20 shadow-lg">
                                <AvatarImage src={teacher.avatarUrl} alt={teacher.name} data-ai-hint={teacher.dataAiHint} priority/>
                                <AvatarFallback className="text-6xl">{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <h1 className="font-headline text-3xl font-bold mt-4">{teacher.name}</h1>
                            <p className="text-primary font-semibold mt-1">{teacher.title}</p>
                            <div className="flex gap-4 mt-4">
                                {teacher.socials?.linkedin && <a href={teacher.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin /></a>}
                                {teacher.socials?.facebook && <a href={teacher.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Facebook /></a>}
                                {teacher.socials?.twitter && <a href={teacher.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Twitter /></a>}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <h2 className="font-headline text-2xl font-bold mb-4">About Me</h2>
                            <p className="text-muted-foreground whitespace-pre-line">{teacher.bio}</p>
                            <div className="flex flex-wrap gap-4 mt-6">
                                <Badge variant="secondary" className="p-2 gap-2 text-base"><Star className="text-yellow-500" /> {averageRating} Average Rating</Badge>
                                 <Badge variant="secondary" className="p-2 gap-2 text-base"><Users /> {studentCount.toLocaleString()}+ Students</Badge>
                                 <Badge variant="secondary" className="p-2 gap-2 text-base"><CheckCircle className="text-green-500" /> RDC Verified</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Display Section */}
            <main className="container mx-auto px-4 py-16">
                <h2 className="font-headline text-3xl font-bold mb-8 text-center">My Courses</h2>
                {courses.length > 0 ? (
                     <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map(course => (
                            <CourseCard key={course.id} {...course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-muted rounded-lg">
                        <p className="text-muted-foreground">This teacher has not published any courses yet.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
