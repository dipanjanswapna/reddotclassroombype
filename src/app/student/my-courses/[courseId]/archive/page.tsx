
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCourse, getCoursesByIds } from '@/lib/firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PlayCircle, FileText, HelpCircle, Archive, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Course } from '@/lib/types';
import { motion } from 'framer-motion';

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

export default async function ArchivedContentPage({ params }: { params: { courseId: string } }) {
  const mainCourse = await getCourse(params.courseId);

  if (!mainCourse) {
    notFound();
  }

  const archivedCourseIds = mainCourse.includedCourseIds || [];
  const archivedCourses = archivedCourseIds.length > 0 ? await getCoursesByIds(archivedCourseIds) : [];
  
  if (archivedCourses.length === 0) {
    return (
        <div className="space-y-8">
            <div className="border-l-4 border-primary pl-4">
                <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Legacy <span className="text-primary">Archive</span></h1>
                <p className="mt-1 text-muted-foreground font-medium">Extra resources and previous batch content.</p>
            </div>
            <div className="text-center py-24 bg-muted/5 border-2 border-dashed border-primary/10 rounded-[20px] flex flex-col items-center">
                <Archive className="w-12 h-12 text-primary/20 mx-auto mb-4 opacity-40" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-40">No archived bonus content found</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="border-l-4 border-primary pl-4">
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Legacy <span className="text-primary">Archive</span></h1>
        <p className="mt-1 text-lg text-muted-foreground font-medium">Included bonus content from previous courses.</p>
      </div>

      <div className="space-y-8">
        {archivedCourses.map(course => (
             <Card key={course.id} className="rounded-[20px] border-primary/20 shadow-xl overflow-hidden bg-card">
                <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight">{course.title}</CardTitle>
                            <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest px-3 py-1 mt-2">{course.category}</Badge>
                        </div>
                        <Archive className="w-8 h-8 text-primary/20" />
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                 {course.syllabus && course.syllabus.length > 0 ? (
                    <Accordion type="multiple" defaultValue={course.syllabus.map(m => m.id)} className="w-full space-y-3">
                        {course.syllabus.map((module) => (
                            <AccordionItem value={module.id} key={module.id} className="border border-primary/5 rounded-xl bg-muted/20 overflow-hidden">
                                <AccordionTrigger className="text-sm md:text-base font-black uppercase tracking-tight px-6 py-4 hover:no-underline bg-white/50 dark:bg-black/20">
                                    <div className="flex items-center gap-3 text-left">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                        <div className="flex flex-col">
                                            <span>{module.title}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                                {module.lessons.length} Archived Lessons
                                            </span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0 bg-background/50">
                                    <ul className="divide-y divide-primary/5">
                                    {module.lessons.map((lesson) => (
                                        <li key={lesson.id}>
                                        <Link
                                            href={`/student/my-courses/${course.id}/lesson/${lesson.id}`}
                                            className="flex items-center gap-4 px-6 py-3 hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                                                {getLessonIcon(lesson.type)}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{lesson.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold text-muted-foreground uppercase">
                                                    <span>{lesson.type}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {lesson.duration}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                                        </Link>
                                        </li>
                                    ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-12 opacity-40">
                        <BookOpen className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Syllabus empty</p>
                    </div>
                )}
                </CardContent>
             </Card>
        ))}
      </div>
    </div>
  );
}
