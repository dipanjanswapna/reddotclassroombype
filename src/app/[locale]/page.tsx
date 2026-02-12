'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap,
  Sparkles,
  ArrowRight,
  BookOpen
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
import { RequestCallbackForm } from '@/components/request-callback-form';
import WhyTrustUs from '@/components/why-trust-us';
import { TypingText } from '@/components/typing-text';
import { StatsSection } from '@/components/stats-section';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/loading-spinner';

const DynamicTeachersCarousel = dynamic(() => import('@/components/dynamic-teachers-carousel').then(mod => mod.DynamicTeachersCarousel), {
    loading: () => <Skeleton className="h-[250px] w-full rounded-[20px]" />,
    ssr: false,
});

/**
 * @fileOverview Localized Homepage
 * Implements Hind Siliguri font and premium colourful UI.
 * Consistent 20px corners and px-1 wall-to-wall design.
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
  }, [language]); // Refetch on language change to ensure i18n consistency

  if (loading) return (
    <div className="px-1 py-20 flex flex-col items-center justify-center gap-4 min-h-screen">
        <LoadingSpinner className="w-12 h-12" />
        <p className={cn("text-sm font-black uppercase tracking-widest animate-pulse", isBn && "font-bengali")}>
            {isBn ? 'লোড হচ্ছে...' : 'Initializing RDC...'}
        </p>
    </div>
  );
  
  if (!homepageConfig) return null;
  
  const CourseGrid = ({ courses }: { courses: Course[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 md:gap-y-8 px-1">
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
    <div className={cn("text-foreground mesh-gradient overflow-x-hidden max-w-full px-1 pb-20", isBn && "font-bengali")}>
        {/* Welcome Hero */}
        {homepageConfig.welcomeSection?.display && (
            <section className="py-12 md:py-20 text-center px-1">
                <div className="container mx-auto px-0">
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6 }} 
                        className="flex flex-col items-center gap-4"
                     >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            {isBn ? 'সেরা লার্নিং প্ল্যাটফর্ম' : 'Elite Learning Platform'}
                        </div>
                        <h1 className={cn(
                            "font-black tracking-tighter text-foreground uppercase leading-[0.95]",
                            isBn ? "text-4xl md:text-6xl" : "text-4xl md:text-7xl font-headline"
                        )}>
                            {homepageConfig.welcomeSection?.title?.[language] || "RED DOT CLASSROOM"}
                        </h1>
                        <div className="w-full max-w-3xl mx-auto">
                            <TypingText 
                                text={homepageConfig.welcomeSection?.description?.[language] || ''} 
                                className={cn(
                                    "mt-4 text-sm md:text-xl text-muted-foreground leading-relaxed font-medium px-4"
                                )} 
                            />
                        </div>
                     </motion.div>
                </div>
            </section>
        )}

        {/* Dynamic Banners */}
        <section className="py-0 overflow-hidden px-1 mb-12">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {/* Categories Section */}
        {homepageConfig.categoriesSection?.display && (
          <section className="overflow-hidden py-12 md:py-20 px-1">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-10 border-l-4 border-primary pl-4">
                  <h2 className={cn(
                      "font-black tracking-tight uppercase",
                      isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline"
                  )}>
                    {t.categories_heading[language]}
                  </h2>
                  <Button asChild variant="link" className={cn("font-black uppercase text-[10px] tracking-widest text-primary p-0")}>
                      <Link href={getLocalizedPath("/courses")}>{t.view_all[language]} &rarr;</Link>
                  </Button>
              </div>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
            </div>
          </section>
        )}

        {/* RDC Shop (Live Courses) */}
        {homepageConfig.journeySection?.display && (
          <section className="bg-gradient-to-b from-transparent via-primary/5 to-transparent overflow-hidden py-12 md:py-20 px-1">
            <div className="container mx-auto px-0">
              <div className="border-l-4 border-primary pl-4 mb-10 text-left">
                <h2 className={cn(
                    "font-black tracking-tight uppercase text-left",
                    isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline"
                )}>
                    {t.live_courses_heading[language]}
                </h2>
                <p className={cn("text-muted-foreground mt-1 text-sm md:text-lg font-medium text-left")}>
                    {homepageConfig.journeySection?.subtitle?.[language] || ''}
                </p>
              </div>
              <CourseGrid courses={liveCourses} />
            </div>
          </section>
        )}

        {/* Faculty Section */}
        {homepageConfig.teachersSection?.display && (
          <section className="overflow-hidden py-12 md:py-20 px-1 bg-muted/20">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-10 border-l-4 border-accent pl-4">
                  <div className="text-left">
                      <h2 className={cn(
                          "font-black tracking-tight uppercase text-left",
                          isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline"
                      )}>{t.our_mentors[language]}</h2>
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
        <div className="px-1 py-16">
            <WhyTrustUs data={homepageConfig.whyChooseUs} />
        </div>
        
        {/* Stats Section */}
        {homepageConfig.statsSection?.display && (
          <div className="px-1">
            <StatsSection stats={dynamicStats} title={t.stats_heading} />
          </div>
        )}

        {/* Callback CTA */}
        <section className="relative overflow-hidden py-12 md:py-20 px-1">
            <div className="container mx-auto px-0 relative z-10">
                <RequestCallbackForm homepageConfig={homepageConfig} />
            </div>
        </section>
    </div>
  );
}
