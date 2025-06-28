
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';

export default function PasswordResetPage() {
  const { language } = useLanguage();

  return (
    <div className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{t.forgot_password_q[language]}</CardTitle>
          <CardDescription>{t.password_reset_desc[language]}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t.email[language]}</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <Button type="submit" className="w-full font-bold">
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
