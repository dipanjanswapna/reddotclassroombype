import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getInstructorBySlug, getCourses, getEnrollments, getOrganizations } from '@/lib/firebase/firestore';
import type { Course, Instructor, Organization } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Facebook, Twitter, CheckCircle2, Star, Users, PlayCircle, GraduationCap, ChevronRight, MapPin, Youtube } from 'lucide-react';
import { CourseCard } from '@/components/course-card';
import Link from 'next/link';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getYoutubeVideoId, cn } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { teacherSlug: string } }): Promise<Metadata> {
  const teacher = await getInstructorBySlug(params.teacherSlug);

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

export default async function TeacherProfilePage({ params }: { params: { teacherSlug: string } }) {
    const teacher = await getInstructorBySlug(params.teacherSlug);

    if (!teacher || teacher.status !== 'Approved') {
        notFound();
    }

    const [allCourses, allEnrollments, allOrgs] = await Promise.all([
        getCourses(),
        getEnrollments(),
        getOrganizations()
    ]);
    
    const teacherCourses = allCourses.filter(c => 
        c.status === 'Published' && c.instructors?.some(i => i.slug === params.teacherSlug)
    );
    const courseIds = teacherCourses.map(c => c.id);
    const studentCount = new Set(allEnrollments.filter(e => courseIds.includes(e.courseId)).map(e => e.userId)).size;

    const ratedCourses = teacherCourses.filter(c => c.rating && c.rating > 0);
    const totalRatingSum = ratedCourses.reduce((sum, course) => sum + (course.rating || 0), 0);
    const averageRating = ratedCourses.length > 0 ? (totalRatingSum / ratedCourses.length).toFixed(1) : "4.9";

    return (
        <div className="bg-background min-h-screen pb-16">
            {/* Tighter Breadcrumb */}
            <div className="bg-muted/30 border-b border-white/5 py-2">
                <div className="container mx-auto px-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <Link href="/teachers" className="hover:text-primary transition-colors">Instructors</Link>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <span className="text-foreground truncate">{teacher.name}</span>
                </div>
            </div>

            {/* High-Density Compact Hero Section */}
            <section className="relative pt-8 md:pt-12 pb-8 md:pb-12 border-b border-white/5 overflow-hidden bg-card/30">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-12 gap-6 items-center">
                        <div className="lg:col-span-4 flex flex-col items-center">
                            <div className="relative group">
                                <div className="absolute -inset-3 bg-primary/15 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full border-4 border-white shadow-2xl overflow-hidden p-1 bg-white">
                                    <Image
                                        src={teacher.avatarUrl}
                                        alt={teacher.name}
                                        fill
                                        className="object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                                        data-ai-hint={teacher.dataAiHint || "teacher profile"}
                                        priority
                                    />
                                </div>
                                <div className="absolute bottom-2 right-2 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                            <div className="space-y-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] shadow-sm">
                                    Elite Faculty
                                </Badge>
                                <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
                                    {teacher.name}
                                </h1>
                                <p className="text-sm md:text-base font-black text-primary uppercase tracking-widest opacity-90">
                                    {teacher.title}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-1">
                                <div className="bg-white/60 dark:bg-black/20 p-2.5 px-4 rounded-2xl border border-white/40 shadow-sm min-w-[90px] text-center backdrop-blur-sm">
                                    <p className="text-lg font-black text-foreground flex items-center justify-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                        {averageRating}
                                    </p>
                                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mt-0.5">Rating</p>
                                </div>
                                <div className="bg-white/60 dark:bg-black/20 p-2.5 px-4 rounded-2xl border border-white/40 shadow-sm min-w-[90px] text-center backdrop-blur-sm">
                                    <p className="text-lg font-black text-foreground flex items-center justify-center gap-1">
                                        <Users className="w-3.5 h-3.5 text-primary" />
                                        {studentCount >= 1000 ? `${(studentCount/1000).toFixed(1)}k+` : studentCount}
                                    </p>
                                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mt-0.5">Learners</p>
                                </div>
                                <div className="bg-white/60 dark:bg-black/20 p-2.5 px-4 rounded-2xl border border-white/40 shadow-sm min-w-[90px] text-center backdrop-blur-sm">
                                    <p className="text-lg font-black text-foreground flex items-center justify-center gap-1">
                                        <GraduationCap className="w-3.5 h-3.5 text-accent" />
                                        {teacherCourses.length}
                                    </p>
                                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mt-0.5">Courses</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1">
                                {teacher.socials?.linkedin && (
                                    <Button asChild variant="outline" size="icon" className="h-8 w-8 rounded-xl border-white/40 bg-white hover:bg-primary hover:text-white transition-all shadow-sm">
                                        <a href={teacher.socials.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"><Linkedin className="w-3.5 h-3.5" /></a>
                                    </Button>
                                )}
                                {teacher.socials?.facebook && (
                                    <Button asChild variant="outline" size="icon" className="h-8 w-8 rounded-xl border-white/40 bg-white hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                        <a href={teacher.socials.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"><Facebook className="w-3.5 h-3.5" /></a>
                                    </Button>
                                )}
                                {teacher.socials?.twitter && (
                                    <Button asChild variant="outline" size="icon" className="h-8 w-8 rounded-xl border-white/40 bg-white hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                                        <a href={teacher.socials.twitter} target="_blank" rel="noopener noreferrer" title="Twitter"><Twitter className="w-3.5 h-3.5" /></a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-8 md:py-12 space-y-10 md:space-y-14">
                {/* Biography Section - High Density */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-4 border-l-4 border-primary pl-4">
                        <h2 className="font-headline text-lg md:text-xl font-black tracking-tight uppercase">Biography</h2>
                    </div>
                    <Card className="rounded-2xl border-white/40 bg-card shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <GraduationCap className="w-16 h-16 rotate-12" />
                        </div>
                        <CardContent className="p-6 md:p-8">
                            <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed whitespace-pre-line relative z-10">
                                {teacher.bio}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Courses Grid - High Density */}
                <section className="py-0">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-l-4 border-primary pl-4">
                        <div className="text-left">
                            <h2 className="font-headline text-lg md:text-2xl font-black tracking-tight uppercase">My Courses</h2>
                            <p className="text-muted-foreground font-medium text-xs md:text-sm mt-0.5">Pick your path to academic excellence.</p>
                        </div>
                        <Badge variant="accent" className="rounded-full px-3 py-0.5 font-black text-[8px] uppercase tracking-widest shadow-sm">{teacherCourses.length} ACTIVE BATCHES</Badge>
                    </div>

                    {teacherCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 md:gap-y-8">
                            {teacherCourses.map(course => {
                                const provider = allOrgs.find(p => p.id === course.organizationId);
                                return <CourseCard key={course.id} {...course} provider={provider} />
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-muted/20 border-2 border-dashed border-white/10 rounded-2xl">
                            <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">No published courses yet.</p>
                        </div>
                    )}
                </section>
                
                {/* YouTube Classes Section - Premium Cards */}
                {teacher.youtubeClasses && teacher.youtubeClasses.length > 0 && (
                    <section className="py-0">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-l-4 border-primary pl-4">
                            <div className="text-left">
                                <h2 className="font-headline text-lg md:text-2xl font-black tracking-tight uppercase">Free YouTube Classes</h2>
                                <p className="text-muted-foreground font-medium text-xs md:text-sm mt-0.5">Watch and learn from our free resources.</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teacher.youtubeClasses.map((video) => {
                                const videoId = getYoutubeVideoId(video.youtubeUrl);
                                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Video';

                                return (
                                    <Link key={video.id || video.title} href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="group block">
                                        <Card className="overflow-hidden h-full flex flex-col rounded-2xl border-white/40 bg-card hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 shadow-md">
                                            <CardHeader className="p-0">
                                                <div className="relative aspect-video">
                                                    <Image
                                                        src={thumbnailUrl}
                                                        alt={video.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                        data-ai-hint="youtube video thumbnail"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]">
                                                        <div className="bg-primary p-3 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                                            <PlayCircle className="w-8 h-8 text-white" />
                                                        </div>
                                                    </div>
                                                    <Badge className="absolute top-3 left-3 bg-red-600 font-black text-[8px] uppercase tracking-widest border-none shadow-lg">
                                                        <Youtube className="w-3 h-3 mr-1" /> LIVE
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 flex-grow flex flex-col justify-center">
                                                <h3 className="font-black text-sm md:text-base uppercase tracking-tight leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                                    {video.title}
                                                </h3>
                                                <div className="mt-3 flex items-center gap-1.5 text-primary font-black text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                                    Watch on YouTube <ChevronRight className="w-3 h-3" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
