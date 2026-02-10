
'use client';

import { useState } from 'react';
import { Loader2, Wand2, Volume2, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { textToSpeech } from '@/ai/flows/tts-flow';

export default function StudentTtsPage() {
  const [inputText, setInputText] = useState('');
  const [audioDataUri, setAudioDataUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSpeech = async () => {
    if (!inputText) return;
    setIsLoading(true);
    setError(null);
    setAudioDataUri('');
    try {
      const result = await textToSpeech(inputText);
      setAudioDataUri(result.audioDataUri);
    } catch (err) {
      setError('Sorry, could not generate audio. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-1 py-4 md:py-8 space-y-8 max-w-3xl mx-auto">
        <div className="text-center">
            <h1 className="font-headline text-3xl font-bold tracking-tight">AI Text-to-Speech</h1>
            <p className="mt-1 text-lg text-muted-foreground">
                Convert your notes and other text into listenable audio.
            </p>
        </div>
        <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="tts-input" className="text-lg">Your Text</Label>
                <Textarea
                    id="tts-input"
                    placeholder="Paste or type your text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={10}
                    className="bg-background text-base"
                />
            </div>
            <Button onClick={handleGenerateSpeech} disabled={isLoading || !inputText} className="w-full">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                Generate Audio
            </Button>
            {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {audioDataUri && (
                <div className="pt-4 space-y-4">
                    <Label className="text-lg">Generated Audio</Label>
                    <audio controls className="w-full">
                        <source src={audioDataUri} type="audio/wav" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </div>
    </div>
  );
}
