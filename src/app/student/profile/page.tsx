'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Monitor, Smartphone, Trash2, ShieldCheck, Info } from "lucide-react";
import { saveUserAction, removeUserSessionAction } from "@/app/actions/user.actions";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { safeToDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StudentProfilePage() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [removingSessionId, setRemovingSessionId] = useState<string | null>(null);

    // Form state
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100.png");
    const [className, setClassName] = useState("");
    const [fathersName, setFathersName] = useState("");
    const [mothersName, setMothersName] = useState("");
    const [nidNumber, setNidNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [guardianMobileNumber, setGuardianMobileNumber] = useState("");

    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.name || "");
            setEmail(userInfo.email || "");
            setAvatarUrl(userInfo.avatarUrl || "https://placehold.co/100x100.png");
            setClassName(userInfo.className || "");
            setFathersName(userInfo.fathersName || "");
            setMothersName(userInfo.mothersName || "");
            setNidNumber(userInfo.nidNumber || "");
            setMobileNumber(userInfo.mobileNumber || "");
            setGuardianMobileNumber(userInfo.guardianMobileNumber || "");
            setLoading(false);
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [userInfo, authLoading]);

    const handleSave = async () => {
        if (!userInfo?.id) return;
        setIsSaving(true);
        try {
            await saveUserAction({ 
                id: userInfo.id, 
                name: fullName, 
                avatarUrl,
                className,
                fathersName,
                mothersName,
                nidNumber,
                mobileNumber,
                guardianMobileNumber
            });
            await refreshUserInfo();
            toast({
                title: "Profile Updated",
                description: "Your personal information has been saved.",
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
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

    const handleRemoveSession = async (sessionId: string) => {
        if (!userInfo?.id) return;
        setRemovingSessionId(sessionId);
        try {
            const result = await removeUserSessionAction(userInfo.id, sessionId);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                await refreshUserInfo();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setRemovingSessionId(null);
        }
    };

    const currentSessionId = typeof window !== 'undefined' ? localStorage.getItem('rdc_session_id') : null;

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    if (!userInfo) {
        return <p className="p-8">Could not load your profile. Please try logging in again.</p>
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Student Profile</h1>
        <p className="text-muted-foreground">Manage your account and personal information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-2xl md:rounded-3xl border-white/30 bg-[#eef2ed] shadow-xl">
                <CardHeader>
                <CardTitle className="font-black uppercase tracking-tight">Your Information</CardTitle>
                <CardDescription className="font-medium text-muted-foreground">Keep your details up-to-date.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                            <AvatarImage src={avatarUrl} alt={fullName} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{fullName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <Label htmlFor="avatar-upload" className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Update Avatar</Label>
                            <div className="relative">
                                <Input id="avatar-upload-visible" type="text" readOnly placeholder="No file selected" className="pr-24 rounded-xl border-black/5" />
                                <label htmlFor="avatar-upload" className="absolute inset-y-0 right-0 flex items-center">
                                    <Button asChild variant="outline" className="rounded-l-none rounded-r-xl border-none bg-white hover:bg-white/80 h-full">
                                        <div><Upload className="mr-2 h-4 w-4"/>Upload</div>
                                    </Button>
                                </label>
                                <Input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="regNumber" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Registration No.</Label>
                            <Input id="regNumber" value={userInfo.registrationNumber || 'N/A'} readOnly className="cursor-not-allowed bg-white/50 border-black/5 font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="classRoll" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Class Roll</Label>
                            <Input id="classRoll" value={userInfo.classRoll || 'N/A'} readOnly className="cursor-not-allowed bg-white/50 border-black/5 font-mono" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="rounded-xl border-black/5 bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                            <Input id="email" type="email" value={email} readOnly disabled className="bg-white/50 border-black/5" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="className" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Class</Label>
                            <Input id="className" value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g., Class 11" className="rounded-xl border-black/5 bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nidNumber" className="text-xs font-black uppercase tracking-widest text-muted-foreground">NID / Birth Certificate No.</Label>
                            <Input id="nidNumber" value={nidNumber} onChange={e => setNidNumber(e.target.value)} className="rounded-xl border-black/5 bg-white" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fathersName" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Father's Name</Label>
                            <Input id="fathersName" value={fathersName} onChange={e => setFathersName(e.target.value)} className="rounded-xl border-black/5 bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mothersName" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mother's Name</Label>
                            <Input id="mothersName" value={mothersName} onChange={e => setMothersName(e.target.value)} className="rounded-xl border-black/5 bg-white" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mobileNumber" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Mobile Number</Label>
                            <Input id="mobileNumber" type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="01XXXXXXXXX" className="rounded-xl border-black/5 bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianMobileNumber" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Guardian's Mobile Number</Label>
                            <Input id="guardianMobileNumber" type="tel" value={guardianMobileNumber} onChange={e => setGuardianMobileNumber(e.target.value)} placeholder="01XXXXXXXXX" className="rounded-xl border-black/5 bg-white" />
                        </div>
                    </div>
                </CardContent>
                <div className="p-6 pt-0 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="font-black uppercase tracking-widest px-8 rounded-xl shadow-lg shadow-primary/20 h-12">
                        {isSaving ? <Loader2 className="mr-2 animate-spin h-4 w-4"/> : null}
                        Save Changes
                    </Button>
                </div>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
            {/* Manage Devices Section */}
            <Card className="rounded-2xl md:rounded-3xl border-white/30 bg-[#eef2ed] shadow-xl overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-black/5 p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Monitor className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Manage Devices</CardTitle>
                    </div>
                    <CardDescription className="font-medium text-xs">
                        Manage your active login sessions. You can be logged in on up to 2 devices.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-tighter">
                            Device Limit: 2 active sessions. Removing a device will free up a slot.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        {(userInfo.activeSessions || []).length > 0 ? (
                            userInfo.activeSessions?.map((session) => {
                                const isCurrent = session.id === currentSessionId;
                                const loginDate = safeToDate(session.lastLoginAt);
                                const formattedDate = !isNaN(loginDate.getTime()) ? format(loginDate, "MMM d, yyyy, hh:mm a") : "Unknown Time";

                                return (
                                    <div key={session.id} className={cn(
                                        "p-4 rounded-2xl border transition-all duration-300",
                                        isCurrent ? "bg-white border-primary/20 shadow-md ring-1 ring-primary/10" : "bg-white/50 border-black/5"
                                    )}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-xl shrink-0",
                                                    session.deviceName.toLowerCase().includes('windows') ? "bg-blue-100 text-blue-600" : "bg-primary/10 text-primary"
                                                )}>
                                                    {session.deviceName.toLowerCase().includes('android') || session.deviceName.toLowerCase().includes('iphone') 
                                                        ? <Smartphone className="w-5 h-5" /> 
                                                        : <Monitor className="w-5 h-5" />
                                                    }
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-sm uppercase tracking-tight">{session.deviceName}</p>
                                                        {isCurrent && <Badge variant="accent" className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0 h-4">Current Device</Badge>}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-muted-foreground">Logged in: {formattedDate}</p>
                                                    <p className="text-[10px] font-mono text-primary/60">IP: {session.ipAddress}</p>
                                                </div>
                                            </div>
                                            {!isCurrent && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg shrink-0" 
                                                    onClick={() => handleRemoveSession(session.id)}
                                                    disabled={removingSessionId === session.id}
                                                >
                                                    {removingSessionId === session.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 opacity-50">
                                <Monitor className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-xs font-bold uppercase">No active sessions found</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="bg-black/5 p-4 flex justify-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Single Device Policy Enforced</span>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
