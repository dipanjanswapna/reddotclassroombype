
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
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
import { getHomepageConfig, getCoursesByIds, getInstructors, getOrganizations, getUsers, getEnrollments, getCourses } from '@/lib/firebase/firestore';
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
import { TypingText } from '@/components/typing-text';
import { StatsSection } from '@/components/stats-section';

const DynamicTeachersCarousel = dynamic(() => import('@/components/dynamic-teachers-carousel').then(mod => mod.DynamicTeachersCarousel), {
    loading: () => <Skeleton className="h-[250px] w-full" />,
    ssr: false,
});

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
  
  // Stats state
  const [liveStats, setLiveStats] = React.useState({
    learners: 0,
    completionRate: 0,
    liveCoursesCount: 0,
    jobPlacements: 0
  });
  
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
            orgsData,
            allUsers,
            allEnrollments,
            allCourses
        ] = await Promise.all([
            getCoursesByIds(config.liveCoursesIds || []),
            getCoursesByIds(config.sscHscCourseIds || []),
            getCoursesByIds(config.masterClassesIds || []),
            getCoursesByIds(config.admissionCoursesIds || []),
            getCoursesByIds(config.jobCoursesIds || []),
            getInstructors(),
            getOrganizations(),
            getUsers(),
            getEnrollments(),
            getCourses({ status: 'Published' })
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

        // Calculate Live Stats
        const learnerCount = allUsers.filter(u => u.role === 'Student').length;
        const totalEnrollments = allEnrollments.length;
        const completedEnrollments = allEnrollments.filter(e => e.status === 'completed').length;
        const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 83;
        
        const liveCoursesCount = allCourses.filter(c => c.type === 'Online').length;
        const jobPlacementCount = allEnrollments.filter(e => {
            const course = allCourses.find(c => c.id === e.courseId);
            return course?.category === 'Job Prep' || course?.category === 'BCS';
        }).length + 9000; // Adding baseline for established brand feel

        setLiveStats({
            learners: learnerCount > 0 ? learnerCount : 150000,
            completionRate,
            liveCoursesCount: liveCoursesCount > 0 ? liveCoursesCount : 28,
            jobPlacements: jobPlacementCount
        });

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
  
  const CourseGrid = ({ courses }: { courses: Course[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-0 md:gap-y-8">
        {courses.map(course => (
            <CourseCard 
                key={course.id} 
                {...course} 
                provider={organizations.find(p => p.id === course.organizationId)} 
            />
        ))}
    </div>
  );

  const dynamicStats = [
    { label: { bn: "জব প্লেসমেন্ট", en: "Job Placement" }, value: liveStats.jobPlacements, suffix: "+", color: "bg-[#dcfce7]" },
    { label: { bn: "শিক্ষার্থী", en: "Learner" }, value: liveStats.learners, suffix: "+", color: "bg-[#dbeafe]" },
    { label: { bn: "কোর্স সমাপ্তির হার", en: "Course Completion Rate" }, value: liveStats.completionRate, suffix: "%", color: "bg-[#ffedd5]" },
    { label: { bn: "লাইভ কোর্স", en: "Live Course" }, value: liveStats.liveCoursesCount, color: "bg-[#fef9c3]" },
  ];

  return (
    <div className="text-foreground mesh-gradient overflow-x-hidden max-w-full">
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
                            <h1 className="font-black text-2xl md:text-4xl tracking-tighter text-foreground uppercase text-shadow">
                                RED DOT <span className="text-primary">CLASSROOM</span>
                            </h1>
                        </motion.div>
                        <div className="w-full max-w-2xl mx-auto">
                            <TypingText 
                                text={homepageConfig.welcomeSection?.description?.[language] || homepageConfig.welcomeSection?.description?.['en'] || ''}
                                className="mt-2 text-[11px] md:text-sm lg:text-base text-muted-foreground leading-relaxed font-medium break-words px-4"
                            />
                        </div>
                     </motion.div>
                </div>
            </section>
        )}

        <section className="py-0 overflow-hidden">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {homepageConfig.strugglingStudentSection?.display && (
          <section className="py-10 md:py-14 overflow-hidden relative">
              <div className="container mx-auto px-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                    className="group relative p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden rounded-2xl border border-border shadow-xl bg-[#e3e3e3]"
                  >
                      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
                      
                      <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left z-10 w-full">
                          <motion.div
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            className="relative w-24 h-24 md:w-40 md:h-40 shrink-0"
                          >
                            <Image
                                src={homepageConfig.strugglingStudentSection.imageUrl}
                                alt="Struggling in studies illustration"
                                fill
                                className="object-contain"
                                data-ai-hint="confused student illustration"
                            />
                          </motion.div>
                          <div className="space-y-2 flex-grow">
                              <h3 className="font-headline text-lg md:text-2xl lg:text-3xl font-black tracking-tight text-gray-900">
                                  {homepageConfig.strugglingStudentSection?.title?.[language] || homepageConfig.strugglingStudentSection?.title?.['en']}
                              </h3>
                              <p className="text-sm md:text-lg lg:text-xl text-gray-600 font-medium leading-relaxed">
                                  {homepageConfig.strugglingStudentSection?.subtitle?.[language] || homepageConfig.strugglingStudentSection?.subtitle?.['en']}
                              </p>
                          </div>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="z-10 shrink-0 w-full md:w-auto"
                      >
                        <Button asChild size="lg" className="w-full md:w-auto font-black text-sm md:text-lg px-8 h-12 md:h-14 rounded-xl shadow-xl shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
                            <Link href="/strugglers-studies">
                                {homepageConfig.strugglingStudentSection?.buttonText?.[language] || homepageConfig.strugglingStudentSection?.buttonText?.['en']}
                                 <ArrowRight className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-2" />
                            </Link>
                        </Button>
                      </motion.div>
                  </motion.div>
              </div>
          </section>
        )}

        {homepageConfig.categoriesSection?.display && (
          <section aria-labelledby="categories-heading" className="bg-secondary/10 dark:bg-transparent overflow-hidden py-10 md:py-14">
            <div className="container mx-auto px-4">
              <h2 id="categories-heading" className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase border-l-4 border-primary pl-4 mb-8 md:mb-10 text-left">
                {homepageConfig.categoriesSection?.title?.[language] || homepageConfig.categoriesSection?.title?.['en']}
              </h2>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 overflow-hidden">
            <NoticeBoard />
        </div>

        {homepageConfig.journeySection?.display && (
          <section aria-labelledby="journey-heading" className="bg-gradient-to-b from-transparent via-primary/5 to-transparent overflow-hidden py-10 md:py-14">
            <div className="container mx-auto px-4">
              <h2 id="journey-heading" className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase border-l-4 border-primary pl-4 mb-3 text-left">{homepageConfig.journeySection?.title?.[language] || homepageConfig.journeySection?.title?.[language]}</h2>
              <p className="text-muted-foreground text-left max-w-2xl mb-8 md:mb-10 pl-4 text-sm md:text-base leading-relaxed">{homepageConfig.journeySection?.subtitle?.[language] || homepageConfig.journeySection?.subtitle?.[language]}</p>
              <div>
                <h3 className="font-headline text-base md:text-lg lg:text-xl font-bold mb-6 pl-4">{homepageConfig.journeySection?.courseTitle?.[language] || homepageConfig.journeySection?.courseTitle?.[language]}</h3>
                <CourseGrid courses={liveCourses} />
              </div>
            </div>
          </section>
        )}

        {homepageConfig.teachersSection?.display && (
          <section aria-labelledby="teachers-heading" className="overflow-hidden py-10 md:py-14">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-4">
                  <div className="text-left">
                      <h2 id="teachers-heading" className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase">{homepageConfig.teachersSection?.title?.[language] || homepageConfig.teachersSection?.title?.[language]}</h2>
                      <p className="text-muted-foreground mt-1 text-[11px] md:text-sm lg:text-base leading-tight">{homepageConfig.teachersSection?.subtitle?.[language] || homepageConfig.teachersSection?.subtitle?.[language]}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl shrink-0 h-8 md:h-10 text-[10px] md:text-xs font-bold uppercase">
                      <Link href="/teachers">{homepageConfig.teachersSection?.buttonText?.[language] || homepageConfig.teachersSection?.buttonText?.[language]}</Link>
                  </Button>
              </div>
              <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection?.scrollSpeed} />
            </div>
          </section>
        )}

        {homepageConfig.videoSection?.display && (
          <section aria-labelledby="video-section-heading" className="bg-secondary/30 dark:bg-card/20 overflow-hidden py-10 md:py-14">
            <div className="container mx-auto px-4 text-center">
                <h2 id="video-section-heading" className="font-headline text-xl md:text-2xl lg:text-3xl font-bold mb-2">{homepageConfig.videoSection?.title?.[language] || homepageConfig.videoSection?.title?.[language]}</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">{homepageConfig.videoSection?.description?.[language] || homepageConfig.videoSection?.description?.[language]}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {homepageConfig.videoSection?.videos.map((video, index) => {
                      const videoId = getYoutubeVideoId(video.videoUrl);
                      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Invalid+URL';
                      
                      return (
                          <a key={index} href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="relative rounded-xl overflow-hidden group shadow-lg block">
                              <Image src={thumbnailUrl} alt={video.title} width={600} height={400} className="w-full transition-transform duration-300 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PlayCircle className="w-12 h-12 md:w-16 md:h-16 text-white/80 group-hover:text-white transition-colors cursor-pointer"/>
                              </div>
                          </a>
                      );
                    })}
                </div>
                <Button asChild variant="default" size="lg" className="mt-10 md:mt-12 font-black text-xs md:text-base uppercase tracking-widest bg-accent text-accent-foreground rounded-xl shadow-lg shadow-accent/20 h-10 md:h-12">
                  <Link href="/courses">{homepageConfig.videoSection?.buttonText?.[language] || homepageConfig.videoSection?.buttonText?.[language]}</Link>
                </Button>
            </div>
          </section>
        )}

        {homepageConfig.sscHscSection?.display && (
          <section aria-labelledby="ssc-hsc-heading" className="overflow-hidden py-10 md:py-14">
              <div className="container mx-auto px-4">
                  <div className="border-l-4 border-primary pl-4 mb-8 text-left">
                    <Badge variant="default" className="mb-2 text-[9px] md:text-[10px] lg:text-xs py-0.5 px-3 rounded-full bg-primary text-primary-foreground uppercase font-black">{homepageConfig.sscHscSection?.badge?.[language] || homepageConfig.sscHscSection?.badge?.[language]}</Badge>
                    <h2 id="ssc-hsc-heading" className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase">{homepageConfig.sscHscSection?.title?.[language] || homepageConfig.sscHscSection?.title?.[language]}</h2>
                  </div>
                  <CourseGrid courses={sscHscCourses} />
              </div>
          </section>
        )}

        {homepageConfig.masterclassSection?.display && (
          <section aria-labelledby="masterclass-heading" className="bg-secondary/10 dark:bg-transparent overflow-hidden py-10 md:py-14">
              <div className="container mx-auto px-4">
                  <div className="border-l-4 border-primary pl-4 mb-8 text-left">
                    <h2 id="masterclass-heading" className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase">{homepageConfig.masterclassSection?.title?.[language] || homepageConfig.masterclassSection?.title?.[language]}</h2>
                  </div>
                  <CourseGrid courses={masterClasses} />
                  <div className="flex justify-center mt-8 md:mt-10">
                    <Button asChild variant="default" size="sm" className="font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-accent text-accent-foreground rounded-xl shadow-lg h-8 md:h-9 px-6">
                        <Link href="/courses?category=মাস্টার কোর্স">{homepageConfig.masterclassSection?.buttonText?.[language] || homepageConfig.masterclassSection?.buttonText?.[language]}</Link>
                    </Button>
                  </div>
              </div>
          </section>
        )}

        {homepageConfig.admissionSection?.display && (
          <section aria-labelledby="admission-heading" className="overflow-hidden py-10 md:py-14">
              <div className="container mx-auto px-4">
                  <div className="border-l-4 border-primary pl-4 mb-8 text-left">
                    <Badge variant="default" className="mb-2 text-[9px] md:text-[10px] lg:text-xs py-0.5 px-3 rounded-full bg-primary text-primary-foreground uppercase font-black">{homepageConfig.admissionSection?.badge?.[language] || homepageConfig.admissionSection?.badge?.[language]}</Badge>
                    <h2 id="admission-heading" className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase">{homepageConfig.admissionSection?.title?.[language] || homepageConfig.admissionSection?.title?.[language]}</h2>
                  </div>
                  <CourseGrid courses={admissionCourses} />
                  <div className="flex justify-center mt-8 md:mt-10">
                    <Button asChild variant="default" size="sm" className="font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-accent text-accent-foreground rounded-xl shadow-lg h-8 md:h-9 px-6">
                        <Link href="/courses?category=Admission">{homepageConfig.admissionSection?.buttonText?.[language] || homepageConfig.admissionSection?.buttonText?.[language]}</Link>
                    </Button>
                  </div>
              </div>
          </section>
        )}
        
        {homepageConfig.jobPrepSection?.display && (
          <section aria-labelledby="job-prep-heading" className="bg-secondary/10 dark:bg-transparent overflow-hidden py-10 md:py-14">
              <div className="container mx-auto px-4">
                  <div className="border-l-4 border-primary pl-4 mb-8 text-left">
                    <Badge variant="default" className="mb-2 text-[9px] md:text-[10px] lg:text-xs py-0.5 px-3 rounded-full bg-primary text-primary-foreground uppercase font-black">{homepageConfig.jobPrepSection?.badge?.[language] || homepageConfig.jobPrepSection?.badge?.[language]}</Badge>
                    <h2 id="job-prep-heading" className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase">{homepageConfig.jobPrepSection?.title?.[language] || homepageConfig.jobPrepSection?.title?.[language]}</h2>
                  </div>
                  <CourseGrid courses={jobCourses} />
                  <div className="flex justify-center mt-8 md:mt-10">
                    <Button asChild variant="default" size="sm" className="font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-accent text-accent-foreground rounded-xl shadow-lg h-8 md:h-9 px-6">
                        <Link href="/courses?category=Job+Prep">{homepageConfig.jobPrepSection?.buttonText?.[language] || homepageConfig.jobPrepSection?.buttonText?.[language]}</Link>
                    </Button>
                  </div>
              </div>
          </section>
        )}

        <WhyTrustUs data={homepageConfig.whyChooseUs} />
        
        {homepageConfig.collaborations?.display && approvedCollaborators.length > 0 && (
          <section aria-labelledby="collaborations-heading" className="bg-secondary/10 dark:bg-transparent overflow-hidden py-10 md:py-14">
            <div className="container mx-auto px-4">
              <h2 id="collaborations-heading" className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase border-l-4 border-primary pl-4 mb-10 md:mb-12 text-left">
                {homepageConfig.collaborations?.title?.[language] || homepageConfig.collaborations?.title?.[language]}
              </h2>
              <DynamicCollaborationsCarousel organizations={approvedCollaborators} />
            </div>
          </section>
        )}

        {homepageConfig.partnersSection?.display && (
          <section aria-labelledby="partners-heading" className="overflow-hidden py-10 md:py-14">
            <div className="container mx-auto px-4">
              <h2 id="partners-heading" className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase border-l-4 border-primary pl-4 mb-10 md:mb-12 text-left">
                {homepageConfig.partnersSection?.title?.[language] || homepageConfig.partnersSection?.title?.[language]}
              </h2>
              <PartnersLogoScroll 
                partners={homepageConfig.partnersSection.partners}
                scrollSpeed={homepageConfig.partnersSection.scrollSpeed}
              />
            </div>
          </section>
        )}


        {homepageConfig.socialMediaSection?.display && (
          <section aria-labelledby="social-media-heading" className="bg-gradient-to-b from-transparent via-accent/5 to-transparent overflow-hidden py-10 md:py-14">
            <div className="container mx-auto px-4 text-center">
              <h2 id="social-media-heading" className="font-headline text-xl md:text-2xl lg:text-3xl font-bold mb-2">
                {homepageConfig.socialMediaSection?.title?.[language] || homepageConfig.socialMediaSection?.title?.[language]}
              </h2>
              <p className="text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                {homepageConfig.socialMediaSection?.description?.[language] || homepageConfig.socialMediaSection?.description?.[language]}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {homepageConfig.socialMediaSection?.channels.map((channel) => (
                  <Card key={channel.id} className="text-center p-6 flex flex-col items-center justify-between glassmorphism-card bg-white/60 dark:bg-card/40 border-white/20">
                    <CardHeader className="p-0">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-lg", channel.platform === 'YouTube' ? 'bg-red-600' : 'bg-blue-600')}>
                          <SocialIcon platform={channel.platform} />
                        </div>
                        <CardTitle className="text-base md:text-lg">{typeof channel.name === 'object' ? (channel.name[language] || channel.name['en']) : channel.name}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">{channel.handle}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4 pt-4">
                      <div className="flex justify-center gap-4 text-[11px] md:text-sm text-muted-foreground font-bold">
                        {channel.stat1_value && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{channel.stat1_value} {typeof channel.stat1_label === 'object' ? (channel.stat1_label[language] || channel.stat1_label['en']) : channel.stat1_label}</span>
                          </div>
                        )}
                        {channel.stat2_value && (
                          <div className="flex items-center gap-1">
                            {channel.platform === 'YouTube' ? <Video className="w-3.5 h-3.5" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                            <span>{channel.stat2_value} {typeof channel.stat2_label === 'object' ? (channel.stat2_label[language] || channel.stat2_label['en']) : channel.stat2_label}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed">{typeof channel.description === 'object' ? (channel.description[language] || channel.description['en']) : channel.description}</p>
                    </CardContent>
                    <CardFooter className="p-0 w-full pt-2">
                      <Button asChild className="w-full rounded-xl font-black text-[10px] md:text-xs uppercase tracking-tighter shadow-lg h-9 md:h-10" style={{ backgroundColor: channel.platform === 'YouTube' ? '#FF0000' : '#1877F2', color: 'white' }}>
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
          <StatsSection stats={dynamicStats} title={homepageConfig.statsSection.title} />
        )}

        {homepageConfig.notesBanner?.display && (
          <section aria-labelledby="notes-banner-heading" className="overflow-hidden py-10 md:py-14">
            <div className="container mx-auto px-4">
              <div className="glassmorphism-card p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary/10 to-accent/10 border-white/30 rounded-2xl">
                    <div className='text-center md:text-left space-y-2'>
                        <h3 id="notes-banner-heading" className="font-headline text-xl md:text-2xl lg:text-3xl font-bold">{homepageConfig.notesBanner?.title?.[language] || homepageConfig.notesBanner?.title?.[language]}</h3>
                        <p className="text-sm md:text-base text-muted-foreground font-medium">{homepageConfig.notesBanner?.description?.[language] || homepageConfig.notesBanner?.description?.[language]}</p>
                    </div>
                    <Button variant="default" size="lg" className="font-black shrink-0 bg-accent text-accent-foreground rounded-xl shadow-xl shadow-accent/20 px-8 md:px-10 h-12 md:h-14 text-sm md:text-base uppercase tracking-widest">
                        {homepageConfig.notesBanner?.buttonText?.[language] || homepageConfig.notesBanner?.buttonText?.[language]}
                    </Button>
                </div>
            </div>
          </section>
        )}
        
        <section className="relative overflow-hidden py-10 md:py-14">
            <div className="container mx-auto px-4 relative z-10">
                <RequestCallbackForm homepageConfig={homepageConfig} />
            </div>
        </section>
        
        {homepageConfig.appPromo?.display && (
          <section aria-labelledby="app-promo-heading" className="bg-secondary/20 dark:bg-transparent overflow-hidden py-10 md:py-14">
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="text-center md:text-left space-y-4 md:space-y-6">
                    <h2 id="app-promo-heading" className="font-headline text-xl md:text-2xl lg:text-4xl font-bold text-primary leading-tight">
                        {homepageConfig.appPromo?.title?.[language] || homepageConfig.appPromo?.title?.[language]}
                    </h2>
                    <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto md:mx-0">
                        {homepageConfig.appPromo?.description?.[language] || homepageConfig.appPromo?.description?.[language]}
                    </p>
                    <div className="flex justify-center md:justify-start gap-3 md:gap-4 pt-4">
                        <Link href={homepageConfig.appPromo?.googlePlayUrl || '#'}>
                            <Image src={homepageConfig.appPromo.googlePlayImageUrl || 'https://placehold.co/180x60.png'} width={180} height={60} alt="Google Play Store" data-ai-hint="play store button" className="shadow-lg hover:scale-105 transition-transform rounded-xl w-[130px] md:w-[160px] lg:w-[180px] h-auto"/>
                        </Link>
                        <Link href={homepageConfig.appPromo?.appStoreUrl || '#'}>
                            <Image src={homepageConfig.appPromo.appStoreImageUrl || 'https://placehold.co/180x60.png'} width={180} height={60} alt="Apple App Store" data-ai-hint="app store button" className="shadow-lg hover:scale-105 transition-transform rounded-xl w-[130px] md:w-[160px] lg:w-[180px] h-auto"/>
                        </Link>
                    </div>
                  </div>
                  <div className="flex justify-center relative">
                      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-125 -z-10"></div>
                      <Image src={homepageConfig.appPromo.promoImageUrl || "https://i.imgur.com/uR1Y6o6.png"} width={350} height={500} alt="RDC App" className='object-contain drop-shadow-2xl max-w-[240px] md:max-w-[300px] lg:max-w-full' data-ai-hint={homepageConfig.appPromo.promoImageDataAiHint || "mobile app screenshot"} />
                  </div>
              </div>
          </section>
        )}
    </div>
  );
}

const SocialIcon = ({ platform, className }: { platform: string, className?: string }) => {
  switch (platform) {
    case 'YouTube':
      return <Video className={cn("w-5 h-5 md:w-6 md:h-6 text-white", className)} />;
    case 'Facebook Page':
    case 'Facebook Group':
      return <ThumbsUp className={cn("w-5 h-5 md:w-6 md:h-6 text-white", className)} />;
    default:
      return null;
  }
};
