'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Palette, Link as LinkIcon, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { organizations } from "@/lib/mock-data";
import { Textarea } from "@/components/ui/textarea";

// Mock data - in a real app, this would come from auth context
const currentPartner = organizations.find(org => org.id === 'org_medishark')!;

export default function PartnerBrandingPage() {
    const { toast } = useToast();

    const [name, setName] = useState(currentPartner.name);
    const [logoUrl, setLogoUrl] = useState(currentPartner.logoUrl);
    const [primaryColor, setPrimaryColor] = useState(currentPartner.primaryColor);
    const [secondaryColor, setSecondaryColor] = useState(currentPartner.secondaryColor);
    const [heroTitle, setHeroTitle] = useState(currentPartner.hero?.title || '');
    const [heroSubtitle, setHeroSubtitle] = useState(currentPartner.hero?.subtitle || '');
    const [heroImageUrl, setHeroImageUrl] = useState(currentPartner.hero?.imageUrl || '');
    const [siteUrl, setSiteUrl] = useState('');

     useEffect(() => {
        setSiteUrl(`${window.location.origin}/sites/${currentPartner.subdomain}`);
    }, []);


    const handleSave = () => {
        toast({
            title: "Branding Settings Saved",
            description: "Your organization's branding has been updated.",
        });
        console.log({ name, logoUrl, primaryColor, secondaryColor, heroTitle, heroSubtitle, heroImageUrl });
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Site Management & Branding
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Customize the look and feel of your dedicated partner site.
                </p>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Your Dedicated Site URL</CardTitle>
                    <CardDescription>This is the public URL where students can see all of your courses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 p-3 rounded-md bg-muted border">
                        <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                        {siteUrl ? (
                            <Link href={siteUrl} target="_blank" className="font-mono text-sm text-primary hover:underline truncate">
                                {siteUrl}
                            </Link>
                        ) : (
                             <div className="h-5 w-64 bg-muted-foreground/20 rounded-md animate-pulse" />
                        )}
                         <Button asChild variant="secondary" size="sm" className="ml-auto">
                            <Link href={siteUrl} target="_blank" aria-disabled={!siteUrl}>
                                View Site <ExternalLink className="ml-2 h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Hero Section</CardTitle>
                    <CardDescription>Customize the main banner section of your site's homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="heroTitle">Hero Title</Label>
                        <Input id="heroTitle" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} placeholder="e.g., Welcome to Our Academy" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                        <Textarea id="heroSubtitle" value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} placeholder="e.g., Your gateway to excellence." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroImage">Hero Background Image URL</Label>
                        <Input id="heroImage" value={heroImageUrl} onChange={e => setHeroImageUrl(e.target.value)} placeholder="https://placehold.co/1200x400.png" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Brand Settings</CardTitle>
                    <CardDescription>This information will be used on your dedicated course pages and partner site.</CardDescription>
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
                            <Label htmlFor="primaryColor">Primary Brand Color (HSL)</Label>
                            <div className="relative">
                                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="primaryColor" 
                                    value={primaryColor} 
                                    onChange={e => setPrimaryColor(e.target.value)}
                                    className="pl-10 font-mono"
                                    placeholder="e.g., 211 100% 50%"
                                />
                            </div>
                             <p className="text-xs text-muted-foreground mt-1">Enter HSL values without 'hsl()'. Example: 211 100% 50%</p>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="secondaryColor">Secondary Brand Color (HSL)</Label>
                             <div className="relative">
                                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="secondaryColor" 
                                    value={secondaryColor} 
                                    onChange={e => setSecondaryColor(e.target.value)}
                                    className="pl-10 font-mono"
                                    placeholder="e.g., 210 40% 98%"
                                />
                            </div>
                             <p className="text-xs text-muted-foreground mt-1">Example: 210 40% 98%</p>
                        </div>
                    </div>
                </CardContent>
                <div className="p-6 pt-0 flex justify-end">
                    <Button onClick={handleSave}>Save All Changes</Button>
                </div>
            </Card>
        </div>
    );
}
