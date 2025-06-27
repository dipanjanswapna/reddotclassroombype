import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';

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
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/dashboard">
                <Key />
                Demo Login
              </Link>
            </Button>
            <Button variant="outline" className="w-full">
              <GoogleIcon />
              <span className="ml-2">Login with Google</span>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
