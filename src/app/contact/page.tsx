
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/components/ui/use-toast';
import { submitContactFormAction } from '@/app/actions/support.actions';
import { Loader2 } from 'lucide-react';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await submitContactFormAction({ name, email, message });

        if (result.success) {
            toast({
                title: "Message Sent!",
                description: "Thank you for contacting us. We'll get back to you shortly.",
            });
            setName('');
            setEmail('');
            setMessage('');
        } else {
            toast({
                title: "Error",
                description: result.message,
                variant: "destructive",
            });
        }
        setIsLoading(false);
    }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We'd love to hear from you. Please fill out the form below.
        </p>
      </div>
      <div className="mt-12 max-w-xl mx-auto">
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Your message..." rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
