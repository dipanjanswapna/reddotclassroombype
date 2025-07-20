

'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Upload, KeyRound, Copy, Check, Gift } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { getHomepageConfig } from "@/lib/firebase/firestore";
import { HomepageConfig, PlatformSettings } from "@/lib/types";
import { saveHomepageConfigAction } from "@/app/actions/homepage.actions";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context";


export default function AdminSettingsPage() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();

    // State for personal information
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100.png");

    // State for platform settings
    const [config, setConfig] = useState<HomepageConfig | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [isSavingPlatform, setIsSavingPlatform] = useState(false);
    
    // State for API Keys
    const [firebaseConfig, setFirebaseConfig] = useState({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
    });
    const [generatedEnv, setGeneratedEnv] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const envOutputRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.name || "");
            setEmail(userInfo.email || "");
            setAvatarUrl(userInfo.avatarUrl || "https://placehold.co/100x100.png");
        }
    }, [userInfo]);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const fetchedConfig = await getHomepageConfig();
                setConfig(fetchedConfig);
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast({ title: "Error", description: "Could not load platform settings.", variant: "destructive" });
            } finally {
                setLoadingConfig(false);
            }
        }
        fetchConfig();
    }, [toast]);

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

    const handleSettingChange = (role: keyof PlatformSettings, type: 'signupEnabled' | 'loginEnabled', value: boolean) => {
        setConfig(prevConfig => {
            if (!prevConfig) return null;
            const newSettings = { ...prevConfig.platformSettings };
            newSettings[role] = { ...newSettings[role], [type]: value };
            return { ...prevConfig, platformSettings: newSettings };
        });
    };

    const handleReferralSettingChange = (field: 'pointsPerReferral' | 'referredDiscountPercentage', value: string) => {
        const numValue = Number(value);
        if (isNaN(numValue)) return;
        setConfig(prev => {
            if (!prev) return null;
            const referralSettings = { ...(prev.referralSettings || { pointsPerReferral: 10, referredDiscountPercentage: 10 }) };
            return {
                ...prev,
                referralSettings: {
                    ...referralSettings,
                    [field]: numValue
                }
            }
        });
    };
    
    const handleStoreSettingChange = (field: 'deliveryCharge' | 'freeDeliveryThreshold', value: string) => {
        const numValue = Number(value);
        if (isNaN(numValue)) return;
        setConfig(prev => {
            if (!prev) return null;
            const storeSettings = { ...(prev.storeSettings || { deliveryCharge: 40, freeDeliveryThreshold: 2 }) };
            return {
                ...prev,
                storeSettings: {
                    ...storeSettings,
                    [field]: numValue
                }
            }
        });
    };

    const handlePlatformSave = async () => {
        if (!config) return;
        setIsSavingPlatform(true);
        const result = await saveHomepageConfigAction(config);
        if (result.success) {
            toast({ title: 'Platform Settings Updated' });
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsSavingPlatform(false);
    };

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFirebaseConfig(prev => ({ ...prev, [id]: value }));
    }

    const handleGenerateEnv = async () => {
        const envContent = `NEXT_PUBLIC_FIREBASE_API_KEY=${firebaseConfig.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${firebaseConfig.appId}`;
        
        try {
            // This is a placeholder for a server action that would write to .env
            // For now, we just display it to the user.
            setGeneratedEnv(envContent);
            toast({
                title: 'Generated .env Content',
                description: 'Copy the content and paste it into a .env.local file in your project root.'
            });

            // Simulate saving to a server action in a real environment
            // await saveEnvFileAction(envContent);
            // toast({ title: 'Success', description: 'API keys have been saved successfully. The app will restart.' });

        } catch (error) {
            toast({ title: 'Error', description: 'Could not save API keys.', variant: 'destructive' });
        }
    };
    
    const copyToClipboard = () => {
        if (envOutputRef.current) {
            navigator.clipboard.writeText(envOutputRef.current.innerText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const managedRoles: (keyof Omit<PlatformSettings, 'Admin'>)[] = ['Student', 'Guardian', 'Teacher', 'Seller', 'Affiliate', 'Moderator'];


    if (authLoading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <LoadingSpinner className="w-12 h-12" />
        </div>
      );
    }
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
                    <CardTitle>API & Integrations</CardTitle>
                    <CardDescription>Manage Firebase API keys for the platform. These keys should be kept secret.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="apiKey">API Key</Label><Input id="apiKey" value={firebaseConfig.apiKey} onChange={handleApiKeyChange}/></div>
                        <div className="space-y-2"><Label htmlFor="authDomain">Auth Domain</Label><Input id="authDomain" value={firebaseConfig.authDomain} onChange={handleApiKeyChange}/></div>
                        <div className="space-y-2"><Label htmlFor="projectId">Project ID</Label><Input id="projectId" value={firebaseConfig.projectId} onChange={handleApiKeyChange}/></div>
                        <div className="space-y-2"><Label htmlFor="storageBucket">Storage Bucket</Label><Input id="storageBucket" value={firebaseConfig.storageBucket} onChange={handleApiKeyChange}/></div>
                        <div className="space-y-2"><Label htmlFor="messagingSenderId">Messaging Sender ID</Label><Input id="messagingSenderId" value={firebaseConfig.messagingSenderId} onChange={handleApiKeyChange}/></div>
                        <div className="space-y-2"><Label htmlFor="appId">App ID</Label><Input id="appId" value={firebaseConfig.appId} onChange={handleApiKeyChange}/></div>
                    </div>
                    {generatedEnv && (
                        <Alert className="mt-4">
                            <KeyRound className="h-4 w-4" />
                            <AlertTitle>Your Generated .env file</AlertTitle>
                            <AlertDescription className="mb-2">
                                For security, this information must be placed in a <code>.env.local</code> file at the root of your project. Then, restart your server for changes to take effect.
                            </AlertDescription>
                            <div className="relative p-2 bg-muted rounded-md font-mono text-xs">
                                <pre ref={envOutputRef}>{generatedEnv}</pre>
                                <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-7 w-7" onClick={copyToClipboard}>
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGenerateEnv}><KeyRound className="mr-2"/> Generate & Save to .env</Button>
                </CardFooter>
            </Card>
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
                    <Label htmlFor="regNumber">Admin Registration No.</Label>
                    <Input id="regNumber" value={userInfo?.registrationNumber || ''} readOnly className="cursor-not-allowed bg-muted" />
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
        </div>

        <div className="md:col-span-1 space-y-8">
           <Card>
                <CardHeader>
                    <CardTitle>Platform Settings</CardTitle>
                    <CardDescription>Manage global settings for the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loadingConfig ? <div className="flex justify-center"><LoadingSpinner/></div> : (
                        <>
                            <div className="space-y-2">
                                <Label>Referral Settings</Label>
                                <div className="p-4 border rounded-md space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="pointsPerReferral">Points per Referral</Label>
                                        <Input id="pointsPerReferral" type="number" value={config?.referralSettings?.pointsPerReferral || 10} onChange={e => handleReferralSettingChange('pointsPerReferral', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="referredDiscountPercentage">Referred User Discount (%)</Label>
                                        <Input id="referredDiscountPercentage" type="number" value={config?.referralSettings?.referredDiscountPercentage || 10} onChange={e => handleReferralSettingChange('referredDiscountPercentage', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Store Settings</Label>
                                <div className="p-4 border rounded-md space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="deliveryCharge">Delivery Charge (BDT)</Label>
                                        <Input id="deliveryCharge" type="number" value={config?.storeSettings?.deliveryCharge || 40} onChange={e => handleStoreSettingChange('deliveryCharge', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (Items)</Label>
                                        <Input id="freeDeliveryThreshold" type="number" value={config?.storeSettings?.freeDeliveryThreshold || 2} onChange={e => handleStoreSettingChange('freeDeliveryThreshold', e.target.value)} />
                                        <p className="text-xs text-muted-foreground">Number of items required in cart for free delivery.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Registration & Login Control</Label>
                                {managedRoles.map(role => (
                                    <div key={role} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <Label htmlFor={`${role}-signup`} className="text-base">{role}</Label>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id={`${role}-signup`}
                                                    checked={config?.platformSettings[role]?.signupEnabled ?? false}
                                                    onCheckedChange={(value) => handleSettingChange(role, 'signupEnabled', value)}
                                                />
                                                <Label htmlFor={`${role}-signup`} className="text-sm">Sign-up</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id={`${role}-login`}
                                                    checked={config?.platformSettings[role]?.loginEnabled ?? false}
                                                    onCheckedChange={(value) => handleSettingChange(role, 'loginEnabled', value)}
                                                />
                                                <Label htmlFor={`${role}-login`} className="text-sm">Login</Label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handlePlatformSave} disabled={isSavingPlatform || loadingConfig} className="w-full">
                        {isSavingPlatform && <Loader2 className="mr-2 animate-spin" />}
                        Save Platform Settings
                    </Button>
                </CardFooter>
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
      </div>
    </div>
  );
}

    