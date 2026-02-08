
import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the privacy policy for Red Dot Classroom.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-14 max-w-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Privacy Policy</h1>
            <div className="h-1.5 w-24 bg-primary mx-auto mt-4 rounded-full shadow-md" />
            <p className="mt-6 text-sm text-muted-foreground font-bold uppercase tracking-widest">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <Card className="rounded-[2.5rem] border border-primary/10 bg-card shadow-2xl overflow-hidden">
            <CardContent className="p-8 md:p-12 prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-foreground prose-p:leading-relaxed prose-p:font-medium prose-p:text-muted-foreground">
                <p>We, RED DOT CLASSROOM (RDC), incorporated under the Bangladeshi Companies Act (Act XVIII), of 1994 (hereinafter referred to as “Company”), is committed to safeguarding your privacy in relation to the protection of your personal information. To guarantee our ability to access your services, we may obtain and sometimes share your information. In order to further safeguard your privacy, we give this notice that details our information practices and the options you have when it comes to the collection and use of your information.</p>

                <h2 className="pt-8">1. DEFINITIONS</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>“We”, “Our”, and “Us”</strong> - Refers to the creators of this privacy policy.</li>
                    <li><strong>“You”, “Your”, “Yourself” and “User”</strong> - Refers to natural and legal individuals who use the Website.</li>
                    <li><strong>“Website”</strong> - Refers to the official website of RED DOT CLASSROOM.</li>
                    <li><strong>“Personal Information”</strong> - Refers to any personally identifiable information that We may collect from You.</li>
                </ul>

                <h2 className="pt-8">2. OVERVIEW</h2>
                <p>We take the responsibility to respect your private information online. We further acknowledge the need to preserve and handle the information you share with us that is identifiable personally ("personal information"). Information which we regard as personal about you includes but is not confined to your name, address, e-mail address, phone number or other contact details.</p>

                <h2 className="pt-8">3. USER PROVIDED INFORMATION</h2>
                <p>The Application/Website/Services/Products obtains the information you provide when you download and register for the Application or Services or products. When you register with us, you generally provide (a) your name, age, e-mail address, address, phone number, password and educational interests; (b) transaction-related information; (c) information you provide us when you contact us for help; (d) information you enter into our system when using the Application/Services/Products.</p>
                
                <h2 className="pt-8">4. AUTOMATICALLY COLLECTED INFORMATION</h2>
                <p>In addition, the app/products/devices can automatically collect certain data, including, but not limited to, the mobile device types that you use, your mobile device unique device ID, your mobile operating device IP address, your mobile browser type and the use of the application/services/products information.</p>

                <h2 className="pt-8">5. SECURITY</h2>
                <p>We see data as a valuable asset, and thus we must do everything we can to avoid data loss and security breaches. To safeguard the information from unauthorized access by members inside and outside the firm, we utilize a variety of different security technologies. We ensure the privacy of our customers' personal information by using recognized industry standards, both in transit and post delivery.</p>
                
                <h2 className="pt-8">6. DISPUTES AND JURISDICTION</h2>
                <p>All claims brought up by this policy, including but not limited to claims regarding rights, refunds, and compensation, will be resolved using a two-step alternative dispute resolution process in Dhaka, Bangladesh. After the arbitrator hands down their decision, both parties are bound by it.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
