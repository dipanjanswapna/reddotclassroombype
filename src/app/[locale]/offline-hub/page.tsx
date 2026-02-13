'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getHomepageConfig, getCourses, getBranches, getOrganizations } from '@/lib/firebase/firestore';
import { MapPin, Phone, MessageSquare, Zap, Target, Award, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CourseCard } from '@/components/course-card';
import { Course, Branch, Organization, HomepageConfig } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';

/**
 * @fileOverview Localized Offline Hub Page
 * Hind Siliguri font enforcement.
 * Standardized reduced spacing.
 */
export default function OfflineHubPage() {
    const { language } = useLanguage();
    const isBn = language === 'bn';
    const [config, setConfig] = React.useState<HomepageConfig | null>(null);
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [branches, setBranches] = React.useState<Branch[]>([]);
    const [organizations, setOrganizations] = React.useState<Organization[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            try {
                const [homepageConfig, allCourses, allBranches, allOrgs] = await Promise.all([
                    getHomepageConfig(),
                    getCourses({ status: 'Published' }),
                    getBranches(),
                    getOrganizations()
                ]);
                
                setConfig(homepageConfig);
                setBranches(allBranches);
                setOrganizations(allOrgs);
                setCourses(allCourses.filter(c => c.type === 'Offline' || c.type === 'Hybrid' || c.type === 'Exam'));
            } catch (error) {
                console.error("Failed to fetch offline hub data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <LoadingSpinner className="h-12 w-12" />
            </div>
        );
    }

    const offlineHubData = config?.offlineHubSection;

    const features = [
        { 
            icon: Zap, 
            title: t.multimedia_classrooms[language] || "Multimedia Classrooms", 
            desc: t.multimedia_desc[language] || "Digital smart boards and high-speed connectivity."
        },
        { 
            icon: Target, 
            title: t.top_educators[language] || "Top Educators", 
            desc: t.top_educators_desc[language] || "Direct access to the country's elite mentors." 
        },
        { 
            icon: Award, 
            title: t.exam_environment[language] || "Exam Environment", 
            desc: t.exam_environment_desc[language] || "Standardized testing conditions for peak performance." 
        },
    ];

    const heroImageUrl = offlineHubData?.heroImageUrl || "https://picsum.photos/seed/offline/600/400";
    const heroImageAiHint = offlineHubData?.heroImageDataAiHint || "modern classroom";

    return (
        <div className={cn("bg-gray-900 text-white min-h-screen px-1 overflow-x-hidden", isBn && "font-bengali")}>
            {/* Cinematic Hero */}
            <section className="relative pt-10 pb-12 md:pt-14 md:pb-16 overflow-hidden border-b border-white/5 px-0">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left"
                        >
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-5 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md">
                                <MapPin className="w-4 h-4" />
                                {t.offline_hubs_title[language] || "RDC Physical Centers"}
                            </div>
                            
                            <div className="space-y-5">
                                <h1 className={cn(
                                    "text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] uppercase drop-shadow-2xl",
                                    !isBn && "font-headline"
                                )}>
                                    {offlineHubData?.heroTitle?.[language] || "Red Dot Offline Hub"}
                                </h1>
                                <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                    {t.offline_hero_subtitle[language] || "Experience the fusion of digital excellence and physical interaction."}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                                <Button asChild size="lg" className="rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/40 h-14 px-10 bg-primary hover:bg-primary/90 text-white border-none group active:scale-95 transition-all text-xs">
                                    <Link href="#programs" className="flex items-center">
                                        {t.explore_programs[language] || "Explore Programs"}
                                        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="rounded-xl font-black uppercase tracking-widest h-14 px-10 border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm active:scale-95 transition-all text-xs">
                                    <Link href="#centers">{t.find_center[language] || "Find Center"}</Link>
                                </Button>
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative flex justify-center lg:justify-end"
                        >
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[120px] scale-110 opacity-40 animate-pulse" />
                            <div className="relative z-10 w-full max-w-[600px] aspect-[4/3] rounded-[30px] overflow-hidden border-8 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black group">
                                <Image
                                    src={heroImageUrl}
                                    alt="Offline Education Hub"
                                    fill
                                    className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                                    data-ai-hint={heroImageAiHint}
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white"><Sparkles className="w-5 h-5"/></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Premium Facility</p>
                                            <p className="text-xs font-bold text-white">Smart Classrooms across BD</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* High-Density Features */}
            <section className="py-8 bg-black/40 border-b border-white/5 px-0">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                        {features.map((f, i) => (
                            <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 group">
                                <div className="p-4 bg-primary/10 rounded-[20px] text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-xl border border-primary/5">
                                    <f.icon className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-xl uppercase tracking-tight leading-none text-white">{f.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section id="programs" className="py-10 md:py-14 px-0">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl text-left border-l-4 border-primary pl-6 mb-16">
                        <h2 className={cn(
                            "text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight",
                            !isBn && "font-headline"
                        )}>
                            {t.our_programs_title[language] || "Available Programs"}
                        </h2>
                        <p className="text-gray-400 font-medium text-lg mt-2">{t.our_programs_subtitle[language] || "Pick your path to academic excellence."}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {courses.length > 0 ? courses.map((course) => {
                            const provider = organizations.find(p => p.id === course.organizationId);
                            return <CourseCard key={course.id} {...course} provider={provider} />
                        }) : (
                            <div className="col-span-full text-center py-32 text-gray-500 font-black uppercase tracking-widest text-xs border-2 border-dashed border-white/5 rounded-[30px] bg-white/[0.02]">
                                No offline courses available at the moment
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Branch Directory */}
            <section id="centers" className="py-10 md:py-14 bg-black/20 px-0">
                <div className="container mx-auto px-4">
                    <div className="text-left md:text-center mb-20 space-y-4 border-l-4 border-primary md:border-none pl-6 md:pl-0">
                        <h2 className={cn(
                            "text-3xl md:text-5xl font-black tracking-tight uppercase",
                            !isBn && "font-headline"
                        )}>
                            {t.offline_hubs_title[language] || "Our Offline Hubs"}
                        </h2>
                        <p className="text-gray-400 font-medium text-lg max-w-2xl mx-auto">
                            {t.offline_hubs_subtitle[language] || "Visit us at any of our state-of-the-art locations."}
                        </p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {branches.length > 0 ? branches.map((branch) => (
                            <Card key={branch.id} className="p-8 border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-primary/30 transition-all duration-500 group rounded-[30px] flex flex-col shadow-2xl">
                                <div className="space-y-6 flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3.5 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <Badge variant="outline" className="border-white/10 text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 bg-white/5 px-3 py-1">
                                            {branch.branchCode || 'ACTIVE'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <h3 className="font-black text-2xl leading-none group-hover:text-primary transition-colors uppercase tracking-tight text-white">{branch.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium line-clamp-3 leading-relaxed">{branch.address}</p>
                                    </div>
                                </div>
                                <div className="pt-8 flex flex-col gap-3">
                                    <Button variant="outline" className="w-full justify-start rounded-xl border-white/10 bg-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/20 gap-3 font-black text-[10px] uppercase tracking-widest h-11 transition-all">
                                        <Phone className="w-4 h-4" /> {branch.contactPhone}
                                    </Button>
                                    <Button asChild variant="link" className="p-0 h-auto self-start text-primary font-black uppercase tracking-widest text-[9px] group-hover:gap-2 transition-all mt-2">
                                        <Link href="#" className="flex items-center">
                                            Get Directions <ArrowRight className="ml-1.5 w-3 h-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        )) : (
                            <div className="col-span-full text-center py-20 text-gray-500 font-black uppercase tracking-widest text-[10px] border border-dashed border-white/10 rounded-[25px]">
                                Offline centers are currently being updated
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-12 md:py-20 px-0">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-[40px] overflow-hidden p-10 md:p-24 bg-gradient-to-br from-primary via-primary/90 to-black text-white shadow-2xl border border-white/10"
                    >
                        <div className="absolute top-0 right-0 -m-20 w-96 h-96 bg-white/10 rounded-full blur-[120px] opacity-50" />
                        <div className="absolute bottom-0 left-0 -m-20 w-96 h-96 bg-black/40 rounded-full blur-[120px] opacity-50" />
                        
                        <div className="relative z-10 max-w-3xl space-y-8 text-left">
                            <div className="inline-block p-5 bg-white/10 backdrop-blur-md rounded-3xl shadow-inner border border-white/20">
                                <MessageSquare className="w-12 h-12 text-white" />
                            </div>
                            <div className="space-y-4">
                                <h2 className={cn(
                                    "text-4xl md:text-6xl font-black tracking-tight leading-[0.95] uppercase",
                                    !isBn && "font-headline"
                                )}>
                                    {t.have_a_question[language] || "Have a Question?"}
                                </h2>
                                <p className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed max-w-xl">
                                    {t.talk_to_advisors[language] || "Talk to our student advisors anytime."}
                                </p>
                            </div>
                            <div className="pt-6 flex flex-col sm:flex-row items-center gap-5">
                                <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest h-16 px-12 bg-white text-primary hover:bg-gray-100 shadow-2xl border-none active:scale-95 transition-all text-sm">
                                    <a href="tel:01641035736">
                                        <Phone className="mr-3 h-5 w-5 fill-current" />
                                        {t.call_now[language]}
                                    </a>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest h-16 px-12 border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl active:scale-95 transition-all text-sm">
                                    <a href="https://wa.me/8801641035736" target="_blank" rel="noopener noreferrer">
                                        <MessageSquare className="mr-3 h-5 w-5" />
                                        {t.message_whatsapp[language]}
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}