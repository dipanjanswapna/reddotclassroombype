
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { getUser } from '@/lib/firebase/firestore';
import { linkGuardianAction, unlinkGuardianAction } from '@/app/actions/user.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Loader2, Link2, Link2Off } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StudentGuardianPage() {
    const { userInfo, refreshUserInfo } = useAuth();
    const { toast } = useToast();
    const [guardianEmail, setGuardianEmail] = useState('');
    const [linkedGuardian, setLinkedGuardian] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userInfo?.linkedGuardianId) {
            async function fetchGuardian() {
                const guardianData = await getUser(userInfo.linkedGuardianId!);
                setLinkedGuardian(guardianData);
            }
            fetchGuardian();
        }
    }, [userInfo]);
    
    const handleLinkGuardian = async () => {
        if (!guardianEmail || !userInfo) return;
        setIsLoading(true);
        const result = await linkGuardianAction(userInfo.id!, guardianEmail);
        if (result.success) {
            toast({ title: 'Success', description: result.message });
            await refreshUserInfo();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsLoading(false);
    };

    const handleUnlinkGuardian = async () => {
        if (!userInfo?.linkedGuardianId) return;
        setIsLoading(true);
        const result = await unlinkGuardianAction(userInfo.id!, userInfo.linkedGuardianId);
        if (result.success) {
            toast({ title: 'Guardian Unlinked', description: result.message });
            setLinkedGuardian(null);
            await refreshUserInfo();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsLoading(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Guardian Management</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Link a guardian to your account to share your academic progress.
                </p>
            </div>
            
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Your Linked Guardian</CardTitle>
                </CardHeader>
                <CardContent>
                    {linkedGuardian ? (
                         <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={linkedGuardian.avatarUrl} />
                                    <AvatarFallback>{linkedGuardian.name.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{linkedGuardian.name}</p>
                                    <p className="text-sm text-muted-foreground">{linkedGuardian.email}</p>
                                </div>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isLoading}><Link2Off className="mr-2 h-4 w-4"/> Unlink</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to unlink your guardian?</AlertDialogTitle>
                                        <AlertDialogDescription>This will remove their access to your progress and attendance reports.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleUnlinkGuardian} className="bg-destructive hover:bg-destructive/90">Unlink</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-muted-foreground">You have not linked a guardian yet.</p>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Enter guardian's email" 
                                    type="email" 
                                    value={guardianEmail} 
                                    onChange={e => setGuardianEmail(e.target.value)}
                                />
                                <Button onClick={handleLinkGuardian} disabled={isLoading || !guardianEmail}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : <Link2 className="mr-2 h-4 w-4"/>} Link Guardian
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
