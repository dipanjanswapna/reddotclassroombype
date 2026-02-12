
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { createInstructorAction } from '@/app/actions/instructor.actions';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { HomepageConfig } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function TeacherSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { language, getLocalizedPath } = useLanguage();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    getHomepageConfig().then(c => {
        setConfig(c);
        setLoadingConfig(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('full-name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;
    const title = formData.get('expertise') as string;
    const bio = formData.get('bio') as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await signup(email, password, name, 'Teacher', 'Pending Approval');
      
      const result = await createInstructorAction({
          uid: userCredential.user.uid,
          name,
          email,
          title,
          bio,
          avatarUrl: `https://placehold.co/100x100.png?text=${name.split(' ').map(n=>n[0]).join('')}`,
          dataAiHint: 'person teacher'
      });
      
      if (result.success) {
          toast({
              title: "Application Submitted!",
              description: "Thank you! Your account has been created and is now under review. We'll notify you upon approval.",
          });
          setTimeout(() => router.push(getLocalizedPath("/")), 2000);
      } else {
          setError(result.message);
      }
    } catch (authError: any) {
        setError(authError.message || "An unexpected error occurred during signup.");
    } finally {
        setIsSubmitting(false);
    }
  }

  const signupDisabled = !config?.platformSettings.Teacher.signupEnabled;

  if (loadingConfig) {
      return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>
  }

  if (signupDisabled) {
      return (
          <div className="flex items-center justify-center py-12 px-4 bg-background min-h-screen mesh-gradient">
              <Card className="w-full max-w-lg shadow-2xl rounded-[25px] border-primary/10 overflow-hidden">
                  <CardHeader className="text-center bg-primary/5 p-8 border-b border-primary/10">
                      <CardTitle className="text-2xl font-headline uppercase tracking-tight">Teacher Registration Closed</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                      <p className="text-center text-muted-foreground font-medium">We are not accepting new teacher applications at this time. Please check back later.</p>
                      <div className="mt-8 text-center">
                          <Link href={getLocalizedPath("/")} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                              &larr; Back to Home
                          </Link>
                      </div>
                  </CardContent>
              </Card>
          </div>
      );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 bg-background min-h-screen mesh-gradient">
      <Card className="w-full max-w-lg shadow-2xl rounded-[25px] border-primary/10 overflow-hidden">
        <CardHeader className="text-center bg-primary/5 p-8 border-b border-primary/10">
          <CardTitle className="text-2xl font-headline uppercase tracking-tight">{t.become_a_teacher[language]}</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">{t.teacher_signup_desc[language]}</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
           {error && (
                <Alert variant="destructive" className="mb-6 rounded-xl border-none">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Application Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          <form className="grid gap-6" onSubmit={handleSubmit}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-[10px] font-black uppercase tracking-widest ml-1">{t.full_name[language]}</Label>
                    <Input id="full-name" name="full-name" placeholder="Jubayer Ahmed" required className="h-11 rounded-xl border-primary/10 bg-white" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest ml-1">{t.email[language]}</Label>
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required className="h-11 rounded-xl border-primary/10 bg-white" />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest ml-1">{t.password[language]}</Label>
                    <Input id="password" name="password" type="password" required className="h-11 rounded-xl border-primary/10 bg-white" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-widest ml-1">{t.confirm_password[language]}</Label>
                    <Input id="confirm-password" name="confirm-password" type="password" required className="h-11 rounded-xl border-primary/10 bg-white" />
                </div>
             </div>
            <div className="space-y-2">
                <Label htmlFor="expertise" className="text-[10px] font-black uppercase tracking-widest ml-1">{t.expertise_title[language]}</Label>
                <Input id="expertise" name="expertise" placeholder="e.g., Physics Expert, IELTS Trainer" required className="h-11 rounded-xl border-primary/10 bg-white" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest ml-1">{t.your_bio[language]}</Label>
                <Textarea id="bio" name="bio" placeholder="Tell us about your teaching experience..." rows={4} required className="rounded-xl border-primary/10 bg-white resize-none" />
            </div>

            <Button type="submit" className="w-full h-12 font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              {t.submit_application[language]}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">{t.already_have_account[language]}</span>{' '}
            <Link href={getLocalizedPath("/login?type=staff")} className="text-[11px] font-black uppercase tracking-widest text-primary hover:underline">
              {t.login[language]}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
