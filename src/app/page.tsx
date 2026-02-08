'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Youtube,
  Facebook,
  Video,
  ThumbsUp,
  ArrowRight,
  PlayCircle,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/course-card';
import { Badge } from '@/components/ui/badge';
import { HeroCarousel } from '@/components/hero-carousel';
import { cn, getYoutubeVideoId } from '@/lib/utils';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { getHomepageConfig, getCoursesByIds, getInstructors, getOrganizations } from '@/lib/firebase/firestore';
import type { HomepageConfig, Course, Instructor, Organization } from '@/lib/types';
import { PartnersLogoScroll } from '@/components/partners-logo-scroll';
import { CategoriesCarousel } from '@/components/categories-carousel';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/language-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { RequestCallbackForm } from '@/components/request-callback-form';
import WhyTrustUs from '@/components/why-trust-us';
import { DynamicCollaborationsCarousel } from '@/components/dynamic-collaborations-carousel';
import { NoticeBoard } from '@/components/notice-board';
import { motion } from 'framer-motion';

const DynamicLiveCoursesCarousel = dynamic(() => import('@/components/dynamic-live-courses-carousel').then(mod => mod.DynamicLiveCoursesCarousel), {
    loading: () => <Skeleton className="h-[380px] w-full rounded-[2rem]" />,
    ssr: false,
});

const DynamicTeachersCarousel = dynamic(() => import('@/components/dynamic-teachers-carousel').then(mod => mod.DynamicTeachersCarousel), {
    loading: () => <Skeleton className="h-[250px] w-full rounded-[2rem]" />,
    ssr: false,
});

const DynamicMasterclassCarousel = dynamic(() => import('@/components/dynamic-masterclass-carousel').then(mod => mod.DynamicMasterclassCarousel), {
    loading: () => <Skeleton className="h-[380px] w-full rounded-[2rem]" />,
    ssr: false,
});

const SocialIcon = ({ platform, className }: { platform: string, className?: string }) => {
  switch (platform) {
    case 'YouTube':
      return <Youtube className={cn("w-6 h-6 text-white", className)} />;
    case 'Facebook Page':
    case 'Facebook Group':
      return <Facebook className={cn("w-6 h-6 text-white", className)} />;
    default:
      return null;
  }
};

const SectionWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <section
    className={cn("py-10 md:py-14 container mx-auto px-4 md:px-8 max-w-full overflow-hidden", className)}
  >
    {children}
  </section>
);

const HeadingUnderline = () => (
  <div className="h-1.5 w-24 bg-primary mx-auto mt-4 rounded-full shadow-md" />
);

