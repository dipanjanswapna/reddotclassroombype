

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function PasswordResetPage() {
  const { language } = useLanguage();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await resetPassword(email);
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{t.forgot_password_q[language]}</CardTitle>
          <CardDescription>{t.password_reset_desc[language]}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleReset}>
             {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                 <Alert variant="default" className="border-green-500 text-green-700">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">{t.email[language]}</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {t.send_reset_link[language]}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              &larr; {t.back_to_login[language]}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
