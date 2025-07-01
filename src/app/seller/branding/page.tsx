
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Palette, Link as LinkIcon, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { getOrganizationByUserId } from "@/lib/firebase/firestore";
import { savePartnerBrandingAction } from "@/app/actions/organization.actions";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/loading-spinner";
import type { Organization } from "@/lib/types";
import { useAuth } from "@/context/auth-context";


export default function SellerBrandingPage() {
    const { toast } = useToast();
    const { userInfo } = useAuth();
    const [partner, setPartner] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const [heroTitle, setHeroTitle] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');
    const [heroImageUrl, setHeroImageUrl] = useState('');
    const [heroDataAiHint, setHeroDataAiHint] = useState('');
    const [siteUrl, setSiteUrl] = useState('');

    useEffect(() => {
        if (!userInfo) return;

        const fetchPartner = async () => {
            try {
                const partnerData = await getOrganizationByUserId(userInfo.uid);
                if (partnerData) {
                    setPartner(partnerData);
                    setName(partnerData.name);
                    setLogoUrl(partnerData.logoUrl);
                    setPrimaryColor(partnerData.primaryColor);
                    setSecondaryColor(partnerData.secondaryColor);
                    setHeroTitle(partnerData.hero?.title || '');
                    setHeroSubtitle(partnerData.hero?.subtitle || '');
                    setHeroImageUrl(partnerData.hero?.imageUrl || '');
                    setHeroDataAiHint(partnerData.hero?.dataAiHint || '');
                    setSiteUrl(`${window.location.origin}/sites/${partnerData.subdomain}`);
                } else {
                    toast({ title: "Error", description: "Could not find your organization details.", variant: "destructive" });
                }
            } catch (err) {
                console.error(err);
                toast({ title: "Error", description: "Failed to load seller data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchPartner();
    }, [userInfo, toast]);


    const handleSave = async () => {
        if (!partner) return;
        setIsSaving(true);
        const dataToSave: Partial<Organization> = {
            name,
            logoUrl,
            primaryColor,
            secondaryColor,
            hero: {
                title: heroTitle,
                subtitle: heroSubtitle,
                imageUrl: heroImageUrl,
                dataAiHint: heroDataAiHint,
            }
        };

        const result = await savePartnerBrandingAction(partner.id!, dataToSave);

        if(result.success) {
             toast({
                title: "Branding Settings Saved",
                description: "Your organization's branding has been updated.",
            });
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setIsSaving(false);
    };

    if (loading) {
        return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <LoadingSpinner className="w-12 h-12" />
          </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Seller Storefront & Branding
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Customize the look and feel of your dedicated seller storefront.
                </p>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Your Seller Storefront URL</CardTitle>
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
                    <CardDescription>Customize the main banner section of your storefront homepage.</CardDescription>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="heroImage">Hero Background Image URL</Label>
                            <Input id="heroImage" value={heroImageUrl} onChange={e => setHeroImageUrl(e.target.value)} placeholder="https://placehold.co/1200x400.png" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="heroDataAiHint">Hero Image AI Hint</Label>
                            <Input id="heroDataAiHint" value={heroDataAiHint} onChange={e => setHeroDataAiHint(e.target.value)} placeholder="e.g., students classroom" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Brand Settings</CardTitle>
                    <CardDescription>This information will be used on your course pages and seller storefront.</CardDescription>
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
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin mr-2"/>}
                        Save All Changes
                    </Button>
                </div>
            </Card>
        </div>
    );
}
