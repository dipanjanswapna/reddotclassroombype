import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpCircle, MessageSquare, Phone, Globe } from "lucide-react";
import type { Metadata } from 'next';
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: 'FAQ | Support Center',
  description: 'Common questions about RED DOT CLASSROOM.',
};

const getFaqData = (language: 'en' | 'bn') => {
    const isBn = language === 'bn';
    return [
        {
            title: isBn ? "সাধারণ তথ্য" : "General Information",
            icon: HelpCircle,
            items: [
                {
                    question: isBn ? "রেড ডট ক্লাসরুম (RDC) কী?" : "What is Red Dot Classroom (RDC)?",
                    answer: isBn ? "রেড ডট ক্লাসরুম (RDC) একটি আধুনিক লার্নিং ম্যানেজমেন্ট সিস্টেম যা বাংলাদেশের শিক্ষার্থীদের জন্য বিশেষভাবে ডিজাইন করা হয়েছে। আমরা SSC, HSC, এবং ভর্তি পরীক্ষার জন্য সেরা কোর্স অফার করি।" : "Red Dot Classroom (RDC) is a modern LMS designed for Bangladeshi students, offering expert-led courses for SSC, HSC, and Admission tests."
                },
                {
                    question: isBn ? "আমি কীভাবে অ্যাকাউন্ট তৈরি করব?" : "How do I create an account?",
                    answer: isBn ? "উপরের ডানদিকে 'Sign Up' বাটনে ক্লিক করে আপনার নাম, ইমেইল এবং মোবাইল নম্বর দিয়ে সহজেই অ্যাকাউন্ট তৈরি করতে পারবেন।" : "Click 'Sign Up' at the top right, fill in your details, and you're ready to start learning."
                }
            ]
        },
        {
            title: isBn ? "ভর্তি এবং কোর্স" : "Enrollment & Courses",
            icon: HelpCircle,
            items: [
                {
                    question: isBn ? "কোর্সে কীভাবে ভর্তি হবো?" : "How do I enroll in a course?",
                    answer: isBn ? "কোর্স পেজে গিয়ে 'ভর্তি হন' বাটনে ক্লিক করুন। এরপর পেমেন্ট সম্পন্ন করলেই আপনার ড্যাশবোর্ডে কোর্সটি যুক্ত হয়ে যাবে।" : "Visit the course page, click 'Enroll Now', complete the payment, and get instant access."
                },
                {
                    question: isBn ? "প্রি-বুকিং কী?" : "What is Pre-booking?",
                    answer: isBn ? "কোর্স লঞ্চ হওয়ার আগেই কম মূল্যে সিট বুক করাকে প্রি-বুকিং বলে। কোর্স শুরু হলে আপনাকে জানিয়ে দেওয়া হবে।" : "Pre-booking lets you secure a spot in an upcoming course at a discount before it officially launches."
                }
            ]
        }
    ];
};

/**
 * @fileOverview Localized FAQ Page
 * Implements Hind Siliguri font and premium RDC UI.
 */
export default async function FaqPage({ params }: { params: { locale: string } }) {
    const awaitedParams = await params;
    const language = awaitedParams.locale as 'en' | 'bn';
    const isBn = language === 'bn';
    const faqSections = getFaqData(language);

  return (
    <div className={cn("bg-background min-h-screen pb-20 px-1", isBn && "font-bengali")}>
      {/* Hero Header */}
      <section className="relative py-16 md:py-24 bg-muted/30 border-b border-white/5 overflow-hidden rounded-b-[40px]">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20 shadow-sm">
            <Globe className="w-3.5 h-3.5" />
            {t.support_center[language]}
          </div>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-tight">
            {isBn ? 'আপনার যা কিছু' : 'How can we'} <span className="text-primary">{isBn ? 'জিজ্ঞাসা' : 'Help'}</span>?
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            {isBn ? 'রেড ডট ক্লাসরুম প্ল্যাটফর্ম সম্পর্কে সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নের উত্তর এখানে পাবেন।' : 'Find answers to the most frequently asked questions about the Red Dot Classroom platform.'}
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <div className="container mx-auto px-4 mt-12 md:mt-20">
        <div className="max-w-4xl mx-auto space-y-16">
          {faqSections.map((section, idx) => (
            <div key={idx} className="space-y-8">
              <div className="flex items-center gap-4 border-l-4 border-primary pl-6 text-left">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <section.icon className="w-6 h-6" />
                </div>
                <h2 className="font-headline text-xl md:text-2xl font-black uppercase tracking-tight">
                  {section.title}
                </h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-4">
                {section.items.map((item, iIdx) => (
                  <AccordionItem 
                    value={`item-${idx}-${iIdx}`} 
                    key={iIdx}
                    className="border border-white/10 rounded-[25px] overflow-hidden bg-card/50 shadow-lg hover:border-primary/30 transition-all"
                  >
                    <AccordionTrigger className="text-base md:text-xl font-black text-left px-8 py-6 hover:no-underline hover:bg-white/5 uppercase tracking-tight">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-8 text-muted-foreground leading-relaxed text-sm md:text-lg font-medium text-left border-t border-primary/5 mt-2 pt-6">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="p-10 md:p-16 rounded-[40px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tight">{isBn ? 'এখনও সমাধান পাননি?' : 'Still have questions?'}</h2>
              <p className="text-muted-foreground font-medium text-lg max-w-lg mx-auto">{isBn ? 'আপনার যদি আরও কোনো প্রশ্ন থাকে, আমাদের সাপোর্ট টিম সবসময় পাশে আছে।' : 'If you couldn\'t find what you were looking for, our team is here to help.'}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest px-10 shadow-xl shadow-primary/20 h-16">
                <Link href={t.nav_contact[language] === 'Contact' ? '/contact' : '/contact'}>Contact Support</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest px-10 h-16 border-white/20 bg-white/50 backdrop-blur-md">
                <Link href="tel:01641035736">Call Hotline</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}