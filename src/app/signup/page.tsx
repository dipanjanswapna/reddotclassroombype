
import type { Metadata } from 'next';
import SignupPageClient from './signup-client-page';
import { getHomepageConfig } from '@/lib/firebase/firestore';

export const metadata: Metadata = {
  title: 'Create an Account',
  description: 'Join the Red Dot Classroom community and start your learning journey with thousands of students across Bangladesh.',
};

export default async function SignupPage() {
    const homepageConfig = await getHomepageConfig();
    return <SignupPageClient homepageConfig={homepageConfig} />;
}
