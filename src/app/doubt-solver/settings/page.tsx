
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";

export default function DoubtSolverSettingsPage() {
    const { toast } = useToast();
    const { resetPassword } = useAuth();

    const handlePasswordSave = async () => {
        const email = "test@example.com"; // In a real app, get this from useAuth()
         try {
            await resetPassword(email);
            toast({
                title: "Password Reset Email Sent",
                description: `Instructions to reset your password have been sent to ${email}.`,
            });
         } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive'});
         }
    };
    

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account security.</p>
      </div>
      
      <div className="space-y-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Click the button below to receive a password reset link in your email.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handlePasswordSave}>Send Password Reset Email</Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
