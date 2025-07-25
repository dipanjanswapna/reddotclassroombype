
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
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, HomepageConfig } from '@/lib/types';
import loginImage from '@/public/login.jpg';


function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" aria-hidden="true">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,36.631,44,30.836,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}

function FacebookIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#3F51B5" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
            <path fill="#FFF" d="M34.368,25.708h-6.142v16.292h-7.734V25.708h-4.433v-6.52h4.433v-4.66c0-4.39,2.685-6.78,6.597-6.78c1.88,0,3.504,0.14,3.976,0.205v6.251h-3.692c-2.131,0-2.543,1.011-2.543,2.498v2.965h6.643L34.368,25.708z"></path>
        </svg>
    )
}

export default function LoginPageClient({ homepageConfig }: { homepageConfig: HomepageConfig }) {
  const { language } = useLanguage();
  const { login, loginWithGoogle, loginWithFacebook, loginWithClassRoll, loginWithStaffId } = useAuth();

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
  
  const currentRole = role === ('Partner' as any) ? 'Seller' : role;
  const socialLoginDisabled = !homepageConfig.platformSettings.Student.loginEnabled;
  const roleLoginDisabled = currentRole && currentRole !== 'Admin' && !homepageConfig.platformSettings[currentRole]?.loginEnabled;

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-sm mx-auto shadow-lg">
            <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">{t.login_welcome[language]}</CardTitle>
            <CardDescription>{t.login_desc[language]}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="student">Student / Guardian</TabsTrigger>
                        <TabsTrigger value="staff">Staff / Seller</TabsTrigger>
                    </TabsList>
                    <TabsContent value="student">
                        <div className="pt-4 grid gap-4">
                            <p className="text-center text-sm text-muted-foreground">The easiest way to login or create an account.</p>
                            <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={isLoading || socialLoginDisabled} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GoogleIcon />}
                                <span className="ml-2">Continue with Google</span>
                            </Button>
                            <Button variant="social" onClick={() => handleSocialLogin('facebook')} disabled={isLoading || socialLoginDisabled} className="w-full">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FacebookIcon />}
                                <span className="ml-2">Continue with Facebook</span>
                            </Button>
                            {socialLoginDisabled && <p className="text-xs text-center text-destructive">Student & Guardian login is temporarily disabled.</p>}
                            
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        {t.or_login_with_roll[language]}
                                    </span>
                                </div>
                            </div>

                            <form className="grid gap-4" onSubmit={handleClassRollLogin}>
                                <div className="grid gap-2">
                                    <Label htmlFor="class-roll">{t.class_roll[language]}</Label>
                                    <Input id="class-roll" placeholder="123456" required value={classRoll} onChange={(e) => setClassRoll(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="student-password">{t.password[language]}</Label>
                                    <Input id="student-password" type="password" required value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} />
                                </div>
                                <div className="flex items-center justify-end">
                                    <Link href="/password-reset" className="text-sm text-primary hover:underline">
                                        {t.forgot_password[language]}
                                    </Link>
                                </div>
                                <Button type="submit" className="w-full font-bold" disabled={isLoading || socialLoginDisabled}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    {t.login[language]}
                                </Button>
                            </form>
                        </div>
                    </TabsContent>
                    <TabsContent value="staff">
                        <Tabs defaultValue="email" className="w-full pt-4">
                            <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="email">{t.email_login[language]}</TabsTrigger>
                            <TabsTrigger value="id">{t.login_with_staff_id[language]}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="email">
                            <form className="grid gap-4 pt-4" onSubmit={handleEmailLogin}>
                                    <div className="grid gap-2">
                                    <Label htmlFor="role">Your Role</Label>
                                    <Select value={role} onValueChange={(value) => setRole(value as User['role'])} required>
                                        <SelectTrigger id="role">
                                        <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Teacher">Teacher</SelectItem>
                                        <SelectItem value="Seller">Seller</SelectItem>
                                        <SelectItem value="Moderator">Moderator</SelectItem>
                                        <SelectItem value="Affiliate">Affiliate</SelectItem>
                                        <SelectItem value="Doubt Solver">Doubt Solver</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    </div>
                                    <div className="grid gap-2">
                                    <Label htmlFor="email">{t.email[language]}</Label>
                                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                    <Label htmlFor="password">{t.password[language]}</Label>
                                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                    {roleLoginDisabled && (
                                        <Alert variant="destructive" className="p-2 text-xs">
                                            <AlertDescription>Login for the '{role}' role is temporarily disabled.</AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="flex items-center justify-end">
                                        <Link href="/password-reset" className="text-sm text-primary hover:underline">
                                            {t.forgot_password[language]}
                                        </Link>
                                    </div>
                                    <Button type="submit" className="w-full font-bold" disabled={isLoading || !!roleLoginDisabled}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        {t.login[language]}
                                    </Button>
                                </form>
                            </TabsContent>
                            <TabsContent value="id">
                                <form className="grid gap-4 pt-4" onSubmit={handleStaffIdLogin}>
                                    <div className="grid gap-2">
                                        <Label htmlFor="staff-id">{t.staff_id[language]}</Label>
                                        <Input id="staff-id" placeholder="12345678" required value={staffId} onChange={(e) => setStaffId(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="staff-password">{t.password[language]}</Label>
                                        <Input id="staff-password" type="password" required value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} />
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <Link href="/password-reset" className="text-sm text-primary hover:underline">
                                            {t.forgot_password[language]}
                                        </Link>
                                    </div>
                                    <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        {t.login[language]}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
                

            <div className="mt-4 text-center text-sm">
                {t.no_account[language]}{' '}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                {t.signup[language]}
                </Link>
            </div>
            </CardContent>
        </Card>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src={loginImage}
          alt="Students learning in a classroom"
          placeholder="blur"
          className="h-full w-full object-cover"
          data-ai-hint="students classroom"
        />
      </div>
    </div>
  );
}
