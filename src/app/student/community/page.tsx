'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// In a real app, this would come from the logged-in user's data.
const mockStudentId = 'usr_stud_001'; 
const accessCode = `RDC-STU-${mockStudentId.split('_')[2].toUpperCase()}-A9B8`;

export default function StudentCommunityPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    toast({ title: 'Code Copied!', description: 'Your access code has been copied to the clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <Users className="w-10 h-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold tracking-tight">Community Hub</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Connect with fellow students, ask questions, and learn together.
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Join Our Private Facebook Group</CardTitle>
                <CardDescription>
                    This is the central community for all RDC students. Join the group to stay updated and interact with thousands of other learners.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Your Unique Access Code</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                        To join the private group, you will need to provide this unique code in the joining request. This code is unique to you. Do not share it.
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
                    <Link href="https://www.facebook.com/groups/rdc.main" target="_blank" rel="noopener noreferrer">
                        Go to Facebook Group
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
