

import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { ArrowRight, CheckCircle, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'RDC OFFLINE HUB',
  description: 'Welcome to the Red Dot Classroom Offline Hub. Find our centers, facilities, and upcoming events.',
};

export default async function OfflineHubPage() {
    const homepageConfig = await getHomepageConfig();
    const language = 'bn'; // Defaulting to Bengali as per the image
    const offlineHubData = homepageConfig?.offlineHubSection;

    if (!offlineHubData || !offlineHubData.display) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                <p>Offline hub is currently not available. Please check back later.</p>
            </div>
        );
    }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-bengali">
        <div className="relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/40 via-gray-900 to-gray-900 z-0"></div>
             <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="font-headline text-4xl lg:text-5xl font-bold tracking-tight">
                            {offlineHubData.title[language]}
                        </h1>
                        <p className="mt-4 text-lg text-gray-300">
                           {offlineHubData.subtitle[language]}
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-base px-6 py-6 rounded-lg">
                                {offlineHubData.button1Text[language]}
                            </Button>
                            <Button variant="outline" className="bg-white hover:bg-gray-200 text-black font-bold text-base px-6 py-6 rounded-lg">
                                {offlineHubData.button2Text[language]}
                            </Button>
                        </div>
                    </div>
                     <div className="flex justify-center items-center">
                        <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl border-4 border-red-500/50 p-2 shadow-2xl bg-black/20 backdrop-blur-sm">
                             <Image
                                src={offlineHubData.imageUrl}
                                alt="Offline classroom"
                                fill
                                className="object-cover rounded-xl"
                                data-ai-hint={offlineHubData.dataAiHint}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      
      {offlineHubData.programs && offlineHubData.programs.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">
            {offlineHubData.programsTitle?.[language] || "আমাদের প্রোগ্রামসমূহ"}
          </h2>
          <div className="space-y-8 max-w-5xl mx-auto">
            {offlineHubData.programs.map((program) => (
              <div key={program.id} className="p-8 border border-red-500/30 bg-red-900/20 rounded-xl grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="font-headline text-4xl font-bold mb-6">{program.title}</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-8">
                    {program.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-red-400 mt-1 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold text-base px-6 py-6 rounded-lg">
                      <Link href={program.button1Url}>{program.button1Text}</Link>
                    </Button>
                    <Button asChild variant="outline" className="bg-white hover:bg-gray-200 text-black font-bold text-base px-6 py-6 rounded-lg">
                      <Link href={program.button2Url}>{program.button2Text}</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  <Image
                    src={program.imageUrl}
                    alt={program.title}
                    width={500}
                    height={350}
                    className="rounded-xl object-cover"
                    data-ai-hint={program.dataAiHint}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-16">
         <h2 className="font-headline text-3xl font-bold text-center mb-12">
            {offlineHubData.centersTitle[language]}
         </h2>
         <div className="flex gap-8 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
            {offlineHubData.centers.map((center) => (
                <div key={center.id} className="snap-start shrink-0 w-80">
                    <div className="p-6 border border-red-500/30 bg-gray-800/50 rounded-xl h-full flex flex-col justify-between hover:border-red-500 transition-colors">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin className="text-red-500" />
                                <h3 className="text-xl font-bold">{center.name}</h3>
                            </div>
                            <p className="text-gray-400 text-sm">{center.address}</p>
                        </div>
                        <Button variant="link" className="p-0 h-auto mt-4 text-red-400 hover:text-red-300 justify-start">
                           <Link href="#">
                                Get Directions <ArrowRight className="ml-2 h-4 w-4" />
                           </Link>
                        </Button>
                    </div>
                </div>
            ))}
         </div>
      </section>

      {offlineHubData.contactSection?.display && (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="bg-gradient-to-br from-red-800 via-red-900 to-black rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 -m-12 w-48 h-48 bg-white/5 rounded-full"></div>
                    <div className="relative z-10">
                        <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
                            <Phone className="w-8 h-8" />
                        </div>
                        <h2 className="font-headline text-3xl font-bold">{offlineHubData.contactSection.title[language]}</h2>
                        <p className="mt-2 text-lg text-gray-300 max-w-lg mx-auto">{offlineHubData.contactSection.subtitle[language]}</p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold text-base px-6 py-6 rounded-lg w-full sm:w-auto">
                                <a href={`tel:${offlineHubData.contactSection.callButtonNumber}`}>{offlineHubData.contactSection.callButtonText[language]}</a>
                            </Button>
                            <span className="font-semibold">{language === 'bn' ? 'অথবা' : 'OR'}</span>
                            <Button asChild variant="outline" className="bg-white hover:bg-gray-200 text-black font-bold text-base px-6 py-6 rounded-lg w-full sm:w-auto">
                                <a href={`https://wa.me/${offlineHubData.contactSection.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                    {offlineHubData.contactSection.whatsappButtonText[language]}
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      )}
    </div>
  );
}
