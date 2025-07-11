

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle, PlayCircle, FileText, HelpCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';
import { getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { Course, Enrollment, SyllabusModule } from '@/lib/types';
import { LoadingSpinner } from './loading-spinner';
import { Button } from './ui/button';

export function CourseContentClient({ course }: { course: Course }) {
  const { userInfo, loading: authLoading } = useAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userInfo) {
        if (!authLoading) setLoading(false);
        return;
    }
    const fetchEnrollment = async () => {
        try {
            const enrollments = await getEnrollmentsByUserId(userInfo.uid);
            const currentEnrollment = enrollments.find(e => e.courseId === course.id);
            setEnrollment(currentEnrollment || null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchEnrollment();
  }, [userInfo, authLoading, course.id]);

  const isFullCourseAccess = !enrollment?.cycleId || enrollment.enrollmentType === 'full_course';

  const accessibleModuleIds = useMemo(() => {
      if (isFullCourseAccess) {
          return new Set(course.syllabus?.map(m => m.id));
      }
      const cycle = course.cycles?.find(c => c.id === enrollment?.cycleId);
      return new Set(cycle?.moduleIds || []);
  }, [isFullCourseAccess, enrollment, course]);


  if (loading || authLoading) {
      return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  }
  
  const courseProgress = enrollment?.progress || 0;
  const completedLessons = enrollment?.completedLessons || [];

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

  const visibleSyllabus = course.syllabus?.filter(module => accessibleModuleIds.has(module.id));

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between font-medium">
            <span>Overall Progress</span>
            <span>{courseProgress}%</span>
        </div>
        <Progress value={courseProgress} className="h-2 [&>div]:bg-accent" />
      </div>

      <div>
        <h2 className="font-headline text-2xl font-bold mb-4">Course Content</h2>
        {!visibleSyllabus || visibleSyllabus.length === 0 ? (
          <div className="text-center py-16 bg-muted rounded-lg">
            <p className="text-muted-foreground">You do not have access to any content in this course.</p>
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={visibleSyllabus.map(m => m.id)} className="w-full space-y-2">
            {visibleSyllabus.map((module) => (
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
                    {module.lessons.map((lesson) => {
                      const lessonLink = lesson.type === 'quiz'
                          ? `/student/my-courses/${course.id}/quizzes/${lesson.quizId}`
                          : `/student/my-courses/${course.id}/lesson/${lesson.id}`;
                      const isCompleted = completedLessons.includes(lesson.id);
                      
                      return (
                          <li key={lesson.id}>
                          <Link
                              href={lessonLink}
                              className="flex items-center gap-4 px-6 py-3 hover:bg-muted/50 transition-colors"
                          >
                              {getLessonIcon(lesson.type)}
                              <div className="flex-grow">
                              <p className="font-medium">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                              </div>
                              <CheckCircle
                              className={cn(
                                  'w-5 h-5 text-green-500 transition-opacity',
                                  isCompleted ? 'opacity-100' : 'opacity-20'
                              )}
                              />
                          </Link>
                          </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        
        {!isFullCourseAccess && (
             <div className="text-center py-8 mt-4 rounded-lg bg-muted/50">
                <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2"/>
                <p className="font-semibold">Some modules are locked.</p>
                <p className="text-sm text-muted-foreground">Enroll in other cycles or the full course to unlock all content.</p>
                <Button asChild variant="link" size="sm"><Link href={`/courses/${course.id}#cycles`}>View All Cycles</Link></Button>
            </div>
        )}
      </div>
    </>
  );
}
