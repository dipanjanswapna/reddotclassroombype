'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Search, Info, Smartphone, Mail, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, HomepageConfig } from '@/lib/types';
import loginImage from '@/public/login.jpg';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { findRollNumberByEmailAction } from '@/app/actions/user.actions';
import { cn } from '@/lib/utils';

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" aria-hidden="true">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,36.631,44,30.836,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}

function FacebookIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#3F51B5" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
            <path fill="#FFF" d="M34.368,25.708h-6.142v16.292h-7.734V25.708h-4.433v-6.52h4.433v-4.66c0-4.39,2.685-6.78,6.597-6.78c1.88,0,3.504,0.14,3.976,0.205v6.251h-3.692c-2.131,0-2.543,1.011-2.543,2.498v2.965h6.643L34.368,25.708z"></path>
        </svg>
    )
}

/**
 * @fileOverview Localized Login Page
 * Ultra-colorful premium design with Hind Siliguri support and px-1 spacing.
 */
export default function LoginPageClient({ homepageConfig }: { homepageConfig: HomepageConfig }) {
  const { language, getLocalizedPath } = useLanguage();
  const { login, loginWithGoogle, loginWithFacebook, loginWithClassRoll, loginWithStaffId } = useAuth();
  const { toast } = useToast();
  const isBn = language === 'bn';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [classRoll, setClassRoll] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [role, setRole] = useState<User['role']>('Teacher');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('student');

  // Find Roll states
  const [searchEmail, setSearchEmail] = useState('');
  const [isFindingRoll, setIsFindingRoll] = useState(false);
  const [foundRoll, setFoundRoll] = useState<string | null>(null);
  const [findRollError, setFindRollError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password, role);
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClassRollLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        await loginWithClassRoll(classRoll, studentPassword);
    } catch (err: any) {
        setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleStaffIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        await loginWithStaffId(staffId, staffPassword);
    } catch (err: any) {
        setError(err.message || 'Failed to log in with Staff ID. Please check your credentials.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setError(null);
    try {
      if (provider === 'google') {
          await loginWithGoogle();
      } else {
          await loginWithFacebook();
      }
    } catch (err: any) {
       if (err.code === 'auth/popup-closed-by-user') {
         console.log('Firebase auth popup closed by user.');
       } else {
         setError(err.message || `Failed to log in with ${provider}.`);
       }
    } finally {
       setIsLoading(false);
    }
  };

  const handleFindRoll = async () => {
      if (!searchEmail) {
          setFindRollError(isBn ? "দয়া করে ইমেইল এড্রেস লিখুন।" : "Please enter your email address.");
          return;
      }
      setIsFindingRoll(true);
      setFindRollError(null);
      setFoundRoll(null);
      
      const result = await findRollNumberByEmailAction(searchEmail);
      if (result.success) {
          setFoundRoll(result.rollNumber!);
          toast({ title: isBn ? "রোল নম্বর পাওয়া গেছে!" : "Roll number found!" });
      } else {
          setFindRollError(result.message!);
      }
      setIsFindingRoll(false);
  };
  
  const currentRole = role === ('Partner' as any) ? 'Seller' : role;
  const socialLoginDisabled = !homepageConfig.platformSettings.Student.loginEnabled;
  const roleLoginDisabled = currentRole && currentRole !== 'Admin' && !homepageConfig.platformSettings[currentRole]?.loginEnabled;

  return (
    <div className={cn("w-full lg:grid lg:min-h-screen lg:grid-cols-2", isBn && "font-bengali")}>
      <div className="flex items-center justify-center py-12 px-4 bg-background">
        <Card className="w-full max-w-sm mx-auto shadow-2xl bg-card rounded-[30px] overflow-hidden border-primary/10">
            <CardHeader className="text-center bg-primary/5 p-8 border-b border-primary/10">
                <CardTitle className={cn(
                    "text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground",
                    !isBn && "font-headline"
                )}>
                    {t.login_welcome[language]}
                </CardTitle>
                <CardDescription className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                    {t.login_desc[language]}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 p-8">

                {error && (
                    <Alert variant="destructive" className="rounded-xl border-none shadow-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-2xl border border-black/5 shadow-inner">
                        <TabsTrigger value="student" className="rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest data-[state=active]:shadow-md">Student / Parent</TabsTrigger>
                        <TabsTrigger value="staff" className="rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest data-[state=active]:shadow-md">Staff / Partner</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="student" className="mt-6">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={isLoading || socialLoginDisabled} className="w-full h-12 rounded-xl font-bold shadow-sm border-primary/10 hover:bg-primary/5">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <GoogleIcon />}
                                    <span className="ml-2 text-[10px] font-black uppercase tracking-tighter">Google</span>
                                </Button>
                                <Button variant="social" onClick={() => handleSocialLogin('facebook')} disabled={isLoading || socialLoginDisabled} className="w-full h-12 rounded-xl font-bold shadow-sm">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <FacebookIcon />}
                                    <span className="ml-2 text-[10px] font-black uppercase tracking-tighter">Facebook</span>
                                </Button>
                            </div>
                            
                            {socialLoginDisabled && <p className="text-[10px] text-center text-destructive font-black uppercase tracking-widest">Student login is temporarily disabled.</p>}
                            
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-primary/5" />
                                </div>
                                <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.2em]">
                                    <span className="bg-card px-3 text-muted-foreground">
                                        {t.or_login_with_roll[language]}
                                    </span>
                                </div>
                            </div>

                            <form className="grid gap-5" onSubmit={handleClassRollLogin}>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="class-roll" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">{t.class_roll[language]}</Label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                                        <Input id="class-roll" placeholder="123456" required value={classRoll} onChange={(e) => setClassRoll(e.target.value)} className="h-12 rounded-xl border-primary/10 pl-10 bg-muted/20" />
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="student-password" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">{t.password[language]}</Label>
                                    <Input id="student-password" type="password" required value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} className="h-12 rounded-xl border-primary/10 bg-muted/20" />
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button type="button" className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                                                {t.find_roll_title[language]}?
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md rounded-[30px] border-primary/10 overflow-hidden px-1">
                                            <DialogHeader className="bg-primary/5 p-8 border-b border-primary/10">
                                                <DialogTitle className="font-headline text-2xl font-black uppercase tracking-tight">{t.find_roll_title[language]}</DialogTitle>
                                                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                                    {t.find_roll_desc[language]}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-6 p-8">
                                                <div className="space-y-3">
                                                    <Label htmlFor="search-email" className="text-[10px] font-black uppercase tracking-widest ml-1">{t.email[language]}</Label>
                                                    <div className="flex gap-2">
                                                        <Input 
                                                            id="search-email" 
                                                            type="email" 
                                                            placeholder="example@mail.com" 
                                                            value={searchEmail} 
                                                            onChange={e => setSearchEmail(e.target.value)}
                                                            className="rounded-xl h-12 border-primary/10 bg-muted/20"
                                                        />
                                                        <Button onClick={handleFindRoll} disabled={isFindingRoll} className="rounded-xl h-12 w-12 px-0 shadow-lg shadow-primary/20">
                                                            {isFindingRoll ? <Loader2 className="h-5 w-5 animate-spin"/> : <Search className="h-5 w-5"/>}
                                                        </Button>
                                                    </div>
                                                </div>
                                                {findRollError && (
                                                    <Alert variant="destructive" className="rounded-xl border-none bg-red-50 text-red-800 shadow-sm">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertDescription className="text-xs font-bold">{findRollError}</AlertDescription>
                                                    </Alert>
                                                )}
                                                {foundRoll && (
                                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                                        <Alert className="rounded-2xl border-2 border-green-200 bg-green-50 text-green-800 shadow-lg p-6">
                                                            <div className="flex flex-col items-center gap-3 text-center w-full">
                                                                <div className="bg-green-100 p-2 rounded-full"><ShieldCheck className="h-8 w-8 text-green-600" /></div>
                                                                <AlertDescription className="text-base font-bold uppercase tracking-tight">
                                                                    আপনার রোল নম্বরটি হলো: <br/>
                                                                    <span className="text-3xl font-black text-primary block mt-2 tracking-[0.2em]">{foundRoll}</span>
                                                                </AlertDescription>
                                                            </div>
                                                        </Alert>
                                                    </motion.div>
                                                )}
                                            </div>
                                            <DialogFooter className="bg-muted/30 p-4 border-t border-black/5">
                                                <DialogTrigger asChild>
                                                    <Button type="button" variant="ghost" className="rounded-xl font-black uppercase text-[10px] tracking-widest w-full">বন্ধ করুন (Close)</Button>
                                                </DialogTrigger>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    <Link href={getLocalizedPath("/password-reset")} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                                        {t.forgot_password[language]}
                                    </Link>
                                </div>
                                <Button type="submit" className="w-full font-black uppercase tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95" disabled={isLoading || socialLoginDisabled}>
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                    {t.login[language]}
                                </Button>
                            </form>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="staff" className="mt-6">
                        <Tabs defaultValue="email" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-xl shadow-inner border border-black/5 mb-6">
                                <TabsTrigger value="email" className="rounded-lg text-[9px] font-black uppercase tracking-widest">{t.email_login[language]}</TabsTrigger>
                                <TabsTrigger value="id" className="rounded-lg text-[9px] font-black uppercase tracking-widest">{t.login_with_staff_id[language]}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="email">
                                <form className="grid gap-5" onSubmit={handleEmailLogin}>
                                    <div className="space-y-2 text-left">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">System Role</Label>
                                        <Select value={role} onValueChange={(value) => setRole(value as User['role'])} required>
                                            <SelectTrigger className="h-12 rounded-xl border-primary/10 font-bold bg-muted/20">
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-primary/10 shadow-2xl">
                                                <SelectItem value="Admin" className="font-bold text-xs uppercase">Administrator</SelectItem>
                                                <SelectItem value="Teacher" className="font-bold text-xs uppercase">Elite Faculty</SelectItem>
                                                <SelectItem value="Seller" className="font-bold text-xs uppercase">Organization Partner</SelectItem>
                                                <SelectItem value="Moderator" className="font-bold text-xs uppercase">Community Moderator</SelectItem>
                                                <SelectItem value="Affiliate" className="font-bold text-xs uppercase">Affiliate Member</SelectItem>
                                                <SelectItem value="Doubt Solver" className="font-bold text-xs uppercase">Expert Solver</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">{t.email[language]}</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                                            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border-primary/10 pl-10 bg-muted/20" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">{t.password[language]}</Label>
                                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl border-primary/10 bg-muted/20" />
                                    </div>
                                    {roleLoginDisabled && (
                                        <Alert variant="destructive" className="p-3 text-[9px] rounded-xl font-bold border-none shadow-sm">
                                            <AlertDescription className="uppercase tracking-widest text-center">Login for '{role}' is currently restricted.</AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="flex items-center justify-end px-1">
                                        <Link href={getLocalizedPath("/password-reset")} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                                            {t.forgot_password[language]}
                                        </Link>
                                    </div>
                                    <Button type="submit" className="w-full font-black uppercase tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95" disabled={isLoading || !!roleLoginDisabled}>
                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                        {t.login[language]}
                                    </Button>
                                </form>
                            </TabsContent>
                            <TabsContent value="id">
                                <form className="grid gap-5" onSubmit={handleStaffIdLogin}>
                                    <div className="space-y-2 text-left">
                                        <Label htmlFor="staff-id" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">{t.staff_id[language]}</Label>
                                        <Input id="staff-id" placeholder="12345678" required value={staffId} onChange={(e) => setStaffId(e.target.value)} className="h-12 rounded-xl border-primary/10 bg-muted/20" />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <Label htmlFor="staff-password" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">{t.password[language]}</Label>
                                        <Input id="staff-password" type="password" required value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="h-12 rounded-xl border-primary/10 bg-muted/20" />
                                    </div>
                                    <div className="flex items-center justify-end px-1">
                                        <Link href={getLocalizedPath("/password-reset")} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                                            {t.forgot_password[language]}
                                        </Link>
                                    </div>
                                    <Button type="submit" className="w-full font-black uppercase tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                        {t.login[language]}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
                

            <div className="mt-4 text-center text-[11px] font-bold">
                <span className="text-muted-foreground uppercase tracking-widest opacity-60">{t.no_account[language]}</span>{' '}
                <Link href={getLocalizedPath("/signup")} className="font-black uppercase tracking-widest text-primary hover:underline">
                    {t.signup[language]}
                </Link>
            </div>
            </CardContent>
        </Card>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <Image
          src={loginImage}
          alt="Students learning in a classroom"
          placeholder="blur"
          fill
          className="object-cover"
          data-ai-hint="students classroom"
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white text-left space-y-2">
            <h2 className="text-4xl font-black uppercase font-headline leading-none">RDC Ecosystem</h2>
            <p className="text-lg font-medium opacity-80 max-w-md">Join thousands of students achieving excellence every single day.</p>
        </div>
      </div>
    </div>
  );
}
