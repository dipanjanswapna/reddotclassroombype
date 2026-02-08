
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms of service for using the Red Dot Classroom platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-14 max-w-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Terms of Service</h1>
            <div className="h-1.5 w-24 bg-primary mx-auto mt-4 rounded-full shadow-md" />
            <p className="mt-6 text-sm text-muted-foreground font-bold uppercase tracking-widest">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="rounded-[2.5rem] border border-primary/10 bg-card shadow-2xl overflow-hidden mb-8">
            <CardContent className="p-8 md:p-12 prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-foreground prose-p:leading-relaxed prose-p:font-medium prose-p:text-muted-foreground">
                <p>These Terms & Conditions (“Terms”) of use of our website, applications, or any products or services in connection with RED DOT CLASSROOM (RDC) (“Company/We/Us/Our”) and its users (“User/You/Your”).</p>
                <p>Please carefully read the terms and privacy policy of the Company prior to registering. You accept and agree to be legally bound by the Terms if you access the Application, Website, or Services through any means.</p>
                
                <h2 className="pt-8">PROPRIETARY INFORMATION</h2>
                <p>The software, text, images, graphics, video, and audio, all of which are contained in the Application and Website, are the Company's proprietary property (“Proprietary Information”). Permission to reproduce, modify, or distribute Proprietary Information may not be granted without first obtaining permission.</p>
                
                <Card className="my-10 bg-muted/30 border-primary/20 rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                        <CardTitle className="font-headline text-xl font-black uppercase text-primary">Essential Course Policies</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <ul className="list-disc pl-5 space-y-3 font-bengali text-sm md:text-base font-bold text-foreground">
                            <li>এক কোর্স থেকে অন‍্য কোর্সে স্থানান্তর করা যাবে না।</li>
                            <li>একটি আইডি দিয়ে এপ্রুভালের পর কোনমতেই আইডি চেইঞ্জ করা যাবে না।</li>
                            <li>ফেসবুক আইডি ব্যান হলে এর দায় কর্তৃপক্ষ নিবে না।</li>
                            <li>তোমার আইপি ট্র্যাক করা হবে কোর্স চলাকালে।</li>
                            <li>কোন মতেই কোর্স এর পেমেন্ট রিফান্ড এবল না।</li>
                            <li>একাধিক ডিভাইস / ব্রাউজারে লগিন করতে চাইলে আমাদের পূর্ব অনুমতি নিতে হবে।</li>
                        </ul>
                    </CardContent>
                </Card>
                
                <h2 className="pt-8">PROHIBITED ACTS</h2>
                <p>The following acts are strictly banned when using our services:</p>
                <ul className="list-disc pl-6 space-y-3">
                    <li>Make available any deceptive, unlawful, defamatory, or otherwise objectionable content;</li>
                    <li>Threatening, stalking, and/or harassing another person;</li>
                    <li>Falsely impersonate any person or entity;</li>
                    <li>Disrupt, interfere with, or otherwise cause harm to the security of our networks.</li>
                </ul>

                <h2 className="pt-8">INDEMNITY</h2>
                <p>You accept responsibility for protecting, reimbursing, and holding harmless the Company from any and all claims, costs, and liabilities (including legal fees) incurred because of your use of the platform or violation of these terms.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
