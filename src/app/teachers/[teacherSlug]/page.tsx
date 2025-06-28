
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { allInstructors, courses, Instructor } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Facebook, Twitter, CheckCircle, Star, Users } from 'lucide-react';
import { CourseCard } from '@/components/course-card';
import Link from 'next/link';

const getTeacherBySlug = (slug: string): Instructor | undefined => {
  return allInstructors.find((instructor) => instructor.slug === slug && instructor.status === 'Approved');
};

const getCoursesByTeacher = (teacherId: string) => {
    return courses.filter(course => 
        course.instructors.some(instructor => instructor.id === teacherId)
    );
};

export async function generateMetadata({ params }: { params: { teacherSlug: string } }): Promise<Metadata> {
  const teacher = getTeacherBySlug(params.teacherSlug);

  if (!teacher) {
    return {
      title: 'Teacher Not Found',
    };
  }

  return {
    title: `${teacher.name} - ${teacher.title} | Red Dot Classroom`,
    description: teacher.bio.substring(0, 160),
    openGraph: {
      title: `${teacher.name} | Red Dot Classroom`,
      description: teacher.bio,
      images: [
        {
          url: teacher.avatarUrl,
          width: 400,
          height: 400,
          alt: teacher.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
    return allInstructors
        .filter(i => i.status === 'Approved')
        .map((instructor) => ({
            teacherSlug: instructor.slug,
        }));
}

export default function TeacherProfilePage({ params }: { params: { teacherSlug: string } }) {
  const teacher = getTeacherBySlug(params.teacherSlug);

  if (!teacher) {
    notFound();
  }
  
  const teacherCourses = getCoursesByTeacher(teacher.id);

  return (
    <div className="bg-background">
        {/* Hero/About Section */}
        <section className="bg-card py-16">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-1 flex flex-col items-center text-center">
                        <Avatar className="w-48 h-48 border-4 border-primary/20 shadow-lg">
                            <AvatarImage src={teacher.avatarUrl} alt={teacher.name} data-ai-hint={teacher.dataAiHint} />
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
                            <Badge variant="secondary" className="p-2 gap-2 text-base"><Star className="text-yellow-500" /> 4.8 Average Rating</Badge>
                             <Badge variant="secondary" className="p-2 gap-2 text-base"><Users /> 5,000+ Students</Badge>
                             <Badge variant="secondary" className="p-2 gap-2 text-base"><CheckCircle className="text-green-500" /> RDC Verified</Badge>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Course Display Section */}
        <main className="container mx-auto px-4 py-16">
            <h2 className="font-headline text-3xl font-bold mb-8 text-center">My Courses</h2>
            {teacherCourses.length > 0 ? (
                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {teacherCourses.map(course => (
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
