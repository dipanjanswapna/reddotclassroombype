'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Monitor, Smartphone, Trash2, ShieldCheck, Info, Trophy, Save, Zap } from "lucide-react";
import { saveUserAction, removeUserSessionAction } from "@/app/actions/user.actions";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { safeToDate } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <div className="space-y-10 md:space-y-14 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-l-4 border-primary pl-6"
      >
        <div>
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">
                My <span className="text-primary">Profile</span>
            </h1>
            <p className="text-muted-foreground font-medium mt-2">Manage your account, rewards and connected devices.</p>
        </div>
        <div className="flex items-center gap-4">
            <Card className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-50 border-amber-200 shadow-sm">
                <Trophy className="w-5 h-5 text-amber-600" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">Reward Points</span>
                    <span className="font-black text-amber-700 leading-none">{userInfo.referralPoints || 0}</span>
                </div>
            </Card>
            <Button onClick={handleSave} disabled={isSaving} className="font-black uppercase tracking-widest px-8 rounded-xl shadow-xl shadow-primary/20 h-11">
                {isSaving ? <Loader2 className="mr-2 animate-spin h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>}
                Save Changes
            </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-3xl overflow-hidden bg-[#eef2ed] dark:bg-card/40">
                <CardHeader className="p-8 md:p-10 border-b border-primary/10 bg-white/20">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-2xl relative z-10">
                                <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-black text-4xl">{fullName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 z-20 bg-primary text-white p-2.5 rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all border-2 border-white">
                                <Upload className="w-5 h-5" />
                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </label>
                        </div>
                        <div className="space-y-3 text-center md:text-left">
                            <div className="space-y-1">
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">{fullName}</h2>
                                <p className="text-muted-foreground font-bold text-sm md:text-base">{email}</p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black uppercase text-[10px] tracking-widest px-3 py-1">{userInfo.role}</Badge>
                                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-black uppercase text-[10px] tracking-widest px-3 py-1">Class {className || 'N/A'}</Badge>
                                <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-tighter">ID: {userInfo.registrationNumber || 'N/A'}</Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 md:p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Student Full Name</Label>
                            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="rounded-xl border-primary/10 bg-white h-12 text-base font-medium focus:border-primary/50" />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="className" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Class / Batch Level</Label>
                            <Input id="className" value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g., Class 11" className="rounded-xl border-primary/10 bg-white h-12 text-base font-medium focus:border-primary/50" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label htmlFor="mobileNumber" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Student Mobile Number</Label>
                            <Input id="mobileNumber" type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="01XXXXXXXXX" className="rounded-xl border-primary/10 bg-white h-12 text-base font-medium focus:border-primary/50" />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="guardianMobileNumber" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Guardian's Mobile Number</Label>
                            <Input id="guardianMobileNumber" type="tel" value={guardianMobileNumber} onChange={e => setGuardianMobileNumber(e.target.value)} placeholder="01XXXXXXXXX" className="rounded-xl border-primary/10 bg-white h-12 text-base font-medium focus:border-primary/50" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label htmlFor="fathersName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Father's Name</Label>
                            <Input id="fathersName" value={fathersName} onChange={e => setFathersName(e.target.value)} className="rounded-xl border-primary/10 bg-white h-12 text-base font-medium focus:border-primary/50" />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="mothersName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Mother's Name</Label>
                            <Input id="mothersName" value={mothersName} onChange={e => setMothersName(e.target.value)} className="rounded-xl border-primary/10 bg-white h-12 text-base font-medium focus:border-primary/50" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
            <Card className="rounded-3xl overflow-hidden bg-white dark:bg-card/40">
                <CardHeader className="bg-primary/5 border-b border-primary/10 p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Quick Overview</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-muted/50 border border-primary/5 text-center">
                            <p className="text-2xl font-black text-foreground">{(userInfo.enrolledCourses || []).length}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Enrolled</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/50 border border-primary/5 text-center">
                            <p className="text-2xl font-black text-primary">{userInfo.referralPoints || 0}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Points</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-primary/10 pb-2">Academic Profile</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-muted-foreground">Class Roll</span>
                                <span className="font-black text-foreground">{userInfo.classRoll || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-muted-foreground">Reg. Number</span>
                                <span className="font-black text-foreground font-mono">{userInfo.registrationNumber || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-3xl overflow-hidden bg-white dark:bg-card/40">
                <CardHeader className="bg-primary/5 border-b border-primary/10 p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Monitor className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Active Devices</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                        {(userInfo.activeSessions || []).length > 0 ? (
                            userInfo.activeSessions?.map((session) => {
                                const isCurrent = session.id === currentSessionId;
                                const loginDate = safeToDate(session.lastLoginAt);
                                const formattedDate = !isNaN(loginDate.getTime()) ? format(loginDate, "MMM d, hh:mm a") : "Unknown";

                                return (
                                    <div key={session.id} className={cn(
                                        "p-3 rounded-2xl border transition-all duration-300",
                                        isCurrent ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-white/50 border-primary/5"
                                    )}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-xl shrink-0",
                                                    isCurrent ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {session.deviceName.toLowerCase().includes('android') || session.deviceName.toLowerCase().includes('iphone') 
                                                        ? <Smartphone className="w-4 h-4" /> 
                                                        : <Monitor className="w-4 h-4" />
                                                    }
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-black text-xs uppercase tracking-tight">{session.deviceName}</p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{formattedDate}</p>
                                                </div>
                                            </div>
                                            {!isCurrent && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl" 
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
                                <p className="text-[10px] font-black uppercase tracking-widest">No active sessions</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="bg-primary/5 p-4 flex justify-center gap-2 border-t border-primary/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Proctoring Secure</span>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}