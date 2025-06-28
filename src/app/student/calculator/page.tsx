
'use client';

import { useState } from 'react';
import { Calculator, Wand2, Loader2 } from 'lucide-react';
import { CasioCalculator } from '@/components/calculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { aiCalculator } from '@/ai/flows/ai-calculator-flow';

function AICalculator() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!question) return;
    setIsLoading(true);
    setError(null);
    setAnswer('');
    try {
      const result = await aiCalculator(question);
      setAnswer(result);
    } catch (err) {
      setError('Sorry, I could not calculate that. Please try rephrasing.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[340px] p-4 bg-gray-100 dark:bg-[#2d3748] rounded-2xl shadow-2xl border-2 border-gray-300 dark:border-gray-600 font-sans">
       <div className="text-center mb-2 px-2">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">AI Calculator</h3>
            <p className="text-xs text-muted-foreground">Ask any math question in plain language.</p>
        </div>
        <div className="space-y-4 p-2">
            <Textarea
                placeholder="e.g., What is 15% of 800? or (2+3)*5"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                className="bg-background"
            />
            <Button onClick={handleCalculate} disabled={isLoading || !question} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Calculate'}
            </Button>
            {answer && (
                <div className="pt-2">
                    <Label className="dark:text-white px-1">Answer</Label>
                    <div className="p-3 bg-muted rounded-md text-xl font-bold font-mono text-center">
                        {answer}
                    </div>
                </div>
            )}
             {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    </div>
  );
}


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
