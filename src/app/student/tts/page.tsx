'use client';

import { useState } from 'react';
import { Voicemail, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { textToSpeech } from '@/ai/flows/tts-flow';

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;

    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const result = await textToSpeech(text);
      setAudioUrl(result.audioDataUri);
    } catch (err) {
      setError('An error occurred while generating audio. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
            <Voicemail className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="font-headline text-4xl font-bold tracking-tight">Text-to-Speech Tool</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Convert your notes or any text into audible speech to listen on the go.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Convert Text to Audio</CardTitle>
                <CardDescription>
                    Enter the text you want to convert below. The AI will generate an audio file for you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="text-input">Your Text</Label>
                        <Textarea
                        id="text-input"
                        placeholder="Type or paste your text here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={8}
                        required
                        />
                    </div>
                    <Button type="submit" disabled={isLoading || !text}>
                        {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Audio...
                        </>
                        ) : (
                        <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate Audio
                        </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>

        {(isLoading || audioUrl || error) && (
          <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Your Audio</CardTitle>
                </CardHeader>
              <CardContent className="flex items-center justify-center p-6 min-h-[8rem]">
                {isLoading && (
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {audioUrl && (
                    <audio controls className="w-full">
                        <source src={audioUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                    </audio>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
