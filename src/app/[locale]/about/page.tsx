import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { Facebook, Linkedin, Twitter, ExternalLink, Target, Eye, Users, Award, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'About Us | RED DOT CLASSROOM (RDC)',
  description: "Learn more about RED DOT CLASSROOM (RDC)'s mission, vision, and the team behind our online learning platform.",
};

const socialIconMap: Record<string, any> = {
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    external: ExternalLink
};

/**
 * @fileOverview Localized About Us Page
 * Premium storytelling design with Hind Siliguri font.
 */
export default async function AboutPage({ params }: { params: { locale: string } }) {
    const awaitedParams = await params;
    const language = awaitedParams.locale as 'en' | 'bn';
    const isBn = language === 'bn';
    const config = await getHomepageConfig();
    const aboutSection = config?.aboutUsSection;

    if (!aboutSection || !aboutSection.display) {
        return (
             <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="font-headline text-4xl font-bold tracking-tight">About RED DOT CLASSROOM</h1>
                <p className="mt-4 text-lg text-muted-foreground">Information is currently being updated.</p>
             </div>
        )
    }

  return (
    <div className={cn("bg-background min-h-screen pb-20 px-1", isBn && "font-bengali")}>
        {/* Modern Header Section */}
        <section className="relative py-16 md:py-24 overflow-hidden border-b border-white/5 bg-muted/30 rounded-b-[40px]">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
            <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20 shadow-sm">
                    <Users className="w-3.5 h-3.5" />
                    {t.our_identity[language]}
                </div>
                <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase max-w-4xl mx-auto">
                    {aboutSection.title?.[language] || aboutSection.title?.en || 'About Our Mission'}
                </h1>
                <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                    {aboutSection.subtitle?.[language] || aboutSection.subtitle?.en || "Building the next generation of leaders through accessible and interactive education across Bangladesh."}
                </p>
            </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <CardItem 
                        icon={Target} 
                        title={t.our_mission[language]} 
                        desc={isBn ? "বাংলাদেশের প্রতিটি শিক্ষার্থীর কাছে বিশ্বমানের শিক্ষা পৌঁছে দিয়ে শিক্ষাব্যবস্থাকে গণতান্ত্রিক করা।" : "To democratize quality education in Bangladesh by providing world-class learning resources to every student."} 
                        color="primary"
                    />
                    <CardItem 
                        icon={Eye} 
                        title={t.our_vision[language]} 
                        desc={isBn ? "দক্ষিণ এশিয়ার অন্যতম সেরা হাইব্রিড লার্নিং প্ল্যাটফর্ম হিসেবে নিজেদের প্রতিষ্ঠিত করা।" : "To become the leading hybrid education ecosystem in South Asia, blending digital and physical learning."} 
                        color="accent"
                    />
                    <CardItem 
                        icon={Award} 
                        title={t.core_values[language]} 
                        desc={isBn ? "সততা, উদ্ভাবন এবং শিক্ষার্থী-বান্ধব চিন্তা আমাদের প্রতিটি কাজের কেন্দ্রে থাকে।" : "Integrity, innovation, and student-first thinking are at the heart of everything we do at RDC."} 
                        color="blue"
                    />
                </div>
            </div>
        </section>

        {/* Visionary Team Section */}
        <section className="py-16 md:py-24 bg-muted/10 rounded-[40px] border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-l-4 border-primary pl-6 text-left">
                    <div className="max-w-2xl">
                        <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase">{t.visionary_team[language]}</h2>
                        <p className="text-muted-foreground font-medium text-lg mt-2">{isBn ? 'PRANGONS ECOSYSTEM-কে এগিয়ে নিয়ে যাওয়ার কারিগরদের সাথে পরিচিত হন।' : 'Meet the dedicated individuals driving the PRANGONS ECOSYSTEM forward.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {aboutSection.teamMembers?.map(member => {
                        const socialLinks = member.socialLinks.filter(l => l.platform !== 'external');
                        return (
                            <div key={member.id} className="relative group aspect-[4/5] rounded-[30px] overflow-hidden shadow-2xl border-4 border-white/10 bg-black">
                                <Image
                                    src={member.imageUrl}
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                    data-ai-hint={member.dataAiHint}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                                
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="relative p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white text-left">
                                        <div className="space-y-1">
                                            <h3 className="font-black text-lg uppercase tracking-tight leading-none">{member.name}</h3>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{member.title}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-5">
                                            {socialLinks.map((link, index) => {
                                                const Icon = socialIconMap[link.platform] || ExternalLink;
                                                return (
                                                    <Link 
                                                        key={index} 
                                                        href={link.url} 
                                                        target="_blank" 
                                                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>

        {/* Brand Philosophy */}
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 text-center max-w-3xl">
                <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight mb-8">{t.philosophy[language]}</h2>
                <blockquote className="text-xl md:text-3xl font-medium italic text-muted-foreground leading-relaxed tracking-tight">
                    {isBn 
                        ? '"আমরা শুধু কোর্স করাই না; আমরা ভবিষ্যৎ গড়ি। রেড ডট ক্লাসরুম একটি অ্যাপের চেয়েও বেশি—এটি বাংলাদেশের প্রতিটি স্বপ্নবাজ শিক্ষার্থীর প্রতি আমাদের একটি অঙ্গীকার।"'
                        : '"We don\'t just teach courses; we build futures. Red Dot Classroom is more than an app—it\'s a commitment to every dreamer in Bangladesh who wants to achieve something extraordinary."'
                    }
                </blockquote>
                <div className="mt-10 flex justify-center">
                    <div className="h-1.5 w-24 bg-primary rounded-full shadow-lg shadow-primary/20" />
                </div>
            </div>
        </section>
    </div>
  );
}

function CardItem({ icon: Icon, title, desc, color }: any) {
    const colorClasses = {
        primary: "bg-primary/10 text-primary group-hover:bg-primary",
        accent: "bg-accent/10 text-accent group-hover:bg-accent",
        blue: "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500",
    } as any;

    return (
        <div className="p-8 rounded-[30px] bg-card border border-white/10 shadow-xl space-y-5 text-left group hover:border-primary/30 transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:text-white transition-all shadow-inner", colorClasses[color])}>
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="font-black uppercase tracking-tight text-2xl">{title}</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">{desc}</p>
        </div>
    )
}