'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  BookOpen,
  PlayCircle,
  Users,
  Trophy,
  Youtube,
  Facebook,
  Video,
  ThumbsUp,
  ArrowRight,
  User,
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
import { t } from '@/lib/i18n';
import { LoadingSpinner } from '@/components/loading-spinner';
import { RequestCallbackForm } from '@/components/request-callback-form';
import logoSrc from '@/public/logo.png';
import WhyTrustUs from '@/components/why-trust-us';
import { DynamicCollaborationsCarousel } from '@/components/dynamic-collaborations-carousel';
import { NoticeBoard } from '@/components/notice-board';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingText } from '@/components/typing-text';


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
    <div className="text-foreground mesh-gradient">
        {homepageConfig.welcomeSection?.display && (
            <section className="py-8 md:py-10 text-center overflow-hidden">
                <div className="container mx-auto px-4">
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center gap-2 md:gap-4"
                     >
                        <motion.div 
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="flex items-center justify-center gap-3 md:gap-4"
                        >
                            <Image 
                                src={logoSrc} 
                                alt="RDC Logo" 
                                width={48} 
                                height={48} 
                                className="h-10 md:h-14 w-auto object-contain drop-shadow-sm" 
                                priority 
                            />
                            <h1 className="font-black text-2xl md:text-4xl tracking-tighter text-foreground uppercase">
                                RED DOT <span className="text-primary">CLASSROOM</span>
                            </h1>
                        </motion.div>
                        <TypingText 
                            text={homepageConfig.welcomeSection?.description?.[language] || homepageConfig.welcomeSection?.description?.['en'] || ''}
                            className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium break-words"
                        />
                     </motion.div>
                </div>
            </section>
        )}

        <section className="py-0">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {homepageConfig.strugglingStudentSection?.display && (
          <section className="py-10 md:py-14 overflow-hidden relative">
              <div className="container mx-auto px-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                    className="group relative glassmorphism-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden rounded-2xl border-white/20 dark:border-white/5 bg-white/40 dark:bg-card/40"
                  >
                      {/* Decorative Background Elements */}
                      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
                      
                      <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left z-10">
                          <motion.div
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            className="relative w-32 h-32 md:w-40 md:h-40 shrink-0"
                          >
                            <Image
                                src={homepageConfig.strugglingStudentSection.imageUrl}
                                alt="Struggling in studies illustration"
                                fill
                                className="object-contain"
                                data-ai-hint="confused student illustration"
                            />
                          </motion.div>
                          <div className="space-y-2 max-w-lg">
                              <h3 className="font-headline text-2xl md:text-3xl font-black tracking-tight text-foreground">
                                  {homepageConfig.strugglingStudentSection?.title?.[language] || homepageConfig.strugglingStudentSection?.title?.['en']}
                              </h3>
                              <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                                  {homepageConfig.strugglingStudentSection?.subtitle?.[language] || homepageConfig.strugglingStudentSection?.subtitle?.['en']}
                              </p>
                          </div>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="z-10 shrink-0 w-full md:w-auto"
                      >
                        <Button asChild size="lg" className="w-full md:w-auto font-black text-lg px-10 h-14 rounded-xl shadow-xl shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
                            <Link href="/strugglers-studies">
                                {homepageConfig.strugglingStudentSection?.buttonText?.[language] || homepageConfig.strugglingStudentSection?.buttonText?.['en']}
                                 <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                            </Link>
                        </Button>
                      </motion.div>
                  </motion.div>
              </div>
          </section>
        )}

        {homepageConfig.categoriesSection?.display && (
          <section aria-labelledby="categories-heading" className="bg-secondary/10 dark:bg-transparent">
            <div className="container mx-auto px-4">
              <h2 id="categories-heading" className="font-headline text-3xl font-bold text-center mb-10">
                {homepageConfig.categoriesSection?.title?.[language] || homepageConfig.categoriesSection?.title?.['en']}
              </h2>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
            </div>
          </section>
        )}

        <div className="container mx-auto px-4">
            <NoticeBoard />
        </div>

        {homepageConfig.journeySection?.display && (
          <section aria-labelledby="hero-heading" className="bg-gradient-to-b from-transparent via-primary/5 to-transparent">
            <div className="container mx-auto px-4">
              <h2 id="hero-heading" className="font-headline text-3xl font-bold text-center mb-4">{homepageConfig.journeySection?.title?.[language] || homepageConfig.journeySection?.title?.['en']}</h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">{homepageConfig.journeySection?.subtitle?.[language] || homepageConfig.journeySection?.subtitle?.['en']}</p>
              <div>
                <h3 className="font-headline text-2xl font-bold text-center mb-6">{homepageConfig.journeySection?.courseTitle?.[language] || homepageConfig.journeySection?.courseTitle?.['en']}</h3>
                <DynamicLiveCoursesCarousel courses={liveCourses} providers={organizations} />
              </div>
            </div>
          </section>
        )}

        {homepageConfig.teachersSection?.display && (
          <section aria-labelledby="teachers-heading">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                  <div>
                      <h2 id="teachers-heading" className="font-headline text-3xl font-bold">{homepageConfig.teachersSection?.title?.[language] || homepageConfig.teachersSection?.title?.['en']}</h2>
                      <p className="text-muted-foreground mt-1">{homepageConfig.teachersSection?.subtitle?.[language] || homepageConfig.teachersSection?.subtitle?.['en']}</p>
                  </div>
                  <Button asChild variant="outline" className="rounded-xl">
                      <Link href="/teachers">{homepageConfig.teachersSection?.buttonText?.[language] || homepageConfig.teachersSection?.buttonText?.['en']}</Link>
                  </Button>
              </div>
              <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection?.scrollSpeed} />
            </div>
          </section>
        )}

        {homepageConfig.videoSection?.display && (
          <section aria-labelledby="video-section-heading" className="bg-secondary/30 dark:bg-card/20">
            <div className="container mx-auto px-4 text-center">
                <h2 id="video-section-heading" className="font-headline text-3xl font-bold mb-2">{homepageConfig.videoSection?.title?.[language] || homepageConfig.videoSection?.title?.['en']}</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{homepageConfig.videoSection?.description?.[language] || homepageConfig.videoSection?.description?.['en']}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {homepageConfig.videoSection?.videos.map((video, index) => {
                      const videoId = getYoutubeVideoId(video.videoUrl);
                      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Invalid+URL';
                      
                      return (
                          <a key={index} href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="relative rounded-xl overflow-hidden group shadow-lg block">
                              <Image src={thumbnailUrl} alt={video.title} width={600} height={400} className="w-full transition-transform duration-300 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors cursor-pointer"/>
                              </div>
                          </a>
                      );
                    })}
                </div>
                <Button asChild variant="default" size="lg" className="mt-12 font-bold bg-accent text-accent-foreground rounded-xl shadow-lg shadow-accent/20">
                  <Link href="/courses">{homepageConfig.videoSection?.buttonText?.[language] || homepageConfig.videoSection?.buttonText?.['en']}</Link>
                </Button>
            </div>
          </section>
        )}

        {homepageConfig.sscHscSection?.display && (
          <section aria-labelledby="ssc-hsc-heading">
              <div className="container mx-auto px-4 text-center">
                  <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">{homepageConfig.sscHscSection?.badge?.[language] || homepageConfig.sscHscSection?.badge?.['en']}</Badge>
                  <h2 id="ssc-hsc-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.sscHscSection?.title?.[language] || homepageConfig.sscHscSection?.title?.['en']}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {sscHscCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
              </div>
          </section>
        )}

        {homepageConfig.masterclassSection?.display && (
          <section aria-labelledby="masterclass-heading" className="bg-secondary/10 dark:bg-transparent">
              <div className="container mx-auto px-4 text-center">
                  <h2 id="masterclass-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.masterclassSection?.title?.[language] || homepageConfig.masterclassSection?.title?.['en']}</h2>
                  <DynamicMasterclassCarousel courses={masterClasses} providers={organizations} />
                  <Button asChild variant="default" size="lg" className="mt-12 font-bold bg-accent text-accent-foreground rounded-xl shadow-lg">
                    <Link href="/courses?category=মাস্টার কোর্স">{homepageConfig.masterclassSection?.buttonText?.[language] || homepageConfig.masterclassSection?.buttonText?.['en']}</Link>
                  </Button>
              </div>
          </section>
        )}

        {homepageConfig.admissionSection?.display && (
          <section aria-labelledby="admission-heading">
              <div className="container mx-auto px-4 text-center">
                  <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">{homepageConfig.admissionSection?.badge?.[language] || homepageConfig.admissionSection?.badge?.['en']}</Badge>
                  <h2 id="admission-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.admissionSection?.title?.[language] || homepageConfig.admissionSection?.title?.['en']}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {admissionCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
                  <Button asChild variant="default" size="lg" className="mt-12 font-bold bg-accent text-accent-foreground rounded-xl shadow-lg">
                    <Link href="/courses?category=Admission">{homepageConfig.admissionSection?.buttonText?.[language] || homepageConfig.admissionSection?.buttonText?.['en']}</Link>
                  </Button>
              </div>
          </section>
        )}
        
        {homepageConfig.jobPrepSection?.display && (
          <section aria-labelledby="job-prep-heading" className="bg-secondary/10 dark:bg-transparent">
              <div className="container mx-auto px-4 text-center">
                  <Badge variant="default" className="mb-4 text-lg py-1 px-4 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">{homepageConfig.jobPrepSection?.badge?.[language] || homepageConfig.jobPrepSection?.badge?.['en']}</Badge>
                  <h2 id="job-prep-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.jobPrepSection?.title?.[language] || homepageConfig.jobPrepSection?.title?.['en']}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {jobCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                  </div>
                  <Button asChild variant="default" size="lg" className="mt-12 font-bold bg-accent text-accent-foreground rounded-xl shadow-lg">
                    <Link href="/courses?category=Job+Prep">{homepageConfig.jobPrepSection?.buttonText?.[language] || homepageConfig.jobPrepSection?.buttonText?.['en']}</Link>
                  </Button>
              </div>
          </section>
        )}

        {homepageConfig.freeClassesSection?.display && (
          <section aria-labelledby="free-classes-heading">
            <FreeClassesSection sectionData={homepageConfig.freeClassesSection} />
          </section>
        )}

        <WhyTrustUs data={homepageConfig.whyChooseUs} />
        
        {homepageConfig.collaborations?.display && approvedCollaborators.length > 0 && (
          <section aria-labelledby="collaborations-heading" className="bg-secondary/10 dark:bg-transparent">
            <div className="container mx-auto px-4">
              <h2 id="collaborations-heading" className="font-headline text-3xl font-bold text-center mb-12">
                {homepageConfig.collaborations?.title?.[language] || homepageConfig.collaborations?.title?.['en']}
              </h2>
              <DynamicCollaborationsCarousel organizations={approvedCollaborators} />
            </div>
          </section>
        )}

        {homepageConfig.partnersSection?.display && (
          <section aria-labelledby="partners-heading">
            <div className="container mx-auto px-4">
              <h2 id="partners-heading" className="font-headline text-3xl font-bold text-center mb-12">
                {homepageConfig.partnersSection?.title?.[language] || homepageConfig.partnersSection?.title?.['en']}
              </h2>
              <PartnersLogoScroll 
                partners={homepageConfig.partnersSection.partners}
                scrollSpeed={homepageConfig.partnersSection.scrollSpeed}
              />
            </div>
          </section>
        )}


        {homepageConfig.socialMediaSection?.display && (
          <section aria-labelledby="social-media-heading" className="bg-gradient-to-b from-transparent via-accent/5 to-transparent">
            <div className="container mx-auto px-4 text-center">
              <h2 id="social-media-heading" className="font-headline text-3xl font-bold mb-2">
                {homepageConfig.socialMediaSection?.title?.[language] || homepageConfig.socialMediaSection?.title?.['en']}
              </h2>
              <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
                {homepageConfig.socialMediaSection?.description?.[language] || homepageConfig.socialMediaSection?.description?.['en']}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {homepageConfig.socialMediaSection?.channels.map((channel) => (
                  <Card key={channel.id} className="text-center p-6 flex flex-col items-center justify-between glassmorphism-card bg-white/60 dark:bg-card/40 border-white/20">
                    <CardHeader className="p-0">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-lg", channel.platform === 'YouTube' ? 'bg-red-600' : 'bg-blue-600')}>
                          <SocialIcon platform={channel.platform} />
                        </div>
                        <CardTitle className="text-lg">{typeof channel.name === 'object' ? (channel.name[language] || channel.name['en']) : channel.name}</CardTitle>
                      </div>
                      <CardDescription>{channel.handle}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4 pt-4">
                      <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                        {channel.stat1_value && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{channel.stat1_value} {typeof channel.stat1_label === 'object' ? (channel.stat1_label[language] || channel.stat1_label['en']) : channel.stat1_label}</span>
                          </div>
                        )}
                        {channel.stat2_value && (
                          <div className="flex items-center gap-1">
                            {channel.platform === 'YouTube' ? <Video className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
                            <span>{channel.stat2_value} {typeof channel.stat2_label === 'object' ? (channel.stat2_label[language] || channel.stat2_label['en']) : channel.stat2_label}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{typeof channel.description === 'object' ? (channel.description[language] || channel.description['en']) : channel.description}</p>
                    </CardContent>
                    <CardFooter className="p-0 w-full">
                      <Button asChild className="w-full rounded-xl font-bold shadow-lg" style={{ backgroundColor: channel.platform === 'YouTube' ? '#FF0000' : '#1877F2', color: 'white' }}>
                        <Link href={channel.ctaUrl} target="_blank" rel="noopener noreferrer">
                          <span className="ml-2">{typeof channel.ctaText === 'object' ? (channel.ctaText[language] || channel.ctaText['en']) : channel.ctaText}</span>
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {homepageConfig.statsSection?.display && (
          <section aria-labelledby="stats-heading">
            <div className="container mx-auto px-4 text-center">
                <h2 id="stats-heading" className="font-headline text-3xl font-bold mb-8">{homepageConfig.statsSection?.title?.[language] || homepageConfig.statsSection?.title?.['en']}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {homepageConfig.statsSection?.stats.map((stat, index) => (
                        <div key={index} className="text-center glassmorphism-card p-8 bg-white/40 dark:bg-card/40 border-white/20">
                            <p className="font-headline text-5xl font-black text-primary drop-shadow-sm">{stat.value}</p>
                            <p className="mt-2 text-lg text-muted-foreground font-bold tracking-tight uppercase">{stat.label?.[language] || stat.label?.['en']}</p>
                        </div>
                    ))}
                </div>
            </div>
          </section>
        )}

        {homepageConfig.notesBanner?.display && (
          <section aria-labelledby="notes-banner-heading">
            <div className="container mx-auto px-4">
              <div className="glassmorphism-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary/10 to-accent/10 border-white/30">
                    <div className='text-center md:text-left'>
                        <h3 id="notes-banner-heading" className="font-headline text-2xl font-bold">{homepageConfig.notesBanner?.title?.[language] || homepageConfig.notesBanner?.title?.['en']}</h3>
                        <p className="text-muted-foreground mt-2">{homepageConfig.notesBanner?.description?.[language] || homepageConfig.notesBanner?.description?.['en']}</p>
                    </div>
                    <Button variant="default" size="lg" className="font-black shrink-0 bg-accent text-accent-foreground rounded-xl shadow-xl shadow-accent/20 px-10">{homepageConfig.notesBanner?.buttonText?.[language] || homepageConfig.notesBanner?.buttonText?.['en']}</Button>
                </div>
            </div>
          </section>
        )}
        
        <section className="relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <RequestCallbackForm homepageConfig={homepageConfig} />
            </div>
        </section>
        
        {homepageConfig.appPromo?.display && (
          <section aria-labelledby="app-promo-heading" className="bg-secondary/20 dark:bg-transparent">
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="text-center md:text-left">
                    <h2 id="app-promo-heading" className="font-headline text-4xl font-bold text-primary">{homepageConfig.appPromo?.title?.[language] || homepageConfig.appPromo?.title?.['en']}</h2>
                    <p className="mt-4 text-lg text-muted-foreground">{homepageConfig.appPromo?.description?.[language] || homepageConfig.appPromo?.description?.['en']}</p>
                    <div className="flex justify-center md:justify-start gap-4 mt-8">
                        <Link href={homepageConfig.appPromo?.googlePlayUrl || '#'}>
                            <Image src={homepageConfig.appPromo.googlePlayImageUrl || 'https://placehold.co/180x60.png'} width={180} height={60} alt="Google Play Store" data-ai-hint="play store button" className="shadow-lg hover:scale-105 transition-transform rounded-xl"/>
                        </Link>
                        <Link href={homepageConfig.appPromo?.appStoreUrl || '#'}>
                            <Image src={homepageConfig.appPromo.appStoreImageUrl || 'https://placehold.co/180x60.png'} width={180} height={60} alt="Apple App Store" data-ai-hint="app store button" className="shadow-lg hover:scale-105 transition-transform rounded-xl"/>
                        </Link>
                    </div>
                  </div>
                  <div className="flex justify-center relative">
                      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-125 -z-10"></div>
                      <Image src={homepageConfig.appPromo.promoImageUrl || "https://i.imgur.com/uR1Y6o6.png"} width={350} height={500} alt="RDC App" className='object-contain drop-shadow-2xl' data-ai-hint={homepageConfig.appPromo.promoImageDataAiHint || "mobile app screenshot"} />
                  </div>
              </div>
          </section>
        )}
    </div>
  );
}