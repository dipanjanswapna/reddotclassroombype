'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Linkedin, Facebook, Twitter } from "lucide-react";
import { allInstructors } from "@/lib/mock-data";
import { Textarea } from "@/components/ui/textarea";

// Mock current teacher for demonstration
const currentTeacher = allInstructors.find(i => i.id === 'ins-ja')!;

export default function TeacherProfilePage() {
    const { toast } = useToast();

    // State for public profile information
    const [name, setName] = useState(currentTeacher.name);
    const [title, setTitle] = useState(currentTeacher.title);
    const [bio, setBio] = useState(currentTeacher.bio);
    const [avatarUrl, setAvatarUrl] = useState(currentTeacher.avatarUrl);
    const [linkedin, setLinkedin] = useState(currentTeacher.socials?.linkedin || '');
    const [facebook, setFacebook] = useState(currentTeacher.socials?.facebook || '');
    const [twitter, setTwitter] = useState(currentTeacher.socials?.twitter || '');


    const handleProfileSave = () => {
        // In a real app, this would be a server action to update the database
        console.log({ name, title, bio, avatarUrl, socials: { linkedin, facebook, twitter } });
        toast({
            title: "Profile Updated",
            description: "Your public profile information has been saved.",
        });
    };
    
    // A dummy function to simulate file upload
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
                <AvatarImage src={avatarUrl} alt={name} data-ai-hint={currentTeacher.dataAiHint}/>
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
        <div className="p-6 pt-0 flex justify-end">
            <Button onClick={handleProfileSave}>Save Profile</Button>
        </div>
      </Card>
    </div>
  );
}