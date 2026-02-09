import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { getHomepageConfig, getUsers, getEnrollments, getInstructors, getCourses } from '@/lib/firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Rocket, Users, BookOpen, HelpCircle, BarChart3, Star, Zap, CheckCircle2 } from 'lucide-react';
import { FreeClassesSection } from '@/components/free-classes-section';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'How We Help You Become A Topper | RDC',
  description: 'Learn how Red Dot Classroom provides personalized support and resources to help students overcome their study challenges and succeed.',
};

const classButtons = [
    { label: 'Class 6', color: 'bg-red-100 text-red-600', href: '/courses?category=Class-6' },
    { label: 'Class 7', color: 'bg-blue-100 text-blue-600', href: '/courses?category=Class-7' },
    { label: 'Class 8', color: 'bg-purple-100 text-purple-600', href: '/courses?category=Class-8' },
    { label: 'Class 9', color: 'bg-green-100 text-green-600', href: '/courses?category=Class-9' },
    { label: 'Class 10', color: 'bg-yellow-100 text-yellow-700', href: '/courses?category=Class-10' },
    { label: 'Class 11-12', color: 'bg-indigo-100 text-indigo-600', href: '/courses?category=Class-11-12' },
    { label: 'Admission', color: 'bg-rose-100 text-rose-600', href: '/courses?category=Admission' },
    { label: 'BCS', color: 'bg-teal-100 text-teal-600', href: '/courses?category=BCS' },
    { label: 'Job Prep', color: 'bg-orange-100 text-orange-600', href: '/courses?category=Job+Prep' },
    { label: 'Skills', color: 'bg-emerald-100 text-emerald-600', href: '/courses?category=Skills' },
];

const featureIcons: Record<string, any> = {
    "Personalized Mentorship": Users,
    "Targeted Study Materials": BookOpen,
    "24/7 Doubt Clearing": HelpCircle,
    "Performance Tracking": BarChart3,
};

