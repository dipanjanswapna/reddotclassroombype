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
 * @fileOverview Localized Master Homepage
 * Standardized high-density layout with 18 dynamic sections.
 * px-1 wall-to-wall design enforced.
 */
export default function Home() {
  const { language, getLocalizedPath } = useLanguage();
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig | null>(null);
  const [liveCourses, setLiveCourses] = useState<Course[]>([]);
  const [sscHscCourses, setSscHscCourses] = useState<Course[]>([]);
  const [admissionCourses, setAdmissionCourses] = useState<Course[]>([]);
  const [jobCourses, setJobCourses] = useState<Course[]>([]);
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
            live, ssc, adm, job,
            instructorsData,
            orgsData,
            allUsers,
            allCourses
        ] = await Promise.all([
            getCoursesByIds(config.liveCoursesIds || []),
            getCoursesByIds(config.sscHscCourseIds || []),
            getCoursesByIds(config.admissionCoursesIds || []),
            getCoursesByIds(config.jobCoursesIds || []),
            getInstructors(),
            getOrganizations(),
            getUsers(),
            getCourses({ status: 'Published' })
        ]);
        
        setLiveCourses(live);
        setSscHscCourses(ssc);
        setAdmissionCourses(adm);
        setJobCourses(job);
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
        console.error("Homepage load error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [language]); 

  if (loading) return (
    <div className="px-1 py-20 flex flex-col items-center justify-center gap-4 min-h-screen bg-background">
        <LoadingSpinner className="w-12 h-12" />
        <p className={cn("text-xs font-black uppercase tracking-widest animate-pulse", isBn && "font-bengali")}>
            {isBn ? 'ক্লাসরুম তৈরি হচ্ছে...' : 'Initializing RDC...'}
        </p>
    </div>
  );
  
  if (!homepageConfig) return null;
  
  const getT = (key: string) => t[key]?.[language] || t[key]?.['en'] || key;

  return (
    <div className={cn("text-foreground mesh-gradient overflow-x-hidden max-w-full px-1 pb-20", isBn && "font-bengali")}>
        
        {/* Welcome Section */}
        {homepageConfig.welcomeSection?.display && (
            <section className="pt-6 pb-2 md:pt-8 md:pb-4">
                <div className="container mx-auto text-left space-y-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-3">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm w-fit">
                            <Sparkles className="w-3.5 h-3.5" />
                            {isBn ? 'সেরা লার্নিং প্ল্যাটফর্ম' : 'Elite Learning Platform'}
                        </div>
                        <h1 className={cn("font-black tracking-tighter text-foreground uppercase leading-[0.95]", isBn ? "text-4xl md:text-6xl" : "text-4xl md:text-7xl font-headline")}>
                            {homepageConfig.welcomeSection?.title?.[language] || "RED DOT CLASSROOM"}
                        </h1>
                        <div className="w-full max-w-3xl">
                            <TypingText text={homepageConfig.welcomeSection?.description?.[language] || ''} className="text-sm md:text-xl text-muted-foreground leading-relaxed font-medium" />
                        </div>
                    </motion.div>
                </div>
            </section>
        )}

        {/* Dynamic Hero Banners */}
        <section className="py-4 md:py-6 overflow-hidden px-1">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {/* Struggling in Studies Banner */}
        {homepageConfig.strugglingStudentSection?.display && (
            <section className="px-1 py-6 md:py-10">
                <div className="container mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-[30px] overflow-hidden bg-gradient-to-br from-[#8B1538] to-[#1a1a2e] p-8 md:p-14 shadow-2xl group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110" />
                        <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
                            <div className="space-y-6 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {getT('struggling_title')}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                                    {getT('struggling_subtitle')}
                                </h2>
                                <Button asChild size="lg" className="bg-white text-primary hover:bg-yellow-400 hover:text-black font-black uppercase tracking-widest h-14 px-10 rounded-2xl shadow-2xl transition-all border-none">
                                    <Link href={getLocalizedPath("/strugglers-studies")} className="flex items-center gap-2">
                                        {getT('see_how_we_help')} <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="relative h-64 md:h-80 flex justify-center items-center">
                                <Image src={homepageConfig.strugglingStudentSection.imageUrl} alt="Help" width={400} height={400} className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105 duration-700" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        )}

        {/* Notice Board */}
        <section className="px-1 py-6 md:py-10">
            <div className="container mx-auto max-w-4xl">
                <NoticeBoard />
            </div>
        </section>

        {/* Categories Grid */}
        {homepageConfig.categoriesSection?.display && (
          <section className="overflow-hidden py-6 md:py-10 px-1">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-6 border-l-4 border-primary pl-4">
                  <h2 className={cn("font-black tracking-tight uppercase", isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline")}>
                    {getT('categories_heading')}
                  </h2>
                  <Button asChild variant="link" className="font-black uppercase text-[10px] tracking-widest text-primary p-0 h-auto">
                      <Link href={getLocalizedPath("/courses")}>{getT('view_all')} &rarr;</Link>
                  </Button>
              </div>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
            </div>
          </section>
        )}

        {/* Live Courses Grid */}
        {homepageConfig.journeySection?.display && (
          <section className="bg-gradient-to-b from-transparent via-primary/5 to-transparent overflow-hidden py-6 md:py-10 px-1">
            <div className="container mx-auto px-0">
              <div className="border-l-4 border-primary pl-4 mb-8 text-left">
                <h2 className={cn("font-black tracking-tight uppercase text-left", isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline")}>
                    {getT('live_courses_heading')}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm md:text-lg font-medium text-left">
                    {homepageConfig.journeySection?.subtitle?.[language] || ''}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {liveCourses.map(course => (
                    <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Faculty Carousel */}
        {homepageConfig.teachersSection?.display && (
          <section className="overflow-hidden py-6 md:py-10 px-1 bg-muted/20">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-8 border-l-4 border-accent pl-4 text-left">
                  <div className="text-left">
                      <h2 className={cn("font-black tracking-tight uppercase text-left", isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline")}>{getT('our_mentors')}</h2>
                      <p className="text-muted-foreground mt-1 text-sm md:text-base leading-tight font-medium text-left">{homepageConfig.teachersSection?.subtitle?.[language] || ''}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-accent/20 text-accent font-black h-11 uppercase text-[10px] px-6">
                      <Link href={getLocalizedPath("/teachers")}>{isBn ? 'সকল শিক্ষক' : 'All Teachers'}</Link>
                  </Button>
              </div>
              <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection?.scrollSpeed} />
            </div>
          </section>
        )}

        {/* Why Trust Us */}
        <section className="px-1 py-6 md:py-10">
            <WhyTrustUs data={homepageConfig.whyChooseUs} />
        </section>
        
        {/* Stats Section */}
        {homepageConfig.statsSection?.display && (
          <section className="px-1 py-6 md:py-10">
            <StatsSection stats={homepageConfig.statsSection.stats.map(s => ({...s, color: 'bg-muted/20'}))} title={homepageConfig.statsSection.title} />
          </section>
        )}

        {/* Course Specific Sections */}
        {sscHscCourses.length > 0 && (
            <section className="py-6 md:py-10 px-1">
                <div className="container mx-auto">
                    <h2 className="font-headline text-2xl font-black uppercase mb-8 border-l-4 border-primary pl-4">{homepageConfig.sscHscSection?.title?.[language] || 'SSC & HSC'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sscHscCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                    </div>
                </div>
            </section>
        )}

        {/* Callback Form */}
        <section className="px-1 py-6 md:py-10">
            <div className="container mx-auto">
                <RequestCallbackForm homepageConfig={homepageConfig} />
            </div>
        </section>

        {/* Have a Question CTA */}
        {homepageConfig.offlineHubSection?.contactSection?.display && (
            <section className="px-1 py-6 md:py-10 overflow-hidden">
                <div className="container mx-auto">
                    <Card className="rounded-[40px] border-none shadow-2xl bg-[#eef2ed] dark:bg-card/20 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none"><Megaphone className="w-48 h-48 text-primary" /></div>
                        <CardContent className="p-10 md:p-16 text-center space-y-8 relative z-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-primary/10 p-4 rounded-[20px] shadow-inner mb-2"><MessageSquare className="w-10 h-10 text-primary" /></div>
                                <h2 className="text-3xl md:text-5xl font-black uppercase font-headline tracking-tighter text-foreground leading-none">
                                    {homepageConfig.offlineHubSection.contactSection.title[language] || getT('have_a_question')}
                                </h2>
                                <p className="text-muted-foreground font-medium text-lg md:text-xl max-w-2xl mx-auto">
                                    {homepageConfig.offlineHubSection.contactSection.subtitle[language] || getT('talk_to_advisors')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2">
                                <Button asChild size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 group">
                                    <a href={`tel:${homepageConfig.offlineHubSection.contactSection.callButtonNumber}`}>
                                        <Phone className="mr-3 h-5 w-5 fill-current transition-transform group-hover:rotate-12" />
                                        {homepageConfig.offlineHubSection.contactSection.callButtonText[language] || getT('call_now')}
                                    </a>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl font-black uppercase tracking-widest border-green-500/20 bg-green-500/5 text-green-600 hover:bg-green-500 hover:text-white transition-all group">
                                    <a href={`https://wa.me/${homepageConfig.offlineHubSection.contactSection.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                        <MessageSquare className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                                        {homepageConfig.offlineHubSection.contactSection.whatsappButtonText[language] || getT('message_whatsapp')}
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        )}
    </div>
  );
}
