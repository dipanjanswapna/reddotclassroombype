
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

const currentAffiliate = {
    name: "Affiliate User",
    email: "affiliate@example.com",
    avatarUrl: "https://placehold.co/100x100.png"
};

export default function AffiliateProfilePage() {
    const { toast } = useToast();

    const [name, setName] = useState(currentAffiliate.name);
    const [email] = useState(currentAffiliate.email);
    const [avatarUrl, setAvatarUrl] = useState(currentAffiliate.avatarUrl);

    const handleSave = () => {
        toast({
            title: "Profile Updated",
            description: "Your personal information has been saved.",
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
                    description: "Your new profile picture has been set.",
                });
            };
            reader.readAsDataURL(file);
        }
    };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Affiliate Profile</h1>
        <p className="text-muted-foreground">Manage your account and payment information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={name} />
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
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} readOnly disabled/>
              </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Your commissions will be sent to this bank account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Holder Name</Label>
                <Input id="accountName" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 flex items-start">
             <Button onClick={handleSave} className="w-full md:w-auto">Save All Changes</Button>
        </div>
      </div>
    </div>
  );
}