export default function Home() {
  const { language } = useLanguage();
  const [homepageConfig, setHomepageConfig] = React.useState<HomepageConfig | null>(null);
  const [liveCourses, setLiveCourses] = React.useState<Course[]>([]);
  const [sscHscCourses, setSscHscCourses] = React.useState<Course[]>([]);
  const [masterClasses, setMasterClasses] = React.useState<Course[]>([]);
  const [admissionCourses, setAdmissionCourses] = React.useState<Course[]>([]);
  const [jobCourses, setJobCourses] = React.useState<Course[]>([]);
  const [featuredInstructors, setFeaturedInstructors] = React.useState<Instructor[]>([]);
  const [approvedCollaborators, setApprovedCollaborators] = React.useState<Organization[]>([]);
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function fetchData() {
      try {
        const config = await getHomepageConfig();
        setHomepageConfig(config);

        const [
            live,
            sscHsc,
            masters,
            admission,
            job,
            instructorsData,
            orgsData
        ] = await Promise.all([
            getCoursesByIds(config.liveCoursesIds || []),
            getCoursesByIds(config.sscHscCourseIds || []),
            getCoursesByIds(config.masterClassesIds || []),
            getCoursesByIds(config.admissionCoursesIds || []),
            getCoursesByIds(config.jobCoursesIds || []),
            getInstructors(),
            getOrganizations()
        ]);
        
        setLiveCourses(live);
        setSscHscCourses(sscHsc);
        setMasterClasses(masters);
        setAdmissionCourses(admission);
        setJobCourses(job);
        setOrganizations(orgsData);

        const featuredIds = config.teachersSection?.instructorIds || [];
        setFeaturedInstructors(instructorsData.filter(inst => 
            inst.status === 'Approved' && featuredIds.includes(inst.id!)
        ));

        const collabIds = config.collaborations?.organizationIds || [];
        setApprovedCollaborators(orgsData.filter(org => 
            org.status === 'approved' && collabIds.includes(org.id!)
        ));
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }
  
  if (!homepageConfig) {
      return (
          <div className="flex h-screen items-center justify-center bg-background">
              <p className="font-bold text-muted-foreground">Initializing platform environment...</p>
          </div>
      )
  }
  
  return (
    <div className="bg-background text-foreground overflow-x-hidden max-w-full">
        <section className="py-4 md:py-6 container mx-auto px-4 md:px-8 max-w-full">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {homepageConfig.categoriesSection?.display && (
          <SectionWrapper>
              <div className="text-center mb-12">
                <h2 id="categories-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                  {homepageConfig.categoriesSection?.title?.[language] || homepageConfig.categoriesSection?.title?.en}
                </h2>
                <HeadingUnderline />
              </div>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
          </SectionWrapper>
        )}

        <div className="container mx-auto px-4 md:px-8 my-4 max-w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <NoticeBoard />
            </motion.div>
        </div>

        {homepageConfig.journeySection?.display && (
          <SectionWrapper aria-labelledby="hero-heading">
              <div className="text-center mb-12 bg-muted/30 py-10 md:py-12 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
                <h2 id="hero-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 relative z-10 uppercase">{homepageConfig.journeySection?.title?.[language] || homepageConfig.journeySection?.title?.en}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base md:text-lg font-medium px-6 relative z-10 leading-relaxed">{homepageConfig.journeySection?.subtitle?.[language] || homepageConfig.journeySection?.subtitle?.en}</p>
                <HeadingUnderline />
              </div>
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b-2 border-primary/10 pb-4">
                    <h3 className="font-headline text-2xl font-black text-primary uppercase tracking-tight">{homepageConfig.journeySection?.courseTitle?.[language] || homepageConfig.journeySection?.courseTitle?.en}</h3>
                    <Button asChild variant="link" className="group font-black text-[10px] uppercase tracking-[0.25em] p-0 h-auto text-primary hover:no-underline">
                        <Link href="/courses">Explore All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2"/></Link>
                    </Button>
                </div>
                <DynamicLiveCoursesCarousel courses={liveCourses} providers={organizations} />
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.strugglingStudentSection?.display && (
          <SectionWrapper>
              <div 
                className="group relative rounded-[2.5rem] bg-card border-2 border-primary p-10 md:p-16 flex flex-wrap items-center justify-center lg:justify-between gap-12 overflow-hidden shadow-2xl transition-all hover:shadow-primary/10"
              >
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-10 text-center lg:text-left z-10 flex-1">
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 shrink-0 bg-primary/5 rounded-full p-4 border border-primary/10 backdrop-blur-sm shadow-inner">
                        <Image
                            src={homepageConfig.strugglingStudentSection.imageUrl}
                            alt="Student success illustration"
                            fill
                            className="object-contain p-4 transition-transform duration-700 group-hover:rotate-3 group-hover:scale-110"
                            data-ai-hint="student success illustration"
                        />
                      </div>
                      <div className="max-w-xl">
                          <h3 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase leading-tight">
                              {homepageConfig.strugglingStudentSection?.title?.[language] || homepageConfig.strugglingStudentSection?.title?.en}
                          </h3>
                          <p className="text-lg md:text-xl text-muted-foreground mt-4 font-medium leading-relaxed opacity-90">
                              {homepageConfig.strugglingStudentSection?.subtitle?.[language] || homepageConfig.strugglingStudentSection?.subtitle?.en}
                          </p>
                      </div>
                  </div>
                  <Button asChild size="lg" className="font-black uppercase tracking-[0.2em] text-[10px] h-16 px-12 rounded-xl shrink-0 z-10 w-full lg:w-auto shadow-2xl shadow-primary/20 border-none active:scale-95 transition-all">
                      <Link href="/strugglers-studies" className="flex items-center gap-3">
                          {homepageConfig.strugglingStudentSection?.buttonText?.[language] || homepageConfig.strugglingStudentSection?.buttonText?.en}
                           <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                      </Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.teachersSection?.display && (
          <SectionWrapper aria-labelledby="teachers-heading">
            <Card className="rounded-[2.5rem] bg-card border-2 border-primary shadow-2xl p-10 md:p-16 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50"></div>
              <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8 relative z-10">
                  <div className="text-center lg:text-left space-y-3">
                      <h2 id="teachers-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">{homepageConfig.teachersSection?.title?.[language] || homepageConfig.teachersSection?.title?.en}</h2>
                      <div className="h-1.5 w-24 bg-primary rounded-full hidden lg:block shadow-sm" />
                      <p className="text-muted-foreground mt-4 text-lg md:text-xl font-medium max-w-2xl">{homepageConfig.teachersSection?.subtitle?.[language] || homepageConfig.teachersSection?.subtitle?.en}</p>
                  </div>
                  <Button asChild variant="outline" size="lg" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 border-2 border-primary/20 hover:bg-primary/5 shadow-md shrink-0">
                      <Link href="/teachers">{homepageConfig.teachersSection?.buttonText?.[language] || homepageConfig.teachersSection?.buttonText?.en}</Link>
                  </Button>
              </div>
              <div className="relative z-10">
                <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection?.scrollSpeed} />
              </div>
            </Card>
          </SectionWrapper>
        )}

        {homepageConfig.videoSection?.display && (
          <SectionWrapper aria-labelledby="video-section-heading">
            <div className="text-center space-y-12">
                <div className="text-center bg-muted/30 py-12 rounded-3xl border border-primary/10 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent"></div>
                  <h2 id="video-section-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 relative z-10 uppercase">{homepageConfig.videoSection?.title?.[language] || homepageConfig.videoSection?.title?.en}</h2>
                  <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg md:text-xl font-medium px-6 relative z-10 leading-relaxed">{homepageConfig.videoSection?.description?.[language] || homepageConfig.videoSection?.description?.en}</p>
                  <HeadingUnderline />
                </div>
                <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
                    {homepageConfig.videoSection?.videos.map((video, index) => {
                      const videoId = getYoutubeVideoId(video.videoUrl);
                      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Invalid+URL';
                      
                      return (
                          <motion.a 
                            key={index} 
                            href={video.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            whileHover={{ y: -10 }}
                            className="relative rounded-2xl overflow-hidden group shadow-2xl block flex-1 min-w-[280px] max-w-[550px] border-4 border-primary/5"
                          >
                              <Image src={thumbnailUrl} alt={video.title} width={600} height={400} className="w-full transition-transform duration-1000 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                                  <PlayCircle className="w-24 h-24 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-transform group-hover:scale-110"/>
                                  <span className="mt-4 font-black uppercase text-[10px] tracking-[0.3em] text-white bg-black/60 px-6 py-2 rounded-full border border-white/20">Watch Masterclass</span>
                              </div>
                          </motion.a>
                      );
                    })}
                </div>
                <Button asChild variant="default" size="lg" className="font-black uppercase tracking-[0.2em] text-[10px] h-16 px-14 rounded-2xl shadow-2xl shadow-accent/20 bg-accent text-accent-foreground transition-all active:scale-95 border-none">
                  <Link href="/courses">{homepageConfig.videoSection?.buttonText?.[language] || homepageConfig.videoSection?.buttonText?.en}</Link>
                </Button>
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.sscHscSection?.display && (
          <SectionWrapper aria-labelledby="ssc-hsc-heading">
              <div className="text-center">
                  <Badge variant="default" className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] py-2 px-8 rounded-full bg-primary text-primary-foreground shadow-xl border-none">{homepageConfig.sscHscSection?.badge?.[language] || homepageConfig.sscHscSection?.badge?.en}</Badge>
                  <div className="mb-12">
                    <h2 id="ssc-hsc-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase leading-tight">{homepageConfig.sscHscSection?.title?.[language] || homepageConfig.sscHscSection?.title?.en}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                      {sscHscCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.masterclassSection?.display && (
          <SectionWrapper aria-labelledby="masterclass-heading">
              <div className="text-center">
                  <div className="mb-12">
                    <h2 id="masterclass-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase leading-tight">{homepageConfig.masterclassSection?.title?.[language] || homepageConfig.masterclassSection?.title?.en}</h2>
                    <HeadingUnderline />
                  </div>
                  <DynamicMasterclassCarousel courses={masterClasses} providers={organizations} />
                  <Button asChild variant="default" size="lg" className="mt-12 font-black uppercase tracking-[0.2em] text-[10px] h-16 px-14 rounded-2xl shadow-2xl shadow-accent/20 bg-accent text-accent-foreground transition-all active:scale-95 border-none">
                    <Link href="/courses?category=মাস্টার কোর্স">{homepageConfig.masterclassSection?.buttonText?.[language] || homepageConfig.masterclassSection?.buttonText?.en}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.admissionSection?.display && (
          <SectionWrapper aria-labelledby="admission-heading">
              <div className="text-center">
                  <Badge variant="default" className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] py-2 px-8 rounded-full bg-primary text-primary-foreground shadow-xl border-none">{homepageConfig.admissionSection?.badge?.[language] || homepageConfig.admissionSection?.badge?.en}</Badge>
                  <div className="mb-12">
                    <h2 id="admission-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase leading-tight">{homepageConfig.admissionSection?.title?.[language] || homepageConfig.admissionSection?.title?.en}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                      {admissionCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
                  <Button asChild variant="default" size="lg" className="mt-12 font-black uppercase tracking-[0.2em] text-[10px] h-16 px-14 rounded-2xl shadow-2xl shadow-accent/20 bg-accent text-accent-foreground transition-all active:scale-95 border-none">
                    <Link href="/courses?category=Admission">{homepageConfig.admissionSection?.buttonText?.[language] || homepageConfig.admissionSection?.buttonText?.en}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}
        
        {homepageConfig.jobPrepSection?.display && (
          <SectionWrapper aria-labelledby="job-prep-heading">
              <div className="text-center">
                  <Badge variant="default" className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] py-2 px-8 rounded-full bg-primary text-primary-foreground shadow-xl border-none">{homepageConfig.jobPrepSection?.badge?.[language] || homepageConfig.jobPrepSection?.badge?.en}</Badge>
                  <div className="mb-12">
                    <h2 id="job-prep-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase leading-tight">{homepageConfig.jobPrepSection?.title?.[language] || homepageConfig.jobPrepSection?.title?.en}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                      {jobCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
                  <Button asChild variant="default" size="lg" className="mt-12 font-black uppercase tracking-[0.2em] text-[10px] h-16 px-14 rounded-2xl shadow-2xl shadow-accent/20 bg-accent text-accent-foreground transition-all active:scale-95 border-none">
                    <Link href="/courses?category=Job+Prep">{homepageConfig.jobPrepSection?.buttonText?.[language] || homepageConfig.jobPrepSection?.buttonText?.en}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}

        <WhyTrustUs data={homepageConfig.whyChooseUs} />
        
        {homepageConfig.collaborations?.display && approvedCollaborators.length > 0 && (
          <SectionWrapper aria-labelledby="collaborations-heading">
            <div className="text-center">
              <div className="mb-12">
                <h2 id="collaborations-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                  {homepageConfig.collaborations?.title?.[language] || homepageConfig.collaborations?.title?.en}
                </h2>
                <HeadingUnderline />
              </div>
              <DynamicCollaborationsCarousel organizations={approvedCollaborators} />
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.partnersSection?.display && (
          <SectionWrapper aria-labelledby="partners-heading">
            <div className="text-center">
              <div className="mb-12">
                <h2 id="partners-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">{homepageConfig.partnersSection?.title?.[language] || homepageConfig.partnersSection?.title?.en}</h2>
                <HeadingUnderline />
              </div>
              <PartnersLogoScroll 
                partners={homepageConfig.partnersSection.partners}
                scrollSpeed={homepageConfig.partnersSection.scrollSpeed}
              />
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.socialMediaSection?.display && (
          <SectionWrapper aria-labelledby="social-media-heading">
            <div className="text-center">
              <div className="mb-12">
                <h2 id="social-media-heading" className="font-headline text-3xl md:text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase leading-tight">{homepageConfig.socialMediaSection?.title?.[language] || homepageConfig.socialMediaSection?.title?.en}</h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg md:text-xl font-medium px-6 leading-relaxed opacity-90">
                  {homepageConfig.socialMediaSection?.description?.[language] || homepageConfig.socialMediaSection?.description?.en}
                </p>
                <HeadingUnderline />
              </div>
              <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
                {homepageConfig.socialMediaSection?.channels.map((channel) => (
                  <div 
                    key={channel.id}
                    className="flex-1 min-w-[280px] max-w-[350px]"
                  >
                    <Card className="text-center p-8 md:p-10 flex flex-col h-full items-center justify-between rounded-3xl border border-primary/10 bg-card hover:border-primary/40 transition-all duration-500 shadow-xl hover:shadow-2xl group">
                      <CardHeader className="p-0 w-full">
                        <div className="flex flex-col items-center gap-4 mb-6">
                          <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110", channel.platform === 'YouTube' ? 'bg-red-600 shadow-red-600/20' : 'bg-blue-600 shadow-blue-600/20')}>
                            <SocialIcon platform={channel.platform} className="w-8 h-8"/>
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tight break-words">{typeof channel.name === 'object' ? (channel.name[language] || channel.name.en) : channel.name}</CardTitle>
                            <CardDescription className="text-sm font-bold text-primary/60 uppercase tracking-[0.2em] mt-1">{channel.handle}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-8 pt-4 w-full">
                        <div className="flex justify-center gap-8 text-xs font-black uppercase tracking-widest text-muted-foreground border-y-2 border-primary/5 py-6">
                          {channel.stat1_value && (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-xl font-black text-foreground tracking-tighter">{channel.stat1_value}</span>
                              <span className="opacity-60">{typeof channel.stat1_label === 'object' ? (channel.stat1_label[language] || channel.stat1_label.en) : channel.stat1_label}</span>
                            </div>
                          )}
                          {channel.stat2_value && (
                            <div className="flex flex-col items-center gap-2 border-l-2 border-primary/5 pl-8">
                              <span className="text-xl font-black text-foreground tracking-tighter">{channel.stat2_value}</span>
                              <span className="opacity-60">{typeof channel.stat2_label === 'object' ? (channel.stat2_label[language] || channel.stat2_label.en) : channel.stat2_label}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium line-clamp-3 italic opacity-80">"{typeof channel.description === 'object' ? (channel.description[language] || channel.description.en) : channel.description}"</p>
                      </CardContent>
                      <CardFooter className="p-0 w-full mt-10">
                        <Button asChild size="lg" className="w-full font-black uppercase tracking-[0.25em] text-[10px] h-14 rounded-2xl shadow-xl transition-all active:scale-95 border-none text-white" style={{ backgroundColor: channel.platform === 'YouTube' ? '#FF0000' : '#1877F2' }}>
                          <Link href={channel.ctaUrl} target="_blank" rel="noopener noreferrer">
                            {typeof channel.ctaText === 'object' ? (channel.ctaText[language] || channel.ctaText.en) : channel.ctaText}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        )}
        
        {homepageConfig.statsSection?.display && (
          <SectionWrapper aria-labelledby="stats-heading">
            <div className="text-center">
                <div className="mb-12">
                  <h2 id="stats-heading" className="font-headline text-3xl md:text-4xl font-black text-green-700 dark:text-green-500 uppercase leading-tight">{homepageConfig.statsSection?.title?.[language] || homepageConfig.statsSection?.title?.en}</h2>
                  <HeadingUnderline />
                </div>
                <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
                    {homepageConfig.statsSection?.stats.map((stat, index) => (
                        <motion.div 
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="text-center rounded-3xl bg-card border-2 border-primary/10 p-12 flex-1 min-w-[280px] max-w-[380px] shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                            <p className="font-headline text-6xl font-black text-primary tracking-tighter drop-shadow-sm">{stat.value}</p>
                            <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">{stat.label?.[language] || stat.label?.en}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.notesBanner?.display && (
          <SectionWrapper aria-labelledby="notes-banner-heading">
              <div className="rounded-3xl bg-card border-4 border-primary p-12 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group/notes">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-[100px] opacity-50 group-hover/notes:bg-primary/10 transition-colors duration-1000"></div>
                    <div className='text-center lg:text-left relative z-10 flex-1'>
                        <Badge variant="outline" className="mb-6 font-black uppercase text-[10px] tracking-[0.3em] px-6 py-1.5 rounded-full border-primary/30 text-primary bg-primary/5">Knowledge Repository</Badge>
                        <h3 id="notes-banner-heading" className="font-headline text-4xl md:text-5xl font-black text-green-700 dark:text-green-500 uppercase tracking-tight leading-tight">{homepageConfig.notesBanner?.title?.[language] || homepageConfig.notesBanner?.title?.en}</h3>
                        <p className="text-lg md:text-xl text-muted-foreground mt-6 leading-relaxed font-medium max-w-2xl opacity-90">{homepageConfig.notesBanner?.description?.[language] || homepageConfig.notesBanner?.description?.en}</p>
                    </div>
                    <Button variant="default" size="lg" className="font-black uppercase tracking-[0.2em] text-[10px] shrink-0 bg-primary text-white flex-1 sm:flex-none shadow-2xl shadow-primary/20 h-16 px-14 rounded-2xl relative z-10 active:scale-95 transition-all border-none">
                      {homepageConfig.notesBanner?.buttonText?.[language] || homepageConfig.notesBanner?.buttonText?.en}
                    </Button>
                </div>
          </SectionWrapper>
        )}
        
        <SectionWrapper>
            <RequestCallbackForm homepageConfig={homepageConfig} />
        </SectionWrapper>
        
        {homepageConfig.appPromo?.display && (
          <SectionWrapper aria-labelledby="app-promo-heading">
              <div className="rounded-[2.5rem] md:rounded-[4rem] bg-card border-2 border-primary bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-10 md:p-24 shadow-2xl overflow-hidden relative group/app">
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full -mr-80 -mt-80 blur-[120px] group-hover/app:bg-primary/10 transition-colors duration-1000"></div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                      <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-8 border border-primary/20">
                            Mobile Ecosystem
                        </div>
                        <h2 
                          id="app-promo-heading"
                          className="font-headline text-4xl md:text-6xl font-black text-green-700 dark:text-green-500 uppercase tracking-tight leading-tight break-words"
                        >
                          {homepageConfig.appPromo?.title?.[language] || homepageConfig.appPromo?.title?.en}
                        </h2>
                        <p className="mt-10 text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium opacity-90">
                            {homepageConfig.appPromo?.description?.[language] || homepageConfig.appPromo?.description?.en}
                        </p>
                        <div className="flex justify-center lg:justify-start gap-8 mt-14 flex-wrap">
                            <Link href={homepageConfig.appPromo?.googlePlayUrl || '#'} className="block">
                                <motion.div whileHover={{ scale: 1.05 }} className="shadow-2xl rounded-2xl overflow-hidden border-2 border-white/10 bg-white">
                                  <Image src={homepageConfig.appPromo.googlePlayImageUrl || 'https://placehold.co/180x60.png'} width={220} height={66} alt="Google Play Store" className="object-contain" data-ai-hint="google play button"/>
                                </motion.div>
                            </Link>
                            <Link href={homepageConfig.appPromo?.appStoreUrl || '#'} className="block">
                                <motion.div whileHover={{ scale: 1.05 }} className="shadow-2xl rounded-2xl overflow-hidden border-2 border-white/10 bg-white">
                                  <Image src={homepageConfig.appPromo.appStoreImageUrl || 'https://placehold.co/180x60.png'} width={220} height={66} alt="Apple App Store" className="object-contain" data-ai-hint="app store button"/>
                                </motion.div>
                            </Link>
                        </div>
                      </div>
                      <div className="flex justify-center">
                          <div className="relative">
                              <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full scale-150 animate-pulse"></div>
                              <Image 
                                src={homepageConfig.appPromo.promoImageUrl || "https://i.imgur.com/uR1Y6o6.png"} 
                                width={400} 
                                height={600} 
                                alt="RDC App Interface" 
                                className='object-contain relative z-10 transition-transform duration-1000 group-hover/app:rotate-3 group-hover/app:scale-105' 
                                data-ai-hint={homepageConfig.appPromo.promoImageDataAiHint || "mobile app prototype"} 
                              />
                          </div>
                      </div>
                  </div>
              </div>
          </SectionWrapper>
        )}
    </div>
  );
}