export default async function TopperPage() {
    const [config, allUsers, allEnrollments, allInstructors, allCourses] = await Promise.all([
        getHomepageConfig(),
        getUsers(),
        getEnrollments(),
        getInstructors(),
        getCourses({ status: 'Published' })
    ]);

    const sectionData = config?.topperPageSection;

    // --- Dynamic Stats Calculation ---
    const activeLearnersCount = allUsers.filter(u => u.role === 'Student').length;
    const expertMentorsCount = allInstructors.filter(i => i.status === 'Approved').length;
    
    const totalEnrollments = allEnrollments.length;
    const completedEnrollments = allEnrollments.filter(e => e.status === 'completed').length;
    const successRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 98;

    const coursesWithRatings = allCourses.filter(c => c.rating && c.rating > 0);
    const avgRating = coursesWithRatings.length > 0 
        ? (coursesWithRatings.reduce((sum, c) => sum + (c.rating || 0), 0) / coursesWithRatings.length).toFixed(1)
        : "4.9";

    const formatCount = (num: number) => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
        return num.toString();
    };

    if (!sectionData || !sectionData.display) {
        return (
             <div className="container mx-auto px-4 py-12">
                <div className="text-center">
                    <h1 className="font-headline text-4xl font-bold tracking-tight">Information Coming Soon</h1>
                    <p className="mt-4 text-lg text-muted-foreground">This page is currently under construction.</p>
                </div>
             </div>
        )
    }

  return (
    <div className="mesh-gradient min-h-screen pb-20">
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 overflow-hidden border-b border-white/10">
            <div className="absolute inset-0 bg-primary/5 -z-10" />
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            <Zap className="w-3.5 h-3.5" />
                            Academic Excellence
                        </div>
                        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-foreground">
                            {sectionData.title}
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            We bridge the gap between where you are and where you want to be. Discover our 4-pillar support system designed for Bangladeshi students.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <Button asChild size="lg" className="rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 h-14 px-8">
                                <Link href="#programs">Get Started Now</Link>
                            </Button>
                            <Button variant="outline" size="lg" className="rounded-xl font-black uppercase tracking-widest h-14 px-8 bg-white/50 backdrop-blur-sm">
                                Explore Features
                            </Button>
                        </div>
                    </div>
                    <div className="relative group flex justify-center">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] scale-110 opacity-50 group-hover:scale-125 transition-transform duration-700" />
                        <div className="relative z-10 w-full max-w-lg aspect-square">
                            <Image
                                src={sectionData.mainImageUrl}
                                alt={sectionData.title}
                                fill
                                className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint={sectionData.mainImageDataAiHint}
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Feature Grid */}
        <div className="container mx-auto px-4 -mt-12 relative z-20">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sectionData.cards.map((card, index) => {
                    const Icon = featureIcons[card.title] || Rocket;
                    return (
                        <Card key={card.id} className="p-6 md:p-8 glassmorphism-card border-white/40 bg-card group hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-2xl md:rounded-3xl">
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary w-fit group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="font-black text-lg md:text-xl leading-tight font-headline">{card.title}</h2>
                                    <p className="text-[13px] md:text-sm text-muted-foreground font-medium leading-relaxed">{card.description}</p>
                                </div>
                                <div className="pt-2">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                        Learn More <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
        
        {/* Programs Section */}
        <section id="programs" className="py-20 md:py-28 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-l-4 border-primary pl-6">
                    <div className="max-w-2xl text-left">
                        <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">Academic & Professional Roadmap</h2>
                        <p className="text-muted-foreground font-medium text-lg mt-2">Pick your class or goal to see how RDC transforms your learning experience.</p>
                    </div>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-black shadow-xl shadow-primary/20 rounded-xl px-10 h-14 uppercase tracking-widest text-sm">
                        <Link href="/courses">All Courses</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {classButtons.map((btn) => (
                        <Link key={btn.label} href={btn.href}>
                            <div className={cn(
                                "flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl shadow-sm border border-white/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-card backdrop-blur-xl group",
                                "hover:border-primary/50"
                            )}>
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black mb-4 group-hover:scale-110 transition-transform shadow-inner", btn.color)}>
                                    {btn.label.match(/\d+/) ? btn.label.match(/\d+/)?.[0] : btn.label[0]}
                                </div>
                                <span className="font-black text-[11px] md:text-sm uppercase tracking-widest text-center group-hover:text-primary transition-colors">{btn.label}</span>
                            </div>
                        </Link>
                    ))}
                     <Link href="/courses">
                        <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl shadow-xl border-2 border-primary/20 bg-primary text-white transition-all duration-300 hover:shadow-primary/40 hover:-translate-y-1 group">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                                <Rocket className="w-10 h-10" />
                            </div>
                            <span className="font-black text-[11px] md:text-sm uppercase tracking-widest">Join RDC</span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>

        {/* Benefits List */}
        <section className="bg-secondary/30 py-20 border-y border-white/20">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight">Why RDC Toppers Excel?</h2>
                        <ul className="space-y-4">
                            {[
                                "Personalized doubt clearing within minutes",
                                "Weekly performance analysis and goal setting",
                                "Exclusive access to topper secrets and shortcuts",
                                "Gamified learning environment with real rewards",
                                "Direct access to elite educators across Bangladesh"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-semibold text-gray-700 dark:text-gray-300">
                                    <div className="bg-green-500/10 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card p-8 rounded-3xl text-center space-y-2 border border-white/40 shadow-xl">
                            <p className="text-4xl font-black text-primary">{formatCount(activeLearnersCount)}</p>
                            <p className="text-xs font-black uppercase text-muted-foreground">Active Learners</p>
                        </div>
                        <div className="bg-card p-8 rounded-3xl text-center space-y-2 border border-white/40 shadow-xl">
                            <p className="text-4xl font-black text-accent">{successRate}%</p>
                            <p className="text-xs font-black uppercase text-muted-foreground">Success Rate</p>
                        </div>
                        <div className="bg-card p-8 rounded-3xl text-center space-y-2 border border-white/40 shadow-xl">
                            <p className="text-4xl font-black text-blue-600">{expertMentorsCount}</p>
                            <p className="text-xs font-black uppercase text-muted-foreground">Expert Mentors</p>
                        </div>
                        <div className="bg-card p-8 rounded-3xl text-center space-y-2 border border-white/40 shadow-xl">
                            <p className="text-4xl font-black text-yellow-500">{avgRating}/5</p>
                            <p className="text-xs font-black uppercase text-muted-foreground">User Rating</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {config.freeClassesSection?.display && (
            <section className="py-20 md:py-28">
                <FreeClassesSection sectionData={config.freeClassesSection} />
            </section>
        )}
    </div>
  );
}