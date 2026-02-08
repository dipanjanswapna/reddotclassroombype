
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/components/ui/use-toast';
import { submitContactFormAction } from '@/app/actions/support.actions';
import { Loader2, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-14 max-w-full">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Contact Us</h1>
        <div className="h-1.5 w-24 bg-primary mx-auto mt-4 rounded-full shadow-md" />
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
          We'd love to hear from you. Have a question or feedback? Reach out to our team.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 lg:gap-16 max-w-6xl mx-auto">
        <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2rem] border border-primary/10 bg-muted/30 shadow-lg p-8 space-y-8 h-full">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Our Info</h2>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">Reach out directly via these channels for faster response.</p>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary transition-colors duration-300">
                            <Mail className="w-6 h-6 text-primary group-hover:text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Email Us</p>
                            <p className="font-bold text-sm">support@reddotclassroom.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary transition-colors duration-300">
                            <Phone className="w-6 h-6 text-primary group-hover:text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Call Us</p>
                            <p className="font-bold text-sm">+8801641035736</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary transition-colors duration-300">
                            <MapPin className="w-6 h-6 text-primary group-hover:text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Head Office</p>
                            <p className="font-bold text-sm">Mirpur DOHS, Dhaka</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <Card className="rounded-[2.5rem] border-2 border-primary shadow-2xl p-8 md:p-12 bg-card overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-colors duration-500 group-hover:bg-primary/10" />
                <form className="grid gap-6 relative z-10" onSubmit={handleSubmit}>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-primary">Your Name</Label>
                            <Input id="name" placeholder="Full Name" className="h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-primary shadow-sm" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-primary">Email Address</Label>
                            <Input id="email" type="email" placeholder="name@company.com" className="h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-primary shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-primary">How can we help?</Label>
                        <Textarea id="message" placeholder="Describe your inquiry..." rows={6} className="rounded-2xl bg-muted/50 border-none focus-visible:ring-primary shadow-sm p-4" value={message} onChange={(e) => setMessage(e.target.value)} required />
                    </div>
                    <Button type="submit" size="lg" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Message
                    </Button>
                </form>
            </Card>
        </div>
      </div>
    </div>
  );
}
