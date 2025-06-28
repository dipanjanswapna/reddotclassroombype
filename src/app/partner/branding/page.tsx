
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Palette } from "lucide-react";
import Image from "next/image";

// Mock data
const currentPartner = {
    name: "MediShark",
    logoUrl: "https://placehold.co/100x100.png",
    primaryColor: "#007BFF",
    secondaryColor: "#6C757D"
};

export default function PartnerBrandingPage() {
    const { toast } = useToast();

    const [name, setName] = useState(currentPartner.name);
    const [logoUrl, setLogoUrl] = useState(currentPartner.logoUrl);
    const [primaryColor, setPrimaryColor] = useState(currentPartner.primaryColor);
    const [secondaryColor, setSecondaryColor] = useState(currentPartner.secondaryColor);

    const handleSave = () => {
        toast({
            title: "Branding Settings Saved",
            description: "Your organization's branding has been updated.",
        });
        console.log({ name, logoUrl, primaryColor, secondaryColor });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Branding & Customization
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Customize the look and feel of your partner portal.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Brand Settings</CardTitle>
                    <CardDescription>This information will be used on your dedicated course pages and future branded portal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name</Label>
                        <Input id="orgName" value={name} onChange={e => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Organization Logo</Label>
                        <div className="flex items-center gap-4">
                            <Image src={logoUrl} alt="Logo Preview" width={80} height={80} className="rounded-md bg-muted p-1" />
                            <div className="flex-grow">
                                <Label htmlFor="logoUrl" className="sr-only">Logo URL</Label>
                                <Input id="logoUrl" placeholder="https://example.com/logo.png" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
                                <p className="text-xs text-muted-foreground mt-1">Enter the URL of your logo image.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Primary Brand Color</Label>
                            <div className="relative">
                                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="primaryColor" 
                                    type="color" 
                                    value={primaryColor} 
                                    onChange={e => setPrimaryColor(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="secondaryColor">Secondary Brand Color</Label>
                             <div className="relative">
                                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="secondaryColor" 
                                    type="color" 
                                    value={secondaryColor} 
                                    onChange={e => setSecondaryColor(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button onClick={handleSave}>Save Branding</Button>
                </div>
            </Card>
        </div>
    );
}
