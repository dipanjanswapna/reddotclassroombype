
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
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
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue="Student Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="student@rdc.com" />
              </div>
            </CardContent>
            <div className="p-6 pt-0">
                <Button>Save Changes</Button>
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
                <Button>Update Password</Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
           <Card>
             <CardHeader>
              <CardTitle>Account Management</CardTitle>
            </CardHeader>
             <CardContent>
                <Button variant="destructive" className="w-full">Delete Account</Button>
                <p className="text-xs text-muted-foreground mt-2">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
