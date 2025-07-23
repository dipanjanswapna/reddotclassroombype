
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { saveUserAction } from "@/app/actions/user.actions";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function StudentProfilePage() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100.png");
    const [className, setClassName] = useState("");
    const [fathersName, setFathersName] = useState("");
    const [mothersName, setMothersName] = useState("");
    const [nidNumber, setNidNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [guardianMobileNumber, setGuardianMobileNumber] = useState("");

    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.name || "");
            setEmail(userInfo.email || "");
            setAvatarUrl(userInfo.avatarUrl || "https://placehold.co/100x100.png");
            setClassName(userInfo.className || "");
            setFathersName(userInfo.fathersName || "");
            setMothersName(userInfo.mothersName || "");
            setNidNumber(userInfo.nidNumber || "");
            setMobileNumber(userInfo.mobileNumber || "");
            setGuardianMobileNumber(userInfo.guardianMobileNumber || "");
            setLoading(false);
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [userInfo, authLoading]);

    const handleSave = async () => {
        if (!userInfo?.id) return;
        setIsSaving(true);
        try {
            await saveUserAction({ 
                id: userInfo.id, 
                name: fullName, 
                avatarUrl,
                className,
                fathersName,
                mothersName,
                nidNumber,
                mobileNumber,
                guardianMobileNumber
            });
            await refreshUserInfo();
            toast({
                title: "Profile Updated",
                description: "Your personal information has been saved.",
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
                 toast({
                    title: "Avatar Updated",
                    description: "Your new profile picture has been set. Click 'Save Changes' to confirm.",
                });
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    if (!userInfo) {
        return <p className="p-8">Could not load your profile. Please try logging in again.</p>
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Student Profile</h1>
        <p className="text-muted-foreground">Manage your account and personal information.</p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Keep your details up-to-date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback>{fullName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                    <Label htmlFor="regNumber">Registration No.</Label>
                    <Input id="regNumber" value={userInfo.registrationNumber || 'N/A'} readOnly className="cursor-not-allowed bg-muted" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="classRoll">Class Roll</Label>
                    <Input id="classRoll" value={userInfo.classRoll || 'N/A'} readOnly className="cursor-not-allowed bg-muted" />
                </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} readOnly disabled/>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="className">Class</Label>
                    <Input id="className" value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g., Class 11" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="nidNumber">NID / Birth Certificate No.</Label>
                    <Input id="nidNumber" value={nidNumber} onChange={e => setNidNumber(e.target.value)} />
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="fathersName">Father's Name</Label>
                    <Input id="fathersName" value={fathersName} onChange={e => setFathersName(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="mothersName">Mother's Name</Label>
                    <Input id="mothersName" value={mothersName} onChange={e => setMothersName(e.target.value)} />
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Your Mobile Number</Label>
                    <Input id="mobileNumber" type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="01XXXXXXXXX"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="guardianMobileNumber">Guardian's Mobile Number</Label>
                    <Input id="guardianMobileNumber" type="tel" value={guardianMobileNumber} onChange={e => setGuardianMobileNumber(e.target.value)} placeholder="01XXXXXXXXX"/>
                </div>
            </div>
        </CardContent>
         <div className="p-6 pt-0">
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 animate-spin"/> : null}
                Save Changes
            </Button>
        </div>
      </Card>
    </div>
  );
}
