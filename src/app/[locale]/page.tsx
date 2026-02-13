'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Sparkles,
  ArrowRight,
  Phone,
  MessageSquare,
  AlertCircle,
  Megaphone,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/course-card';
import { HeroCarousel } from '@/components/hero-carousel';
import { getHomepageConfig, getCoursesByIds, getInstructors, getOrganizations, getUsers, getEnrollments, getCourses } from '@/lib/firebase/firestore';
import type { HomepageConfig, Course, Instructor, Organization } from '@/lib/types';
import { CategoriesCarousel } from '@/components/categories-carousel';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';
import WhyTrustUs from '@/components/why-trust-us';
import { TypingText } from '@/components/typing-text';
import { StatsSection } from '@/components/stats-section';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/loading-spinner';
import { NoticeBoard } from '@/components/notice-board';
import { Card, CardContent } from '@/components/ui/card';
import { RequestCallbackForm } from '@/components/request-callback-form';

const DynamicTeachersCarousel = dynamic(() => import('@/components/dynamic-teachers-carousel').then(mod => mod.DynamicTeachersCarousel), {
    loading: () => <Skeleton className="h-[250px] w-full rounded-[20px]" />,
    ssr: false,
});

/**
 * @fileOverview Localized Home Page
 * Standardized reduced spacing (py-8 md:py-12).
 * Hind Siliguri font enforced.
 */
