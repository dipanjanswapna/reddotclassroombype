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
import { FreeClassesSection } from '@/components/free-classes-section';
import { CategoriesCarousel } from '@/components/categories-carousel';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/language-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { RequestCallbackForm } from '@/components/request-callback-form';
import WhyTrustUs from '@/components/why-trust-us';
import { DynamicCollaborationsCarousel } from '@/components/dynamic-collaborations-carousel';
import { NoticeBoard } from '@/components/notice-board';
import { motion, AnimatePresence } from 'framer-motion';

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
    className={cn("py-6 md:py-8 container mx-auto px-4 md:px-8", className)}
  >
    {children}
  </section>
);

const HeadingUnderline = () => (
  <div className="h-1 w-16 bg-primary mx-auto mt-2 rounded-full" />
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
    <div className="text-foreground">
        <section className="py-3 md:py-6 container mx-auto px-4 md:px-8">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {homepageConfig.categoriesSection?.display && (
          <SectionWrapper>
              <div className="text-center mb-10">
                <h2 id="categories-heading" className="font-headline text-2xl font-bold text-green-700 dark:text-green-500">
                  {homepageConfig.categoriesSection?.title?.[language]}
                </h2>
                <HeadingUnderline />
              </div>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
          </SectionWrapper>
        )}

        <div className="container mx-auto px-4 md:px-8 my-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <NoticeBoard />
            </motion.div>
        </div>

        {homepageConfig.journeySection?.display && (
          <SectionWrapper aria-labelledby="hero-heading">
              <div className="text-center mb-12 bg-gradient-to-r from-secondary via-background to-secondary py-8 rounded-2xl border border-primary shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h2 id="hero-heading" className="font-headline text-2xl font-bold text-green-700 dark:text-green-500 relative z-10">{homepageConfig.journeySection?.title?.[language]}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-sm px-4 relative z-10">{homepageConfig.journeySection?.subtitle?.[language]}</p>
                <HeadingUnderline />
              </div>
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="font-headline text-xl font-bold text-primary">{homepageConfig.journeySection?.courseTitle?.[language]}</h3>
                    <Button asChild variant="link" className="group">
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
                className="group relative glassmorphism-card border-2 border-primary p-8 md:p-12 flex flex-wrap items-center justify-center md:justify-between gap-10 overflow-hidden shadow-xl"
              >
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-center md:text-left z-10">
                      <Image
                          src={homepageConfig.strugglingStudentSection.imageUrl}
                          alt="Struggling in studies illustration"
                          width={120}
                          height={100}
                          className="hidden sm:block object-contain"
                          data-ai-hint="student family studying"
                      />
                      <div>
                          <h3 className="font-headline text-2xl font-bold text-green-700 dark:text-green-500">
                              {homepageConfig.strugglingStudentSection?.title?.[language]}
                          </h3>
                          <p className="text-lg text-muted-foreground mt-2">
                              {homepageConfig.strugglingStudentSection?.subtitle?.[language]}
                          </p>
                      </div>
                  </div>
                  <Button asChild size="lg" className="font-bold shrink-0 z-10 flex-1 sm:flex-none">
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
            <Card className="glassmorphism-card border-2 border-primary shadow-xl p-8 md:p-12">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
                  <div className="text-center sm:text-left">
                      <h2 id="teachers-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500">{homepageConfig.teachersSection?.title?.[language]}</h2>
                      <div className="h-1 w-16 bg-primary mt-2 rounded-full hidden sm:block" />
                      <p className="text-muted-foreground mt-3 text-lg">{homepageConfig.teachersSection?.subtitle?.[language]}</p>
                  </div>
                  <Button asChild variant="outline" size="lg">
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
                <div className="text-center mb-12 bg-gradient-to-r from-secondary via-background to-secondary py-8 rounded-2xl shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mt-16 blur-2xl"></div>
                  <h2 id="video-section-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500 relative z-10">{homepageConfig.videoSection?.title?.[language]}</h2>
                  <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg px-4 relative z-10">{homepageConfig.videoSection?.description?.[language]}</p>
                  <HeadingUnderline />
                </div>
                <div className="flex flex-wrap justify-center gap-10">
                    {homepageConfig.videoSection?.videos.map((video, index) => {
                      const videoId = getYoutubeVideoId(video.videoUrl);
                      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Invalid+URL';
                      
                      return (
                          <a 
                            key={index} 
                            href={video.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="relative rounded-xl overflow-hidden group shadow-lg block max-w-[500px] flex-1 min-w-[280px]"
                          >
                              <Image src={thumbnailUrl} alt={video.title} width={600} height={400} className="w-full transition-transform duration-500 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PlayCircle className="w-20 h-20 text-white/80 transition-colors cursor-pointer"/>
                              </div>
                          </a>
                      );
                    })}
                </div>
                <Button asChild variant="default" size="lg" className="mt-10 font-bold bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all h-12 px-10">
                  <Link href="/courses">{homepageConfig.videoSection?.buttonText?.[language]}</Link>
                </Button>
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.sscHscSection?.display && (
          <SectionWrapper aria-labelledby="ssc-hsc-heading">
              <div className="text-center">
                  <Badge variant="default" className="mb-4 text-base py-1 px-4 rounded-full bg-primary text-primary-foreground">{homepageConfig.sscHscSection?.badge?.[language]}</Badge>
                  <div className="mb-10">
                    <h2 id="ssc-hsc-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500">{homepageConfig.sscHscSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="flex flex-wrap justify-center gap-10">
                      {sscHscCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.masterclassSection?.display && (
          <SectionWrapper aria-labelledby="masterclass-heading">
              <div className="text-center">
                  <div className="mb-10">
                    <h2 id="masterclass-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500">{homepageConfig.masterclassSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <DynamicMasterclassCarousel courses={masterClasses} providers={organizations} />
                  <Button asChild variant="default" size="lg" className="mt-10 font-bold bg-accent text-accent-foreground shadow-lg h-12 px-10">
                    <Link href="/courses?category=মাস্টার কোর্স">{homepageConfig.masterclassSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.admissionSection?.display && (
          <SectionWrapper aria-labelledby="admission-heading">
              <div className="text-center">
                  <Badge variant="default" className="mb-4 text-base py-1 px-4 rounded-full bg-primary text-primary-foreground">{homepageConfig.admissionSection?.badge?.[language]}</Badge>
                  <div className="mb-10">
                    <h2 id="admission-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500">{homepageConfig.admissionSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="flex flex-wrap justify-center gap-10">
                      {admissionCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
                  <Button asChild variant="default" size="lg" className="mt-10 font-bold bg-accent text-accent-foreground shadow-lg h-12 px-10">
                    <Link href="/courses?category=Admission">{homepageConfig.admissionSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}
        
        {homepageConfig.jobPrepSection?.display && (
          <SectionWrapper aria-labelledby="job-prep-heading">
              <div className="text-center">
                  <Badge variant="default" className="mb-4 text-base py-1 px-4 rounded-full bg-primary text-primary-foreground">{homepageConfig.jobPrepSection?.badge?.[language]}</Badge>
                  <div className="mb-10">
                    <h2 id="job-prep-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500">{homepageConfig.jobPrepSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="flex flex-wrap justify-center gap-10">
                      {jobCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
                  <Button asChild variant="default" size="lg" className="mt-10 font-bold bg-accent text-accent-foreground shadow-lg h-12 px-10">
                    <Link href="/courses?category=Job+Prep">{homepageConfig.jobPrepSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.freeClassesSection?.display && (
          <SectionWrapper aria-labelledby="free-classes-heading">
            <FreeClassesSection sectionData={homepageConfig.freeClassesSection} />
          </SectionWrapper>
        )}

        <WhyTrustUs data={homepageConfig.whyChooseUs} />
        
        {homepageConfig.collaborations?.display && approvedCollaborators.length > 0 && (
          <SectionWrapper aria-labelledby="collaborations-heading">
            <div className="text-center">
              <div className="mb-10">
                <h2 id="collaborations-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500">
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
                <h2 id="partners-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500">{homepageConfig.partnersSection?.title?.[language]}</h2>
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
                <h2 id="social-media-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500">{homepageConfig.socialMediaSection?.title?.[language]}</h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg px-4">
                  {homepageConfig.socialMediaSection?.description?.[language]}
                </p>
                <HeadingUnderline />
              </div>
              <div className="flex flex-wrap justify-center gap-10">
                {homepageConfig.socialMediaSection?.channels.map((channel) => (
                  <div 
                    key={channel.id}
                    className="flex-1 min-w-[280px] max-w-[320px]"
                  >
                    <Card className="text-center p-8 flex flex-col h-full items-center justify-between glassmorphism-card shadow-lg border border-primary/20 hover:border-primary/40 transition-colors">
                      <CardHeader className="p-0">
                        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-lg", channel.platform === 'YouTube' ? 'bg-red-600' : 'bg-blue-600')}>
                            <SocialIcon platform={channel.platform} />
                          </div>
                          <CardTitle className="text-xl">{typeof channel.name === 'object' ? channel.name[language] : channel.name}</CardTitle>
                        </div>
                        <CardDescription className="text-base">{channel.handle}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-6 pt-6">
                        <div className="flex justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                          {channel.stat1_value && (
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-primary" />
                              <span className="font-bold">{channel.stat1_value} {typeof channel.stat1_label === 'object' ? channel.stat1_label[language] : channel.stat1_label}</span>
                            </div>
                          )}
                          {channel.stat2_value && (
                            <div className="flex items-center gap-2">
                              {channel.platform === 'YouTube' ? <Video className="w-5 h-5 text-primary" /> : <ThumbsUp className="w-5 h-5 text-primary" />}
                              <span className="font-bold">{channel.stat2_value} {typeof channel.stat2_label === 'object' ? channel.stat2_label[language] : channel.stat2_label}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-md text-muted-foreground leading-relaxed">{typeof channel.description === 'object' ? channel.description[language] : channel.description}</p>
                      </CardContent>
                      <CardFooter className="p-0 w-full mt-8">
                        <Button asChild size="lg" className="w-full shadow-lg h-12 text-base font-bold" style={{ backgroundColor: channel.platform === 'YouTube' ? '#FF0000' : '#1877F2', color: 'white' }}>
                          <Link href={channel.ctaUrl} target="_blank" rel="noopener noreferrer">
                            <span className="ml-2">{typeof channel.ctaText === 'object' ? channel.ctaText[language] : channel.ctaText}</span>
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
                  <h2 id="stats-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500">{homepageConfig.statsSection?.title?.[language]}</h2>
                  <HeadingUnderline />
                </div>
                <div className="flex flex-wrap justify-center gap-10">
                    {homepageConfig.statsSection?.stats.map((stat, index) => (
                        <div 
                          key={index}
                          className="text-center glassmorphism-card p-10 flex-1 min-w-[250px] max-w-[350px] shadow-lg border border-primary/20 hover:border-primary/40 transition-colors"
                        >
                            <p className="font-headline text-5xl font-extrabold text-primary">{stat.value}</p>
                            <p className="mt-4 text-lg font-semibold text-muted-foreground">{stat.label?.[language]}</p>
                        </div>
                    ))}
                </div>
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.notesBanner?.display && (
          <SectionWrapper aria-labelledby="notes-banner-heading">
              <div className="glassmorphism-card border-2 border-primary p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden rounded-3xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className='text-center md:text-left relative z-10 flex-1'>
                        <h3 id="notes-banner-heading" className="font-headline text-3xl font-bold text-green-700 dark:text-green-500">{homepageConfig.notesBanner?.title?.[language]}</h3>
                        <p className="text-lg text-muted-foreground mt-4 leading-relaxed">{homepageConfig.notesBanner?.description?.[language]}</p>
                    </div>
                    <Button variant="default" size="lg" className="font-bold shrink-0 bg-accent text-accent-foreground flex-1 sm:flex-none shadow-xl h-14 px-12 text-lg relative z-10 rounded-xl">
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
              <div className="glassmorphism-card border-2 border-primary bg-gradient-to-br from-primary/10 via-background to-secondary/30 p-10 md:p-20 shadow-2xl rounded-3xl overflow-hidden relative group/app">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] group-hover/app:bg-primary/10 transition-colors duration-700"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                      <div className="text-center md:text-left">
                        <h2 
                          id="app-promo-heading"
                          className="font-headline text-4xl md:text-5xl font-extrabold text-green-700 dark:text-green-500"
                        >
                          {homepageConfig.appPromo?.title?.[language]}
                        </h2>
                        <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
                            {homepageConfig.appPromo?.description?.[language]}
                        </p>
                        <div className="flex justify-center md:justify-start gap-6 mt-12 flex-wrap">
                            <Link href={homepageConfig.appPromo?.googlePlayUrl || '#'} className="block">
                                <div className="transition-transform hover:scale-105 active:scale-95 shadow-xl rounded-xl overflow-hidden">
                                  <Image src={homepageConfig.appPromo.googlePlayImageUrl || 'https://placehold.co/180x60.png'} width={200} height={60} alt="Google Play Store" data-ai-hint="google play button"/>
                                </div>
                            </Link>
                            <Link href={homepageConfig.appPromo?.appStoreUrl || '#'} className="block">
                                <div className="transition-transform hover:scale-105 active:scale-95 shadow-xl rounded-xl overflow-hidden">
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
                                className='object-contain relative z-10 transition-transform duration-700 group-hover/app:rotate-2 group-hover/app:scale-110' 
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
