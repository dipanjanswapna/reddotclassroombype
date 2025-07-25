

'use client'; 

import { notFound, useParams } from 'next/navigation';
import { getCourse, getEnrollmentsByUserId, getInstructorBySlug } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Download, MessageSquare, CheckCircle, Loader2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import type { Course, Lesson, Enrollment, Instructor } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { markLessonAsCompleteAction } from '@/app/actions/progress.actions';
import { LessonFeedback } from '@/components/lesson-feedback';
import dynamic from 'next/dynamic';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const FacebookComments = dynamic(() => import('@/components/facebook-comments'), {
    ssr: false,
    loading: () => <Skeleton className="h-24 w-full" />,
});

function InstructorCard({ instructor }: { instructor: Instructor | null }) {
    if (!instructor) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Our Instructor</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={instructor.avatarUrl} />
                        <AvatarFallback>{instructor.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">{instructor.name}</h3>
                        <p className="text-sm text-muted-foreground">{instructor.title}</p>
                        <Button variant="link" asChild className="p-0 h-auto mt-1">
                            <Link href={`/teachers/${instructor.slug}`}>View Profile</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


export default function LessonPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!courseId || !userInfo) {
        if (!loading) setLoading(false);
        return;
      };
      try {
        const [courseData, enrollments] = await Promise.all([
          getCourse(courseId),
          getEnrollmentsByUserId(userInfo.uid)
        ]);

        if (courseData) {
          setCourse(courseData);
          const currentEnrollment = enrollments.find(e => e.courseId === courseId);
          setEnrollment(currentEnrollment || null);

          let foundLesson: Lesson | null = null;
          for (const module of courseData.syllabus || []) {
            const lessonData = module.lessons.find((l) => l.id === lessonId);
            if (lessonData) {
              foundLesson = lessonData;
              break;
            }
          }
           setLesson(foundLesson);

          if (foundLesson) {
             const instructorSlug = foundLesson.instructorSlug || courseData.instructors[0]?.slug;
             if (instructorSlug) {
                 const instructorData = await getInstructorBySlug(instructorSlug);
                 setInstructor(instructorData);
             }
          }

        }
      } catch (error) {
        console.error("Failed to fetch lesson data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [courseId, lessonId, userInfo]);
  
  const isCompleted = enrollment?.completedLessons?.includes(lessonId);

  const handleMarkComplete = async () => {
      if (!userInfo || isCompleted) return;
      setIsCompleting(true);
      const result = await markLessonAsCompleteAction(userInfo.uid, courseId, lessonId);
      if(result.success) {
          toast({ title: result.message });
          // Manually update state to reflect change immediately
          setEnrollment(prev => prev ? ({
              ...prev,
              completedLessons: [...(prev.completedLessons || []), lessonId]
          }) : null);
      } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setIsCompleting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
          <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  if (!course || !lesson) {
    notFound();
  }
  
  const lessonUrl = `${window.location.origin}/student/my-courses/${courseId}/lesson/${lessonId}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-muted-foreground">{course.title}</p>
      </div>

      <div className="aspect-video">
        <iframe
          className="w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${lesson.videoId}`}
          title={lesson.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-4">
             <div className="flex flex-wrap gap-4 items-center">
                {lesson.lectureSheetUrl && (
                <Button asChild>
                    <a
                    href={lesson.lectureSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <Download className="mr-2" />
                    Download Lecture Sheet
                    </a>
                </Button>
                )}
                <Button onClick={handleMarkComplete} disabled={!!isCompleted || isCompleting} variant={isCompleted ? 'secondary' : 'default'}>
                {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                {isCompleted ? 'Completed' : 'Mark as Complete'}
                </Button>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare />
                        Lesson Discussion
                    </CardTitle>
                </CardHeader>
                 <CardContent>
                    <FacebookComments href={lessonUrl} />
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1 space-y-6">
             <InstructorCard instructor={instructor} />
             <LessonFeedback courseId={courseId} courseTitle={course.title} lessonId={lessonId} />
        </div>
      </div>
    </div>
  );
}
