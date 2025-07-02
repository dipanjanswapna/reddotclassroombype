

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getUser, linkGuardianAction, unlinkGuardianAction } from '@/lib/firebase/firestore';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, UserPlus, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/context/auth-context';

export default function GuardianManagementPage() {
    const { toast } = useToast();
    const { userInfo: student, loading: authLoading } = useAuth();
    const [guardian, setGuardian] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    const fetchGuardianData = async () => {
        if (!student) return;
        setLoading(true);
        try {
            if (student?.linkedGuardianId) {
                const linkedGuardian = await getUser(student.linkedGuardianId);
                setGuardian(linkedGuardian || null);
            } else {
                setGuardian(null);
            }
        } catch(e) {
            console.error(e);
            toast({ title: 'Error', description: 'Could not fetch guardian data.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!authLoading) {
            fetchGuardianData();
        }
    }, [student, authLoading]);

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !student) {
            toast({ title: "Error", description: "Please enter an email address.", variant: 'destructive'});
            return;
        }
        setIsSaving(true);
        const result = await linkGuardianAction(student.id!, inviteEmail);
        
        if (result.success) {
            toast({ title: "Invitation Sent!", description: result.message });
            setInviteEmail('');
            fetchGuardianData();
        } else {
            toast({ title: "Error", description: result.message, variant: 'destructive'});
        }
        setIsSaving(false);
    };
    
    const handleRemoveGuardian = async () => {
        if (!student || !guardian) return;
        setIsSaving(true);
        const result = await unlinkGuardianAction(student.id!, guardian.id!);
        if (result.success) {
            toast({ title: "Guardian Removed", description: "Access has been revoked." });
            fetchGuardianData();
        } else {
            toast({ title: "Error", description: result.message, variant: 'destructive'});
        }
        setIsSaving(false);
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Guardian Management</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Invite a guardian to view your academic progress or manage access.
                </p>
            </div>
            
            {guardian ? (
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Connected Guardian</CardTitle>
                        <CardDescription>This person has access to view your course progress and grades.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={guardian.avatarUrl} alt={guardian.name} />
                                    <AvatarFallback>{guardian.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{guardian.name}</p>
                                    <p className="text-sm text-muted-foreground">{guardian.email}</p>
                                </div>
                            </div>
                            <Button variant="destructive" size="sm" onClick={handleRemoveGuardian} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                                Revoke Access
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Invite a Guardian</CardTitle>
                        <CardDescription>Enter the email address of the guardian you wish to invite. They will receive an email to accept your invitation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSendInvite} className="flex items-end gap-2">
                             <div className="grid gap-2 flex-grow">
                                <Label htmlFor="email" className="sr-only">Guardian's Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="guardian@example.com" 
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserPlus className="mr-2 h-4 w-4" />}
                                Send Invite
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
