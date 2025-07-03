
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCourse } from '@/lib/firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default async function CourseHomePage({ params }: { params: { courseId: string } }) {
  const course = await getCourse(params.courseId);

  if (!course || !course.syllabus) {
    notFound();
  }

  // Mock progress dynamically based on course ID for a more realistic feel
  const getMockProgress = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return (Math.abs(hash) % 75) + 20; // Progress between 20 and 95
  };

  const courseProgress = getMockProgress(course.id!); 

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {course.title}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Welcome back! Let's continue where you left off.
        </p>
      </div>

       <div className="space-y-2">
            <div className="flex justify-between font-medium">
                <span>Overall Progress</span>
                <span>{courseProgress}%</span>
            </div>
            <Progress value={courseProgress} className="h-2 [&>div]:bg-accent" />
        </div>

      <div>
        <h2 className="font-headline text-2xl font-bold mb-4">Course Content</h2>
        <Accordion type="multiple" defaultValue={course.syllabus.map(m => m.id)} className="w-full space-y-2">
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
                  {module.lessons.map((lesson, index) => {
                    const lessonLink = lesson.type === 'quiz'
                        ? `/student/my-courses/${course!.id}/quizzes/${lesson.quizId}`
                        : `/student/my-courses/${course!.id}/lesson/${lesson.id}`;
                    
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
                                'w-5 h-5 text-green-500',
                                index > 2 ? 'opacity-20' : '' // Mock completion status
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
      </div>
    </div>
  );
}
