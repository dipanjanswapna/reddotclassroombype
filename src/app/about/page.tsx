
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { Facebook, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About Us | RED DOT CLASSROOM (RDC)',
  description: "Learn more about RED DOT CLASSROOM (RDC)'s mission, vision, and the team behind our online learning platform.",
};

const socialIconMap = {
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
             <div className="container mx-auto px-4 md:px-8 py-12">
                <div className="text-center">
                    <h1 className="font-headline text-4xl font-bold tracking-tight">About RED DOT CLASSROOM</h1>
                    <p className="mt-4 text-lg text-muted-foreground">Information coming soon.</p>
                </div>
             </div>
        )
    }

  return (
    <div className="bg-background min-h-screen">
        <section className="bg-secondary/20 py-16 border-b border-primary/5">
            <div className="container mx-auto px-4 md:px-8 text-center">
                <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">{aboutSection.title.en || 'About Us'}</h1>
                <div className="h-1.5 w-24 bg-primary mx-auto mt-6 rounded-full shadow-md" />
                <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                    {aboutSection.subtitle.en || "Meet the team behind our platform."}
                </p>
            </div>
        </section>

        <section className="container mx-auto px-4 md:px-8 py-10 md:py-14 max-w-full">
            <div className="mb-12 text-center md:text-left">
                <h2 className="font-headline text-3xl font-black uppercase tracking-tight">The Leadership Team</h2>
                <div className="h-1.5 w-24 bg-primary mt-4 rounded-full mx-auto md:mx-0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-center">
                {aboutSection.teamMembers.map(member => {
                    const externalLink = member.socialLinks.find(l => l.platform === 'external');
                    const socialLinks = member.socialLinks.filter(l => l.platform !== 'external');
                    return (
                        <div key={member.id} className="relative group aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl border border-primary/5 bg-card">
                            <Image
                                src={member.imageUrl}
                                alt={member.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                data-ai-hint={member.dataAiHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="relative p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white">
                                    <div className="space-y-1">
                                        <h3 className="font-black text-lg uppercase tracking-tight leading-tight">{member.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{member.title}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-5">
                                        {socialLinks.map((link, index) => {
                                            const Icon = (socialIconMap as any)[link.platform] || ExternalLink;
                                            return (
                                                <Link key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-primary transition-all group/icon">
                                                    <Icon className="w-4 h-4 text-white group-hover/icon:scale-110" />
                                                </Link>
                                            )
                                        })}
                                    </div>
                                    {externalLink && (
                                        <Link href={externalLink.url} target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors">
                                            <ExternalLink className="w-4 h-4 text-white" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    </div>
  );
}
