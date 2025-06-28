
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { mockUsers, User } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Trash2, UserPlus } from 'lucide-react';

// Mock current student
const currentStudentId = 'usr_stud_001';

export default function GuardianManagementPage() {
    const { toast } = useToast();
    const [student, setStudent] = useState<User | undefined>(mockUsers.find(u => u.id === currentStudentId));
    const [guardian, setGuardian] = useState<User | undefined>(() => mockUsers.find(u => u.id === student?.linkedGuardianId));
    const [inviteEmail, setInviteEmail] = useState('');

    const handleSendInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) {
            toast({ title: "Error", description: "Please enter an email address.", variant: 'destructive'});
            return;
        }
        toast({ title: "Invitation Sent!", description: `An invitation has been sent to ${inviteEmail}.` });
        setInviteEmail('');
    };
    
    const handleRemoveGuardian = () => {
        // In a real app, this would be a server action
        setGuardian(undefined);
        setStudent(prev => prev ? { ...prev, linkedGuardianId: undefined } : undefined);
        toast({ title: "Guardian Removed", description: "Access has been revoked." });
    };

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
                                    <AvatarImage src="https://placehold.co/100x100.png" alt={guardian.name} />
                                    <AvatarFallback>{guardian.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{guardian.name}</p>
                                    <p className="text-sm text-muted-foreground">{guardian.email}</p>
                                </div>
                            </div>
                            <Button variant="destructive" size="sm" onClick={handleRemoveGuardian}>
                                <Trash2 className="mr-2 h-4 w-4"/>
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
                            <Button type="submit">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Send Invite
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
