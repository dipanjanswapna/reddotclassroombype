'use client';

import dynamic from 'next/dynamic';
import { Calculator, Wand2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const AICalculator = dynamic(
  () => import('@/components/ai-calculator').then((mod) => mod.AICalculator),
  {
    loading: () => <Skeleton className="h-[430px] w-[340px] rounded-2xl" />,
    ssr: false,
  }
);

const CasioCalculator = dynamic(
  () => import('@/components/calculator').then((mod) => mod.CasioCalculator),
  {
    loading: () => <Skeleton className="h-[550px] w-[340px] rounded-2xl" />,
    ssr: false,
  }
);

export default function CalculatorPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-center">
        <div className="text-center mb-8">
          <Calculator className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="font-headline text-4xl font-bold tracking-tight">Calculators</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your trusty tools for any calculation.
          </p>
        </div>

        <Tabs defaultValue="scientific" className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scientific"><Calculator className="mr-2"/> Scientific</TabsTrigger>
                <TabsTrigger value="ai"><Wand2 className="mr-2"/> AI Calculator</TabsTrigger>
            </TabsList>
            <TabsContent value="scientific" className="mt-4 flex justify-center">
                <CasioCalculator />
            </TabsContent>
            <TabsContent value="ai" className="mt-4 flex justify-center">
                <AICalculator />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
