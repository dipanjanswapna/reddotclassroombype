
import type { Metadata } from 'next';
import SignupPageClient from './signup-client-page';

export const metadata: Metadata = {
  title: 'Create an Account',
  description: 'Join the Red Dot Classroom community and start your learning journey with thousands of students across Bangladesh.',
};

export default function SignupPage() {
    return <SignupPageClient />;
}
