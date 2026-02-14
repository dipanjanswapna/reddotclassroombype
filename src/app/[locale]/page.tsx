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
  Video
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
        
        {/* 1. Welcome Section */}
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

        {/* 2. Hero Carousel */}
        <section className="py-4 md:py-6 overflow-hidden px-1">
          <HeroCarousel banners={homepageConfig.heroBanners || []} autoplaySettings={homepageConfig.heroCarousel} />
        </section>

        {/* 3. Struggling Student Banner */}
        {homepageConfig.strugglingStudentSection?.display && (
            <section className="px-1 py-6 md:py-10">
                <div className="container mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-[30px] overflow-hidden bg-gradient-to-br from-[#8B1538] to-[#1a1a2e] p-8 md:p-14 shadow-2xl group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110" />
                        <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
                            <div className="space-y-6 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {isBn ? homepageConfig.strugglingStudentSection.title.bn : homepageConfig.strugglingStudentSection.title.en}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                                    {isBn ? homepageConfig.strugglingStudentSection.subtitle.bn : homepageConfig.strugglingStudentSection.subtitle.en}
                                </h2>
                                <Button asChild size="lg" className="bg-white text-primary hover:bg-yellow-400 hover:text-black font-black uppercase tracking-widest h-14 px-10 rounded-2xl shadow-2xl transition-all border-none">
                                    <Link href={getLocalizedPath("/strugglers-studies")} className="flex items-center gap-2">
                                        {isBn ? homepageConfig.strugglingStudentSection.buttonText.bn : homepageConfig.strugglingStudentSection.buttonText.en} <ArrowRight className="w-4 h-4" />
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
                  <h2 className={cn("font-black tracking-tight uppercase", isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline")}>
                    {homepageConfig.categoriesSection.title[language] || "Categories"}
                  </h2>
                  <Button asChild variant="link" className="font-black uppercase text-[10px] tracking-widest text-primary p-0 h-auto">
                      <Link href={getLocalizedPath("/courses")}>{getT('view_all')} &rarr;</Link>
                  </Button>
              </div>
              <CategoriesCarousel categories={homepageConfig.categoriesSection?.categories || []} />
            </div>
          </section>
        )}

        {/* 6. Journey Section (Live Courses) */}
        {homepageConfig.journeySection?.display && (
          <section className="bg-gradient-to-b from-transparent via-primary/5 to-transparent overflow-hidden py-6 md:py-10 px-1">
            <div className="container mx-auto px-0">
              <div className="border-l-4 border-primary pl-4 mb-8 text-left">
                <h2 className={cn("font-black tracking-tight uppercase text-left", isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline")}>
                    {homepageConfig.journeySection.title[language] || "Live Courses"}
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

        {/* 7. Teachers Section */}
        {homepageConfig.teachersSection?.display && (
          <section className="overflow-hidden py-6 md:py-10 px-1 bg-muted/20">
            <div className="container mx-auto px-0">
              <div className="flex items-center justify-between mb-8 border-l-4 border-accent pl-4 text-left">
                  <div className="text-left">
                      <h2 className={cn("font-black tracking-tight uppercase text-left", isBn ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl font-headline")}>
                        {homepageConfig.teachersSection.title[language] || "Our Mentors"}
                      </h2>
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

        {/* 12. Why Choose Us (Why We Are The Best) */}
        <section className="px-1 py-6 md:py-10">
            <WhyTrustUs data={homepageConfig.whyChooseUs} />
        </section>
        
        {/* 20. Stats Section (Our Achievements) */}
        {homepageConfig.statsSection?.display && (
          <section className="px-1 py-6 md:py-10">
            <StatsSection stats={homepageConfig.statsSection.stats.map(s => ({...s, color: 'bg-muted/20'}))} title={homepageConfig.statsSection.title} />
          </section>
        )}

        {/* 18. Callback Section (Request a Callback) */}
        <section className="px-1 py-6 md:py-10">
            <div className="container mx-auto">
                <RequestCallbackForm homepageConfig={homepageConfig} />
            </div>
        </section>

        {/* 8. SSC & HSC Section */}
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

        {/* 10. Admission Section */}
        {admissionCourses.length > 0 && (
            <section className="py-6 md:py-10 px-1">
                <div className="container mx-auto">
                    <h2 className="font-headline text-2xl font-black uppercase mb-8 border-l-4 border-primary pl-4">{homepageConfig.admissionSection?.title?.[language] || 'University Admission'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {admissionCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                    </div>
                </div>
            </section>
        )}

        {/* 11. Job Prep Section */}
        {jobCourses.length > 0 && (
            <section className="py-6 md:py-10 px-1 bg-muted/10">
                <div className="container mx-auto">
                    <h2 className="font-headline text-2xl font-black uppercase mb-8 border-l-4 border-primary pl-4">{homepageConfig.jobPrepSection?.title?.[language] || 'Job & BCS Prep'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {jobCourses.map(course => <CourseCard key={course.id} {...course} provider={organizations.find(p => p.id === course.organizationId)} />)}
                    </div>
                </div>
            </section>
        )}

        {/* 15. Social Media Section */}
        {homepageConfig.socialMediaSection?.display && (
            <section className="px-1 py-6 md:py-10 bg-card">
                <div className="container mx-auto">
                    <div className="text-center mb-12 space-y-2">
                        <h2 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tight">{homepageConfig.socialMediaSection.title[language]}</h2>
                        <p className="text-muted-foreground font-medium">{homepageConfig.socialMediaSection.description[language]}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {homepageConfig.socialMediaSection.channels.map(channel => (
                            <Card key={channel.id} className="rounded-3xl border-primary/10 shadow-xl overflow-hidden group">
                                <CardHeader className="bg-muted/30 p-6 flex flex-row items-center justify-between border-b border-black/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-white shadow-sm">
                                            {channel.platform === 'YouTube' ? <Video className="text-red-600" /> : <Users className="text-blue-600" />}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm uppercase tracking-tight">{channel.name[language]}</h3>
                                            <p className="text-[10px] font-bold text-muted-foreground">{channel.handle}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="font-black text-[8px] uppercase tracking-widest">{channel.platform}</Badge>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center p-2 rounded-xl bg-muted/20">
                                            <p className="font-black text-xl text-primary leading-none">{channel.stat1_value}</p>
                                            <p className="text-[8px] font-bold uppercase text-muted-foreground mt-1">{channel.stat1_label[language]}</p>
                                        </div>
                                        <div className="text-center p-2 rounded-xl bg-muted/20">
                                            <p className="font-black text-xl text-primary leading-none">{channel.stat2_value}</p>
                                            <p className="text-[8px] font-bold uppercase text-muted-foreground mt-1">{channel.stat2_label[language]}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium mb-6 line-clamp-2">{channel.description[language]}</p>
                                    <Button asChild className="w-full rounded-xl font-black uppercase text-[10px] tracking-widest h-10">
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
            <section className="px-1 py-10 md:py-16 bg-gradient-to-br from-primary to-[#1a1a2e] text-white overflow-hidden rounded-[40px] m-4">
                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 text-center lg:text-left">
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95]">
                                    {homepageConfig.appPromo.title[language]}
                                </h2>
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
                            <div className="absolute inset-0 bg-white/5 rounded-full blur-[120px] scale-110" />
                            <div className="relative w-full max-w-xs md:max-w-md aspect-[4/5]">
                                <Image src={homepageConfig.appPromo.promoImageUrl} alt="App Interface" fill className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]" data-ai-hint={homepageConfig.appPromo.promoImageDataAiHint} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* 14. Partners Section */}
        {homepageConfig.partnersSection?.display && (
            <section className="px-1 py-10 md:py-14 border-t border-primary/5">
                <div className="container mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-10 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                        <div className="h-px w-12 bg-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">{homepageConfig.partnersSection.title[language]}</span>
                        <div className="h-px w-12 bg-muted-foreground" />
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
                        {homepageConfig.partnersSection.partners.map(p => (
                            <Link key={p.id} href={p.href} target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">
                                <Image src={p.logoUrl} alt={p.name} width={140} height={60} className="h-8 md:h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all" data-ai-hint={p.dataAiHint} />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        )}
    </div>
  );
}
