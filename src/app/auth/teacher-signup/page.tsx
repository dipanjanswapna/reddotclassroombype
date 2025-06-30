
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
import { useState } from 'react';
import { createInstructorAction } from '@/app/actions';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function TeacherSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { language } = useLanguage();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Step 1: Create the Firebase Auth user and the User document in Firestore
      const userCredential = await signup(email, password, name, 'Teacher', 'Pending Approval');
      
      // Step 2: Create the Instructor profile document
      const result = await createInstructorAction({
          uid: userCredential.user.uid,
          name,
          email,
          title,
          bio,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          avatarUrl: `https://placehold.co/100x100.png?text=${name.split(' ').map(n=>n[0]).join('')}`,
          dataAiHint: 'person teacher'
      });
      
      if (result.success) {
          toast({
              title: "Application Submitted!",
              description: "Thank you! Your account has been created and is now under review. We'll notify you upon approval.",
          });
          router.push('/login?status=application_submitted');
      } else {
          // This case is tricky: auth user exists but instructor profile failed.
          // For now, show an error. A robust solution might delete the auth user or flag for admin review.
          setError(result.message);
      }
    } catch (authError: any) {
        setError(authError.message || "An unexpected error occurred during signup.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{t.become_a_teacher[language]}</CardTitle>
          <CardDescription>{t.teacher_signup_desc[language]}</CardDescription>
        </CardHeader>
        <CardContent>
           {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Application Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          <form className="grid gap-4" onSubmit={handleSubmit}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="full-name">{t.full_name[language]}</Label>
                    <Input id="full-name" name="full-name" placeholder="Jubayer Ahmed" required />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="email">{t.email[language]}</Label>
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="password">{t.password[language]}</Label>
                    <Input id="password" name="password" type="password" required />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="confirm-password">{t.confirm_password[language]}</Label>
                    <Input id="confirm-password" name="confirm-password" type="password" required />
                </div>
             </div>
            <div className="grid gap-2">
                <Label htmlFor="expertise">{t.expertise_title[language]}</Label>
                <Input id="expertise" name="expertise" placeholder="e.g., Physics Expert, IELTS Trainer" required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="bio">{t.your_bio[language]}</Label>
                <Textarea id="bio" name="bio" placeholder="Tell us about your teaching experience, qualifications, and passion..." rows={4} required/>
            </div>

            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
              {t.submit_application[language]}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            {t.already_have_account[language]}{' '}
            <Link href="/login?type=staff" className="font-semibold text-primary hover:underline">
              {t.login[language]}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
