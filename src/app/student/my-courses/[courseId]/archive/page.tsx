import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCourse, getCoursesByIds } from '@/lib/firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PlayCircle, FileText, HelpCircle, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Course } from '@/lib/types';

/**
 * @fileOverview Archived Bonus Content Page.
 * Updated for Next.js 15 async params compliance and refined visual radius.
 */

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


export default async function ArchivedContentPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const mainCourse = await getCourse(courseId);

  if (!mainCourse) {
    notFound();
  }

  const archivedCourseIds = mainCourse.includedCourseIds || [];
  const archivedCourses = archivedCourseIds.length > 0 ? await getCoursesByIds(archivedCourseIds) : [];
  
  if (archivedCourses.length === 0) {
    return (
        <div className="space-y-10 md:space-y-14">
            <div className="text-center sm:text-left space-y-2">
                <h1 className="font-headline text-3xl font-black uppercase tracking-tight text-muted-foreground">Archived Vault</h1>
                <p className="text-lg text-muted-foreground font-medium">Accessing bonus materials and historical curriculum.</p>
                <div className="h-1.5 w-24 bg-muted rounded-full mx-auto sm:mx-0 shadow-inner" />
            </div>
            <div className="text-center py-24 bg-muted/30 rounded-3xl border-4 border-dashed">
                <Archive className="w-16 h-16 text-muted-foreground opacity-20 mx-auto mb-4" />
                <p className="text-xl font-bold text-muted-foreground">No archived bonus content found for this course.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-14">
      <div className="text-center sm:text-left space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Archived Vault</h1>
        <p className="text-lg text-muted-foreground font-medium">Included bonus content from related programs.</p>
        <div className="h-1.5 w-24 bg-primary rounded-full mx-auto sm:mx-0 shadow-md" />
      </div>

      <div className="space-y-10">
        {archivedCourses.map(course => (
             <Card key={course.id} className="rounded-2xl border-primary/10 shadow-xl overflow-hidden bg-card transition-all hover:border-primary/40">
                <div className="p-8 border-b border-primary/5 bg-muted/30">
                    <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-primary leading-tight">{course.title}</h2>
                    <Badge variant="secondary" className="mt-3 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">{course.category}</Badge>
                </div>
                 {course.syllabus && course.syllabus.length > 0 ? (
                    <Accordion type="multiple" defaultValue={course.syllabus.map(m => m.id)} className="w-full space-y-4 p-8">
                        {course.syllabus.map((module) => (
                            <AccordionItem value={module.id} key={module.id} className="border-none rounded-xl overflow-hidden bg-muted/20 transition-all hover:bg-muted/40 shadow-sm">
                                <AccordionTrigger className="text-lg font-black px-8 py-6 hover:no-underline text-left">
                                    <div className="flex flex-col">
                                        <span className="uppercase tracking-tight">{module.title}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                                            {module.lessons.length} Reference Lessons
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-8 pb-6 pt-2">
                                    <ul className="space-y-2">
                                    {module.lessons.map((lesson) => (
                                        <li key={lesson.id}>
                                        <Link
                                            href={`/student/my-courses/${course.id}/lesson/${lesson.id}`}
                                            className="flex items-center gap-4 p-4 rounded-xl bg-background border border-primary/5 hover:border-primary/20 hover:shadow-md transition-all group"
                                        >
                                            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                                                {getLessonIcon(lesson.type)}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="font-bold text-sm truncate">{lesson.title}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{lesson.duration}</p>
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
                    <div className="p-16 text-center text-muted-foreground font-medium italic">No syllabus found for this archived resource.</div>
                )}
             </Card>
        ))}
      </div>
    </div>
  );
}
