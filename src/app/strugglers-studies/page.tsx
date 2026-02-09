import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Rocket, Users, BookOpen, HelpCircle, BarChart3 } from 'lucide-react';
import { FreeClassesSection } from '@/components/free-classes-section';

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
    const config = await getHomepageConfig();
    const sectionData = config?.topperPageSection;

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
    <div className="mesh-gradient">
        <div className="container mx-auto px-4 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight leading-tight text-foreground">{sectionData.title}</h1>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {sectionData.cards.map(card => {
                            const Icon = featureIcons[card.title] || Rocket;
                            return (
                                <Card key={card.id} className="p-6 glassmorphism-card border-white/30 bg-white/40 group hover:border-primary/50 transition-all duration-300">
                                    <div className="flex items-start gap-4 mb-3">
                                        <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h2 className="font-black text-lg leading-tight pt-1">{card.title}</h2>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">{card.description}</p>
                                </Card>
                            )
                        })}
                    </div>
                </div>
                <div className="hidden lg:block relative group">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-110 opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
                    <Image
                        src={sectionData.mainImageUrl}
                        alt={sectionData.title}
                        width={600}
                        height={600}
                        className="object-contain relative z-10 drop-shadow-2xl"
                        data-ai-hint={sectionData.mainImageDataAiHint}
                    />
                </div>
            </div>
        </div>
        
        <section className="bg-secondary/30 py-16 border-y border-white/20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="font-headline text-3xl font-black tracking-tight">Academic & Professional Programs</h2>
                        <p className="text-muted-foreground font-medium text-lg">Select your category to start your journey with RDC</p>
                    </div>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-black shadow-xl shadow-primary/20 rounded-xl">
                        <Link href="/courses">Explore All Courses</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {classButtons.map((btn) => (
                        <Link key={btn.label} href={btn.href}>
                            <div className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl shadow-sm border border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/60 backdrop-blur-md group",
                                "hover:border-primary/50"
                            )}>
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mb-3 group-hover:scale-110 transition-transform shadow-inner", btn.color)}>
                                    {btn.label.match(/\d+/) ? btn.label.match(/\d+/)?.[0] : btn.label[0]}
                                </div>
                                <span className="font-black text-sm uppercase tracking-wider text-center">{btn.label}</span>
                            </div>
                        </Link>
                    ))}
                     <Link href="/courses">
                        <div className="flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg border-2 border-primary/20 bg-primary text-white transition-all duration-300 hover:shadow-primary/30 hover:-translate-y-1 group">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform">
                                <Rocket className="w-8 h-8" />
                            </div>
                            <span className="font-black text-sm uppercase tracking-widest">Join Now</span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>

        {config.freeClassesSection?.display && (
            <section className="py-16">
                <FreeClassesSection sectionData={config.freeClassesSection} />
            </section>
        )}
    </div>
  );
}