
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Metadata } from 'next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new account on Red Dot Classroom to start your learning journey.',
};

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,36.631,44,30.836,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}


export default function SignupPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join our community and start your learning journey!</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
              <Alert className="bg-primary/5 border-primary/20">
                <UserSquare className="h-4 w-4 !text-primary" />
                <AlertTitle className="text-primary font-semibold">Want to be a Teacher?</AlertTitle>
                <AlertDescription>
                    Apply to become an instructor. <Link href="/auth/teacher-signup" className="font-bold underline">Click here!</Link>
                </AlertDescription>
            </Alert>
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="Jubayer Ahmed" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="grid gap-2">
                <Label>I am registering as a...</Label>
                <RadioGroup defaultValue="student" className="grid grid-cols-2 gap-2">
                    <div>
                        <RadioGroupItem value="student" id="role-student" className="peer sr-only" />
                        <Label
                            htmlFor="role-student"
                            className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            Student
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="guardian" id="role-guardian" className="peer sr-only" />
                        <Label
                            htmlFor="role-guardian"
                            className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            Guardian
                        </Label>
                    </div>
                </RadioGroup>
            </div>
             <div className="flex items-start space-x-2">
                <Checkbox id="terms" required/>
                <div className="grid gap-1.5 leading-none">
                    <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                    Accept terms and conditions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                    You agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className='text-primary hover:underline'>Privacy Policy</Link>.
                    </p>
                </div>
            </div>
            <Button type="submit" className="w-full font-bold">
              Create Account
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <GoogleIcon />
              <span className="ml-2">Sign up with Google</span>
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
