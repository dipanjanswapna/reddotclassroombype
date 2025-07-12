
import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Rocket } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How We Help You Become A Topper | RDC',
  description: 'Learn how Red Dot Classroom provides personalized support and resources to help students overcome their study challenges and succeed.',
};

const classButtons = [
    { classNo: '6', className: 'ক্লাস ৬', color: 'bg-red-100 dark:bg-red-900/30 text-red-500', href: '/courses?category=Class-6' },
    { classNo: '7', className: 'ক্লাস ৭', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500', href: '/courses?category=Class-7' },
    { classNo: '8', className: 'ক্লাস ৮', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500', href: '/courses?category=Class-8' },
    { classNo: '9', className: 'ক্লাস ৯', color: 'bg-green-100 dark:bg-green-900/30 text-green-500', href: '/courses?category=Class-9' },
    { classNo: '10', className: 'ক্লাস ১০', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', href: '/courses?category=Class-10' },
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
    <>
        <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
                <h1 className="font-headline text-4xl font-bold tracking-tight">{sectionData.title}</h1>
                <div className="grid sm:grid-cols-2 gap-6">
                    {sectionData.cards.map(card => (
                        <Card key={card.id} className="p-6 bg-secondary/50 border-border/50">
                            <div className="flex items-start gap-4 mb-3">
                                <Image src={card.iconUrl} alt="" width={40} height={40} className="object-contain" data-ai-hint={card.dataAiHint} />
                                <h2 className="font-bold text-lg leading-tight">{card.title}</h2>
                            </div>
                            <p className="text-sm text-muted-foreground">{card.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
            <div className="hidden lg:block">
                <Image
                    src={sectionData.mainImageUrl}
                    alt={sectionData.title}
                    width={600}
                    height={600}
                    className="object-contain"
                    data-ai-hint={sectionData.mainImageDataAiHint}
                />
            </div>
        </div>
        </div>
        
        <section className="bg-secondary/30 py-16">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="font-bengali">
                        <h2 className="font-headline text-3xl font-bold">৬ষ্ঠ-১০ম শ্রেণির পূর্ণাঙ্গ বছরভিত্তিক একাডেমিক প্রোগ্রাম</h2>
                        <p className="text-muted-foreground">ভর্তি হতে তোমার ক্লাসটি সিলেক্ট করো</p>
                    </div>
                    <Button asChild className="mt-4 md:mt-0 bg-red-500 hover:bg-red-600 font-bengali shrink-0">
                        <Link href="/courses">ভর্তি হও</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    {classButtons.map((btn) => (
                        <Link key={btn.classNo} href={btn.href}>
                            <div className="flex items-center justify-between p-4 bg-background rounded-lg shadow-sm hover:shadow-md hover:border-primary/50 border transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-md text-2xl font-bold ${btn.color}`}>
                                        {btn.classNo}
                                    </div>
                                    <span className="font-semibold font-bengali">{btn.className}</span>
                                </div>
                                <ArrowRight className="text-muted-foreground"/>
                            </div>
                        </Link>
                    ))}
                     <Link href="/courses">
                        <div className="flex items-center justify-between p-4 bg-red-100/50 dark:bg-red-900/20 rounded-lg shadow-sm hover:shadow-md border border-transparent hover:border-red-400 transition-all text-red-500">
                            <div className="flex items-center gap-4">
                                <div className="p-3">
                                    <Rocket className="w-7 h-7"/>
                                </div>
                                <span className="font-semibold font-bengali">এখনই ভর্তি হও</span>
                            </div>
                            <ArrowRight />
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    </>
  );
}
