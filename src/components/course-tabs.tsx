"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Course } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';

export function CourseTabs({ course }: { course: Course }) {
    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = React.useMemo(() => {
        let baseTabs = [
            { id: 'overview', label: t.overview[language] },
            { id: 'instructors', label: t.instructors[language] },
        ];

        if (course.cycles && course.cycles.length > 0) {
            baseTabs.push({ id: 'cycles', label: t.cycles[language] });
        }

        if (course.syllabus && course.syllabus.length > 0) {
            baseTabs.push({ id: 'syllabus', label: t.syllabus[language] });
        }
        
        if (course.faqs && course.faqs.length > 0) {
            baseTabs.push({ id: 'faq', label: t.nav_faq[language] });
        }

        if (course.price) {
            baseTabs.push({ id: 'payment', label: t.payment_info[language] });
        }
        
        return baseTabs;
    }, [course, language]);

    const handleScroll = () => {
        let currentTab = '';
        const offset = 150; // Header height + some margin
        for (const tab of tabs) {
            const section = document.getElementById(tab.id);
            if (section && section.getBoundingClientRect().top <= offset) {
                currentTab = tab.id;
            }
        }
        if (currentTab) {
            setActiveTab(currentTab);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [tabs]);

    const scrollToSection = (id: string) => {
        const section = document.getElementById(id);
        if (section) {
            const topPos = section.offsetTop - 120; // approximate offset
            window.scrollTo({
                top: topPos,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-16 z-40">
            <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
                <nav className="flex items-center space-x-2 text-sm font-bold">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            onClick={() => scrollToSection(tab.id)}
                            className={cn(
                                "py-6 px-4 whitespace-nowrap transition-all uppercase text-[10px] tracking-widest rounded-none border-b-2",
                                activeTab === tab.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-primary"
                            )}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
