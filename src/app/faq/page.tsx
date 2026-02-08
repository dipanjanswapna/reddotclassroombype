
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Metadata } from 'next';
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Red Dot Classroom courses, payments, and account management.',
};

const faqs = [
  {
    question: "How do I enroll in a course?",
    answer: "You can enroll in a course by visiting the course details page and clicking the 'Enroll Now' button. You will be prompted to log in or create an account if you haven't already."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept various payment methods including mobile banking (bKash, Nagad), credit/debit cards, and internet banking."
  },
  {
    question: "Can I get a refund?",
    answer: "We offer a 30-day money-back guarantee on most courses. Please check our refund policy on the Terms of Service page for more details."
  },
  {
    question: "How do I access my course materials?",
    answer: "Once enrolled, you can access all your course materials, including videos and notes, from your Student Dashboard under the 'My Courses' section."
  }
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-14 max-w-full">
      <div className="text-center mb-16">
        <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Frequently Asked Questions</h1>
        <div className="h-1.5 w-24 bg-primary mx-auto mt-4 rounded-full shadow-md" />
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          Quickly find the information you need about our courses, payments, and platform features.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <Card className="rounded-[2.5rem] border border-primary/10 bg-card shadow-2xl p-6 md:p-12">
            <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border border-primary/5 rounded-[1.5rem] overflow-hidden bg-muted/20 px-2 transition-all hover:bg-muted/40">
                <AccordionTrigger className="font-black text-left px-6 py-5 hover:no-underline text-base md:text-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <HelpCircle className="w-5 h-5 text-primary" />
                        </div>
                        <span className="leading-tight">{faq.question}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-16 pb-6 text-muted-foreground text-sm md:text-base leading-relaxed font-medium">
                    {faq.answer}
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        </Card>
      </div>
    </div>
  );
}
