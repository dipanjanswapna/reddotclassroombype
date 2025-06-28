
import { Calculator } from 'lucide-react';
import { CasioCalculator } from '@/components/calculator';

export default function CalculatorPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-center">
        <div className="text-center mb-8">
          <Calculator className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="font-headline text-4xl font-bold tracking-tight">Scientific Calculator</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your trusty fx-991EX, right in your browser.
          </p>
        </div>
        <CasioCalculator />
      </div>
    </div>
  );
}
