
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  HelpCircle, 
  BookOpen, 
  CreditCard, 
  ShieldCheck, 
  MessageSquare, 
  UserCheck, 
  Layers,
  Monitor
} from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | RDC',
  description: 'Find answers to common questions about Red Dot Classroom courses, payments, enrollment, and technical support.',
};

const faqSections = [
  {
    title: "General Information",
    icon: HelpCircle,
    items: [
      {
        question: "What is Red Dot Classroom (RDC)?",
        answer: "Red Dot Classroom (RDC) is a modern Learning Management System (LMS) designed specifically for Bangladeshi students. We offer comprehensive courses for SSC, HSC, Admission tests, and professional skills development with elite faculty members."
      },
      {
        question: "How do I create an account?",
        answer: "Creating an account is simple! Click on the 'Sign Up' button at the top right, fill in your details (Name, Email, Phone), and choose your role as a student or guardian."
      },
      {
        question: "Is there a mobile app for RDC?",
        answer: "Yes! We have a native mobile application available for both Android and iOS. You can download it directly from the Google Play Store or Apple App Store to study on the go."
      }
    ]
  },
  {
    title: "Enrollment & Courses",
    icon: BookOpen,
    items: [
      {
        question: "How do I enroll in a course?",
        answer: "Visit our 'Courses' page, select the course you are interested in, and click 'Enroll Now'. You will be taken to the checkout page where you can complete the payment and get instant access."
      },
      {
        question: "What is a 'Course Cycle'?",
        answer: "A course cycle allows you to pay for and access specific portions or modules of a larger course. This is a budget-friendly way to study only what you need at a given time."
      },
      {
        question: "What is Pre-booking?",
        answer: "Pre-booking allows you to secure a spot in an upcoming course at a heavily discounted price before it officially launches. Once the course is live, you will be notified to start your lessons."
      }
    ]
  },
  {
    title: "Payments & Refunds",
    icon: CreditCard,
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major mobile banking services like bKash, Nagad, and Rocket, as well as local and international Debit/Credit cards through our secure payment gateway."
      },
      {
        question: "Are course payments refundable?",
        answer: "According to our policy, course payments are generally non-refundable once access is granted. However, if you face technical issues that we cannot resolve, please contact support within 24 hours."
      },
      {
        question: "How do I use a promo code?",
        answer: "On the checkout page, you will see a 'Promo Code' field. Enter your valid code there and click 'Apply' to see the discounted price before completing the purchase."
      }
    ]
  },
  {
    title: "Security & Policy",
    icon: ShieldCheck,
    items: [
      {
        question: "What is the 'Single Device' policy?",
        answer: "To prevent account sharing, RDC allows only one active session at a time. If you log in from a second device, your first session will be automatically logged out."
      },
      {
        question: "Can I share my account with a friend?",
        answer: "No, account sharing is strictly prohibited under our Terms of Service. Doing so may result in a permanent ban from the platform without any refund."
      },
      {
        question: "How is my data protected?",
        answer: "We use industry-standard encryption and Firebase's secure infrastructure to protect your personal and payment information. We never share your data with unauthorized third parties."
      }
    ]
  }
];

export default function FaqPage() {
  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Hero Header */}
      <section className="relative py-16 md:py-24 bg-muted/30 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
            <HelpCircle className="w-3.5 h-3.5" />
            Support Center
          </div>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-tight">
            How can we <span className="text-primary">Help</span> you?
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Find answers to the most frequently asked questions about the Red Dot Classroom platform.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {faqSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-6">
              <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                <section.icon className="w-6 h-6 text-primary" />
                <h2 className="font-headline text-xl md:text-2xl font-black uppercase tracking-tight">
                  {section.title}
                </h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-3">
                {section.items.map((item, itemIdx) => (
                  <AccordionItem 
                    value={`item-${sectionIdx}-${itemIdx}`} 
                    key={itemIdx}
                    className="border border-white/10 rounded-2xl overflow-hidden bg-card/50 shadow-sm hover:border-primary/30 transition-all"
                  >
                    <AccordionTrigger className="text-base md:text-lg font-bold text-left px-6 py-5 hover:no-underline hover:bg-white/5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 text-muted-foreground leading-relaxed text-sm md:text-base font-medium">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight">Still have questions?</h2>
              <p className="text-muted-foreground font-medium">If you couldn&apos;t find what you were looking for, our team is here to help.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="rounded-xl font-black uppercase tracking-widest px-8 shadow-xl shadow-primary/20 h-14">
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl font-black uppercase tracking-widest px-8 h-14 border-white/20 bg-white/50 backdrop-blur-sm">
                <Link href="tel:01641035736">Call 01641035736</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
