import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Metadata } from 'next';

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
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find answers to common questions about Red Dot Classroom.
        </p>
      </div>
      <div className="mt-12 max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="font-semibold text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
