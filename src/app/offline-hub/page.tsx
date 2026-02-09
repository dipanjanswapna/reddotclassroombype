
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getHomepageConfig, getCourses, getBranches, getOrganizations } from '@/lib/firebase/firestore';
import { ArrowRight, CheckCircle2, MapPin, Phone, MessageSquare, Zap, Target, Award } from 'lucide-react';
import Link from 'next/link';
import { CourseCard } from '@/components/course-card';
import { Course, Branch, Organization } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import { cn } from '@/lib/utils';

export default function OfflineHubPage() {
    const [config, setConfig] = React.useState<any>(null);
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
                // Filter for offline/hybrid courses
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
    const language = 'en'; // Standardizing on high-density English UI for this view

    const features = [
        { icon: Zap, title: "Multimedia Classrooms", desc: "Digital smart boards and high-speed connectivity." },
        { icon: Target, title: "Top Educators", desc: "Direct access to the country's elite mentors." },
        { icon: Award, title: "Exam Environment", desc: "Standardized testing conditions for peak performance." },
    ];

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            {/* Cinematic Hero */}
            <section className="relative pt-32 pb-16 md:pb-24 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6 text-center lg:text-left"
                        >
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                <MapPin className="w-3.5 h-3.5" />
                                RDC Physical Centers
                            </div>
                            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight uppercase">
                                Red Dot <span className="text-primary">Offline Hub</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                Experience the fusion of digital excellence and physical interaction. Learn directly from the experts in an environment designed for elite performance.
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <Button asChild size="lg" className="rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 h-14 px-8 bg-primary hover:bg-primary/90 text-white">
                                    <Link href="#programs">Explore Programs</Link>
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-xl font-black uppercase tracking-widest h-14 px-8 border-white/20 bg-white/5 hover:bg-white/10 text-white">
                                    Find a Center
                                </Button>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative flex justify-center"
                        >
                            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] scale-110 opacity-50" />
                            <div className="relative z-10 w-full max-w-lg aspect-square">
                                <Image
                                    src="https://picsum.photos/seed/offline/800/800"
                                    alt="Offline Education Hub"
                                    fill
                                    className="object-contain drop-shadow-2xl rounded-3xl border-4 border-white/5"
                                    data-ai-hint="modern classroom"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* High-Density Features */}
            <section className="py-12 bg-black/20 border-b border-white/5">
                <div className="container mx-auto px-4">
                    <div className="grid sm:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg uppercase tracking-tight">{f.title}</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dynamic Programs Grid */}
            <section id="programs" className="py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl text-left border-l-4 border-primary pl-6 mb-12">
                        <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase">
                            {offlineHubData?.programsTitle?.[language] || "Available Programs"}
                        </h2>
                        <p className="text-gray-400 font-medium text-lg mt-2">Pick your path to academic excellence in our physical classrooms.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-0 md:gap-y-8">
                        {courses.length > 0 ? courses.map((course) => {
                            const provider = organizations.find(p => p.id === course.organizationId);
                            return <CourseCard key={course.id} {...course} provider={provider} />
                        }) : (
                            <p className="col-span-full text-center py-20 text-gray-500 font-medium border border-white/5 rounded-2xl bg-white/5">No offline courses available at the moment.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Branch Directory */}
            <section className="py-20 md:py-28 bg-black/40">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase">
                            {offlineHubData?.centersTitle?.[language] || "Our Offline Hubs"}
                        </h2>
                        <p className="text-gray-400 font-medium text-lg max-w-2xl mx-auto">Visit us at any of our state-of-the-art locations across Bangladesh.</p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {branches.map((branch) => (
                            <Card key={branch.id} className="p-6 border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group rounded-2xl">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <Badge variant="outline" className="border-white/10 text-[10px] uppercase font-black tracking-widest text-gray-500">
                                            {branch.branchCode || 'Active'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">{branch.name}</h3>
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{branch.address}</p>
                                    </div>
                                    <div className="pt-4 flex flex-col gap-3">
                                        <Button variant="outline" className="w-full justify-start rounded-xl border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 gap-3 font-bold text-xs h-10">
                                            <Phone className="w-3.5 h-3.5" /> {branch.contactPhone}
                                        </Button>
                                        <Button asChild variant="link" className="p-0 h-auto self-start text-primary font-black uppercase tracking-tighter text-[10px] group-hover:gap-2 transition-all">
                                            <Link href="#">Get Directions <ArrowRight className="ml-1 w-3 h-3" /></Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* High-Impact Contact Section */}
            {offlineHubData?.contactSection?.display && (
                <section className="py-20 md:py-28">
                    <div className="container mx-auto px-4">
                        <div className="relative rounded-3xl overflow-hidden p-8 md:p-16 bg-gradient-to-br from-primary via-primary/80 to-black text-white shadow-2xl">
                            <div className="absolute top-0 right-0 -m-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 -m-20 w-64 h-64 bg-black/20 rounded-full blur-3xl" />
                            
                            <div className="relative z-10 max-w-3xl space-y-6">
                                <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-4">
                                    <MessageSquare className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase">
                                    {offlineHubData.contactSection.title[language] || "Ready to Join RDC Offline?"}
                                </h2>
                                <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed max-w-xl">
                                    {offlineHubData.contactSection.subtitle[language] || "Connect with our expert advisors to find the perfect center and batch for your academic goals."}
                                </p>
                                <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
                                    <Button asChild size="lg" className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest h-14 px-10 bg-white text-primary hover:bg-white/90 shadow-xl">
                                        <a href={`tel:${offlineHubData.contactSection.callButtonNumber}`}>
                                            <Phone className="mr-3 h-5 w-5" />
                                            Call Support
                                        </a>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest h-14 px-10 border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm">
                                        <a href={`https://wa.me/${offlineHubData.contactSection.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                            <MessageSquare className="mr-3 h-5 w-5" />
                                            WhatsApp Us
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
