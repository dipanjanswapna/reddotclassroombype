
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

export default function ModeratorProfilePage() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // State for personal information
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100.png");

    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.name || "");
            setEmail(userInfo.email || "");
            setAvatarUrl(userInfo.avatarUrl || "https://placehold.co/100x100.png");
            setLoading(false);
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [userInfo, authLoading]);

    const handleSave = async () => {
        if (!userInfo?.id) return;
        setIsSaving(true);
        try {
            await saveUserAction({ id: userInfo.id, name: fullName, email, avatarUrl });
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
        return <p className="p-8">Could not load moderator profile. Please try logging in again.</p>
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Moderator Profile</h1>
        <p className="text-muted-foreground">Manage your moderator account details.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback>{fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
            <div className="space-y-2">
                <Label htmlFor="regNumber">Staff ID</Label>
                <Input id="regNumber" value={userInfo.registrationNumber || 'N/A'} readOnly className="cursor-not-allowed bg-muted" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="fullName">Moderator Name</Label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} readOnly disabled/>
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
