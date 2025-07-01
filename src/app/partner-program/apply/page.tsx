
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { applyForPartnershipAction } from '@/app/actions/organization.actions';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { HomepageConfig } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import Link from 'next/link';

export default function PartnerApplicationPage() {
  const { toast } = useToast();
  const router = useRouter();
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
    const name = formData.get('company-name') as string;
    const contactEmail = formData.get('contact-email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Create the Firebase Auth user and the User document for the primary contact
      const userCredential = await signup(contactEmail, password, name, 'Partner', 'Pending Approval');
      
      // Step 2: Create the Organization document
      const orgData = {
        name,
        contactEmail,
        logoUrl: formData.get('logo-url') as string,
        subdomain: formData.get('subdomain') as string,
        description: formData.get('description') as string,
        primaryColor: '346.8 77.2% 49.8%', 
        secondaryColor: '210 40% 96.1%',
        contactUserId: userCredential.user.uid,
      };

      const result = await applyForPartnershipAction(orgData);

      if (result.success) {
        toast({
          title: "Application Submitted!",
          description: result.message,
        });
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError(result.message);
      }
    } catch(authError: any) {
        setError(authError.message || "An unexpected error occurred during signup.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const signupDisabled = !config?.platformSettings.Partner.signupEnabled;

  if (loadingConfig) {
      return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>
  }

  if (signupDisabled) {
      return (
          <div className="flex items-center justify-center py-12 px-4 bg-gray-50 min-h-screen">
              <Card className="w-full max-w-lg shadow-lg">
                  <CardHeader className="text-center">
                      <CardTitle className="text-2xl font-headline">Seller Registration Closed</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-center text-muted-foreground">We are not accepting new seller applications at this time. Please check back later.</p>
                      <div className="mt-6 text-center text-sm">
                          <Link href="/" className="font-semibold text-primary hover:underline">
                              &larr; Back to Home
                          </Link>
                      </div>
                  </CardContent>
              </Card>
          </div>
      );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Become an RDC Seller</CardTitle>
          <CardDescription>Sell your courses on our platform and reach thousands of students across the country. Fill out the form below to apply.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Application Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" name="confirm-password" type="password" required />
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
                <p className="text-xs text-muted-foreground">This will be your dedicated storefront address.</p>
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
