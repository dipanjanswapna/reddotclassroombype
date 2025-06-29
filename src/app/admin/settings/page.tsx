
'use client';

import { useState } from "react";
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
import { Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";


// Mock user data for demonstration
const currentUser = {
    id: 'usr_admn_004',
    fullName: "Admin Name",
    email: "admin@rdc.com",
    avatarUrl: "https://placehold.co/100x100.png",
};


export default function AdminSettingsPage() {
    const { toast } = useToast();

    // State for personal information
    const [fullName, setFullName] = useState(currentUser.fullName);
    const [email, setEmail] = useState(currentUser.email);
    const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);

    const handleInfoSave = () => {
        toast({
            title: "Profile Updated",
            description: "Your personal information has been saved.",
        });
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
            description: "This is a dummy action. Admin accounts cannot be deleted this way.",
            variant: "destructive"
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
        <h1 className="font-headline text-3xl font-bold tracking-tight">Admin Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and platform-wide configurations.</p>
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
                <Label htmlFor="userId">Admin ID</Label>
                <Input id="userId" value={currentUser.id} readOnly className="cursor-not-allowed bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </CardContent>
            <div className="p-6 pt-0">
                <Button onClick={handleInfoSave}>Save Changes</Button>
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
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Global settings for the entire platform.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                         <p className="text-[0.8rem] text-muted-foreground">
                            Temporarily disable access for non-admins.
                        </p>
                    </div>
                    <Switch id="maintenance-mode" />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="new-registrations">New Registrations</Label>
                         <p className="text-[0.8rem] text-muted-foreground">
                           Allow or disallow new user sign-ups.
                        </p>
                    </div>
                    <Switch id="new-registrations" defaultChecked/>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
