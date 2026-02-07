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
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className={cn("py-4 sm:py-6 lg:py-8", className)}
  >
    {children}
  </motion.section>
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
    <div className="text-foreground pt-16">
        <section className="py-2 px-4 md:px-8">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {homepageConfig.strugglingStudentSection?.display && (
          <SectionWrapper className="py-2 px-4 md:px-8">
              <div className="container mx-auto">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="group relative glassmorphism-card p-6 flex flex-wrap items-center justify-center md:justify-between gap-6 overflow-hidden"
                  >
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-center md:text-left z-10">
                          <Image
                              src={homepageConfig.strugglingStudentSection.imageUrl}
                              alt="Struggling in studies illustration"
                              width={120}
                              height={100}
                              className="hidden sm:block object-contain"
                              data-ai-hint="student family studying"
                          />
                          <div>
                              <h3 className="font-headline text-xl font-bold">
                                  {homepageConfig.strugglingStudentSection?.title?.[language]}
                              </h3>
                              <p className="text-muted-foreground">
                                  {homepageConfig.strugglingStudentSection?.subtitle?.[language]}
                              </p>
                          </div>
                      </div>
                      <Button asChild className="font-bold shrink-0 z-10 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 flex-1 sm:flex-none">
                          <Link href="/strugglers-studies">
                              {homepageConfig.strugglingStudentSection?.buttonText?.[language]}
                               <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </Link>
                      </Button>
                  </motion.div>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.categoriesSection?.display && (
          <SectionWrapper aria-labelledby="categories-heading" className="px-4 md:px-8">
            <div className="container mx-auto">
              <div className="text-center mb-4">
                <h2 id="categories-heading" className="font-headline text-2xl font-bold">
                  {homepageConfig.categoriesSection?.title?.[language]}
                </h2>
                <HeadingUnderline />
              </div>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
            </div>
          </SectionWrapper>
        )}

        <div className="container mx-auto px-4 md:px-8 my-2">
            <NoticeBoard />
        </div>

        {homepageConfig.journeySection?.display && (
          <SectionWrapper aria-labelledby="hero-heading" className="px-4 md:px-8">
            <div className="container mx-auto">
              <div className="text-center mb-4">
                <h2 id="hero-heading" className="font-headline text-2xl font-bold">{homepageConfig.journeySection?.title?.[language]}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{homepageConfig.journeySection?.subtitle?.[language]}</p>
                <HeadingUnderline />
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold text-center mb-4">{homepageConfig.journeySection?.courseTitle?.[language]}</h3>
                <DynamicLiveCoursesCarousel courses={liveCourses} providers={organizations} />
              </div>
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.teachersSection?.display && (
          <SectionWrapper aria-labelledby="teachers-heading" className="px-4 md:px-8">
            <div className="container mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                  <div className="text-center sm:text-left">
                      <h2 id="teachers-heading" className="font-headline text-2xl font-bold">{homepageConfig.teachersSection?.title?.[language]}</h2>
                      <div className="h-1 w-16 bg-primary mt-2 rounded-full hidden sm:block" />
                      <p className="text-muted-foreground mt-1">{homepageConfig.teachersSection?.subtitle?.[language]}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                      <Link href="/teachers">{homepageConfig.teachersSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
              <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection?.scrollSpeed} />
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.videoSection?.display && (
          <SectionWrapper aria-labelledby="video-section-heading" className="px-4 md:px-8">
            <div className="container mx-auto text-center">
                <div className="mb-4">
                  <h2 id="video-section-heading" className="font-headline text-2xl font-bold">{homepageConfig.videoSection?.title?.[language]}</h2>
                  <p className="text-muted-foreground mb-2 max-w-2xl mx-auto">{homepageConfig.videoSection?.description?.[language]}</p>
                  <HeadingUnderline />
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                    {homepageConfig.videoSection?.videos.map((video, index) => {
                      const videoId = getYoutubeVideoId(video.videoUrl);
                      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Invalid+URL';
                      
                      return (
                          <motion.a 
                            key={index} 
                            href={video.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            whileHover={{ y: -5 }}
                            className="relative rounded-lg overflow-hidden group shadow-lg block max-w-[500px] flex-1 min-w-[280px]"
                          >
                              <Image src={thumbnailUrl} alt={video.title} width={600} height={400} className="w-full transition-transform duration-500 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors cursor-pointer"/>
                              </div>
                          </motion.a>
                      );
                    })}
                </div>
                <Button asChild variant="default" size="lg" className="mt-8 font-bold bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all">
                  <Link href="/courses">{homepageConfig.videoSection?.buttonText?.[language]}</Link>
                </Button>
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.sscHscSection?.display && (
          <SectionWrapper aria-labelledby="ssc-hsc-heading" className="px-4 md:px-8">
              <div className="container mx-auto text-center">
                  <Badge variant="default" className="mb-2 text-md py-1 px-4 rounded-full bg-primary text-primary-foreground">{homepageConfig.sscHscSection?.badge?.[language]}</Badge>
                  <div className="mb-4">
                    <h2 id="ssc-hsc-heading" className="font-headline text-2xl font-bold">{homepageConfig.sscHscSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                      {sscHscCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.masterclassSection?.display && (
          <SectionWrapper aria-labelledby="masterclass-heading" className="px-4 md:px-8">
              <div className="container mx-auto text-center">
                  <div className="mb-4">
                    <h2 id="masterclass-heading" className="font-headline text-2xl font-bold">{homepageConfig.masterclassSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <DynamicMasterclassCarousel courses={masterClasses} providers={organizations} />
                  <Button asChild variant="default" size="lg" className="mt-8 font-bold bg-accent text-accent-foreground shadow-lg">
                    <Link href="/courses?category=মাস্টার কোর্স">{homepageConfig.masterclassSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.admissionSection?.display && (
          <SectionWrapper aria-labelledby="admission-heading" className="px-4 md:px-8">
              <div className="container mx-auto text-center">
                  <Badge variant="default" className="mb-2 text-md py-1 px-4 rounded-full bg-primary text-primary-foreground">{homepageConfig.admissionSection?.badge?.[language]}</Badge>
                  <div className="mb-4">
                    <h2 id="admission-heading" className="font-headline text-2xl font-bold">{homepageConfig.admissionSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                      {admissionCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
                  <Button asChild variant="default" size="lg" className="mt-8 font-bold bg-accent text-accent-foreground shadow-lg">
                    <Link href="/courses?category=Admission">{homepageConfig.admissionSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}
        
        {homepageConfig.jobPrepSection?.display && (
          <SectionWrapper aria-labelledby="job-prep-heading" className="px-4 md:px-8">
              <div className="container mx-auto text-center">
                  <Badge variant="default" className="mb-2 text-md py-1 px-4 rounded-full bg-primary text-primary-foreground">{homepageConfig.jobPrepSection?.badge?.[language]}</Badge>
                  <div className="mb-4">
                    <h2 id="job-prep-heading" className="font-headline text-2xl font-bold">{homepageConfig.jobPrepSection?.title?.[language]}</h2>
                    <HeadingUnderline />
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                      {jobCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
                  <Button asChild variant="default" size="lg" className="mt-8 font-bold bg-accent text-accent-foreground shadow-lg">
                    <Link href="/courses?category=Job+Prep">{homepageConfig.jobPrepSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
          </SectionWrapper>
        )}

        {homepageConfig.freeClassesSection?.display && (
          <SectionWrapper aria-labelledby="free-classes-heading" className="px-4 md:px-8">
            <FreeClassesSection sectionData={homepageConfig.freeClassesSection} />
          </SectionWrapper>
        )}

        <WhyTrustUs data={homepageConfig.whyChooseUs} />
        
        {homepageConfig.collaborations?.display && approvedCollaborators.length > 0 && (
          <SectionWrapper aria-labelledby="collaborations-heading" className="px-4 md:px-8">
            <div className="container mx-auto text-center">
              <div className="mb-6">
                <h2 id="collaborations-heading" className="font-headline text-2xl font-bold">
                  {homepageConfig.collaborations?.title?.[language]}
                </h2>
                <HeadingUnderline />
              </div>
              <DynamicCollaborationsCarousel organizations={approvedCollaborators} />
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.partnersSection?.display && (
          <SectionWrapper aria-labelledby="partners-heading" className="px-4 md:px-8">
            <div className="container mx-auto text-center">
              <div className="mb-4">
                <h2 id="partners-heading" className="font-headline text-2xl font-bold">
                  {homepageConfig.partnersSection?.title?.[language]}
                </h2>
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
          <SectionWrapper aria-labelledby="social-media-heading" className="px-4 md:px-8">
            <div className="container mx-auto text-center">
              <div className="mb-6">
                <h2 id="social-media-heading" className="font-headline text-2xl font-bold">
                  {homepageConfig.socialMediaSection?.title?.[language]}
                </h2>
                <p className="text-muted-foreground mb-2 max-w-2xl mx-auto">
                  {homepageConfig.socialMediaSection?.description?.[language]}
                </p>
                <HeadingUnderline />
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {homepageConfig.socialMediaSection?.channels.map((channel) => (
                  <motion.div 
                    key={channel.id}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="flex-1 min-w-[280px] max-w-[320px]"
                  >
                    <Card className="text-center p-6 flex flex-col h-full items-center justify-between glassmorphism-card shadow-lg">
                      <CardHeader className="p-0">
                        <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", channel.platform === 'YouTube' ? 'bg-red-600' : 'bg-blue-600')}>
                            <SocialIcon platform={channel.platform} />
                          </div>
                          <CardTitle className="text-lg">{typeof channel.name === 'object' ? channel.name[language] : channel.name}</CardTitle>
                        </div>
                        <CardDescription>{channel.handle}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4 pt-4">
                        <div className="flex justify-center gap-4 text-sm text-muted-foreground flex-wrap">
                          {channel.stat1_value && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{channel.stat1_value} {typeof channel.stat1_label === 'object' ? channel.stat1_label[language] : channel.stat1_label}</span>
                            </div>
                          )}
                          {channel.stat2_value && (
                            <div className="flex items-center gap-1">
                              {channel.platform === 'YouTube' ? <Video className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
                              <span>{channel.stat2_value} {typeof channel.stat2_label === 'object' ? channel.stat2_label[language] : channel.stat2_label}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{typeof channel.description === 'object' ? channel.description[language] : channel.description}</p>
                      </CardContent>
                      <CardFooter className="p-0 w-full mt-4">
                        <Button asChild className="w-full shadow-md active:shadow-inner" style={{ backgroundColor: channel.platform === 'YouTube' ? '#FF0000' : '#1877F2', color: 'white' }}>
                          <Link href={channel.ctaUrl} target="_blank" rel="noopener noreferrer">
                            <span className="ml-2">{typeof channel.ctaText === 'object' ? channel.ctaText[language] : channel.ctaText}</span>
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        )}
        
        {homepageConfig.statsSection?.display && (
          <SectionWrapper aria-labelledby="stats-heading" className="px-4 md:px-8">
            <div className="container mx-auto text-center">
                <div className="mb-6">
                  <h2 id="stats-heading" className="font-headline text-2xl font-bold">{homepageConfig.statsSection?.title?.[language]}</h2>
                  <HeadingUnderline />
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                    {homepageConfig.statsSection?.stats.map((stat, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="text-center glassmorphism-card p-6 flex-1 min-w-[250px] max-w-[350px] shadow-lg"
                        >
                            <p className="font-headline text-4xl font-bold text-primary">{stat.value}</p>
                            <p className="mt-2 text-md text-muted-foreground">{stat.label?.[language]}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
          </SectionWrapper>
        )}

        {homepageConfig.notesBanner?.display && (
          <SectionWrapper aria-labelledby="notes-banner-heading" className="px-4 md:px-8">
            <div className="container mx-auto">
              <div className="glassmorphism-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                    <div className='text-center md:text-left'>
                        <h3 id="notes-banner-heading" className="font-headline text-xl font-bold">{homepageConfig.notesBanner?.title?.[language]}</h3>
                        <p className="text-muted-foreground mt-1">{homepageConfig.notesBanner?.description?.[language]}</p>
                    </div>
                    <Button variant="default" size="lg" className="font-bold shrink-0 bg-accent text-accent-foreground flex-1 sm:flex-none shadow-lg">
                      {homepageConfig.notesBanner?.buttonText?.[language]}
                    </Button>
                </div>
            </div>
          </SectionWrapper>
        )}
        
        <SectionWrapper className="px-4 md:px-8">
            <div className="container mx-auto">
                <RequestCallbackForm homepageConfig={homepageConfig} />
            </div>
        </SectionWrapper>
        
        {homepageConfig.appPromo?.display && (
          <SectionWrapper aria-labelledby="app-promo-heading" className="px-4 md:px-8">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="text-center md:text-left">
                    <motion.h2 
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="font-headline text-3xl font-bold text-primary"
                    >
                      {homepageConfig.appPromo?.title?.[language]}
                    </motion.h2>
                    <p className="mt-4 text-lg text-muted-foreground">{homepageConfig.appPromo?.description?.[language]}</p>
                    <div className="flex justify-center md:justify-start gap-4 mt-6 flex-wrap">
                        <Link href={homepageConfig.appPromo?.googlePlayUrl || '#'}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Image src={homepageConfig.appPromo.googlePlayImageUrl || 'https://placehold.co/180x60.png'} width={180} height={60} alt="Google Play Store" data-ai-hint="play store button"/>
                            </motion.div>
                        </Link>
                        <Link href={homepageConfig.appPromo?.appStoreUrl || '#'}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Image src={homepageConfig.appPromo.appStoreImageUrl || 'https://placehold.co/180x60.png'} width={180} height={60} alt="Apple App Store" data-ai-hint="app store button"/>
                            </motion.div>
                        </Link>
                    </div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex justify-center"
                  >
                      <Image src={homepageConfig.appPromo.promoImageUrl || "https://i.imgur.com/uR1Y6o6.png"} width={300} height={450} alt="RDC App" className='object-contain' data-ai-hint={homepageConfig.appPromo.promoImageDataAiHint || "mobile app screenshot"} />
                  </motion.div>
              </div>
          </SectionWrapper>
        )}
    </div>
  );
}
