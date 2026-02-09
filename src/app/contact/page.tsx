
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import { submitContactFormAction } from '@/app/actions/support.actions';
import { Loader2, Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    const contactInfo = [
        {
            icon: Phone,
            title: "Call Us",
            details: "+880 1641 035 736",
            subDetails: "Mon - Fri, 10am - 8pm",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        },
        {
            icon: Mail,
            title: "Email Support",
            details: "support@rdc.com",
            subDetails: "24/7 Online Support",
            color: "text-primary",
            bgColor: "bg-primary/10"
        },
        {
            icon: MapPin,
            title: "Our Office",
            details: "Mirpur DOHS, Dhaka",
            subDetails: "Bangladesh, 1216",
            color: "text-green-500",
            bgColor: "bg-green-500/10"
        }
    ];

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Modern Header Section */}
            <section className="relative py-16 md:py-24 bg-muted/30 border-b border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
                            <Globe className="w-3.5 h-3.5" />
                            Connect With Us
                        </div>
                        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-tight max-w-4xl mx-auto">
                            Get in <span className="text-primary">Touch</span>
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                            Have questions about our courses or technical issues? We're here to help you on your journey to excellence.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-4 mt-12 md:mt-20">
                <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    
                    {/* Contact Info Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {contactInfo.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                                <Card className="border-white/10 bg-card/50 backdrop-blur-xl hover:border-primary/30 transition-all duration-300">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className={cn("p-3 rounded-2xl shrink-0", item.bgColor, item.color)}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black uppercase tracking-tight text-sm">{item.title}</h3>
                                            <p className="font-bold text-foreground">{item.details}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.subDetails}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        <Card className="bg-primary/5 border-primary/20 rounded-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Clock className="w-24 h-24 rotate-12" />
                            </div>
                            <CardHeader className="p-6">
                                <CardTitle className="text-lg font-black uppercase tracking-tight">Support Hours</CardTitle>
                                <CardDescription className="font-medium text-muted-foreground">
                                    Our support team is available during these times to ensure you have the best learning experience.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-2 text-sm font-bold">
                                <div className="flex justify-between border-b border-primary/10 pb-2">
                                    <span className="text-muted-foreground">Saturday - Thursday</span>
                                    <span>10:00 AM - 10:00 PM</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-muted-foreground">Friday</span>
                                    <span className="text-primary">Closed (Emergency Only)</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="shadow-2xl border-white/10 bg-[#eef2ed] dark:bg-card/30 backdrop-blur-2xl rounded-3xl overflow-hidden">
                                <CardHeader className="p-8 md:p-10 border-b border-black/5 bg-[#eef2ed]/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MessageSquare className="w-6 h-6 text-primary" />
                                        <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-foreground">Send a Message</CardTitle>
                                    </div>
                                    <CardDescription className="text-base font-medium text-gray-600 dark:text-muted-foreground">
                                        Fill out the form below and we'll get back to you within 24 hours.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 md:p-10">
                                    <form className="grid gap-8" onSubmit={handleSubmit}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="name" className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-muted-foreground ml-1">Your Name</Label>
                                                <Input 
                                                    id="name" 
                                                    placeholder="e.g. Jubayer Ahmed" 
                                                    value={name} 
                                                    onChange={(e) => setName(e.target.value)} 
                                                    required 
                                                    className="rounded-xl h-12 border-black/10 focus:border-primary/50 bg-white/50 dark:bg-background/50 text-gray-900 dark:text-foreground"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label htmlFor="email" className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-muted-foreground ml-1">Email Address</Label>
                                                <Input 
                                                    id="email" 
                                                    type="email" 
                                                    placeholder="name@example.com" 
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)} 
                                                    required 
                                                    className="rounded-xl h-12 border-black/10 focus:border-primary/50 bg-white/50 dark:bg-background/50 text-gray-900 dark:text-foreground"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="message" className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-muted-foreground ml-1">How can we help?</Label>
                                            <Textarea 
                                                id="message" 
                                                placeholder="Write your message here..." 
                                                rows={6} 
                                                value={message} 
                                                onChange={(e) => setMessage(e.target.value)} 
                                                required 
                                                className="rounded-2xl border-black/10 focus:border-primary/50 bg-white/50 dark:bg-background/50 text-gray-900 dark:text-foreground resize-none p-4"
                                            />
                                        </div>
                                        <Button type="submit" size="lg" className="w-full md:w-fit font-black uppercase tracking-widest h-14 px-10 rounded-2xl shadow-xl shadow-primary/20" disabled={isLoading}>
                                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                                            Send Message
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
