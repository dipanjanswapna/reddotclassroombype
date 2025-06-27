import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms of service for using the Red Dot Classroom platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <p className="mb-4"><em>Last updated: {new Date().toLocaleDateString()}</em></p>
        <div className="space-y-6 text-muted-foreground">
            <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Red Dot Classroom website (the "Service") operated by Red Dot Classroom ("us", "we", or "our").</p>
            <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.</p>
            <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Accounts</h2>
            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us.</p>
        </div>
      </div>
    </div>
  );
}
