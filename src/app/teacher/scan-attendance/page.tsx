
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { markAttendanceByRollAction } from '@/app/actions/attendance.actions';
import { Camera, Loader2, ScanLine } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TeacherScanAttendancePage() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading } = useAuth();
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [rollNo, setRollNo] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use this feature.',
            });
          }
        };

        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [toast]);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rollNo || !userInfo) return;
        setIsScanning(true);

        const result = await markAttendanceByRollAction(rollNo, userInfo.uid);

        if (result.success) {
            toast({
                title: 'Success!',
                description: result.message,
            });
            setRollNo('');
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
        }
        setIsScanning(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
            <div className="text-center mb-8 max-w-2xl">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Scan Attendance</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Point your camera at the student's ID card barcode or manually enter the roll number to record attendance.
                </p>
            </div>
            
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Camera /> Attendance Scanner</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video bg-muted rounded-md overflow-hidden relative flex items-center justify-center mb-4">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                         <div className="absolute inset-0 bg-black/20"></div>
                         <div className="absolute w-full h-1 bg-red-500 animate-pulse rounded-full scanner-line"></div>
                         <p className="absolute bottom-2 text-white text-xs bg-black/50 px-2 py-1 rounded">Align Barcode Here</p>
                    </div>

                    {!hasCameraPermission && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use the scanner. You can still enter roll numbers manually.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <form onSubmit={handleScan} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="roll-no">Student Roll Number</Label>
                            <Input 
                                id="roll-no"
                                placeholder="Enter Roll No manually"
                                value={rollNo}
                                onChange={(e) => setRollNo(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isScanning || !rollNo}>
                            {isScanning ? <Loader2 className="mr-2 animate-spin" /> : <ScanLine className="mr-2" />}
                            Mark Present
                        </Button>
                    </form>

                </CardContent>
            </Card>
            
            <style jsx>{`
                .scanner-line {
                    animation: scan 3s linear infinite;
                }
                @keyframes scan {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                }
            `}</style>
        </div>
    );
}
