
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight,
  Zap,
  MessageSquare,
  Phone,
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
import { LoadingSpinner } from '@/components/loading-spinner';
import { RequestCallbackForm } from '@/components/request-callback-form';
import WhyTrustUs from '@/components/why-trust-us';
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
            sscHsc,
            instructorsData,
            orgsData,
            allUsers,
            allEnrollments,
            allCourses
        ] = await Promise.all([
            getCoursesByIds(config.liveCoursesIds || []),
            getCoursesByIds(config.sscHscCourseIds || []),
            getInstructors(),
            getOrganizations(),
            getUsers(),
            getEnrollments(),
            getCourses({ status: 'Published' })
        ]);
        
        setLiveCourses(live);
        setSscHscCourses(sscHsc);
        setOrganizations(orgsData);

        const featuredIds = config.teachersSection?.instructorIds || [];
        setFeaturedInstructors(instructorsData.filter(inst => 
            inst.status === 'Approved' && featuredIds.includes(inst.id!)
        ));

        const totalEnrollments = allEnrollments.length;
        const completedEnrollments = allEnrollments.filter(e => e.status === 'completed').length;
        const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 83;
        
        setLiveStats({
            learners: allUsers.filter(u => u.role === 'Student').length || 150000,
            completionRate,
            liveCoursesCount: allCourses.filter(c => c.type === 'Online').length || 28,
            jobPlacements: 9000 + (allEnrollments.filter(e => {
                const course = allCourses.find(c => c.id === e.courseId);
                return course?.category === 'Job Prep' || course?.category === 'BCS';
            }).length)
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
  
  if (!homepageConfig) return null;
  
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
    <div className="text-foreground mesh-gradient overflow-x-hidden max-w-full px-1">
        {homepageConfig.welcomeSection?.display && (
            <section className="py-6 md:py-8 text-center overflow-hidden px-1">
                <div className="container mx-auto px-0">
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center gap-2 md:gap-4"
                     >
                        <h1 className="font-black text-2xl md:text-4xl tracking-tighter text-foreground uppercase">
                            {homepageConfig.welcomeSection?.title?.[language] || "RED DOT CLASSROOM"}
                        </h1>
                        <div className="w-full max-w-2xl mx-auto">
                            <TypingText 
                                text={homepageConfig.welcomeSection?.description?.[language] || ''}
                                className="mt-2 text-[11px] md:text-sm lg:text-base text-muted-foreground leading-relaxed font-medium break-words px-4"
                            />
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
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="group relative p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden rounded-[20px] border border-border shadow-xl bg-card"
                  >
                      <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left z-10 w-full">
                          <motion.div whileHover={{ scale: 1.05 }} className="relative w-24 h-24 md:w-40 md:h-40 shrink-0">
                            <Image src={homepageConfig.strugglingStudentSection.imageUrl} alt="Help" fill className="object-contain" />
                          </motion.div>
                          <div className="space-y-2 flex-grow">
                              <h3 className="font-headline text-lg md:text-2xl lg:text-3xl font-black tracking-tight text-gray-900">
                                  {homepageConfig.strugglingStudentSection?.title?.[language] || ''}
                              </h3>
                              <p className="text-sm md:text-lg lg:text-xl text-gray-600 font-medium leading-relaxed">
                                  {homepageConfig.strugglingStudentSection?.subtitle?.[language] || ''}
                              </p>
                          </div>
                      </div>
                      <Button asChild size="lg" className="z-10 w-full md:w-auto font-black text-sm rounded-xl shadow-xl shadow-primary/20">
                        <Link href="/strugglers-studies">
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
                      <Link href="/teachers">{homepageConfig.teachersSection?.buttonText?.[language] || ''}</Link>
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

        {homepageConfig.offlineHubSection?.contactSection?.display && (
            <section className="py-8 md:py-10 overflow-hidden px-1">
                <div className="container mx-auto px-0">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-[20px] overflow-hidden p-8 md:p-16 bg-gradient-to-br from-primary via-primary/80 to-black text-white shadow-2xl"
                    >
                        <div className="relative z-10 max-w-3xl space-y-6">
                            <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-[20px] mb-4">
                                <MessageSquare className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase text-left">
                                {homepageConfig.offlineHubSection.contactSection.title[language] || "Have a Question?"}
                            </h2>
                            <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed max-w-xl text-left">
                                {homepageConfig.offlineHubSection.contactSection.subtitle[language] || "Talk to our student advisors anytime."}
                            </p>
                            <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
                                <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest h-14 px-10 bg-white text-primary hover:bg-white/90 border-none">
                                    <a href={`tel:${homepageConfig.offlineHubSection.contactSection.callButtonNumber}`}>
                                        <Phone className="mr-3 h-5 w-5" />
                                        {homepageConfig.offlineHubSection.contactSection.callButtonText[language] || "Call Support"}
                                    </a>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest h-14 px-10 border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm">
                                    <a href={`https://wa.me/${homepageConfig.offlineHubSection.contactSection.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                        <MessageSquare className="mr-3 h-5 w-5" />
                                        {homepageConfig.offlineHubSection.contactSection.whatsappButtonText[language] || "WhatsApp Us"}
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        )}
    </div>
  );
}
