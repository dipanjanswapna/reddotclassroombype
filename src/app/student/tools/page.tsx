
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Voicemail, Calculator, ChevronRight, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * @fileOverview Student Tools Hub Page.
 * Consolidated page for AI Tutor, TTS, and Calculator.
 */
export default function StudentToolsPage() {
    const tools = [
        {
            title: "AI Tutor",
            description: "আপনার সিলেবাস অনুযায়ী প্রশ্ন করুন এবং তাৎক্ষণিক উত্তর পান আমাদের AI টিউটরের কাছ থেকে।",
            href: "/student/tutor",
            icon: Bot,
            color: "bg-pink-100 text-pink-600",
            borderColor: "hover:border-pink-300"
        },
        {
            title: "Text-to-Speech (TTS)",
            description: "যেকোনো টেক্সট বা নোটকে চমৎকার অডিওতে রূপান্তর করুন এবং শুনতে থাকুন যেকোনো সময়।",
            href: "/student/tts",
            icon: Voicemail,
            color: "bg-violet-100 text-violet-600",
            borderColor: "hover:border-violet-300"
        },
        {
            title: "Smart Calculator",
            description: "অ্যাডভান্স সায়েন্টিফিক ক্যালকুলেটর এবং AI ম্যাথ সলভারের মাধ্যমে কঠিন সব সমাধান করুন।",
            href: "/student/calculator",
            icon: Calculator,
            color: "bg-slate-100 text-slate-600",
            borderColor: "hover:border-slate-300"
        }
    ];

    return (
        <div className="space-y-10 md:space-y-14 pb-10">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 border-l-4 border-primary pl-6"
            >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                    <Wand2 className="w-3 h-3" />
                    AI Powered Utilities
                </div>
                <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight">
                    Learning <span className="text-primary">Tools</span> Hub
                </h1>
                <p className="text-muted-foreground font-medium text-base md:text-lg max-w-2xl">
                    আপনার পড়াশোনাকে আরও আধুনিক, দ্রুত এবং সহজ করার জন্য আমাদের বিশেষ সব টুলস।
                </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool, index) => (
                    <motion.div
                        key={tool.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="h-full"
                    >
                        <Link href={tool.href} className="h-full block">
                            <Card className={cn(
                                "h-full border-white/40 shadow-xl transition-all duration-500 bg-[#eef2ed] dark:bg-card/40 group overflow-hidden rounded-[2rem]",
                                tool.borderColor
                            )}>
                                <CardHeader className="p-8 space-y-6">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500",
                                        tool.color
                                    )}>
                                        <tool.icon className="w-9 h-9" />
                                    </div>
                                    <div className="space-y-3">
                                        <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {tool.title}
                                        </CardTitle>
                                        <CardDescription className="font-medium leading-relaxed text-sm md:text-base text-muted-foreground">
                                            {tool.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Explore Tool</span>
                                        <div className="bg-white dark:bg-background rounded-full p-2 shadow-md group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Micro Feature Section */}
            <Card className="rounded-[2rem] border-white/40 shadow-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
                <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-white dark:bg-card p-6 rounded-3xl shadow-xl shrink-0">
                        <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">More Tools Coming Soon!</h3>
                        <p className="text-muted-foreground font-medium">আমরা নিয়মিত নতুন নতুন টুল যুক্ত করছি আপনার লার্নিং এক্সপেরিয়েন্সকে আরও উন্নত করতে। সাথেই থাকুন!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
