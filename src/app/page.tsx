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
    loading: () => <Skeleton className="h-[380px] w-full" />,
    ssr: false,
});

const DynamicTeachersCarousel = dynamic(() => import('@/components/dynamic-teachers-carousel').then(mod => mod.DynamicTeachersCarousel), {
    loading: () => <Skeleton className="h-[250px] w-full" />,
    ssr: false,
});

const DynamicMasterclassCarousel = dynamic(() => import('@/components/dynamic-masterclass-carousel').then(mod => mod.DynamicMasterclassCarousel), {
    loading: () => <Skeleton className="h-[380px] w-full" />,
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
  <div className="h-1 w-16 bg-primary mx-auto mt-2 rounded-full shadow-sm" />
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
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }
  
  if (!homepageConfig) {
      return (
          <div className="flex h-screen items-center justify-center">
              <p>Could not load homepage content. Please try again later.</p>
          </div>
      )
  }
  
  return (
    <div className="text-foreground overflow-x-hidden max-w-full">
        <section className="py-4 md:py-6 container mx-auto px-4 md:px-8">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {homepageConfig.categoriesSection?.display && (
          <SectionWrapper>
              <div className="text-center mb-10">
                <h2 id="categories-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                  {homepageConfig.categoriesSection?.title?.[language]}
                </h2>
                <HeadingUnderline />
              </div>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
          </SectionWrapper>
        )}

        <div className="container mx-auto px-4 md:px-8 my-2 max-w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <NoticeBoard />
            </motion.div>
        </div>

        {homepageConfig.journeySection?.display && (
          <SectionWrapper aria-labelledby="hero-heading">
              <div className="text-center mb-12 bg-muted/30 py-8 rounded-[2rem] border border-primary/10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h2 id="hero-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 relative z-10 uppercase">{homepageConfig.journeySection?.title?.[language]}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-sm font-medium px-4 relative z-10">{homepageConfig.journeySection?.subtitle?.[language]}</p>
                <HeadingUnderline />
              </div>
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                    <h3 className="font-headline text-xl font-bold text-primary uppercase tracking-wider">{homepageConfig.journeySection?.courseTitle?.[language]}</h3>
                    <Button asChild variant="link" className="group font-black text-xs uppercase tracking-widest p-0 h-auto">
                        <Link href="/courses">View All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"/></Link>
                    </Button>
                </div>
                <DynamicLiveCoursesCarousel courses={liveCourses} providers={organizations} />
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.strugglingStudentSection?.display && (
          <SectionWrapper>
              <div 
                className="group relative rounded-[2.5rem] bg-card border-2 border-primary p-8 md:p-12 flex flex-wrap items-center justify-center md:justify-between gap-10 overflow-hidden shadow-xl"
              >
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-center md:text-left z-10">
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                        <Image
                            src={homepageConfig.strugglingStudentSection.imageUrl}
                            alt="Struggling student illustration"
                            fill
                            className="object-contain"
                            data-ai-hint="student family studying"
                        />
                      </div>
                      <div className="max-w-xl">
                          <h3 className="font-headline text-2xl md:text-3xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                              {homepageConfig.strugglingStudentSection?.title?.[language]}
                          </h3>
                          <p className="text-base md:text-lg text-muted-foreground mt-2 font-medium">
                              {homepageConfig.strugglingStudentSection?.subtitle?.[language]}
                          </p>
                      </div>
                  </div>
                  <Button asChild size="lg" className="font-black uppercase tracking-widest text-xs h-14 px-10 rounded-2xl shrink-0 z-10 flex-1 sm:flex-none shadow-xl shadow-primary/20">
                      <Link href="/strugglers-studies">
                          {homepageConfig.strugglingStudentSection?.buttonText?.[language]}
                           <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.teachersSection?.display && (
          <SectionWrapper aria-labelledby="teachers-heading">
            <Card className="rounded-[2.5rem] bg-card border-2 border-primary shadow-xl p-8 md:p-12 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
                  <div className="text-center sm:text-left">
                      <h2 id="teachers-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">{homepageConfig.teachersSection?.title?.[language]}</h2>
                      <div className="h-1 w-16 bg-primary mt-2 rounded-full hidden sm:block shadow-sm" />
                      <p className="text-muted-foreground mt-3 text-lg font-medium">{homepageConfig.teachersSection?.subtitle?.[language]}</p>
                  </div>
                  <Button asChild variant="outline" size="lg" className="rounded-2xl font-black uppercase tracking-widest text-xs h-12 px-8 border-primary/20">
                      <Link href="/teachers">{homepageConfig.teachersSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
              <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection?.scrollSpeed} />
            </Card>
          </SectionWrapper>
        )}

        {homepageConfig.videoSection?.display && (
          <SectionWrapper aria-labelledby="video-section-heading">
            <div className="text-center">
                <div className="text-center mb-12 bg-muted/30 py-8 rounded-[2rem] border border-primary/10 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <h2 id="video-section-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 relative z-10 uppercase">{homepageConfig.videoSection?.title?.[language]}</h2>
                  <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg font-medium px-4 relative z-10">{homepageConfig.videoSection?.description?.[language]}</p>
                  <HeadingUnderline />
                </div>
                <div className="flex flex-wrap justify-center gap-8 md:gap-10">
                    {homepageConfig.videoSection?.videos.map((video, index) => {
                      const videoId = getYoutubeVideoId(video.videoUrl);
                      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Invalid+URL';
                      
                      return (
                          <a 
                            key={index} 
                            href={video.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="relative rounded-2xl overflow-hidden group shadow-xl block max-w-[500px] flex-1 min-w-[280px] border border-primary/10"
                          >
                              <Image src={thumbnailUrl} alt={video.title} width={600} height={400} className="w-full transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                  <PlayCircle className="w-20 h-20 text-white/90 drop-shadow-2xl transition-transform group-hover:scale-110"/>
                              </div>
                          </a>
                      );
                    })}
                </div>
                <Button asChild variant="default" size="lg" className="mt-10 font-black uppercase tracking-widest text-xs h-14 px-12 rounded-2xl shadow-xl shadow-accent/20 bg-accent text-accent-foreground transition-all active:scale-95">
                  <Link href="/courses">{homepageConfig.videoSection?.buttonText?.[language]}</Link>
                </Button>
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.sscHscSection?.display && (
          <SectionWrapper aria-labelledby="ssc-hsc-heading">
              <div className="text-center">
                  <Badge variant="default" className="mb-4 text-xs font-black uppercase tracking-[0.2em] py-1.5 px-6 rounded-full bg-primary text-primary-foreground shadow-lg">{homepageConfig.sscHscSection?.badge?.[language]}</Badge>
                  <div className="mb-10">
                    <h2 id="ssc-hsc-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">{homepageConfig.sscHscSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                      {sscHscCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.masterclassSection?.display && (
          <SectionWrapper aria-labelledby="masterclass-heading">
              <div className="text-center">
                  <div className="mb-10">
                    <h2 id="masterclass-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">{homepageConfig.masterclassSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <DynamicMasterclassCarousel courses={masterClasses} providers={organizations} />
                  <Button asChild variant="default" size="lg" className="mt-10 font-black uppercase tracking-widest text-xs h-14 px-12 rounded-2xl shadow-xl shadow-accent/20 bg-accent text-accent-foreground transition-all active:scale-95">
                    <Link href="/courses?category=মাস্টার কোর্স">{homepageConfig.masterclassSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.admissionSection?.display && (
          <SectionWrapper aria-labelledby="admission-heading">
              <div className="text-center">
                  <Badge variant="default" className="mb-4 text-xs font-black uppercase tracking-[0.2em] py-1.5 px-6 rounded-full bg-primary text-primary-foreground shadow-lg">{homepageConfig.admissionSection?.badge?.[language]}</Badge>
                  <div className="mb-10">
                    <h2 id="admission-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">{homepageConfig.admissionSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                      {admissionCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
                  <Button asChild variant="default" size="lg" className="mt-10 font-black uppercase tracking-widest text-xs h-14 px-12 rounded-2xl shadow-xl shadow-accent/20 bg-accent text-accent-foreground transition-all active:scale-95">
                    <Link href="/courses?category=Admission">{homepageConfig.admissionSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}
        
        {homepageConfig.jobPrepSection?.display && (
          <SectionWrapper aria-labelledby="job-prep-heading">
              <div className="text-center">
                  <Badge variant="default" className="mb-4 text-xs font-black uppercase tracking-[0.2em] py-1.5 px-6 rounded-full bg-primary text-primary-foreground shadow-lg">{homepageConfig.jobPrepSection?.badge?.[language]}</Badge>
                  <div className="mb-10">
                    <h2 id="job-prep-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">{homepageConfig.jobPrepSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                      {jobCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
                  <Button asChild variant="default" size="lg" className="mt-10 font-black uppercase tracking-widest text-xs h-14 px-12 rounded-2xl shadow-xl shadow-accent/20 bg-accent text-accent-foreground transition-all active:scale-95">
                    <Link href="/courses?category=Job+Prep">{homepageConfig.jobPrepSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}

        <WhyTrustUs data={homepageConfig.whyChooseUs} />
        
        {homepageConfig.collaborations?.display && approvedCollaborators.length > 0 && (
          <SectionWrapper aria-labelledby="collaborations-heading">
            <div className="text-center">
              <div className="mb-10">
                <h2 id="collaborations-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">
                  {homepageConfig.collaborations?.title?.[language]}
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
              <div className="mb-10">
                <h2 id="partners-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">{homepageConfig.partnersSection?.title?.[language]}</h2>
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
              <div className="mb-10">
                <h2 id="social-media-heading" className="font-headline text-3xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">{homepageConfig.socialMediaSection?.title?.[language]}</h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg font-medium px-4">
                  {homepageConfig.socialMediaSection?.description?.[language]}
                </p>
                <HeadingUnderline />
              </div>
              <div className="flex flex-wrap justify-center gap-8 md:gap-10">
                {homepageConfig.socialMediaSection?.channels.map((channel) => (
                  <div 
                    key={channel.id}
                    className="flex-1 min-w-[280px] max-w-[320px]"
                  >
                    <Card className="text-center p-8 flex flex-col h-full items-center justify-between rounded-3xl border border-primary/20 bg-card hover:border-primary/40 transition-all shadow-xl hover:shadow-2xl">
                      <CardHeader className="p-0">
                        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", channel.platform === 'YouTube' ? 'bg-red-600' : 'bg-blue-600')}>
                            <SocialIcon platform={channel.platform} />
                          </div>
                          <CardTitle className="text-xl font-bold">{typeof channel.name === 'object' ? channel.name[language] : channel.name}</CardTitle>
                        </div>
                        <CardDescription className="text-base font-medium">{channel.handle}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-6 pt-6">
                        <div className="flex justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                          {channel.stat1_value && (
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-primary" />
                              <span className="font-black text-foreground">{channel.stat1_value} {typeof channel.stat1_label === 'object' ? channel.stat1_label[language] : channel.stat1_label}</span>
                            </div>
                          )}
                          {channel.stat2_value && (
                            <div className="flex items-center gap-2">
                              {channel.platform === 'YouTube' ? <Video className="w-5 h-5 text-primary" /> : <ThumbsUp className="w-5 h-5 text-primary" />}
                              <span className="font-black text-foreground">{channel.stat2_value} {typeof channel.stat2_label === 'object' ? channel.stat2_label[language] : channel.stat2_label}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{typeof channel.description === 'object' ? channel.description[language] : channel.description}</p>
                      </CardContent>
                      <CardFooter className="p-0 w-full mt-8">
                        <Button asChild size="lg" className="w-full font-black uppercase tracking-widest text-xs h-12 rounded-2xl shadow-lg transition-all active:scale-95 border-none" style={{ backgroundColor: channel.platform === 'YouTube' ? '#FF0000' : '#1877F2', color: 'white' }}>
                          <Link href={channel.ctaUrl} target="_blank" rel="noopener noreferrer">
                            {typeof channel.ctaText === 'object' ? channel.ctaText[language] : channel.ctaText}
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
                <div className="mb-10">
                  <h2 id="stats-heading" className="font-headline text-3xl font-black text-green-700 dark:text-green-500 uppercase">{homepageConfig.statsSection?.title?.[language]}</h2>
                  <HeadingUnderline />
                </div>
                <div className="flex flex-wrap justify-center gap-8 md:gap-10">
                    {homepageConfig.statsSection?.stats.map((stat, index) => (
                        <div 
                          key={index}
                          className="text-center rounded-[2rem] bg-card border border-primary/20 p-10 flex-1 min-w-[250px] max-w-[350px] shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-500"
                        >
                            <p className="font-headline text-5xl font-black text-primary tracking-tighter">{stat.value}</p>
                            <p className="mt-4 text-base font-bold uppercase tracking-widest text-muted-foreground">{stat.label?.[language]}</p>
                        </div>
                    ))}
                </div>
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.notesBanner?.display && (
          <SectionWrapper aria-labelledby="notes-banner-heading">
              <div className="rounded-[2.5rem] bg-card border-2 border-primary p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className='text-center md:text-left relative z-10 flex-1'>
                        <h3 id="notes-banner-heading" className="font-headline text-3xl md:text-4xl font-black text-green-700 dark:text-green-500 uppercase tracking-tight">{homepageConfig.notesBanner?.title?.[language]}</h3>
                        <p className="text-lg text-muted-foreground mt-4 leading-relaxed font-medium max-w-2xl">{homepageConfig.notesBanner?.description?.[language]}</p>
                    </div>
                    <Button variant="default" size="lg" className="font-black uppercase tracking-widest text-xs shrink-0 bg-accent text-accent-foreground flex-1 sm:flex-none shadow-xl h-14 px-12 rounded-2xl relative z-10 active:scale-95 transition-all">
                      {homepageConfig.notesBanner?.buttonText?.[language]}
                    </Button>
                </div>
          </SectionWrapper>
        )}
        
        <SectionWrapper>
            <RequestCallbackForm homepageConfig={homepageConfig} />
        </SectionWrapper>
        
        {homepageConfig.appPromo?.display && (
          <SectionWrapper aria-labelledby="app-promo-heading">
              <div className="rounded-[3rem] bg-card border-2 border-primary bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-10 md:p-20 shadow-2xl overflow-hidden relative group/app">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] group-hover/app:bg-primary/10 transition-colors duration-700"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                      <div className="text-center md:text-left">
                        <h2 
                          id="app-promo-heading"
                          className="font-headline text-4xl md:text-5xl font-black text-green-700 dark:text-green-500 uppercase tracking-tight leading-tight"
                        >
                          {homepageConfig.appPromo?.title?.[language]}
                        </h2>
                        <p className="mt-8 text-xl text-muted-foreground leading-relaxed font-medium">
                            {homepageConfig.appPromo?.description?.[language]}
                        </p>
                        <div className="flex justify-center md:justify-start gap-6 mt-12 flex-wrap">
                            <Link href={homepageConfig.appPromo?.googlePlayUrl || '#'} className="block">
                                <div className="transition-transform hover:scale-105 active:scale-95 shadow-xl rounded-2xl overflow-hidden">
                                  <Image src={homepageConfig.appPromo.googlePlayImageUrl || 'https://placehold.co/180x60.png'} width={200} height={60} alt="Google Play Store" data-ai-hint="google play button"/>
                                </div>
                            </Link>
                            <Link href={homepageConfig.appPromo?.appStoreUrl || '#'} className="block">
                                <div className="transition-transform hover:scale-105 active:scale-95 shadow-xl rounded-2xl overflow-hidden">
                                  <Image src={homepageConfig.appPromo.appStoreImageUrl || 'https://placehold.co/180x60.png'} width={200} height={60} alt="Apple App Store" data-ai-hint="app store button"/>
                                </div>
                            </Link>
                        </div>
                      </div>
                      <div className="flex justify-center">
                          <div className="relative">
                              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-150 animate-pulse"></div>
                              <Image 
                                src={homepageConfig.appPromo.promoImageUrl || "https://i.imgur.com/uR1Y6o6.png"} 
                                width={350} 
                                height={500} 
                                alt="RDC App" 
                                className='object-contain relative z-10 transition-transform duration-1000 group-hover/app:rotate-2 group-hover/app:scale-110' 
                                data-ai-hint={homepageConfig.appPromo.promoImageDataAiHint || "mobile app screenshot"} 
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