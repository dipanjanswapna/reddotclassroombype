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
  ChevronRight,
  Zap,
  CheckCircle2,
  Users,
  Award,
  Video,
  Star,
  Activity,
  Heart,
  TrendingUp,
  Monitor,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/course-card';
import { HeroCarousel } from '@/components/hero-carousel';
import { getHomepageConfig, getCoursesByIds, getInstructors, getOrganizations } from '@/lib/firebase/firestore';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestCallbackForm } from '@/components/request-callback-form';
import { Badge } from '@/components/ui/badge';

const DynamicTeachersCarousel = dynamic(() => import('@/components/dynamic-teachers-carousel').then(mod => mod.DynamicTeachersCarousel), {
    loading: () => <Skeleton className="h-[250px] w-full rounded-xl" />,
    ssr: false,
});

/**
 * @fileOverview Localized Master Homepage with Geometric UI Standards.
 * Standardized with rounded-xl corners and Title Case typography.
 */
export default function Home() {
  const { language, getLocalizedPath } = useLanguage();
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig | null>(null);
  const [liveCourses, setLiveCourses] = useState<Course[]>([]);
  const [featuredInstructors, setFeaturedInstructors] = useState<Instructor[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const isBn = language === 'bn';
  
  const getT = (key: string) => t[key]?.[language] || t[key]?.['en'] || key;

  useEffect(() => {
    async function fetchData() {
      try {
        const config = await getHomepageConfig();
        setHomepageConfig(config);

        const [
            live,
            instructorsData,
            orgsData,
        ] = await Promise.all([
            getCoursesByIds(config.liveCoursesIds || []),
            getInstructors(),
            getOrganizations(),
        ]);
        
        setLiveCourses(live);
        setOrganizations(orgsData);

        const featuredIds = config.teachersSection?.instructorIds || [];
        setFeaturedInstructors(instructorsData.filter(inst => 
            inst.status === 'Approved' && featuredIds.includes(inst.id!)
        ));

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
        <p className={cn("text-xs font-semibold uppercase tracking-widest animate-pulse", isBn && "font-bengali")}>
            {isBn ? 'ক্লাসরুম তৈরি হচ্ছে...' : 'Initializing RDC...'}
        </p>
    </div>
  );
  
  if (!homepageConfig) return null;

  return (
    <div className={cn("text-foreground overflow-x-hidden max-w-full px-1 pb-20", isBn && "font-bengali")}>
        
        {/* 1. Welcome Section */}
        {homepageConfig.welcomeSection?.display && (
            <section className="pt-6 pb-2 md:pt-8 md:pb-4">
                <div className="container mx-auto text-left space-y-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-3">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-tight border border-primary/20 w-fit">
                            <Sparkles className="w-3.5 h-3.5" />
                            {getT('best_learning_platform')}
                        </div>
                        <h1 className={cn("font-bold tracking-tight text-foreground leading-[1.1]", isBn ? "text-4xl md:text-6xl" : "text-4xl md:text-7xl font-headline")}>
                            {homepageConfig.welcomeSection?.title?.[language] || "Red Dot Classroom"}
                        </h1>
                        <div className="w-full max-w-3xl">
                            <TypingText text={homepageConfig.welcomeSection?.description?.[language] || ''} className="text-base md:text-xl text-muted-foreground leading-relaxed font-medium" />
                        </div>
                    </motion.div>
                </div>
            </section>
        )}

        {/* 2. Hero Carousel */}
        <section className="py-4 md:py-6 overflow-hidden px-1">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {/* 3. Banner Section */}
        {homepageConfig.strugglingStudentSection?.display && (
            <section className="px-1 py-6 md:py-10">
                <div className="container mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-xl overflow-hidden bg-primary p-8 md:p-14 shadow-lg group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110" />
                        <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
                            <div className="space-y-6 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-tight border border-white/20">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {isBn ? homepageConfig.strugglingStudentSection.title.bn : homepageConfig.strugglingStudentSection.title.en}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                                    {isBn ? homepageConfig.strugglingStudentSection.subtitle.bn : homepageConfig.strugglingStudentSection.subtitle.en}
                                </h2>
                                <Button asChild size="lg" variant="secondary" className="font-bold h-14 px-10 rounded-xl transition-all border-none">
                                    <Link href={getLocalizedPath("/strugglers-studies")} className="flex items-center gap-2">
                                        {isBn ? homepageConfig.strugglingStudentSection.buttonText.bn : homepageConfig.strugglingStudentSection.buttonText.en} <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="relative h-64 md:h-80 flex justify-center items-center">
                                <Image src={homepageConfig.strugglingStudentSection.imageUrl} alt="Help" width={400} height={400} className="object-contain drop-shadow-xl transition-transform group-hover:scale-105 duration-700" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        )}

        {/* 4. Notice Board */}
        <section className="px-1 py-6 md:py-10">
            <div className="container mx-auto max-w-4xl">
                <NoticeBoard />
            </div>
        </section>

        {/* 5. Categories Section */}
        {homepageConfig.categoriesSection?.display && (
          <section className="overflow-hidden py-6 md:py-10 px-1">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-6 border-l-4 border-primary pl-4">
                  <h2 className={cn("font-bold tracking-tight", isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline")}>
                    {homepageConfig.categoriesSection.title[language] || "Categories"}
                  </h2>
                  <Button asChild variant="link" className="font-bold text-sm text-primary p-0 h-auto">
                      <Link href={getLocalizedPath("/courses")}>{getT('view_all')} &rarr;</Link>
                  </Button>
              </div>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
            </div>
          </section>
        )}

        {/* 6. Journey Section (Live Courses) */}
        {homepageConfig.journeySection?.display && (
          <section className="bg-muted/30 overflow-hidden py-6 md:py-10 px-1">
            <div className="container mx-auto px-0">
              <div className="border-l-4 border-primary pl-4 mb-8 text-left">
                <h2 className={cn("font-bold tracking-tight text-left", isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline")}>
                    {homepageConfig.journeySection.title[language] || "Live Courses"}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium text-left">
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

        {/* 7. Teachers Section */}
        {homepageConfig.teachersSection?.display && (
          <section className="overflow-hidden py-6 md:py-10 px-1">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-8 border-l-4 border-accent pl-4 text-left">
                  <div className="text-left">
                      <h2 className={cn("font-bold tracking-tight text-left", isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline")}>
                        Our Mentors
                      </h2>
                      <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium text-left">{homepageConfig.teachersSection?.subtitle?.[language] || ''}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-accent/20 text-accent font-bold h-11 px-6">
                      <Link href={getLocalizedPath("/teachers")}>{isBn ? 'সকল শিক্ষক' : 'All Teachers'}</Link>
                  </Button>
              </div>
              <DynamicTeachersCarousel instructors={featuredInstructors} scrollSpeed={homepageConfig.teachersSection?.scrollSpeed} />
            </div>
          </section>
        )}

        {/* 12. Why Choose Us */}
        <section className="px-1 py-6 md:py-10 bg-muted/20">
            <WhyTrustUs data={homepageConfig.whyChooseUs} />
        </section>
        
        {/* 20. Stats Section */}
        {homepageConfig.statsSection?.display && (
          <section className="px-1 py-6 md:py-10">
            <StatsSection stats={homepageConfig.statsSection.stats.map(s => ({...s, color: 'bg-card border'}))} title={homepageConfig.statsSection.title} />
          </section>
        )}

        {/* 18. Callback Section */}
        <section className="px-1 py-6 md:py-10">
            <div className="container mx-auto">
                <RequestCallbackForm homepageConfig={homepageConfig} />
            </div>
        </section>

        {/* 15. Social Media Section */}
        {homepageConfig.socialMediaSection?.display && (
            <section className="px-1 py-6 md:py-10 bg-muted/30">
                <div className="container mx-auto">
                    <div className="text-center mb-12 space-y-2">
                        <h2 className="font-headline text-2xl md:text-4xl font-bold tracking-tight">{homepageConfig.socialMediaSection.title[language]}</h2>
                        <p className="text-muted-foreground font-medium">{homepageConfig.socialMediaSection.description[language]}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {homepageConfig.socialMediaSection.channels.map(channel => (
                            <Card key={channel.id} className="rounded-xl border-border shadow-sm overflow-hidden group bg-card">
                                <CardHeader className="p-6 flex flex-row items-center justify-between border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-muted/50">
                                            {channel.platform === 'YouTube' ? <Video className="text-red-600" /> : <Users className="text-blue-600" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">{channel.name[language]}</h3>
                                            <p className="text-xs text-muted-foreground">{channel.handle}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="font-bold text-[10px]">{channel.platform}</Badge>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center p-3 rounded-xl bg-muted/30">
                                            <p className="font-bold text-xl text-primary leading-none">{channel.stat1_value}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground mt-1">{channel.stat1_label[language]}</p>
                                        </div>
                                        <div className="text-center p-3 rounded-xl bg-muted/30">
                                            <p className="font-bold text-xl text-primary leading-none">{channel.stat2_value}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground mt-1">{channel.stat2_label[language]}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium mb-6 line-clamp-2">{channel.description[language]}</p>
                                    <Button asChild variant="outline" className="w-full rounded-xl font-bold text-xs h-10">
                                        <Link href={channel.ctaUrl} target="_blank">{channel.ctaText[language]}</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        )}

        {/* 17. App Promo Section */}
        {homepageConfig.appPromo?.display && (
            <section className="px-1 py-10 md:py-16 bg-primary text-white overflow-hidden rounded-xl m-4">
                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 text-center lg:text-left">
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                                    {homepageConfig.appPromo.title[language]}
                                </h2>
                                <h3 className="text-xl md:text-2xl font-medium opacity-90">Download our mobile app for better learning.</h3>
                                <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                    {homepageConfig.appPromo.description[language]}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <Link href={homepageConfig.appPromo.googlePlayUrl} className="hover:scale-105 transition-transform">
                                    <Image src={homepageConfig.appPromo.googlePlayImageUrl} alt="Google Play" width={180} height={60} className="h-12 w-auto" />
                                </Link>
                                <Link href={homepageConfig.appPromo.appStoreUrl} className="hover:scale-105 transition-transform">
                                    <Image src={homepageConfig.appPromo.appStoreImageUrl} alt="App Store" width={180} height={60} className="h-12 w-auto" />
                                </Link>
                            </div>
                        </div>
                        <div className="relative flex justify-center lg:justify-end">
                            <div className="relative w-full max-w-xs md:max-w-md aspect-[4/5]">
                                <Image src={homepageConfig.appPromo.promoImageUrl} alt="App Interface" fill className="object-contain drop-shadow-2xl" data-ai-hint={homepageConfig.appPromo.promoImageDataAiHint} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )}
    </div>
  );
}
