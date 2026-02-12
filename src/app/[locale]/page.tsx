'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight,
  Zap,
  MessageSquare,
  Phone,
  Video,
  BookOpen,
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
import { RequestCallbackForm } from '@/components/request-callback-form';
import WhyTrustUs from '@/components/why-trust-us';
import { NoticeBoard } from '@/components/notice-board';
import { motion } from 'framer-motion';
import { TypingText } from '@/components/typing-text';
import { StatsSection } from '@/components/stats-section';

const DynamicTeachersCarousel = dynamic(() => import('@/components/dynamic-teachers-carousel').then(mod => mod.DynamicTeachersCarousel), {
    loading: () => <Skeleton className="h-[250px] w-full rounded-[20px]" />,
    ssr: false,
});

function HomeSkeleton() {
    return (
        <div className="px-1 space-y-8 md:space-y-12 animate-pulse">
            <div className="py-6 md:py-8 space-y-4">
                <Skeleton className="h-10 w-3/4 mx-auto max-w-lg rounded-xl" />
                <Skeleton className="h-4 w-1/2 mx-auto max-w-md rounded-lg" />
            </div>
            <div className="px-1">
                <Skeleton className="aspect-[16/9] md:aspect-[21/7] w-full rounded-[20px]" />
            </div>
            <div className="container mx-auto px-1">
                <Skeleton className="h-40 w-full rounded-[20px]" />
            </div>
        </div>
    );
}

export default function Home() {
  const { language, getLocalizedPath } = useLanguage();
  const [homepageConfig, setHomepageConfig] = React.useState<HomepageConfig | null>(null);
  const [liveCourses, setLiveCourses] = React.useState<Course[]>([]);
  const [featuredInstructors, setFeaturedInstructors] = React.useState<Instructor[]>([]);
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);
  
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

  if (loading) return <HomeSkeleton />;
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
    <div className="text-foreground mesh-gradient overflow-x-hidden max-w-full px-1">
        {homepageConfig.welcomeSection?.display && (
            <section className="py-6 md:py-8 text-center overflow-hidden px-1">
                <div className="container mx-auto px-0">
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center gap-2">
                        <h1 className="font-headline text-2xl md:text-4xl font-black tracking-tighter text-foreground uppercase">
                            {homepageConfig.welcomeSection?.title?.[language] || "RED DOT CLASSROOM (RDC)"}
                        </h1>
                        <div className="w-full max-w-2xl mx-auto">
                            <TypingText text={homepageConfig.welcomeSection?.description?.[language] || ''} className="mt-2 text-[11px] md:text-sm text-muted-foreground leading-relaxed font-medium px-4" />
                        </div>
                     </motion.div>
                </div>
            </section>
        )}

        <section className="py-0 overflow-hidden px-1">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {homepageConfig.strugglingStudentSection?.display && (
          <section className="py-8 md:py-10 overflow-hidden relative px-1">
              <div className="container mx-auto px-0">
                  <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="group relative p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden rounded-[20px] border border-border shadow-xl bg-card">
                      <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left z-10 w-full">
                          <div className="relative w-24 h-24 md:w-40 md:h-40 shrink-0">
                            <Image src={homepageConfig.strugglingStudentSection.imageUrl} alt="Help" fill className="object-contain" />
                          </div>
                          <div className="space-y-2 flex-grow">
                              <h3 className="font-headline text-lg md:text-2xl lg:text-3xl font-black tracking-tight text-gray-900 uppercase">
                                  {homepageConfig.strugglingStudentSection?.title?.[language] || ''}
                              </h3>
                              <p className="text-sm md:text-lg lg:text-xl text-gray-600 font-medium leading-relaxed">
                                  {homepageConfig.strugglingStudentSection?.subtitle?.[language] || ''}
                              </p>
                          </div>
                      </div>
                      <Button asChild size="lg" className="z-10 w-full md:w-auto font-black text-sm rounded-xl shadow-xl shadow-primary/20 h-14 px-10 uppercase tracking-widest">
                        <Link href={getLocalizedPath("/strugglers-studies")}>
                            {homepageConfig.strugglingStudentSection?.buttonText?.[language] || ''}
                             <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                  </motion.div>
              </div>
          </section>
        )}

        {homepageConfig.categoriesSection?.display && (
          <section className="bg-secondary/10 dark:bg-transparent overflow-hidden py-8 md:py-10 px-1">
            <div className="container mx-auto px-0">
              <h2 className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase border-l-4 border-primary pl-4 mb-8 text-left">
                {homepageConfig.categoriesSection?.title?.[language] || ''}
              </h2>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
            </div>
          </section>
        )}

        <div className="container mx-auto px-1 overflow-hidden">
            <NoticeBoard />
        </div>

        {homepageConfig.journeySection?.display && (
          <section className="bg-gradient-to-b from-transparent via-primary/5 to-transparent overflow-hidden py-8 md:py-10 px-1">
            <div className="container mx-auto px-0">
              <h2 className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase border-l-4 border-primary pl-4 mb-3 text-left">{homepageConfig.journeySection?.title?.[language] || ''}</h2>
              <p className="text-muted-foreground text-left max-w-2xl mb-8 md:mb-10 pl-4 text-sm md:text-base">{homepageConfig.journeySection?.subtitle?.[language] || ''}</p>
              <div>
                <h3 className="font-headline text-base md:text-lg lg:text-xl font-bold mb-6 pl-4">{homepageConfig.journeySection?.courseTitle?.[language] || ''}</h3>
                <CourseGrid courses={liveCourses} />
              </div>
            </div>
          </section>
        )}

        {homepageConfig.teachersSection?.display && (
          <section className="overflow-hidden py-8 md:py-10 px-1">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-4">
                  <div className="text-left">
                      <h2 className="font-headline text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase">{homepageConfig.teachersSection?.title?.[language] || ''}</h2>
                      <p className="text-muted-foreground mt-1 text-[11px] md:text-sm lg:text-base leading-tight">{homepageConfig.teachersSection?.subtitle?.[language] || ''}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl shrink-0 h-8 md:h-10 text-[10px] md:text-xs font-bold uppercase">
                      <Link href={getLocalizedPath("/teachers")}>{homepageConfig.teachersSection?.buttonText?.[language] || ''}</Link>
                  </Button>
              </div>
              <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection?.scrollSpeed} />
            </div>
          </section>
        )}

        <div className="px-1">
            <WhyTrustUs data={homepageConfig.whyChooseUs} />
        </div>
        
        {homepageConfig.statsSection?.display && (
          <div className="px-1">
            <StatsSection stats={dynamicStats} title={homepageConfig.statsSection.title} />
          </div>
        )}

        <section className="relative overflow-hidden py-8 md:py-10 px-1">
            <div className="container mx-auto px-0 relative z-10">
                <RequestCallbackForm homepageConfig={homepageConfig} />
            </div>
        </section>
    </div>
  );
}
