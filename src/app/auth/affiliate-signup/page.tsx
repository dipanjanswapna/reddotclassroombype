
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';

export default function AffiliateSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('full-name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      await signup(email, password, name, 'Affiliate', 'Pending Approval');
      toast({
          title: "Application Submitted!",
          description: "Thank you! Your application to become an affiliate is now under review. We'll notify you upon approval.",
      });
      router.push('/login?status=application_submitted');
    } catch (authError: any) {
        setError(authError.message || "An unexpected error occurred during signup.");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{t.become_an_affiliate[language]}</CardTitle>
          <CardDescription>{t.affiliate_signup_desc[language]}</CardDescription>
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
