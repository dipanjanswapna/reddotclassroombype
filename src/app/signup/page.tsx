
import type { Metadata } from 'next';
import SignupPageClient from './signup-client-page';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

export const metadata: Metadata = {
  title: 'Create an Account',
  description: 'Join the Red Dot Classroom community and start your learning journey with thousands of students across Bangladesh.',
};

export default async function SignupPage() {
    const homepageConfig = await getHomepageConfig();
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
        <SignupPageClient homepageConfig={homepageConfig} />
      </Suspense>
    );
}
