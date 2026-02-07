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
             <div className="container mx-auto px-4 py-12">
                <div className="text-center">
                    <h1 className="font-headline text-4xl font-bold tracking-tight">About RED DOT CLASSROOM</h1>
                    <p className="mt-4 text-lg text-muted-foreground">Information coming soon.</p>
                </div>
             </div>
        )
    }

  return (
    <div className="bg-background">
        <section className="bg-secondary/50 py-16">
            <div className="container mx-auto px-4 text-center">
                <h1 className="font-headline text-4xl font-bold tracking-tight">{aboutSection.title.en || 'About Us'}</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {aboutSection.subtitle.en || "Meet the team behind our platform."}
                </p>
            </div>
        </section>

        <section className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
                {aboutSection.teamMembers.map(member => {
                    const externalLink = member.socialLinks.find(l => l.platform === 'external');
                    const socialLinks = member.socialLinks.filter(l => l.platform !== 'external');
                    return (
                        <div key={member.id} className="relative group aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                            <Image
                                src={member.imageUrl}
                                alt={member.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={member.dataAiHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="relative p-4 rounded-xl bg-black/20 backdrop-blur-lg border border-white/10 shadow-lg text-white">
                                    <div>
                                        <h3 className="font-bold text-lg">{member.name}</h3>
                                        <p className="text-sm opacity-90">{member.title}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4">
                                        {socialLinks.map((link, index) => {
                                            const Icon = socialIconMap[link.platform] || ExternalLink;
                                            return (
                                                <Link key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">
                                                    <Icon className="w-5 h-5" />
                                                </Link>
                                            )
                                        })}
                                    </div>
                                    {externalLink && (
                                        <Link href={externalLink.url} target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20">
                                            <ExternalLink className="w-5 h-5" />
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
