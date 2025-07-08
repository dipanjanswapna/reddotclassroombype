
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserSquare, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';
import { useAuth } from '@/context/auth-context';
import { User, HomepageConfig } from '@/lib/types';
import { useRouter } from 'next/navigation';
import signupImage from '@/public/signup.jpg';

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,36.631,44,30.836,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}

function FacebookIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
            <path fill="#3F51B5" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
            <path fill="#FFF" d="M34.368,25.708h-6.142v16.292h-7.734V25.708h-4.433v-6.52h4.433v-4.66c0-4.39,2.685-6.78,6.597-6.78c1.88,0,3.504,0.14,3.976,0.205v6.251h-3.692c-2.131,0-2.543,1.011-2.543,2.498v2.965h6.643L34.368,25.708z"></path>
        </svg>
    )
}

export default function SignupPageClient({ homepageConfig }: { homepageConfig: HomepageConfig | null }) {
  const { language } = useLanguage();
  const { signup, loginWithGoogle, loginWithFacebook } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('Student');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signup(email, password, fullName, role);
    } catch (err: any) {
      setError(err.message || 'Failed to create an account.');
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
       setError(err.message || `Failed to sign up with ${provider}.`);
    } finally {
       setIsLoading(false);
    }
  };


  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block">
        <Image
          src={signupImage}
          alt="Students celebrating their success"
          placeholder="blur"
          className="h-full w-full object-cover"
          data-ai-hint="students success graduation"
        />
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">{t.create_account[language]}</CardTitle>
            <CardDescription>{t.signup_desc[language]}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Signup Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
              
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('google')} disabled={isLoading || !homepageConfig?.platformSettings.Student.signupEnabled}>
                      <GoogleIcon />
                      <span className="ml-2">Google</span>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('facebook')} disabled={isLoading || !homepageConfig?.platformSettings.Student.signupEnabled}>
                      <FacebookIcon />
                      <span className="ml-2">Facebook</span>
                  </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t.or_continue_with[language]}
                  </span>
                </div>
              </div>

              <form className="grid gap-4" onSubmit={handleSignup}>
                  <div className="grid gap-2">
                  <Label htmlFor="full-name">{t.full_name[language]}</Label>
                  <Input id="full-name" placeholder="Jubayer Ahmed" required value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                  <Label htmlFor="email">{t.email[language]}</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                  <Label htmlFor="password">{t.password[language]}</Label>
                  <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                      <Label>{t.registering_as[language]}</Label>
                      <RadioGroup defaultValue={role} onValueChange={(value: User['role']) => setRole(value)} className="grid grid-cols-2 gap-2">
                          <div>
                              <RadioGroupItem value="Student" id="role-student" className="peer sr-only" disabled={!homepageConfig?.platformSettings.Student.signupEnabled}/>
                              <Label
                                  htmlFor="role-student"
                                  className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                              >
                                  {t.student[language]}
                              </Label>
                          </div>
                          <div>
                              <RadioGroupItem value="Guardian" id="role-guardian" className="peer sr-only" disabled={!homepageConfig?.platformSettings.Guardian.signupEnabled}/>
                              <Label
                                  htmlFor="role-guardian"
                                  className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                              >
                                  {t.guardian[language]}
                              </Label>
                          </div>
                      </RadioGroup>
                  </div>
                  <div className="flex items-start space-x-2">
                      <Checkbox id="terms" required/>
                      <div className="grid gap-1.5 leading-none">
                          <Label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                          {t.accept_terms[language]}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                          {t.you_agree_to[language]}{' '}
                          <Link href="/terms" className="text-primary hover:underline">{t.terms_of_service[language]}</Link> {t.and[language]} <Link href="/privacy" className='text-primary hover:underline'>{t.privacy_policy[language]}</Link>.
                          </p>
                      </div>
                  </div>
                  <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  {t.create_account[language]}
                  </Button>
              </form>
            
              <div className="mt-4 text-center text-sm">
                  {t.already_have_account[language]}{' '}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                  {t.login[language]}
                  </Link>
              </div>
              <div className="mt-4 text-center text-sm space-y-2">
                  <p className="text-muted-foreground">Want to join our team?</p>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                      {homepageConfig?.platformSettings.Teacher.signupEnabled && <Link href="/auth/teacher-signup" className="font-semibold text-primary hover:underline">Apply as Teacher</Link>}
                      {homepageConfig?.platformSettings.Seller.signupEnabled && <Link href="/seller-program/apply" className="font-semibold text-primary hover:underline">Apply as Seller</Link>}
                      {homepageConfig?.platformSettings.Affiliate.signupEnabled && <Link href="/auth/affiliate-signup" className="font-semibold text-primary hover:underline">Join as Affiliate</Link>}
                      {homepageConfig?.platformSettings.Moderator.signupEnabled && <Link href="/auth/moderator-signup" className="font-semibold text-primary hover:underline">Join as Moderator</Link>}
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
