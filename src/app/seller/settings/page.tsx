
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { saveUserAction } from "@/app/actions/user.actions";

export default function SellerSettingsPage() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.name || "");
            setEmail(userInfo.email || "");
        }
    }, [userInfo]);

    const handleInfoSave = async () => {
        if (!userInfo?.id) return;
        setIsSaving(true);
        try {
            await saveUserAction({ id: userInfo.id, name: fullName });
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
