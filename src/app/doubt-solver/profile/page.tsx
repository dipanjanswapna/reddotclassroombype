
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getInstructorByUid } from "@/lib/firebase/firestore";
import { Instructor } from "@/lib/types";
import { saveInstructorProfileAction } from "@/app/actions/instructor.actions";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuth } from "@/context/auth-context";

export default function DoubtSolverProfilePage() {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (!userInfo?.uid) {
            if (loading) setLoading(false);
            return;
        }

        const fetchInstructorData = async () => {
            try {
                const data = await getInstructorByUid(userInfo.uid);
                if (data) {
                    setInstructor(data);
                    setName(data.name || '');
                    setTitle(data.title || 'Doubt Solver');
                    setBio(data.bio || '');
                    setAvatarUrl(data.avatarUrl || 'https://placehold.co/100x100.png');
                }
            } catch (error) {
                console.error(error);
                toast({ title: 'Error', description: 'Failed to load profile data.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchInstructorData();
    }, [userInfo?.uid, toast]);
    
    const handleProfileSave = async () => {
        if (!instructor?.id) return;
        setIsSaving(true);
        const updatedData: Partial<Instructor> = { name, title, bio, avatarUrl };
        const result = await saveInstructorProfileAction(instructor.id, updatedData);
        if (result.success) {
            toast({ title: "Profile Updated", description: "Your profile has been saved." });
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsSaving(false);
    };
    
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
                toast({ title: "Avatar Updated", description: "Click 'Save Changes' to confirm." });
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    if (!instructor) {
        return <div className="p-8">Could not find your profile. Please contact an admin.</div>
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Doubt Solver Profile</h1>
                    <p className="text-muted-foreground">Manage your account information.</p>
                </div>
                <Button onClick={handleProfileSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                    Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={avatarUrl} alt={name} data-ai-hint={instructor?.dataAiHint} />
                            <AvatarFallback>{name ? name.split(' ').map(n => n[0]).join('') : ''}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <Label htmlFor="avatar-upload" className="block text-sm font-medium mb-1">Update Avatar</Label>
                            <div className="relative">
                                <Input id="avatar-upload-visible" type="text" readOnly placeholder="No file selected" className="pr-24" />
                                <label htmlFor="avatar-upload" className="absolute inset-y-0 right-0 flex items-center">
                                    <Button asChild variant="outline" className="rounded-l-none -ml-px">
                                        <div><Upload className="mr-2"/>Upload</div>
                                    </Button>
                                </label>
                                <Input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title / Expertise</Label>
                            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Physics Expert"/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Biography</Label>
                        <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="A short bio about yourself."/>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
