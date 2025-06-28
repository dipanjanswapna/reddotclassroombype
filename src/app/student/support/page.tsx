
import { Mail, HelpCircle, Wrench, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const supportTopics = [
    {
        icon: HelpCircle,
        title: "Frequently Asked Questions",
        description: "Find quick answers to common questions about courses, payments, and your account.",
        link: "/faq",
        linkText: "View FAQs"
    },
    {
        icon: Mail,
        title: "Contact Support Team",
        description: "Can't find an answer? Get in touch with our support team directly for personalized help.",
        link: "/contact",
        linkText: "Contact Us"
    },
    {
        icon: Wrench,
        title: "Technical Issues",
        description: "Facing a technical problem? Try clearing your browser cache or using a different browser first.",
        link: "/contact",
        linkText: "Report Issue"
    },
    {
        icon: CreditCard,
        title: "Billing & Payments",
        description: "Need help with a transaction or have questions about payment methods? Check our FAQ or contact us.",
        link: "/faq",
        linkText: "See Payment FAQs"
    },
]

export default function SupportPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          We're here to help! Find the resources you need below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {supportTopics.map((topic, index) => (
            <Card key={index} className="flex flex-col">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <div className="p-3 bg-muted rounded-full">
                        <topic.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>{topic.title}</CardTitle>
                        <CardDescription className="mt-1">{topic.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow"></CardContent>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={topic.link}>{topic.linkText}</Link>
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}
