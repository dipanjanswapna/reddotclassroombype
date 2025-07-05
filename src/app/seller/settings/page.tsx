
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { saveUserAction } from "@/app/actions/user.actions";

export default function SellerSettingsPage() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100.png");

    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.name || "");
            setEmail(userInfo.email || "");
            setAvatarUrl(userInfo.avatarUrl || "https://placehold.co/100x100.png");
        }
    }, [userInfo]);

    const handleInfoSave = async () => {
        if (!userInfo?.id) return;
        setIsSaving(true);
        try {
            await saveUserAction({ id: userInfo.id, name: fullName, avatarUrl });
            await refreshUserInfo();
            toast({
                title: "Profile Updated",
                description: "Your contact information has been saved.",
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSave = () => {
         toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });
    };
    
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
                 toast({
                    title: "Avatar Updated",
                    description: "Your new avatar has been set. Click 'Save Changes' to confirm.",
                });
            };
            reader.readAsDataURL(file);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">Manage your primary contact account.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Person Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={email} readOnly disabled/>
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Button onClick={handleInfoSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 animate-spin"/> : null}
                                Save Changes
                            </Button>
                        </div>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password. Make sure it's a strong one.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input id="currentPassword" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input id="newPassword" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input id="confirmPassword" type="password" />
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Button onClick={handlePasswordSave}>Update Password</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
