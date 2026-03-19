
import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { getHomepageConfig, getUsers, getEnrollments, getInstructors, getCourses } from '@/lib/firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Rocket, Users, BookOpen, HelpCircle, BarChart3, Star, Zap, CheckCircle2 } from 'lucide-react';
import { FreeClassesSection } from '@/components/free-classes-section';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'From Struggler to Topper | RDC Academic Support',
  description: 'Learn how Red Dot Classroom provides personalized support and resources to help students succeed.',
};

const classButtons = [
    { label: 'Class 6', color: 'bg-red-50 text-red-600 border-red-100', href: '/courses?category=Class-6' },
    { label: 'Class 7', color: 'bg-blue-50 text-blue-600 border-blue-100', href: '/courses?category=Class-7' },
    { label: 'Class 8', color: 'bg-purple-50 text-purple-600 border-purple-100', href: '/courses?category=Class-8' },
    { label: 'Class 9', color: 'bg-green-50 text-green-600 border-green-100', href: '/courses?category=Class-9' },
    { label: 'Class 10', color: 'bg-yellow-50 text-yellow-700 border-yellow-100', href: '/courses?category=Class-10' },
    { label: 'Class 11-12', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', href: '/courses?category=Class-11-12' },
    { label: 'Admission', color: 'bg-rose-50 text-rose-600 border-rose-100', href: '/courses?category=Admission' },
    { label: 'Job Prep', color: 'bg-orange-50 text-orange-600 border-orange-100', href: '/courses?category=Job+Prep' },
];

const featureIcons: Record<string, any> = {
    "Personalized Mentorship": Users,
    "Targeted Study Materials": BookOpen,
    "24/7 Doubt Clearing": HelpCircle,
    "Performance Tracking": BarChart3,
};

/**
 * @fileOverview Localized Topper Page (Strugglers Studies)
 * Implements Geometric UI with rounded-xl corners and Title Case.
 */
export default async function TopperPage({ params }: { params: { locale: string } }) {
    const awaitedParams = await params;
    const language = awaitedParams.locale as 'en' | 'bn';
    const isBn = language === 'bn';
    const config = await getHomepageConfig();
    const sectionData = config?.topperPageSection;

    const [allUsers, allEnrollments, allInstructors, allCourses] = await Promise.all([
        getUsers(),
        getEnrollments(),
        getInstructors(),
        getCourses({ status: 'Published' })
    ]);

    const activeLearnersCount = allUsers.filter(u => u.role === 'Student').length;
    const expertMentorsCount = allInstructors.filter(i => i.status === 'Approved').length;
    const successRate = 98; 

    const getT = (key: string) => t[key]?.[language] || t[key]?.['en'] || key;

    if (!sectionData || !sectionData.display) {
        return (
             <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="font-headline text-4xl font-bold tracking-tight">Curriculum Update in Progress</h1>
                <p className="mt-4 text-lg text-muted-foreground">We are refining our success roadmap. Please check back later.</p>
             </div>
        )
    }

  return (
    <div className={cn("bg-background min-h-screen pb-20 px-1", isBn && "font-bengali")}>
        {/* Modern Header Section */}
        <section className="relative py-12 md:py-20 overflow-hidden border-b border-border bg-muted/30 rounded-b-[40px] px-0">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm">
                            <Zap className="w-3.5 h-3.5" />
                            Elite Academic Roadmap
                        </div>
                        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none uppercase text-left">
                            {sectionData.title}
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0 text-left">
                            {isBn 
                                ? 'আমরা বিশ্বাস করি প্রতিটি শিক্ষার্থীর মধ্যেই একজন টপার লুকিয়ে থাকে। আমাদের বিশেষ ৪-স্তরের গাইডেন্স সিস্টেম আপনাকে আপনার লক্ষ্যে পৌঁছাতে সাহায্য করবে।'
                                : "We bridge the gap between where you are and where you want to be. Discover our 4-pillar support system designed for peak performance."
                            }
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                            <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 h-14 px-10">
                                <Link href="#programs">Get Started Now</Link>
                            </Button>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest h-14 px-10 border-border bg-white hover:bg-muted">
                                Watch Success Stories
                            </Button>
                        </div>
                    </div>
                    <div className="relative group flex justify-center">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] scale-110 opacity-50 transition-transform duration-700 group-hover:scale-125" />
                        <div className="relative z-10 w-full max-w-lg aspect-square">
                            <Image
                                src={sectionData.mainImageUrl}
                                alt="Student Success"
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

        {/* Feature Cards Grid */}
        <div className="container mx-auto px-4 -mt-10 relative z-20">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sectionData.cards.map((card) => {
                    const Icon = featureIcons[card.title] || Rocket;
                    return (
                        <Card key={card.id} className="p-8 border-border bg-card shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 rounded-[25px] group">
                            <div className="space-y-6">
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary w-fit group-hover:bg-primary group-hover:text-white transition-all">
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <h3 className="font-black text-xl uppercase tracking-tight font-headline">{card.title}</h3>
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{card.description}</p>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
        
        {/* Academic Categories Section */}
        <section id="programs" className="py-16 md:py-24 px-0">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-l-4 border-primary pl-6 text-left">
                    <div className="max-w-2xl">
                        <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-tight">Pick your academic path</h2>
                        <p className="text-muted-foreground font-medium text-lg mt-2">{isBn ? 'আপনার প্রয়োজনীয় ক্লাস বা লক্ষ্য অনুযায়ী সঠিক কোর্সটি বেছে নিন।' : 'Select your class or goal to see how RDC transforms your learning journey.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {classButtons.map((btn) => (
                        <Link key={btn.label} href={btn.href} className="group">
                            <div className={cn(
                                "flex flex-col items-center justify-center p-8 rounded-[30px] shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card text-center",
                                btn.color
                            )}>
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-inner flex items-center justify-center text-3xl font-black mb-4 group-hover:scale-110 transition-transform">
                                    {btn.label.match(/\d+/) ? btn.label.match(/\d+/)?.[0] : btn.label[0]}
                                </div>
                                <span className="font-black text-xs md:text-sm uppercase tracking-widest text-foreground">{btn.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>

        {/* Global Statistics Section */}
        <section className="bg-muted/30 py-16 md:py-20 rounded-[40px] border-y border-white/5 px-0">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 text-left">
                        <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-tight">Why RDC Toppers Excel?</h2>
                        <div className="space-y-4">
                            {[
                                "Personalized 1-on-1 mentorship sessions",
                                "Adaptive learning technology for each student",
                                "Weekly performance reports for parents",
                                "Gamified learning with real-world rewards",
                                "Direct access to top 1% faculty members"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500 group-hover:text-white transition-all">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 group-hover:text-white" />
                                    </div>
                                    <p className="font-bold text-gray-700 dark:text-gray-300 text-sm md:text-base">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <StatCard label="Active Learners" value={`${(activeLearnersCount/1000).toFixed(1)}k+`} color="bg-blue-500" />
                        <StatCard label="Success Rate" value="98%" color="bg-primary" />
                        <StatCard label="Elite Mentors" value={expertMentorsCount.toString()} color="bg-accent" />
                        <StatCard label="Course Rating" value="4.9/5" color="bg-yellow-500" />
                    </div>
                </div>
            </div>
        </section>

        {config.freeClassesSection?.display && (
            <section className="py-16 md:py-24 px-0">
                <FreeClassesSection sectionData={config.freeClassesSection} />
            </section>
        )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <Card className="p-8 rounded-[30px] text-center border-none shadow-xl bg-card hover:scale-105 transition-transform">
            <p className={cn("text-3xl md:text-4xl font-black tracking-tighter mb-1", color.replace('bg-', 'text-'))}>{value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        </Card>
    )
}
