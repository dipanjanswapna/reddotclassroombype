
import type { Metadata } from 'next';
import LoginPageClient from './login-client-page';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { getHomepageConfig } from '@/lib/firebase/firestore';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your Red Dot Classroom account to access your courses and dashboard.',
};

const LoginPageFallback = () => (
    <div className="flex items-center justify-center py-12 px-4 bg-secondary/50 min-h-screen">
        <LoadingSpinner className="w-12 h-12" />
    </div>
);

export default async function LoginPage() {
    const homepageConfig = await getHomepageConfig();
    return (
        <Suspense fallback={<LoginPageFallback />}>
            <LoginPageClient homepageConfig={homepageConfig} />
        </Suspense>
    );
}
