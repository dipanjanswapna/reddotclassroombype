
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { addCallbackRequest } from "@/app/actions/callback.actions";
import { HomepageConfig } from "@/lib/types";
import { trackLead } from "@/lib/fpixel";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  mobileNumber: z.string().min(10, {
    message: "Please enter a valid mobile number.",
  }),
  class: z.string(),
  goals: z.string(),
  preferredCourses: z.string(),
  state: z.string(),
});

export function RequestCallbackForm({ homepageConfig }: { homepageConfig: HomepageConfig | null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const callbackSection = homepageConfig?.requestCallbackSection;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            mobileNumber: "",
            class: "12th+",
            goals: "NEET",
            preferredCourses: "Online Courses",
            state: "Bangladesh",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await addCallbackRequest(values);
            if (result.success) {
                trackLead('callback_request', { class: values.class, goals: values.goals });
                toast({
                    title: "Request Submitted!",
                    description: "Our team will get back to you shortly.",
                });
                form.reset();
            } else {
                throw new Error(result.message);
            }
        } catch(error: any) {
             toast({
                title: "Submission Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <Card className="shadow-2xl overflow-hidden border-none rounded-2xl md:rounded-3xl">
        <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
                <div className="hidden md:flex items-center justify-center bg-[#eef2ed] dark:bg-gray-800 p-8">
                     <Image
                        src={callbackSection?.imageUrl || "https://i.imgur.com/GZ0gQfN.png"}
                        alt="Happy student requesting a callback"
                        width={300}
                        height={400}
                        className="object-contain"
                        data-ai-hint={callbackSection?.dataAiHint || "student illustration"}
                    />
                </div>
                <div className="p-6 md:p-10 bg-[#eef2ed] dark:bg-gray-900/50">
                    <h3 className="text-xl md:text-2xl font-black mb-6 text-gray-900 dark:text-foreground font-headline uppercase tracking-tight">Request a callback</h3>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                             <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs uppercase font-black tracking-widest text-gray-500 dark:text-muted-foreground">Full name*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Rohit Singh" {...field} className="rounded-xl h-10 md:h-11 bg-white/50 dark:bg-background/50 border-black/5 dark:border-white/10 text-gray-900 dark:text-foreground" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs uppercase font-black tracking-widest text-gray-500 dark:text-muted-foreground">Mobile Number*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: +88017..." {...field} className="rounded-xl h-10 md:h-11 bg-white/50 dark:bg-background/50 border-black/5 dark:border-white/10 text-gray-900 dark:text-foreground" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="class"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase font-black tracking-widest text-gray-500 dark:text-muted-foreground">Class*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl h-10 md:h-11 bg-white/50 dark:bg-background/50 border-black/5 dark:border-white/10 text-gray-900 dark:text-foreground">
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="12th+">12th+</SelectItem>
                                        <SelectItem value="11th">11th</SelectItem>
                                        <SelectItem value="10th">10th</SelectItem>
                                        <SelectItem value="9th">9th</SelectItem>
                                        <SelectItem value="8th">8th</SelectItem>
                                        <SelectItem value="7th">7th</SelectItem>
                                        <SelectItem value="6th">6th</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="goals"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase font-black tracking-widest text-gray-500 dark:text-muted-foreground">Goals*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl h-10 md:h-11 bg-white/50 dark:bg-background/50 border-black/5 dark:border-white/10 text-gray-900 dark:text-foreground">
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="NEET">NEET</SelectItem>
                                        <SelectItem value="JEE">JEE</SelectItem>
                                        <SelectItem value="Board Exams">Board Exams</SelectItem>
                                        <SelectItem value="University Admission">University Admission</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="preferredCourses"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase font-black tracking-widest text-gray-500 dark:text-muted-foreground">Preference*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl h-10 md:h-11 bg-white/50 dark:bg-background/50 border-black/5 dark:border-white/10 text-gray-900 dark:text-foreground">
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="Online Courses">Online Courses</SelectItem>
                                        <SelectItem value="Offline Courses">Offline Courses</SelectItem>
                                        <SelectItem value="Both">Both</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase font-black tracking-widest text-gray-500 dark:text-muted-foreground">Location*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl h-10 md:h-11 bg-white/50 dark:bg-background/50 border-black/5 dark:border-white/10 text-gray-900 dark:text-foreground">
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="Dhaka">Dhaka</SelectItem>
                                        <SelectItem value="Chattogram">Chattogram</SelectItem>
                                        <SelectItem value="Khulna">Khulna</SelectItem>
                                        <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                                        <SelectItem value="Barishal">Barishal</SelectItem>
                                        <SelectItem value="Sylhet">Sylhet</SelectItem>
                                        <SelectItem value="Rangpur">Rangpur</SelectItem>
                                        <SelectItem value="Mymensingh">Mymensingh</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                                )}
                            />
                        </div>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-muted-foreground leading-relaxed">
                            By continuing, you agree to our{' '}
                            <Link href="/terms" className="underline hover:text-primary font-bold">
                                Terms & Conditions
                            </Link>
                        </p>
                        <Button type="submit" className="w-full font-black text-sm uppercase tracking-widest h-12 md:h-14 rounded-xl shadow-xl shadow-primary/20" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Request Callback"}
                        </Button>
                    </form>
                    </Form>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
