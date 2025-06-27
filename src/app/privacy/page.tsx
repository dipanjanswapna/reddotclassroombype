export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        <p className="mb-4"><em>Last updated: {new Date().toLocaleDateString()}</em></p>
        <div className="space-y-6 text-muted-foreground">
            <p>Red Dot Classroom ("us", "we", or "our") operates the Red Dot Classroom website (the "Service").</p>
            <p>This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
            <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
            <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us.</p>
        </div>
      </div>
    </div>
  );
}
