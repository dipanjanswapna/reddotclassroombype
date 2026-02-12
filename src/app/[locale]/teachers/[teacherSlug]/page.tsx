import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getInstructorBySlug, getCourses, getEnrollments, getOrganizations } from '@/lib/firebase/firestore';
import type { Course, Instructor, Organization } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Facebook, Twitter, CheckCircle2, Star, Users, PlayCircle, GraduationCap, ChevronRight, Youtube } from 'lucide-react';
import { CourseCard } from '@/components/course-card';
import Link from 'next/link';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getYoutubeVideoId, cn } from '@/lib/utils';
import { YoutubeModalPlayer } from '@/components/youtube-modal-player';
import { t } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: { teacherSlug: string } }): Promise<Metadata> {
  const awaitedParams = await params;
  const teacher = await getInstructorBySlug(awaitedParams.teacherSlug);

  if (!teacher) {
    return {
      title: 'Teacher Not Found',
    }
  }

  return {
    title: `${teacher.name} - ${teacher.title}`,
    description: teacher.bio,
    openGraph: {
      title: `${teacher.name} - ${teacher.title}`,
      description: teacher.bio,
      images: [teacher.avatarUrl],
    },
  }
}

export default async function TeacherProfilePage({ params }: { params: { locale: string; teacherSlug: string } }) {
    const awaitedParams = await params;
    const { locale, teacherSlug } = awaitedParams;
    const language = locale as 'en' | 'bn';
    const isBn = language === 'bn';
    const teacher = await getInstructorBySlug(teacherSlug);

    if (!teacher || teacher.status !== 'Approved') {
        notFound();
    }

    const [allCourses, allEnrollments, allOrgs] = await Promise.all([
        getCourses(),
        getEnrollments(),
        getOrganizations()
    ]);
    
    const teacherCourses = allCourses.filter(c => 
        c.status === 'Published' && c.instructors?.some(i => i.slug === teacherSlug)
    );
    const courseIds = teacherCourses.map(c => c.id);
    const studentCount = new Set(allEnrollments.filter(e => courseIds.includes(e.courseId)).map(e => e.userId)).size;

    const ratedCourses = teacherCourses.filter(c => c.rating && c.rating > 0);
    const totalRatingSum = ratedCourses.reduce((sum, course) => sum + (course.rating || 0), 0);
    const averageRating = ratedCourses.length > 0 ? (totalRatingSum / ratedCourses.length).toFixed(1) : "4.9";

    const getT = (key: string) => t[key]?.[language] || t[key]?.['en'] || key;

    return (
        <div className={cn("bg-background min-h-screen pb-16 px-1", isBn && "font-bengali")}>
            {/* Breadcrumb */}
            <div className="bg-muted/30 border-b border-white/5 py-2">
                <div className="container mx-auto px-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <Link href={`/${language}`} className="hover:text-primary transition-colors">{getT('nav_home')}</Link>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <Link href={`/${language}/teachers`} className="hover:text-primary transition-colors">{language === 'bn' ? 'শিক্ষকগণ' : 'Instructors'}</Link>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <span className="text-foreground truncate">{teacher.name}</span>
                </div>
            </div>

            {/* Premium Hero Section */}
            <section className="relative pt-8 md:pt-12 pb-8 md:pb-12 border-b border-white/5 overflow-hidden bg-card/20 px-0">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-4 flex flex-col items-center">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-white shadow-2xl overflow-hidden p-1 bg-white">
                                    <Image
                                        src={teacher.avatarUrl}
                                        alt={teacher.name}
                                        fill
                                        className="object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                                        priority
                                    />
                                </div>
                                <div className="absolute bottom-3 right-3 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
                            <div className="space-y-3">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
                                    {language === 'bn' ? 'এলিট ফ্যাকাল্টি মেম্বার' : 'Elite Faculty Member'}
                                </Badge>
                                <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tight leading-none uppercase text-foreground">
                                    {teacher.name}
                                </h1>
                                <p className="text-base md:text-xl font-black text-primary uppercase tracking-widest opacity-90">
                                    {teacher.title}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                                <div className="bg-card p-3 px-6 rounded-2xl border border-white/40 shadow-sm min-w-[100px] text-center backdrop-blur-sm">
                                    <p className="text-xl font-black text-foreground flex items-center justify-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        {averageRating}
                                    </p>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">{language === 'bn' ? 'গড় রেটিং' : 'Avg Rating'}</p>
                                </div>
                                <div className="bg-card p-3 px-6 rounded-2xl border border-white/40 shadow-sm min-w-[100px] text-center backdrop-blur-sm">
                                    <p className="text-xl font-black text-foreground flex items-center justify-center gap-1">
                                        <Users className="w-4 h-4 text-primary" />
                                        {studentCount >= 1000 ? `${(studentCount/1000).toFixed(1)}k+` : studentCount}
                                    </p>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">{language === 'bn' ? 'মোট শিক্ষার্থী' : 'Total Learners'}</p>
                                </div>
                                <div className="bg-card p-3 px-6 rounded-2xl border border-white/40 shadow-sm min-w-[100px] text-center backdrop-blur-sm">
                                    <p className="text-xl font-black text-foreground flex items-center justify-center gap-1">
                                        <GraduationCap className="w-4 h-4 text-accent" />
                                        {teacherCourses.length}
                                    </p>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">{language === 'bn' ? 'চলমান কোর্স' : 'Active Courses'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-8 md:py-12 space-y-10">
                {/* Biography Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-4 border-l-4 border-primary pl-4 text-left">
                        <h2 className="font-headline text-lg md:text-xl font-black tracking-tight uppercase">{getT('teacher_bio')}</h2>
                    </div>
                    <Card className="rounded-2xl md:rounded-3xl border-white/40 bg-card shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <GraduationCap className="w-20 h-20 rotate-12" />
                        </div>
                        <CardContent className="p-6 md:p-10 text-left">
                            <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed whitespace-pre-line relative z-10">
                                {teacher.bio}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Courses Grid */}
                <section className="py-0 px-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-l-4 border-primary pl-4">
                        <div className="text-left">
                            <h2 className="font-headline text-lg md:text-2xl font-black tracking-tight uppercase text-left">{getT('teacher_courses')}</h2>
                            <p className="text-muted-foreground font-medium text-xs md:text-sm mt-0.5 text-left">{language === 'bn' ? 'আপনার প্রয়োজনীয় কোর্সটি বেছে নিন।' : 'Pick your path to academic excellence.'}</p>
                        </div>
                        <Badge variant="accent" className="rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest shadow-sm">{teacherCourses.length} {language === 'bn' ? 'টি একটিভ ব্যাচ' : 'ACTIVE BATCHES'}</Badge>
                    </div>

                    {teacherCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 md:gap-y-8">
                            {teacherCourses.map(course => {
                                const provider = allOrgs.find(p => p.id === course.organizationId);
                                return <CourseCard key={course.id} {...course} provider={provider} />
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-card/50 border-2 border-dashed border-white/30 rounded-3xl">
                            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                            <p className="text-muted-foreground text-sm font-black uppercase tracking-widest">No published courses at the moment.</p>
                        </div>
                    )}
                </section>
                
                {/* YouTube Classes Section */}
                {teacher.youtubeClasses && teacher.youtubeClasses.length > 0 && (
                    <section className="py-0 px-0">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-l-4 border-primary pl-4">
                            <div className="text-left">
                                <h2 className="font-headline text-lg md:text-2xl font-black tracking-tight uppercase text-left">{getT('free_masterclasses')}</h2>
                                <p className="text-muted-foreground font-medium text-xs md:text-sm mt-0.5 text-left">{language === 'bn' ? 'আমাদের ফ্রি রিসোর্সগুলো থেকে আজই শিখুন।' : 'Learn from our high-impact free resources.'}</p>
                            </div>
                        </div>
                        <YoutubeModalPlayer videos={teacher.youtubeClasses} />
                    </section>
                )}
            </main>
        </div>
    );
}
