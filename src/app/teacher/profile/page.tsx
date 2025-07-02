'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Linkedin, Facebook, Twitter, Loader2, ExternalLink, Youtube, PlusCircle, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getInstructorByUid } from "@/lib/firebase/firestore";
import { Instructor } from "@/lib/types";
import { saveInstructorProfileAction } from "@/app/actions/instructor.actions";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuth } from "@/context/auth-context";

export default function TeacherProfilePage() {
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
    const [linkedin, setLinkedin] = useState('');
    const [facebook, setFacebook] = useState('');
    const [twitter, setTwitter] = useState('');
    const [youtubeClasses, setYoutubeClasses] = useState<{ id: string; title: string; youtubeUrl: string }[]>([]);

    useEffect(() => {
        const currentUid = userInfo?.uid;
        if (!currentUid) {
            if (loading) setLoading(false);
            return;
        }

        const fetchInstructorData = async () => {
            try {
                const data = await getInstructorByUid(currentUid);
                if (data) {
                    setInstructor(data);
                    setName(data.name || '');
                    setTitle(data.title || '');
                    setBio(data.bio || '');
                    setAvatarUrl(data.avatarUrl || 'https://placehold.co/100x100.png');
                    setLinkedin(data.socials?.linkedin || '');
                    setFacebook(data.socials?.facebook || '');
                    setTwitter(data.socials?.twitter || '');
                    setYoutubeClasses(data.youtubeClasses?.map(yc => ({ ...yc, id: yc.id || `yc_${Date.now()}_${Math.random()}` })) || []);
                } else {
                    toast({ title: 'Error', description: 'Could not find your instructor profile.', variant: 'destructive' });
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

        if (!name.trim()) {
            toast({ title: 'Validation Error', description: 'Full Name cannot be empty.', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        const updatedData: Partial<Instructor> = {
            name,
            title,
            bio,
            avatarUrl,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            socials: { linkedin, facebook, twitter },
            youtubeClasses: youtubeClasses.filter(c => c.title && c.youtubeUrl),
        };
        
        const result = await saveInstructorProfileAction(instructor.id, updatedData);

        if (result.success) {
            toast({
                title: "Profile Updated",
                description: "Your public profile information has been saved.",
            });
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
                 toast({
                    title: "Avatar Updated",
                    description: "Your new profile picture has been set.",
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const addYoutubeClass = () => setYoutubeClasses(prev => [...prev, { id: `yc_${Date.now()}_${Math.random()}`, title: '', youtubeUrl: '' }]);
    const updateYoutubeClass = (id: string, field: 'title' | 'youtubeUrl', value: string) => {
        setYoutubeClasses(prev => prev.map(yc => yc.id === id ? { ...yc, [field]: value } : yc));
    };
    const removeYoutubeClass = (id: string) => setYoutubeClasses(prev => prev.filter(yc => yc.id !== id));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }
    
    if (!instructor) {
        return <div className="p-8">Could not find instructor profile.</div>
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Public Profile</h1>
            <p className="text-muted-foreground">This information will be displayed on your public teacher profile page.</p>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your public information. Keep it professional and engaging.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={name} data-ai-hint={instructor.dataAiHint} />
                    <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Physics Instructor"/>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={6} placeholder="Tell students a little about your teaching philosophy and experience."/>
                </div>
                
                <div>
                    <Label className="mb-2 block">Social Links</Label>
                    <div className="space-y-3">
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input value={linkedin} onChange={e => setLinkedin(e.target.value)} className="pl-10" placeholder="https://linkedin.com/in/your-profile"/>
                        </div>
                        <div className="relative">
                            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input value={facebook} onChange={e => setFacebook(e.target.value)} className="pl-10" placeholder="https://facebook.com/your-profile"/>
                        </div>
                        <div className="relative">
                            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input value={twitter} onChange={e => setTwitter(e.target.value)} className="pl-10" placeholder="https://twitter.com/your-handle"/>
                        </div>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href={`/teachers/${instructor.slug}`} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Public Profile
                    </Link>
                </Button>
                <Button onClick={handleProfileSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                    Save Profile
                </Button>
            </CardFooter>
        </Card>

        <Card>
            <CardHeader>
              <CardTitle>Free YouTube Classes</CardTitle>
              <CardDescription>Add links to your free classes on YouTube. These will be displayed on your public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {youtubeClasses.map(yc => (
                    <div key={yc.id} className="flex items-end gap-2 p-4 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                            <div className="space-y-1">
                                <Label htmlFor={`yc-title-${yc.id}`}>Class Title</Label>
                                <Input id={`yc-title-${yc.id}`} value={yc.title} onChange={e => updateYoutubeClass(yc.id, 'title', e.target.value)} placeholder="e.g., Physics Chapter 5" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`yc-url-${yc.id}`}>YouTube URL</Label>
                                <Input id={`yc-url-${yc.id}`} value={yc.youtubeUrl} onChange={e => updateYoutubeClass(yc.id, 'youtubeUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeYoutubeClass(yc.id)}><X className="text-destructive h-4 w-4"/></Button>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addYoutubeClass}><PlusCircle className="mr-2"/>Add YouTube Class</Button>
            </CardContent>
             <CardFooter className="p-6 pt-0 flex justify-end">
                <Button onClick={handleProfileSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>

        </div>
    );
}
