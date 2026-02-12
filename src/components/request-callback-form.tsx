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
import { useLanguage } from "@/context/language-context";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
    const { language } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const callbackSection = homepageConfig?.requestCallbackSection;
    const isBn = language === 'bn';

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            mobileNumber: "",
            class: "12th+",
            goals: "University Admission",
            preferredCourses: "Online Courses",
            state: "Dhaka",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await addCallbackRequest(values);
            if (result.success) {
                trackLead('callback_request', { class: values.class, goals: values.goals });
                toast({
                    title: isBn ? "আবেদন জমা হয়েছে!" : "Request Submitted!",
                    description: isBn ? "আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।" : "Our team will get back to you shortly.",
                });
                form.reset();
            } else {
                throw new Error(result.message);
            }
        } catch(error: any) {
             toast({
                title: isBn ? "ত্রুটি ঘটেছে" : "Submission Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <Card className={cn("shadow-2xl overflow-hidden border-none rounded-[20px] md:rounded-[30px] bg-card", isBn && "font-bengali")}>
        <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
                <div className="hidden md:flex items-center justify-center bg-muted p-8">
                     <Image
                        src={callbackSection?.imageUrl || "https://i.imgur.com/GZ0gQfN.png"}
                        alt="Happy student requesting a callback"
                        width={300}
                        height={400}
                        className="object-contain"
                        data-ai-hint={callbackSection?.dataAiHint || "student illustration"}
                    />
                </div>
                <div className="p-6 md:p-10 bg-card">
                    <h3 className={cn(
                        "text-xl md:text-2xl font-black mb-6 uppercase tracking-tight text-left",
                        isBn ? "font-bengali" : "font-headline"
                    )}>
                        {t.callback_title[language]}
                    </h3>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                             <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem className="text-left">
                                    <FormLabel className={cn("text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1", isBn && "font-bengali")}>
                                        {t.full_name_label[language]}*
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder={isBn ? "উদা: রিয়াদ হাসান" : "Ex: Rohit Singh"} {...field} className="rounded-xl h-11 bg-muted/30 border-black/5 text-gray-900 font-medium" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={({ field }) => (
                                    <FormItem className="text-left">
                                    <FormLabel className={cn("text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1", isBn && "font-bengali")}>
                                        {t.mobile_label[language]}*
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="01XXXXXXXXX" {...field} className="rounded-xl h-11 bg-muted/30 border-black/5 text-gray-900 font-medium" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="class"
                                render={({ field }) => (
                                <FormItem className="text-left">
                                    <FormLabel className={cn("text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1", isBn && "font-bengali")}>
                                        {t.class_label[language]}*
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-black/5 text-gray-900 font-bold">
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl font-bold">
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
                                <FormItem className="text-left">
                                    <FormLabel className={cn("text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1", isBn && "font-bengali")}>
                                        {t.goal_label[language]}*
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-black/5 text-gray-900 font-bold">
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl font-bold">
                                        <SelectItem value="HSC/SSC Exam">Board Exams</SelectItem>
                                        <SelectItem value="University Admission">University Admission</SelectItem>
                                        <SelectItem value="Job Prep/BCS">BCS & Job Prep</SelectItem>
                                        <SelectItem value="Skills">Professional Skills</SelectItem>
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
                                <FormItem className="text-left">
                                    <FormLabel className={cn("text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1", isBn && "font-bengali")}>
                                        {t.preference_label[language]}*
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-black/5 text-gray-900 font-bold">
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl font-bold">
                                        <SelectItem value="Online Courses">Online Courses</SelectItem>
                                        <SelectItem value="Offline Courses">Offline Hub</SelectItem>
                                        <SelectItem value="Both">Hybrid Mode</SelectItem>
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
                                <FormItem className="text-left">
                                    <FormLabel className={cn("text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1", isBn && "font-bengali")}>
                                        {t.location_label[language]}*
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-black/5 text-gray-900 font-bold">
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl font-bold">
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
                        <p className={cn("text-[10px] md:text-xs text-muted-foreground leading-relaxed text-left", isBn && "font-bengali")}>
                            {isBn ? 'এগিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের' : 'By continuing, you agree to our'}{' '}
                            <Link href="/terms" className="underline hover:text-primary font-bold">
                                {t.terms_of_service[language]}
                            </Link>
                        </p>
                        <Button type="submit" className={cn("w-full font-black text-xs uppercase tracking-widest h-12 md:h-14 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95", isBn && "font-bengali")} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {t.submit_callback[language]}
                        </Button>
                    </form>
                    </Form>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
