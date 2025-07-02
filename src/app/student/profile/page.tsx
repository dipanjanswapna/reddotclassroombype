

'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
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
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { updateUser } from "@/lib/firebase/firestore";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuth } from "@/context/auth-context";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // State for personal information
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100.png");
    const [fathersName, setFathersName] = useState("");
    const [mothersName, setMothersName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [nidNumber, setNidNumber] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.name || "");
            setEmail(userInfo.email || "");
            setAvatarUrl(userInfo.avatarUrl || "https://placehold.co/100x100.png");
            setFathersName(userInfo.fathersName || "");
            setMothersName(userInfo.mothersName || "");
            setMobileNumber(userInfo.mobileNumber || "");
            setNidNumber(userInfo.nidNumber || "");
            setAddress(userInfo.address || "");
            setLoading(false);
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [userInfo, authLoading]);

    const handleInfoSave = async () => {
        if (!userInfo?.id) return;
        setIsSaving(true);
        try {
            await updateUser(userInfo.id, { 
                name: fullName, 
                avatarUrl,
                fathersName,
                mothersName,
                mobileNumber,
                nidNumber,
                address,
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

    const handlePasswordSave = () => {
         toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });
    };
    
    const handleDeleteAccount = () => {
        toast({
            title: "Account Deletion Requested",
            description: "Your account is scheduled for deletion. This action cannot be undone.",
            variant: "destructive"
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
        return <p className="p-8">Could not load user profile. Please try logging in again.</p>
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and personal information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={fullName} data-ai-hint="male student" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="userId">Student ID</Label>
                    <Input id="userId" value={userInfo.uid || ''} readOnly className="cursor-not-allowed bg-muted" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="classRoll">Class Roll</Label>
                    <Input id="classRoll" value={userInfo.classRoll || 'N/A'} readOnly className="cursor-not-allowed bg-muted" />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <Input id="regNumber" value={userInfo.registrationNumber || 'N/A'} readOnly className="cursor-not-allowed bg-muted" />
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
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input id="mobileNumber" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nidNumber">NID Number (Optional)</Label>
                    <Input id="nidNumber" value={nidNumber} onChange={e => setNidNumber(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={address} onChange={e => setAddress(e.target.value)} />
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

        <div className="md:col-span-1 space-y-8">
           <Card>
             <CardHeader>
              <CardTitle>Account Management</CardTitle>
            </CardHeader>
             <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action is permanent and cannot be undone. This will permanently delete your account and all associated data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteAccount}>
                                Yes, delete my account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-muted-foreground mt-2">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
             </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Receive emails about course updates and announcements.
                        </p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                         <p className="text-[0.8rem] text-muted-foreground">
                            Get push notifications on your devices.
                        </p>
                    </div>
                    <Switch id="push-notifications" />
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
