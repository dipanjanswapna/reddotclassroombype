
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
    <Card className="shadow-lg overflow-hidden border-none">
        <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
                <div className="hidden md:flex items-center justify-center bg-[#eef5ff] dark:bg-gray-800 p-8">
                     <Image
                        src={callbackSection?.imageUrl || "https://i.imgur.com/GZ0gQfN.png"}
                        alt="Happy student requesting a callback"
                        width={300}
                        height={400}
                        className="object-contain"
                        data-ai-hint={callbackSection?.dataAiHint || "student illustration"}
                    />
                </div>
                <div className="p-6 md:p-8 bg-[#f7faff] dark:bg-gray-900/50">
                    <h3 className="text-2xl font-bold mb-6 text-foreground">Request a callback</h3>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Student's full name*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Rohit Singh" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Mobile Number*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: +8801700000000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="class"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="12th+">12th+</SelectItem>
                                        <SelectItem value="11th">11th</SelectItem>
                                        <SelectItem value="10th">10th</SelectItem>
                                        <SelectItem value="9th">9th</SelectItem>
                                        <SelectItem value="8th">8th</SelectItem>
                                        <SelectItem value="7th">7th</SelectItem>
                                        <SelectItem value="6th">6th</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="goals"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goals*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="NEET">NEET</SelectItem>
                                        <SelectItem value="JEE">JEE</SelectItem>
                                        <SelectItem value="Board Exams">Board Exams</SelectItem>
                                        <SelectItem value="University Admission">University Admission</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="preferredCourses"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preferred Courses*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Online Courses">Online Courses</SelectItem>
                                        <SelectItem value="Offline Courses">Offline Courses</SelectItem>
                                        <SelectItem value="Both">Both</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Dhaka">Dhaka</SelectItem>
                                        <SelectItem value="Chattogram">Chattogram</SelectItem>
                                        <SelectItem value="Khulna">Khulna</SelectItem>
                                        <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                                        <SelectItem value="Barishal">Barishal</SelectItem>
                                        <SelectItem value="Sylhet">Sylhet</SelectItem>
                                        <SelectItem value="Rangpur">Rangpur</SelectItem>
                                        <SelectItem value="Mymensingh">Mymensingh</SelectItem>
                                        <SelectItem value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            By continuing, you agree to our{' '}
                            <Link href="/terms" className="underline hover:text-primary">
                                Terms & Conditions
                            </Link>
                        </p>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </Button>
                    </form>
                    </Form>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
