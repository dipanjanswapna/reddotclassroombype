import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getInstructorBySlug, getCourses, getEnrollments, getOrganizations } from '@/lib/firebase/firestore';
import type { Course, Instructor, Organization } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Facebook, Twitter, CheckCircle2, Star, Users, PlayCircle, GraduationCap, ChevronRight, MapPin } from 'lucide-react';
import { CourseCard } from '@/components/course-card';
import Link from 'next/link';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getYoutubeVideoId } from '@/lib/utils';

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
        <div className="bg-background min-h-screen pb-20">
            {/* Modern Breadcrumb */}
            <div className="bg-muted/30 border-b border-white/5 py-3">
                <div className="container mx-auto px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/teachers" className="hover:text-primary transition-colors">Instructors</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground truncate">{teacher.name}</span>
                </div>
            </div>

            {/* Dynamic Hero Section */}
            <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 border-b border-white/5 overflow-hidden bg-muted/20">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-accent/5 blur-[100px] rounded-full -z-10" />
                
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        {/* Profile Image Column */}
                        <div className="lg:col-span-4 flex flex-col items-center">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
                                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-[6px] border-white shadow-2xl overflow-hidden p-1 bg-white">
                                    <Image
                                        src={teacher.avatarUrl}
                                        alt={teacher.name}
                                        fill
                                        className="object-cover rounded-full"
                                        data-ai-hint={teacher.dataAiHint}
                                        priority
                                    />
                                </div>
                                <div className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-full shadow-xl border-4 border-white">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Info Column */}
                        <div className="lg:col-span-8 space-y-8 text-center lg:text-left">
                            <div className="space-y-4">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                                    Elite Faculty
                                </Badge>
                                <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none uppercase text-foreground">
                                    {teacher.name}
                                </h1>
                                <p className="text-lg md:text-xl font-bold text-primary uppercase tracking-widest">
                                    {teacher.title}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <div className="bg-card p-4 rounded-2xl border border-white/40 shadow-sm min-w-[120px] text-center">
                                    <p className="text-2xl font-black text-foreground flex items-center justify-center gap-1.5">
                                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                        {averageRating}
                                    </p>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Avg. Rating</p>
                                </div>
                                <div className="bg-card p-4 rounded-2xl border border-white/40 shadow-sm min-w-[120px] text-center">
                                    <p className="text-2xl font-black text-foreground flex items-center justify-center gap-1.5">
                                        <Users className="w-5 h-5 text-primary" />
                                        {studentCount >= 1000 ? `${(studentCount/1000).toFixed(1)}k+` : studentCount}
                                    </p>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Learners</p>
                                </div>
                                <div className="bg-card p-4 rounded-2xl border border-white/40 shadow-sm min-w-[120px] text-center">
                                    <p className="text-2xl font-black text-foreground flex items-center justify-center gap-1.5">
                                        <GraduationCap className="w-5 h-5 text-accent" />
                                        {teacherCourses.length}
                                    </p>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Courses</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                                {teacher.socials?.linkedin && (
                                    <Button asChild variant="outline" size="icon" className="rounded-xl border-white/40 bg-white/50 backdrop-blur-sm hover:bg-primary hover:text-white hover:border-primary transition-all">
                                        <a href={teacher.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="w-5 h-5" /></a>
                                    </Button>
                                )}
                                {teacher.socials?.facebook && (
                                    <Button asChild variant="outline" size="icon" className="rounded-xl border-white/40 bg-white/50 backdrop-blur-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                                        <a href={teacher.socials.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="w-5 h-5" /></a>
                                    </Button>
                                )}
                                {teacher.socials?.twitter && (
                                    <Button asChild variant="outline" size="icon" className="rounded-xl border-white/40 bg-white/50 backdrop-blur-sm hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all">
                                        <a href={teacher.socials.twitter} target="_blank" rel="noopener noreferrer"><Twitter className="w-5 h-5" /></a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-16 md:py-24 space-y-24">
                {/* About Me Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8 border-l-4 border-primary pl-6">
                        <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase">Biography</h2>
                    </div>
                    <div className="bg-card p-8 md:p-12 rounded-3xl border border-white/40 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <GraduationCap className="w-32 h-32 rotate-12" />
                        </div>
                        <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed whitespace-pre-line relative z-10">
                            {teacher.bio}
                        </p>
                    </div>
                </div>

                {/* Courses Grid */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-l-4 border-primary pl-6">
                        <div className="text-left">
                            <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase">My Courses</h2>
                            <p className="text-muted-foreground font-medium text-lg mt-2">Pick your path to academic excellence with {teacher.name}.</p>
                        </div>
                        <Badge variant="accent" className="rounded-full px-4 font-black">{teacherCourses.length} ACTIVE BATCHES</Badge>
                    </div>

                    {teacherCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-0 md:gap-y-8">
                            {teacherCourses.map(course => {
                                const provider = allOrgs.find(p => p.id === course.organizationId);
                                return <CourseCard key={course.id} {...course} provider={provider} />
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-white/10 rounded-3xl">
                            <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground text-lg font-bold">This teacher has not published any courses yet.</p>
                        </div>
                    )}
                </section>
                
                {/* YouTube Classes Section */}
                {teacher.youtubeClasses && teacher.youtubeClasses.length > 0 && (
                    <section className="pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-l-4 border-primary pl-6">
                            <div className="text-left">
                                <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase">Free YouTube Classes</h2>
                                <p className="text-muted-foreground font-medium text-lg mt-2">Get a glimpse of the teaching quality through these free resources.</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {teacher.youtubeClasses.map((video) => {
                                const videoId = getYoutubeVideoId(video.youtubeUrl);
                                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Video';

                                return (
                                    <Link key={video.id || video.title} href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="group block">
                                        <Card className="overflow-hidden h-full flex flex-col rounded-2xl border-white/30 bg-card hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                            <CardHeader className="p-0">
                                                <div className="relative aspect-video">
                                                    <Image
                                                        src={thumbnailUrl}
                                                        alt={video.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        data-ai-hint="youtube video thumbnail"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                        <div className="bg-primary p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                                            <PlayCircle className="w-10 h-10 text-white" />
                                                        </div>
                                                    </div>
                                                    <Badge className="absolute top-4 left-4 bg-red-600 font-black text-[9px] uppercase tracking-widest border-none">LIVE</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 flex-grow flex flex-col justify-center">
                                                <h3 className="font-black text-sm md:text-base uppercase tracking-tight leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                                    {video.title}
                                                </h3>
                                                <div className="mt-4 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
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
