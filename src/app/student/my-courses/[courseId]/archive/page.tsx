
'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCourse, getCourses } from '@/lib/firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import type { Course } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-5 h-5 text-muted-foreground" />;
      case 'quiz':
        return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
      case 'document':
        return <FileText className="w-5 h-5 text-muted-foreground" />;
      default:
        return <PlayCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };


export default function ArchivedContentPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [mainCourse, setMainCourse] = useState<Course | null>(null);
  const [archivedCourses, setArchivedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchivedContent = async () => {
      if (!courseId) return;
      try {
        const courseData = await getCourse(courseId);
        setMainCourse(courseData);

        if (courseData?.includedArchivedCourseIds && courseData.includedArchivedCourseIds.length > 0) {
          const allCourses = await getCourses();
          const filteredArchived = allCourses.filter(c => courseData.includedArchivedCourseIds?.includes(c.id!));
          setArchivedCourses(filteredArchived);
        }
      } catch (error) {
        console.error("Failed to fetch archived content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArchivedContent();
  }, [courseId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
          <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  if (!mainCourse || archivedCourses.length === 0) {
    return (
        <div className="text-center py-16 bg-muted rounded-lg">
            <p className="text-muted-foreground">No archived bonus content found for this course.</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Archived Content
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Included bonus content from previous courses.
        </p>
      </div>

      <div className="space-y-6">
        {archivedCourses.map(course => (
             <Card key={course.id}>
                <div className="p-6">
                    <h2 className="font-headline text-2xl font-bold">{course.title}</h2>
                    <Badge variant="secondary" className="mt-2">{course.category}</Badge>
                </div>
                 {course.syllabus && course.syllabus.length > 0 ? (
                    <Accordion type="multiple" defaultValue={course.syllabus.map(m => m.id)} className="w-full space-y-2 px-6 pb-6">
                        {course.syllabus.map((module) => (
                            <AccordionItem value={module.id} key={module.id} className="border rounded-lg bg-card overflow-hidden">
                                <AccordionTrigger className="text-lg font-semibold px-6 py-4 hover:no-underline bg-muted/50">
                                    <div className="flex flex-col text-left">
                                        <span>{module.title}</span>
                                        <span className="text-xs font-normal text-muted-foreground mt-1">
                                            {module.lessons.length} lessons
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0">
                                    <ul className="space-y-1 border-t">
                                    {module.lessons.map((lesson) => (
                                        <li key={lesson.id}>
                                        <Link
                                            href={`/student/my-courses/${course.id}/lesson/${lesson.id}`}
                                            className="flex items-center gap-4 px-6 py-3 hover:bg-muted/50 transition-colors"
                                        >
                                            {getLessonIcon(lesson.type)}
                                            <div className="flex-grow">
                                            <p className="font-medium">{lesson.title}</p>
                                            <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                                            </div>
                                        </Link>
                                        </li>
                                    ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p className="px-6 pb-6 text-muted-foreground">No syllabus found for this archived course.</p>
                )}
             </Card>
        ))}
      </div>
    </div>
  );
}
