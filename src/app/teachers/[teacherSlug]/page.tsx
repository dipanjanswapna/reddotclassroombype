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
            {/* Breadcrumb */}
            <div className="bg-muted/30 border-b border-white/5 py-2">
                <div className="container mx-auto px-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <Link href="/teachers" className="hover:text-primary transition-colors">Instructors</Link>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <span className="text-foreground truncate">{teacher.name}</span>
                </div>
            </div>

            {/* Premium Hero Section */}
            <section className="relative pt-8 md:pt-12 pb-8 md:pb-12 border-b border-white/5 overflow-hidden bg-card/20">
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
                                        data-ai-hint={teacher.dataAiHint || "teacher profile"}
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
                                    Elite Faculty Member
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
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Avg Rating</p>
                                </div>
                                <div className="bg-card p-3 px-6 rounded-2xl border border-white/40 shadow-sm min-w-[100px] text-center backdrop-blur-sm">
                                    <p className="text-xl font-black text-foreground flex items-center justify-center gap-1">
                                        <Users className="w-4 h-4 text-primary" />
                                        {studentCount >= 1000 ? `${(studentCount/1000).toFixed(1)}k+` : studentCount}
                                    </p>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Total Learners</p>
                                </div>
                                <div className="bg-card p-3 px-6 rounded-2xl border border-white/40 shadow-sm min-w-[100px] text-center backdrop-blur-sm">
                                    <p className="text-xl font-black text-foreground flex items-center justify-center gap-1">
                                        <GraduationCap className="w-4 h-4 text-accent" />
                                        {teacherCourses.length}
                                    </p>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Active Courses</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                                {teacher.socials?.linkedin && (
                                    <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/40 bg-white hover:bg-primary hover:text-white transition-all shadow-sm">
                                        <a href={teacher.socials.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"><Linkedin className="w-4 h-4" /></a>
                                    </Button>
                                )}
                                {teacher.socials?.facebook && (
                                    <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/40 bg-white hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                        <a href={teacher.socials.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"><Facebook className="w-4 h-4" /></a>
                                    </Button>
                                )}
                                {teacher.socials?.twitter && (
                                    <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/40 bg-white hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                                        <a href={teacher.socials.twitter} target="_blank" rel="noopener noreferrer" title="Twitter"><Twitter className="w-4 h-4" /></a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-8 md:py-12 space-y-10">
                {/* Biography Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-4 border-l-4 border-primary pl-4">
                        <h2 className="font-headline text-lg md:text-xl font-black tracking-tight uppercase">Instructor Biography</h2>
                    </div>
                    <Card className="rounded-2xl md:rounded-3xl border-white/40 bg-card shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <GraduationCap className="w-20 h-20 rotate-12" />
                        </div>
                        <CardContent className="p-6 md:p-10">
                            <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed whitespace-pre-line relative z-10">
                                {teacher.bio}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Courses Grid - Fixed Mobile Alignment */}
                <section className="py-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-l-4 border-primary pl-4">
                        <div className="text-left">
                            <h2 className="font-headline text-lg md:text-2xl font-black tracking-tight uppercase text-left">My Courses</h2>
                            <p className="text-muted-foreground font-medium text-xs md:text-sm mt-0.5 text-left">Pick your path to academic excellence.</p>
                        </div>
                        <Badge variant="accent" className="rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest shadow-sm">{teacherCourses.length} ACTIVE BATCHES</Badge>
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
                    <section className="py-0">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-l-4 border-primary pl-4">
                            <div className="text-left">
                                <h2 className="font-headline text-lg md:text-2xl font-black tracking-tight uppercase text-left">Free Masterclasses</h2>
                                <p className="text-muted-foreground font-medium text-xs md:text-sm mt-0.5 text-left">Learn from our high-impact free resources.</p>
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
                                                        <div className="bg-primary p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                                            <PlayCircle className="w-10 h-10 text-white" />
                                                        </div>
                                                    </div>
                                                    <Badge className="absolute top-4 left-4 bg-red-600 font-black text-[9px] uppercase tracking-widest border-none shadow-lg px-2">
                                                        <Youtube className="w-3.5 h-3.5 mr-1.5" /> LIVE
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-5 flex-grow flex flex-col justify-center">
                                                <h3 className="font-black text-sm md:text-base uppercase tracking-tight leading-tight line-clamp-2 group-hover:text-primary transition-colors text-left">
                                                    {video.title}
                                                </h3>
                                                <div className="mt-4 flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                                    Watch on YouTube <ChevronRight className="w-3.5 h-3.5" />
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
