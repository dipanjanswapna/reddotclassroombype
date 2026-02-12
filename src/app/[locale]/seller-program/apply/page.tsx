
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { applyAsSellerAction } from '@/app/actions/organization.actions';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { HomepageConfig } from '@/lib/types';
import { LoadingSpinner } from '@/components/loading-spinner';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';

export default function SellerApplicationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { signup } = useAuth();
  const { language, getLocalizedPath } = useLanguage();
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
      const userCredential = await signup(contactEmail, password, name, 'Seller', 'Pending Approval');
      
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

      const result = await applyAsSellerAction(orgData);

      if (result.success) {
        toast({
          title: "Application Submitted!",
          description: result.message,
        });
        setTimeout(() => router.push(getLocalizedPath("/")), 2000);
      } else {
        setError(result.message);
      }
    } catch(authError: any) {
        setError(authError.message || "An unexpected error occurred during signup.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const signupDisabled = !config?.platformSettings.Seller.signupEnabled;

  if (loadingConfig) {
      return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>
  }

  if (signupDisabled) {
      return (
          <div className="flex items-center justify-center py-12 px-4 bg-background min-h-screen mesh-gradient">
              <Card className="w-full max-w-lg shadow-2xl rounded-[25px] border-primary/10 overflow-hidden">
                  <CardHeader className="text-center bg-primary/5 p-8 border-b border-primary/10">
                      <CardTitle className="text-2xl font-headline uppercase tracking-tight">Seller Registration Closed</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                      <p className="text-center text-muted-foreground font-medium">We are not accepting new seller applications at this time. Please check back later.</p>
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
      <Card className="w-full max-w-2xl shadow-2xl rounded-[25px] border-primary/10 overflow-hidden">
        <CardHeader className="text-center bg-primary/5 p-8 border-b border-primary/10">
          <CardTitle className="text-2xl font-headline uppercase tracking-tight">Become an RDC Seller</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Sell your courses on our platform and reach thousands of students.</CardDescription>
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
                <Label htmlFor="company-name" className="text-[10px] font-black uppercase tracking-widest ml-1">Organization Name</Label>
                <Input id="company-name" name="company-name" placeholder="e.g., MediShark" required className="h-11 rounded-xl border-primary/10 bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-[10px] font-black uppercase tracking-widest ml-1">Contact Email</Label>
                <Input id="contact-email" name="contact-email" type="email" placeholder="contact@yourcompany.com" required className="h-11 rounded-xl border-primary/10 bg-white" />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="password" title="Used for primary contact login" className="text-[10px] font-black uppercase tracking-widest ml-1">Admin Password</Label>
                    <Input id="password" name="password" type="password" required className="h-11 rounded-xl border-primary/10 bg-white" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirm-password" title="Used for primary contact login" className="text-[10px] font-black uppercase tracking-widest ml-1">Confirm Password</Label>
                    <Input id="confirm-password" name="confirm-password" type="password" required className="h-11 rounded-xl border-primary/10 bg-white" />
                </div>
             </div>
            <div className="space-y-2">
                <Label htmlFor="logo-url" className="text-[10px] font-black uppercase tracking-widest ml-1">Logo URL</Label>
                <Input id="logo-url" name="logo-url" placeholder="https://yourcompany.com/logo.png" required className="h-11 rounded-xl border-primary/10 bg-white" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="subdomain" className="text-[10px] font-black uppercase tracking-widest ml-1">Preferred Site Path</Label>
                <div className="flex items-center group">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-primary/10 bg-muted text-[10px] font-bold text-muted-foreground h-11">rdc.vercel.app/sites/</span>
                    <Input id="subdomain" name="subdomain" placeholder="your-company-name" className="rounded-l-none rounded-r-xl h-11 border-primary/10 bg-white" required />
                </div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">This will be your dedicated storefront address.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest ml-1">Brief Description</Label>
                <Textarea id="description" name="description" placeholder="Tell us about your organization..." rows={4} required className="rounded-xl border-primary/10 bg-white resize-none" />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 mt-2" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
