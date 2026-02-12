
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

export default function PasswordResetClientPage() {
  const { language, getLocalizedPath } = useLanguage();
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
    <div className="flex items-center justify-center py-12 px-4 bg-background min-h-screen mesh-gradient">
      <Card className="w-full max-w-sm shadow-2xl rounded-[25px] border-primary/10 overflow-hidden">
        <CardHeader className="text-center bg-primary/5 p-8 border-b border-primary/10">
          <CardTitle className="text-2xl font-headline uppercase tracking-tight">{t.forgot_password_q[language]}</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">{t.password_reset_desc[language]}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form className="grid gap-6" onSubmit={handleReset}>
             {error && (
                <Alert variant="destructive" className="rounded-xl border-none">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                 <Alert variant="default" className="border-none bg-green-50 text-green-700 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.email[language]}</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} className="h-12 rounded-xl border-primary/10 bg-white" />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {t.send_reset_link[language]}
            </Button>
          </form>
          <div className="mt-2 text-center">
            <Link href={getLocalizedPath("/login")} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
              &larr; {t.back_to_login[language]}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
