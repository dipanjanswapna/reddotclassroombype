import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { Facebook, Linkedin, Twitter, ExternalLink, Target, Eye, Users, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'About Us | RED DOT CLASSROOM (RDC)',
  description: "Learn more about RED DOT CLASSROOM (RDC)'s mission, vision, and the team behind our online learning platform, powered by PRANGONS ECOSYSTEM.",
};

const socialIconMap: Record<string, any> = {
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    external: ExternalLink
};

export default async function AboutPage() {
    const config = await getHomepageConfig();
    const aboutSection = config?.aboutUsSection;

    if (!aboutSection || !aboutSection.display) {
        return (
             <div className="container mx-auto px-4 py-20">
                <div className="text-center">
                    <h1 className="font-headline text-4xl font-bold tracking-tight">About RED DOT CLASSROOM</h1>
                    <p className="mt-4 text-lg text-muted-foreground">Information is currently being updated. Please check back soon.</p>
                </div>
             </div>
        )
    }

  return (
    <div className="bg-background min-h-screen">
        {/* Modern Header Section */}
        <section className="relative py-16 md:py-24 overflow-hidden border-b border-white/5 bg-muted/30">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
            <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
                    <Users className="w-3.5 h-3.5" />
                    Our Identity
                </div>
                <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase max-w-4xl mx-auto">
                    {aboutSection.title?.en || 'About Our Mission'}
                </h1>
                <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                    {aboutSection.subtitle?.en || "Building the next generation of leaders through accessible and interactive education across Bangladesh."}
                </p>
            </div>
        </section>

        {/* Mission & Vision Mini Section */}
        <section className="py-12 border-b border-white/5">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-[20px] bg-card border border-white/10 shadow-xl space-y-4 group hover:border-primary/30 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Target className="w-6 h-6" />
                        </div>
                        <h3 className="font-black uppercase tracking-tight text-xl">Our Mission</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">To democratize quality education in Bangladesh by providing world-class learning resources to every student, regardless of their location.</p>
                    </div>
                    <div className="p-8 rounded-[20px] bg-card border border-white/10 shadow-xl space-y-4 group hover:border-primary/30 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                            <Eye className="w-6 h-6" />
                        </div>
                        <h3 className="font-black uppercase tracking-tight text-xl">Our Vision</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">To become the leading hybrid education ecosystem in South Asia, where digital and physical learning blend seamlessly for peak student performance.</p>
                    </div>
                    <div className="p-8 rounded-[20px] bg-card border border-white/10 shadow-xl space-y-4 group hover:border-primary/30 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Award className="w-6 h-6" />
                        </div>
                        <h3 className="font-black uppercase tracking-tight text-xl">Core Values</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">Integrity, innovation, and student-first thinking are at the heart of everything we do at Red Dot Classroom.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Team Section - High Density Grid */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-l-4 border-primary pl-6">
                    <div className="max-w-2xl text-left">
                        <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase">The Visionary Team</h2>
                        <p className="text-muted-foreground font-medium text-lg mt-2">Meet the dedicated individuals driving the PRANGONS ECOSYSTEM forward.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {aboutUsSection.teamMembers?.map(member => {
                        const externalLink = member.socialLinks.find(l => l.platform === 'external');
                        const socialLinks = member.socialLinks.filter(l => l.platform !== 'external');
                        return (
                            <div key={member.id} className="relative group aspect-[4/5] rounded-[20px] overflow-hidden shadow-2xl border-4 border-white/5 bg-black">
                                <Image
                                    src={member.imageUrl}
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                    data-ai-hint={member.dataAiHint}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                                
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="relative p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white">
                                        <div className="space-y-1">
                                            <h3 className="font-black text-lg md:text-xl uppercase tracking-tight leading-none">{member.name}</h3>
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
                                                        rel="noopener noreferrer" 
                                                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                        
                                        {externalLink && (
                                            <Link 
                                                href={externalLink.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/20 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4 text-white/60" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>

        {/* Brand Philosophy Section */}
        <section className="py-20 bg-primary/5">
            <div className="container mx-auto px-4 text-center max-w-3xl">
                <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight mb-6">Our Philosophy</h2>
                <blockquote className="text-xl md:text-2xl font-medium italic text-muted-foreground leading-relaxed">
                    "We don't just teach courses; we build futures. Red Dot Classroom is more than an app—it's a commitment to every dreamer in Bangladesh who wants to achieve something extraordinary."
                </blockquote>
                <div className="mt-8 flex justify-center">
                    <div className="h-1 w-20 bg-primary rounded-full" />
                </div>
            </div>
        </section>
    </div>
  );
}
