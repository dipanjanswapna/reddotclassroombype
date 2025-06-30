

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
import { Loader2 } from 'lucide-react';

export default function TeacherSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('full-name') as string;
    const email = formData.get('email') as string;
    const title = formData.get('expertise') as string;
    const bio = formData.get('bio') as string;

    const result = await createInstructorAction({
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
            description: "Thank you for your application. It is now under review by our admin team.",
        });
        router.push('/');
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive"});
    }
    
    setIsSubmitting(false);
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{t.become_a_teacher[language]}</CardTitle>
          <CardDescription>{t.teacher_signup_desc[language]}</CardDescription>
        </CardHeader>
        <CardContent>
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
            <Link href="/login" className="font-semibold text-primary hover:underline">
              {t.login[language]}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
