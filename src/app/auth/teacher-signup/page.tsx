
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teacher Signup',
  description: 'Register as a teacher on Red Dot Classroom and start sharing your knowledge.',
};

export default function TeacherSignupPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Become a Teacher</CardTitle>
          <CardDescription>Join our team of expert instructors. Fill out the form below to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" placeholder="Jubayer Ahmed" required />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                </div>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" required />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="expertise">Expertise / Title</Label>
                <Input id="expertise" placeholder="e.g., Physics Expert, IELTS Trainer" required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="bio">Your Bio</Label>
                <Textarea id="bio" placeholder="Tell us about your teaching experience, qualifications, and passion..." rows={4} required/>
            </div>

            <Button type="submit" className="w-full font-bold">
              Submit Application
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
