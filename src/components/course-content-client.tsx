
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle, PlayCircle, FileText, HelpCircle, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';
import { getEnrollmentsByUserId } from '@/lib/firebase/firestore';
import { Course, Enrollment } from '@/lib/types';
import { LoadingSpinner } from './loading-spinner';
import { motion } from 'framer-motion';

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

  if (loading || authLoading) {
      return <div className="flex justify-center py-12"><LoadingSpinner className="w-10 h-10" /></div>;
  }
  
  const courseProgress = enrollment?.progress || 0;
  const completedLessons = enrollment?.completedLessons || [];

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-primary" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-accent" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <PlayCircle className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[20px] p-6 border border-primary/20 shadow-xl"
      >
        <div className="flex justify-between items-end mb-3">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Your Progress</p>
                <h3 className="text-2xl font-black text-foreground">{courseProgress}% <span className="text-sm font-bold text-muted-foreground uppercase ml-1">Complete</span></h3>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Completed</p>
                <p className="font-bold text-sm">{completedLessons.length} / {course.syllabus?.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons</p>
            </div>
        </div>
        <Progress value={courseProgress} className="h-2 rounded-full bg-muted shadow-inner [&>div]:bg-accent" />
      </motion.div>

      <div className="space-y-4">
        <h2 className="font-headline text-xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">Course Modules</h2>
        {course.syllabus && course.syllabus.length > 0 ? (
          <Accordion type="multiple" defaultValue={course.syllabus.map(m => m.id)} className="w-full space-y-3">
            {course.syllabus.map((module) => (
              <AccordionItem value={module.id} key={module.id} className="border border-primary/10 rounded-[20px] bg-card overflow-hidden shadow-md">
                <AccordionTrigger className="text-base md:text-lg font-black uppercase tracking-tight px-6 py-5 hover:no-underline hover:bg-primary/5 transition-all">
                  <div className="flex items-center gap-4 text-left">
                      <div className="bg-primary/10 p-2.5 rounded-xl hidden sm:block">
                          <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                          <span>{module.title}</span>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] mt-1">
                              {module.lessons.length} Learning Sessions
                          </span>
                      </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0 border-t border-primary/5 bg-muted/20">
                  <ul className="divide-y divide-primary/5">
                    {module.lessons.map((lesson) => {
                      const lessonLink = lesson.type === 'quiz'
                          ? `/student/my-courses/${course.id}/quizzes/${lesson.quizId}`
                          : `/student/my-courses/${course.id}/lesson/${lesson.id}`;
                      const isCompleted = completedLessons.includes(lesson.id);
                      
                      return (
                          <li key={lesson.id}>
                          <Link
                              href={lessonLink}
                              className="flex items-center gap-4 px-6 py-4 hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                          >
                              <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                isCompleted ? "bg-green-100 text-green-600" : "bg-muted group-hover:bg-primary/10"
                              )}>
                                {getLessonIcon(lesson.type)}
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className={cn(
                                    "font-bold text-sm md:text-base truncate group-hover:text-primary transition-colors",
                                    isCompleted && "text-muted-foreground"
                                )}>{lesson.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{lesson.type}</span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5"/> {lesson.duration}</span>
                                </div>
                              </div>
                              <div className="shrink-0">
                                {isCompleted ? (
                                    <div className="bg-green-500 text-white p-1 rounded-full shadow-sm">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-primary/20 group-hover:border-primary/50 transition-colors" />
                                )}
                              </div>
                          </Link>
                          </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-primary/10 rounded-[20px]">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No content available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
