
'use client';

import { useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Copy, Check, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function CourseCommunityPage() {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const courseId = params.courseId as string;
  // This is a simplified access code generation. In a real app, it might be more complex.
  const accessCode = userInfo ? `RDC-${courseId.slice(0, 4).toUpperCase()}-${userInfo.uid.slice(-4).toUpperCase()}` : '';

  const handleCopy = () => {
    if (!accessCode) return;
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    toast({ title: 'Code Copied!', description: 'Your access code has been copied to the clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Note: We are assuming `course.communityUrl` is available from a parent layout or context.
  // A full implementation would fetch the course details here.
  const communityUrl = "https://www.facebook.com/groups/rdc.main"; // Placeholder

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Course Community</h1>
        <p className="mt-1 text-lg text-muted-foreground">Connect with students and instructors.</p>
      </div>

      {communityUrl ? (
          <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Join the Course Facebook Group</CardTitle>
                    <CardDescription>
                        This is the dedicated community for students of this course. Ask questions, share insights, and learn together.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Your Unique Access Code</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                           To join, you'll need your unique access code. This proves you are an enrolled student. Do not share it.
                        </p>
                        <div className="flex items-center gap-2 p-3 rounded-md bg-muted border">
                            <span className="font-mono text-lg text-primary">{accessCode}</span>
                            <Button variant="ghost" size="icon" className="ml-auto" onClick={handleCopy}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                <span className="sr-only">Copy Code</span>
                            </Button>
                        </div>
                    </div>
                     <Button asChild size="lg" className="w-full">
                        <Link href={communityUrl} target="_blank" rel="noopener noreferrer">
                            Go to Course Group
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      ) : (
        <div className="text-center py-16 bg-muted rounded-lg flex flex-col items-center">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">There is no dedicated community group for this course.</p>
            <p className="text-sm text-muted-foreground mt-2">You can join the main RDC student community instead.</p>
            <Button asChild variant="link" className="mt-2">
                <Link href="/student/community">Go to Community Hub</Link>
            </Button>
        </div>
      )}

    </div>
  );
}
