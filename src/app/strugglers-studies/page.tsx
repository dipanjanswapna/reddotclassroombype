
import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'How We Help You Become A Topper | RDC',
  description: 'Learn how Red Dot Classroom provides personalized support and resources to help students overcome their study challenges and succeed.',
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
  );
}
