import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Shield, UserCog, UserSquare } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="none" fill="#4285F4"/>
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="none" fill="url(#pattern0)"/>
      <g clipPath="url(#clip0_30_3)">
      <path d="M21.53,10.3H12.16V13.89H17.47C17.22,15.63 16.21,17.07 14.67,18.05V20.53H17.84C19.98,18.57 21.29,15.77 21.29,12.39C21.29,11.69 21.23,11 21.08,10.3Z" fill="#4285F4"/>
      <path d="M12.16,21.98C15.04,21.98 17.4,21.05 18.84,19.53L15.67,17.05C14.82,17.61 13.6,18.05 12.16,18.05C9.4,18.05 7.07,16.24 6.25,13.7H3.01V16.27C4.45,19.64 8.01,21.98 12.16,21.98Z" fill="#34A853"/>
      <path d="M6.25,13.7C6.03,13.13 5.9,12.51 5.9,11.87C5.9,11.23 6.03,10.61 6.25,10.04V7.47H3.01C2.33,8.83 2,10.3 2,11.87C2,13.44 2.33,14.91 3.01,16.27L6.25,13.7Z" fill="#FBBC05"/>
      <path d="M12.16,5.69C13.7,5.69 15.14,6.23 16.21,7.23L18.91,4.53C17.4,3.02 15.04,2 12.16,2C8.01,2 4.45,4.34 3.01,7.47L6.25,10.04C7.07,7.5 9.4,5.69 12.16,5.69Z" fill="#EA4335"/>
      </g>
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="text-sm font-medium">Remember me</Label>
              </div>
              <Link href="/password-reset" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full font-bold">
              Login
            </Button>
            
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or use a demo account
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/student/dashboard">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Student
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/teacher/dashboard">
                  <UserSquare className="mr-2 h-4 w-4" />
                  Teacher
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/guardian/dashboard">
                  <Shield className="mr-2 h-4 w-4" />
                  Guardian
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/dashboard">
                  <UserCog className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            </div>
            
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
              <span className="ml-2">Login with Google</span>
            </Button>
          </div>
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