export default function Home() {
  const { language, getLocalizedPath } = useLanguage();
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig | null>(null);
  const [liveCourses, setLiveCourses] = useState<Course[]>([]);
  const [featuredInstructors, setFeaturedInstructors] = useState<Instructor[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const isBn = language === 'bn';
  
  const [liveStats, setLiveStats] = useState({
    learners: 150000,
    completionRate: 83,
    liveCoursesCount: 28,
    jobPlacements: 9000
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const config = await getHomepageConfig();
        setHomepageConfig(config);

        const [
            live,
            instructorsData,
            orgsData,
            allUsers,
            allEnrollments,
            allCourses
        ] = await Promise.all([
            getCoursesByIds(config.liveCoursesIds || []),
            getInstructors(),
            getOrganizations(),
            getUsers(),
            getEnrollments(),
            getCourses({ status: 'Published' })
        ]);
        
        setLiveCourses(live);
        setOrganizations(orgsData);

        const featuredIds = config.teachersSection?.instructorIds || [];
        setFeaturedInstructors(instructorsData.filter(inst => 
            inst.status === 'Approved' && featuredIds.includes(inst.id!)
        ));

        setLiveStats({
            learners: allUsers.filter(u => u.role === 'Student').length || 150000,
            completionRate: 83,
            liveCoursesCount: allCourses.filter(c => c.type === 'Online').length || 28,
            jobPlacements: 9000
        });

      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [language]); 

  if (loading) return (
    <div className="px-1 py-20 flex flex-col items-center justify-center gap-4 min-h-screen bg-background">
        <LoadingSpinner className="w-12 h-12" />
        <p className={cn("text-sm font-black uppercase tracking-widest animate-pulse", isBn && "font-bengali")}>
            {isBn ? 'ক্লাসরুম তৈরি হচ্ছে...' : 'Initializing RDC...'}
        </p>
    </div>
  );
  
  if (!homepageConfig) return null;
  
  const getT = (key: string) => t[key]?.[language] || t[key]?.['en'] || key;

  return (
    <div className={cn("text-foreground mesh-gradient overflow-x-hidden max-w-full px-1 pb-20", isBn && "font-bengali")}>
        
        {/* Welcome Section */}
        <section className="pt-8 pb-4 md:pt-12 md:pb-6">
            <div className="container mx-auto text-left space-y-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }} 
                    className="flex flex-col gap-4"
                >
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm w-fit">
                        <Sparkles className="w-3.5 h-3.5" />
                        {isBn ? 'সেরা লার্নিং প্ল্যাটফর্ম' : 'Elite Learning Platform'}
                    </div>
                    <h1 className={cn(
                        "font-black tracking-tighter text-foreground uppercase leading-[0.95]",
                        isBn ? "text-4xl md:text-6xl" : "text-4xl md:text-7xl font-headline"
                    )}>
                        {homepageConfig.welcomeSection?.title?.[language] || "RED DOT CLASSROOM"}
                    </h1>
                    <div className="w-full max-w-3xl">
                        <TypingText 
                            text={homepageConfig.welcomeSection?.description?.[language] || ''} 
                            className="text-sm md:text-xl text-muted-foreground leading-relaxed font-medium" 
                        />
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Dynamic Banners */}
        <section className="py-0 overflow-hidden px-1 mb-6 md:mb-8">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {/* Struggling in Studies Banner */}
        {homepageConfig.strugglingStudentSection?.display && (
            <section className="px-1 py-8 md:py-12">
                <div className="container mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-[30px] overflow-hidden bg-gradient-to-br from-[#8B1538] to-[#1a1a2e] p-8 md:p-16 shadow-2xl group"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110" />
                        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                            <div className="space-y-6 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {getT('struggling_title')}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                                    {getT('struggling_subtitle')}
                                </h2>
                                <Button asChild size="lg" className="bg-white text-primary hover:bg-yellow-400 hover:text-black font-black uppercase tracking-widest h-14 px-10 rounded-2xl shadow-2xl transition-all active:scale-95 border-none">
                                    <Link href={getLocalizedPath("/strugglers-studies")} className="flex items-center gap-2">
                                        {getT('see_how_we_help')}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="relative h-64 md:h-80 flex justify-center items-center">
                                <Image 
                                    src="https://cdni.iconscout.com/illustration/premium/thumb/man-confused-about-mobile-happenings-illustration-download-in-svg-png-gif-file-formats--error-warning-alert-exclamation-state-pack-people-illustrations-1784671.png?f=webp"
                                    alt="Help Illustration"
                                    width={400}
                                    height={400}
                                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105 duration-700"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        )}

        {/* Notice Board */}
        <section className="px-1 py-4 md:py-6">
            <div className="container mx-auto max-w-4xl">
                <NoticeBoard />
            </div>
        </section>

        {/* Categories Section */}
        {homepageConfig.categoriesSection?.display && (
          <section className="overflow-hidden py-8 md:py-12 px-1">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-4">
                  <h2 className={cn(
                      "font-black tracking-tight uppercase",
                      isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline"
                  )}>
                    {getT('categories_heading')}
                  </h2>
                  <Button asChild variant="link" className={cn("font-black uppercase text-[10px] tracking-widest text-primary p-0")}>
                      <Link href={getLocalizedPath("/courses")}>{getT('view_all')} &rarr;</Link>
                  </Button>
              </div>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
            </div>
          </section>
        )}

        {/* Live Courses */}
        {homepageConfig.journeySection?.display && (
          <section className="bg-gradient-to-b from-transparent via-primary/5 to-transparent overflow-hidden py-8 md:py-12 px-1">
            <div className="container mx-auto px-0">
              <div className="border-l-4 border-primary pl-4 mb-8 text-left">
                <h2 className={cn(
                    "font-black tracking-tight uppercase text-left",
                    isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline"
                )}>
                    {getT('live_courses_heading')}
                </h2>
                <p className={cn("text-muted-foreground mt-1 text-sm md:text-lg font-medium text-left")}>
                    {homepageConfig.journeySection?.subtitle?.[language] || ''}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {liveCourses.map(course => (
                    <CourseCard 
                        key={course.id} 
                        {...course} 
                        provider={organizations.find(p => p.id === course.organizationId)} 
                    />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Faculty Section */}
        {homepageConfig.teachersSection?.display && (
          <section className="overflow-hidden py-8 md:py-12 px-1 bg-muted/20">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-8 border-l-4 border-accent pl-4 text-left">
                  <div className="text-left">
                      <h2 className={cn(
                          "font-black tracking-tight uppercase text-left",
                          isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline"
                      )}>{getT('our_mentors')}</h2>
                      <p className={cn("text-muted-foreground mt-1 text-sm md:text-base leading-tight font-medium text-left")}>{homepageConfig.teachersSection?.subtitle?.[language] || ''}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className={cn("rounded-xl border-accent/20 text-accent font-black h-11 uppercase text-[10px] px-6")}>
                      <Link href={getLocalizedPath("/teachers")}>{isBn ? 'সকল শিক্ষক' : 'All Teachers'}</Link>
                  </Button>
              </div>
              <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection?.scrollSpeed} />
            </div>
          </section>
        )}

        {/* Trust Section */}
        <section className="px-1 py-8 md:py-12">
            <WhyTrustUs data={homepageConfig.whyChooseUs} />
        </section>
        
        {/* Stats Section (Our Achievements) */}
        {homepageConfig.statsSection?.display && (
          <section className="px-1 py-8 md:py-12">
            <StatsSection stats={[
                { label: { bn: "জব প্লেসমেন্ট", en: "Job Placement" }, value: liveStats.jobPlacements, suffix: "+", color: "bg-[#dcfce7]" },
                { label: { bn: "শিক্ষার্থী", en: "Learner" }, value: liveStats.learners, suffix: "+", color: "bg-[#dbeafe]" },
                { label: { bn: "কোর্স সমাপ্তির হার", en: "Course Completion Rate" }, value: liveStats.completionRate, suffix: "%", color: "bg-[#ffedd5]" },
                { label: { bn: "লাইভ কোর্স", en: "Live Course" }, value: liveStats.liveCoursesCount, color: "bg-[#fef9c3]" },
            ]} title={{ bn: 'আমাদের অর্জন', en: 'Our Achievements' }} />
          </section>
        )}

        {/* Request a Callback Section */}
        <section className="px-1 py-8 md:py-12">
            <div className="container mx-auto">
                <RequestCallbackForm homepageConfig={homepageConfig} />
            </div>
        </section>

        {/* Have a Question? Dynamic Contact Section */}
        <section className="px-1 py-8 md:py-12 overflow-hidden">
            <div className="container mx-auto">
                <Card className="rounded-[40px] border-none shadow-2xl bg-[#eef2ed] dark:bg-card/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
                        <Megaphone className="w-48 h-48 text-primary" />
                    </div>
                    <CardContent className="p-10 md:p-20 text-center space-y-8 relative z-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-primary/10 p-4 rounded-[20px] shadow-inner mb-4">
                                <MessageSquare className="w-12 h-12 text-primary" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black uppercase font-headline tracking-tighter text-foreground">
                                {getT('have_a_question')}
                            </h2>
                            <p className="text-muted-foreground font-medium text-lg md:text-xl max-w-2xl mx-auto">
                                {getT('talk_to_advisors')}
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
                            <Button asChild size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 group">
                                <a href="tel:01641035736">
                                    <Phone className="mr-3 h-5 w-5 fill-current transition-transform group-hover:rotate-12" />
                                    {getT('call_now')}
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl font-black uppercase tracking-widest border-green-500/20 bg-green-500/5 text-green-600 hover:bg-green-500 hover:text-white transition-all group">
                                <a href="https://wa.me/8801641035736" target="_blank" rel="noopener noreferrer">
                                    <MessageSquare className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                                    {getT('message_whatsapp')}
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    </div>
  );
}