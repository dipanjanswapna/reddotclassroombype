
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

const currentModerator = {
    name: "Moderator User",
    email: "moderator@example.com",
    avatarUrl: "https://placehold.co/100x100.png"
};

export default function ModeratorProfilePage() {
    const { toast } = useToast();

    const [name, setName] = useState(currentModerator.name);
    const [email] = useState(currentModerator.email);
    const [avatarUrl, setAvatarUrl] = useState(currentModerator.avatarUrl);

    const handleSave = () => {
        toast({
            title: "Profile Updated",
            description: "Your personal information has been saved.",
        });
    };

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
        <CardContent className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="fullName">Moderator Name</Label>
            <Input id="fullName" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} readOnly disabled/>
            </div>
            <div className="pt-2">
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
