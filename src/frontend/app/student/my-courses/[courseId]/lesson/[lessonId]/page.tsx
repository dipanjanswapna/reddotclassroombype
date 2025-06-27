'use client'; // This directive is needed for useEffect and useState

import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Download, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FacebookComments from '@/components/facebook-comments';
import { useEffect, useState } from 'react';

const getLessonData = (courseId: string, lessonId: string) => {
  const course = courses.find((c) => c.id === courseId);
  if (!course || !course.syllabus) return null;

  for (const module of course.syllabus) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return { course, lesson };
    }
  }
  return null;
};

export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const data = getLessonData(params.courseId, params.lessonId);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    // This runs only on the client-side after the component mounts,
    // so `window` is safely available.
    setPageUrl(window.location.href);
  }, []);

  if (!data) {
    notFound();
  }

  const { course, lesson } = data;

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
          {pageUrl ? (
            <FacebookComments href={pageUrl} />
          ) : (
            <div className="flex items-center justify-center p-4">
              <p className="text-muted-foreground">Loading comments...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
