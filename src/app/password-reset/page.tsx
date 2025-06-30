
import type { Metadata } from 'next';
import PasswordResetClientPage from './password-reset-client-page';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password for your Red Dot Classroom account.',
};

export default function PasswordResetPage() {
    return <PasswordResetClientPage />;
}
