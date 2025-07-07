
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Course } from '@/lib/types';


export function CourseTabs({ course }: { course: Course }) {
    const [isSticky, setSticky] = useState(false);
    const [activeTab, setActiveTab] = useState('features');

    const tabs = React.useMemo(() => {
        const baseTabs = [
            { id: 'features', label: 'Overview' },
            { id: 'instructors', label: 'Instructors' },
        ];

        if (course.classRoutine && course.classRoutine.length > 0) {
            baseTabs.push({ id: 'routine', label: 'Routine' });
        }
    
        if (course.examTemplates && course.examTemplates.length > 0) {
            baseTabs.push({ id: 'exam-schedule', label: 'Exam Schedule' });
        }
    
        if (course.syllabus && course.syllabus.length > 0) {
            baseTabs.push({ id: 'syllabus', label: 'Syllabus' });
        }
        
        if (course.reviewsData && course.reviewsData.length > 0) {
            baseTabs.push({ id: 'reviews', label: 'Reviews' });
        }

        if (course.faqs && course.faqs.length > 0) {
            baseTabs.push({ id: 'faq', label: 'FAQ' });
        }

        if (course.price) {
            baseTabs.push({ id: 'payment', label: 'Payment' });
        }
        
        return baseTabs;
    }, [course]);

    const handleScroll = () => {
        const header = document.querySelector('header');
        if (header) {
            const headerBottom = header.getBoundingClientRect().bottom;
            // The value '64' corresponds to the height of the header (h-16)
            setSticky(window.scrollY > headerBottom + 400); // Adjust this value based on hero section height
        }
        
        let currentTab = '';
        const offset = (header ? header.offsetHeight : 64) + 60; // Header height + tabs height
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
        const header = document.querySelector('header');
        if (section && header) {
            const topPos = section.offsetTop - header.offsetHeight - 50; // header height + some margin
            window.scrollTo({
                top: topPos,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={cn("bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-all sticky top-16 z-40")}>
            <div className="container mx-auto px-4 overflow-x-auto">
                <nav className="flex items-center space-x-2 text-sm font-medium">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            onClick={() => scrollToSection(tab.id)}
                            className={cn(
                                "py-4 px-3 whitespace-nowrap transition-colors hover:text-primary rounded-none border-b-2",
                                activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
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
