
'use client';

import { AICalculator } from "@/components/ai-calculator";
import { CasioCalculator } from "@/components/calculator";

export default function StudentCalculatorPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
       <div className="text-center">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Calculators</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Use our calculators for your study sessions.
            </p>
        </div>
        <div className="flex flex-wrap items-start justify-center gap-8">
            <CasioCalculator />
            <AICalculator />
        </div>
    </div>
  );
}
