'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search, CheckCircle, User, BookOpen, Layers3, Hash, BadgeInfo, XCircle } from 'lucide-react';
import { verifyGroupAccessCodeAction, markAsGroupAccessedAction } from '@/app/actions/enrollment.actions';
import { Enrollment, User as Student, Course } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';

type VerificationResult = {
    enrollment: Enrollment;
    student: Student;
    course: Course;
};

export default function GroupAccessVerificationPage() {
    const { toast } = useToast();
    const { userInfo: adminInfo } = useAuth();
    const [accessCode, setAccessCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMarking, setIsMarking] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleVerification = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!accessCode.trim()) {
            toast({ title: "Error", description: "Please enter a Group Access Code.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setVerificationResult(null);
        setError(null);

        const result = await verifyGroupAccessCodeAction(accessCode.trim());

        if (result.success && result.data) {
            setVerificationResult(result.data);
        } else {
            setError(result.message || "An unknown error occurred.");
        }
        setIsLoading(false);
    };

    const handleMarkAsAdded = async () => {
        if (!verificationResult || !adminInfo) return;

        setIsMarking(true);
        const result = await markAsGroupAccessedAction(verificationResult.enrollment.id!, adminInfo.uid);
        if (result.success) {
            toast({ title: "Success", description: `${verificationResult.student.name} marked as added to the group.` });
            // Re-verify to show the updated status
            await handleVerification();
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setIsMarking(false);
    }
    
    const cycle = verificationResult?.enrollment.cycleId
      ? verificationResult.course.cycles?.find(c => c.id === verificationResult.enrollment.cycleId)
      : null;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Group Access Verification</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Verify a student's group access code to grant them entry to secret groups.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Verify Code</CardTitle>
                        <CardDescription>Enter the code from the student's invoice to verify their enrollment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerification} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="access-code">Group Access Code (Enrollment ID)</Label>
                                <Input
                                    id="access-code"
                                    placeholder="Enter code..."
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Search className="mr-2" />}
                                Verify Code
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                
                <Card className="min-h-[250px]">
                    <CardHeader>
                        <CardTitle>Verification Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
                        {error && (
                             <div className="text-center text-destructive flex flex-col items-center justify-center h-full">
                                <XCircle className="w-12 h-12 mb-2"/>
                                <p className="font-semibold">Verification Failed</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        {!isLoading && !error && !verificationResult && (
                             <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                                <BadgeInfo className="w-12 h-12 mb-2"/>
                                <p>Enter a code to see verification results here.</p>
                            </div>
                        )}
                        {verificationResult && (
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-lg flex items-center gap-2"><User /> Student Details</h4>
                                    <p><strong>Name:</strong> {verificationResult.student.name}</p>
                                    <p><strong>RDC ID:</strong> {verificationResult.student.registrationNumber || 'N/A'}</p>
                                </div>
                                 <div className="space-y-2">
                                    <h4 className="font-semibold text-lg flex items-center gap-2"><BookOpen /> Enrollment Details</h4>
                                    <p><strong>Course:</strong> {verificationResult.course.title}</p>
                                    {cycle && <p><strong>Cycle:</strong> {cycle.title}</p>}
                                    <p><strong>Enrollment ID:</strong> {verificationResult.enrollment.id}</p>
                                    <p><strong>Invoice ID:</strong> {verificationResult.enrollment.invoiceId || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button onClick={handleMarkAsAdded} disabled={isMarking || verificationResult.enrollment.isGroupAccessed}>
                                        {isMarking ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        {verificationResult.enrollment.isGroupAccessed ? 'Already in Group' : 'Mark as Added to Group'}
                                    </Button>
                                    {verificationResult.enrollment.isGroupAccessed && <Badge variant="accent">Verified</Badge>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
