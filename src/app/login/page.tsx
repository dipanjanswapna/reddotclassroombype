
import type { Metadata } from 'next';
import LoginPageClient from './login-client-page';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your Red Dot Classroom account to access your courses and dashboard.',
};

export default function LoginPage() {
    return <LoginPageClient />;
}
