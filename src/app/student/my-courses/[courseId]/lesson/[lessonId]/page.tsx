
'use client'; 

import { notFound, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getCourse } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Download, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import type { Course, Lesson } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { LessonFeedback } from '@/components/lesson-feedback';

const FacebookComments = dynamic(() => import('@/components/facebook-comments'), {
    ssr: false,
    loading: () => <Skeleton className="h-24 w-full" />,
});

export default function LessonPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setPageUrl(window.location.href);

    const fetchLessonData = async () => {
      if (!courseId) return;
      try {
        const courseData = await getCourse(courseId);
        if (courseData) {
          setCourse(courseData);
          for (const module of courseData.syllabus || []) {
            const lessonData = module.lessons.find((l) => l.id === lessonId);
            if (lessonData) {
              setLesson(lessonData);
              break;
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
  }, [courseId, lessonId]);

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

      <LessonFeedback courseId={courseId} courseTitle={course.title} lessonId={lesson.id} />

      <div>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare />
            Discussion & Reactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FacebookComments href={pageUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
