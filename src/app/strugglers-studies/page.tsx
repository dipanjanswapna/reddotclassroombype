import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Rocket } from 'lucide-react';
import { FreeClassesSection } from '@/components/free-classes-section';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'How We Help You Become A Topper | RDC',
  description: 'Learn how Red Dot Classroom provides personalized support and resources to help students overcome their study challenges and succeed.',
};

const classButtons = [
    { classNo: '6', className: 'Class 6', color: 'bg-red-100 dark:bg-red-900/30 text-red-500', href: '/courses?category=Class-6' },
    { classNo: '7', className: 'Class 7', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500', href: '/courses?category=Class-7' },
    { classNo: '8', className: 'Class 8', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500', href: '/courses?category=Class-8' },
    { classNo: '9', className: 'Class 9', color: 'bg-green-100 dark:bg-green-900/30 text-green-500', href: '/courses?category=Class-9' },
    { classNo: '10', className: 'Class 10', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', href: '/courses?category=Class-10' },
    { classNo: '11', className: 'Class 11', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-500', href: '/courses?category=Class-11' },
    { classNo: '12', className: 'Class 12', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500', href: '/courses?category=Class-12' },
    { classNo: 'ADM', className: 'Admission', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500', href: '/courses?category=Admission' },
    { classNo: 'BCS', className: 'BCS Prep', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-500', href: '/courses?category=Job+Prep' },
];

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
    <div className="space-y-16">
        <section className="container mx-auto px-4 py-16">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-10">
                    <h1 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tight text-green-700 dark:text-green-500 leading-tight">
                        {sectionData.title}
                    </h1>
                    <div className="grid sm:grid-cols-2 gap-8">
                        {sectionData.cards.map(card => (
                            <Card key={card.id} className="relative group p-6 overflow-hidden transition-all duration-300 border border-primary/20 hover:border-primary/60 bg-gradient-to-br from-card to-secondary/30 dark:from-card dark:to-primary/10 shadow-lg hover:shadow-xl rounded-2xl">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                                <div className="flex flex-col gap-4 relative z-10">
                                    <div className="bg-primary/10 p-3 rounded-xl w-fit border border-primary/20">
                                        <Image src={card.iconUrl} alt={card.title} width={40} height={40} className="object-contain" data-ai-hint={card.dataAiHint} />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors">{card.title}</h2>
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{card.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
                <div className="hidden lg:flex justify-center items-center">
                    <div className="relative w-full max-w-xl aspect-square">
                        <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-90 animate-pulse"></div>
                        <Image
                            src={sectionData.mainImageUrl}
                            alt={sectionData.title}
                            fill
                            className="object-contain relative z-10 transition-transform duration-700 hover:scale-105"
                            data-ai-hint={sectionData.mainImageDataAiHint}
                        />
                    </div>
                </div>
            </div>
        </section>
        
        <section className="bg-secondary/30 py-16 border-y border-primary/5">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="space-y-2">
                        <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-green-700 dark:text-green-500">Comprehensive Academic Programs for Class 6-12 & Beyond</h2>
                        <p className="text-xl text-muted-foreground">Select your class to enroll and start your journey to the top.</p>
                    </div>
                    <Button asChild size="lg" className="mt-4 md:mt-0 bg-red-500 hover:bg-red-600 font-bold shrink-0 shadow-lg px-10 h-14 rounded-xl">
                        <Link href="/courses">Enroll Now</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classButtons.map((btn) => (
                        <Link key={btn.classNo} href={btn.href} className="group">
                            <Card className="flex items-center justify-between p-5 bg-background rounded-xl shadow-md hover:shadow-xl hover:border-primary/50 border border-primary/10 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className={cn("p-4 rounded-xl text-2xl font-black transition-transform group-hover:scale-110 flex items-center justify-center min-w-[80px]", btn.color)}>
                                        {btn.classNo}
                                    </div>
                                    <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">{btn.className}</span>
                                </div>
                                <ArrowRight className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1"/>
                            </Card>
                        </Link>
                    ))}
                     <Link href="/courses" className="lg:col-span-1">
                        <Card className="flex items-center justify-between p-5 bg-primary text-white rounded-xl shadow-lg hover:shadow-2xl border-none transition-all duration-300 group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors"></div>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="p-2">
                                    <Rocket className="w-10 h-10 animate-bounce" />
                                </div>
                                <span className="font-black text-xl">Enroll Right Now</span>
                            </div>
                            <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
                        </Card>
                    </Link>
                </div>
            </div>
        </section>

        {config.freeClassesSection?.display && (
            <section className="py-6 sm:py-8 lg:py-10">
                <FreeClassesSection sectionData={config.freeClassesSection} />
            </section>
        )}
    </div>
  );
}
