
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { applyForPartnershipAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

export default function PartnerApplicationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('company-name') as string,
      contactEmail: formData.get('contact-email') as string,
      logoUrl: formData.get('logo-url') as string,
      subdomain: formData.get('subdomain') as string,
      description: formData.get('description') as string,
      // Default values for required fields not in form
      primaryColor: '346.8 77.2% 49.8%', 
      secondaryColor: '210 40% 96.1%',
    };

    const result = await applyForPartnershipAction(data);

    if (result.success) {
      toast({
        title: "Application Submitted!",
        description: result.message,
      });
      router.push('/');
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Become an RDC Partner</CardTitle>
          <CardDescription>Join our platform and reach thousands of students across the country. Fill out the form below to apply.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company-name">Organization Name</Label>
                <Input id="company-name" name="company-name" placeholder="e.g., MediShark" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" name="contact-email" type="email" placeholder="contact@yourcompany.com" required />
              </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input id="logo-url" name="logo-url" placeholder="https://yourcompany.com/logo.png" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="subdomain">Preferred Site Path</Label>
                <div className="flex items-center">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-secondary text-sm text-muted-foreground">rdc.com/sites/</span>
                    <Input id="subdomain" name="subdomain" placeholder="your-company-name" className="rounded-l-none" required />
                </div>
                <p className="text-xs text-muted-foreground">This will be your dedicated portal address.</p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Brief Description</Label>
                <Textarea id="description" name="description" placeholder="Tell us about your organization and the courses you offer..." rows={4} required />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
