

"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Handshake, Shield, UserCog, UserSquare } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';

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

export default function LoginPage() {
  const { language } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 bg-secondary/50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{t.login_welcome[language]}</CardTitle>
          <CardDescription>{t.login_desc[language]}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t.email[language]}</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t.password[language]}</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="text-sm font-medium">{t.remember_me[language]}</Label>
              </div>
              <Link href="/password-reset" className="text-sm text-primary hover:underline">
                {t.forgot_password[language]}
              </Link>
            </div>
            <Button type="submit" className="w-full font-bold">
              {t.login[language]}
            </Button>
            
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t.or_demo[language]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/student/dashboard">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  {t.student[language]}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/teacher/dashboard">
                  <UserSquare className="mr-2 h-4 w-4" />
                  {t.teacher[language]}
                </Link>
              </Button>
               <Button variant="outline" asChild>
                <Link href="/partner/dashboard">
                  <Handshake className="mr-2 h-4 w-4" />
                  Partner
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/guardian/dashboard">
                  <Shield className="mr-2 h-4 w-4" />
                  {t.guardian[language]}
                </Link>
              </Button>
              <Button variant="outline" asChild className="col-span-2">
                <Link href="/admin/dashboard">
                  <UserCog className="mr-2 h-4 w-4" />
                  {t.admin[language]}
                </Link>
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
            <Button variant="outline" className="w-full">
              <GoogleIcon />
              <span className="ml-2">{t.login_with_google[language]}</span>
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            {t.no_account[language]}{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              {t.signup[language]}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
