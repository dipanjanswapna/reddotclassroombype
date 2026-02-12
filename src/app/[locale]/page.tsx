'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight,
  Zap,
  MessageSquare,
  Phone,
  Video,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/course-card';
import { Badge } from '@/components/ui/badge';
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
import { NoticeBoard } from '@/components/notice-board';
import { motion } from 'framer-motion';
import { TypingText } from '@/components/typing-text';
import { StatsSection } from '@/components/stats-section';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/loading-spinner';

const DynamicTeachersCarousel = dynamic(() => import('@/components/dynamic-teachers-carousel').then(mod => mod.DynamicTeachersCarousel), {
    loading: () => <Skeleton className="h-[250px] w-full rounded-[20px]" />,
    ssr: false,
});

export default function Home() {
  const { language, getLocalizedPath } = useLanguage();
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig | null>(null);
  const [liveCourses, setLiveCourses] = useState<Course[]>([]);
  const [featuredInstructors, setFeaturedInstructors] = useState<Instructor[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [liveStats, setLiveStats] = useState({
    learners: 0,
    completionRate: 0,
    liveCoursesCount: 0,
    jobPlacements: 0
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
  }, []);

  if (loading) return (
    <div className="px-1 py-20 flex flex-col items-center justify-center gap-4">
        <LoadingSpinner className="w-12 h-12" />
        <p className={cn("text-sm font-black uppercase tracking-widest animate-pulse", language === 'bn' && "font-bengali")}>
            {language === 'bn' ? 'RDC লোড হচ্ছে...' : 'Initializing RDC...'}
        </p>
    </div>
  );
  
  if (!homepageConfig) return null;
  
  const CourseGrid = ({ courses }: { courses: Course[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-0 md:gap-y-8 px-1">
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
    <div className={cn("text-foreground mesh-gradient overflow-x-hidden max-w-full px-1", language === 'bn' && "font-bengali")}>
        {/* Welcome Section */}
        {homepageConfig.welcomeSection?.display && (
            <section className="py-8 md:py-12 text-center overflow-hidden px-1">
                <div className="container mx-auto px-0">
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6 }} 
                        className="flex flex-col items-center gap-3"
                     >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            {language === 'bn' ? 'সেরা লার্নিং প্ল্যাটফর্ম' : 'Elite Learning Platform'}
                        </div>
                        <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase leading-[0.95]">
                            {homepageConfig.welcomeSection?.title?.[language] || "RED DOT CLASSROOM"}
                        </h1>
                        <div className="w-full max-w-3xl mx-auto">
                            <TypingText 
                                text={homepageConfig.welcomeSection?.description?.[language] || ''} 
                                className="mt-2 text-sm md:text-lg text-muted-foreground leading-relaxed font-medium px-4" 
                            />
                        </div>
                     </motion.div>
                </div>
            </section>
        )}

        {/* Hero Area */}
        <section className="py-0 overflow-hidden px-1">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {/* Categories */}
        {homepageConfig.categoriesSection?.display && (
          <section className="overflow-hidden py-10 md:py-16 px-1">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-10 border-l-4 border-primary pl-4">
                  <h2 className="font-headline text-xl md:text-2xl font-black tracking-tight uppercase">
                    {t.categories_heading[language]}
                  </h2>
                  <Button asChild variant="link" className="font-black uppercase text-[10px] tracking-widest text-primary p-0">
                      <Link href={getLocalizedPath("/courses")}>{t.view_all[language]} &rarr;</Link>
                  </Button>
              </div>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
            </div>
          </section>
        )}

        {/* Live Courses */}
        {homepageConfig.journeySection?.display && (
          <section className="bg-gradient-to-b from-transparent via-primary/5 to-transparent overflow-hidden py-10 md:py-16 px-1">
            <div className="container mx-auto px-0">
              <div className="border-l-4 border-primary pl-4 mb-10 text-left">
                <h2 className="font-headline text-xl md:text-2xl font-black tracking-tight uppercase">
                    {t.live_courses_heading[language]}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
                    {homepageConfig.journeySection?.subtitle?.[language] || ''}
                </p>
              </div>
              <CourseGrid courses={liveCourses} />
            </div>
          </section>
        )}

        {/* Faculty */}
        {homepageConfig.teachersSection?.display && (
          <section className="overflow-hidden py-10 md:py-16 px-1 bg-muted/20">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-10 border-l-4 border-accent pl-4">
                  <div className="text-left">
                      <h2 className="font-headline text-xl md:text-2xl font-black tracking-tight uppercase">{t.our_mentors[language]}</h2>
                      <p className="text-muted-foreground mt-1 text-[11px] md:text-sm leading-tight font-medium">{homepageConfig.teachersSection?.subtitle?.[language] || ''}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-accent/20 text-accent font-black h-10 uppercase text-[10px]">
                      <Link href={getLocalizedPath("/teachers")}>{language === 'bn' ? 'সকল শিক্ষক' : 'All Teachers'}</Link>
                  </Button>
              </div>
              <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection?.scrollSpeed} />
            </div>
          </section>
        )}

        {/* Trust & Testimonials */}
        <div className="px-1 py-10">
            <WhyTrustUs data={homepageConfig.whyChooseUs} />
        </div>
        
        {/* Statistics */}
        {homepageConfig.statsSection?.display && (
          <div className="px-1">
            <StatsSection stats={dynamicStats} title={t.stats_heading} />
          </div>
        )}

        {/* Final CTA */}
        <section className="relative overflow-hidden py-10 md:py-16 px-1">
            <div className="container mx-auto px-0 relative z-10">
                <RequestCallbackForm homepageConfig={homepageConfig} />
            </div>
        </section>
    </div>
  );
}
