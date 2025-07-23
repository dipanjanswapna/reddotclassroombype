
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/auth-context";


export default function StudentSettingsPage() {
    const { toast } = useToast();
    const { resetPassword, userInfo } = useAuth();

    const handlePasswordReset = async () => {
        if (!userInfo?.email) {
             toast({ title: 'Error', description: 'Could not find your email.', variant: 'destructive'});
             return;
        }
         try {
            await resetPassword(userInfo.email);
            toast({
                title: "Password Reset Email Sent",
                description: `Instructions to reset your password have been sent to ${userInfo.email}.`,
            });
         } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive'});
         }
    };

    const handleDeleteAccount = () => {
        toast({
            title: "Account Deletion Requested",
            description: "Your account is scheduled for deletion. This action cannot be undone.",
            variant: "destructive"
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">Manage your account security and preferences.</p>
            </div>
            
            <div className="space-y-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Click the button below to receive a password reset link in your email.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handlePasswordReset}>Send Password Reset Email</Button>
                    </CardContent>
                </Card>

                 <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Delete Account</CardTitle>
                        <CardDescription>Permanently delete your account and all associated data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete Account</Button>
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
                            This action cannot be undone.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
