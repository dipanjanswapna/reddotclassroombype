"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Course } from '@/lib/types';


export function CourseTabs({ course }: { course: Course }) {
    const [isSticky, setSticky] = useState(false);
    const [activeTab, setActiveTab] = useState('features');

    const tabs = React.useMemo(() => {
        let baseTabs = [
            { id: 'features', label: 'Overview' },
            { id: 'instructors', label: 'Instructors' },
        ];

        if (course.videoUrl) {
            baseTabs.push({ id: 'media', label: 'Preview' });
        }

        if (course.cycles && course.cycles.length > 0) {
            baseTabs.push({ id: 'cycles', label: 'Cycles' });
        }

        if (course.type === 'Exam') {
            if (course.examTemplates && course.examTemplates.length > 0) {
                baseTabs.push({ id: 'exams', label: 'Exam Schedule' });
            }
        } else {
            if (course.classRoutine && course.classRoutine.length > 0) {
                baseTabs.push({ id: 'routine', label: 'Routine' });
            }
        
            if (course.examTemplates && course.examTemplates.length > 0) {
                baseTabs.push({ id: 'exams', label: 'Exams' });
            }
        
            if (course.syllabus && course.syllabus.length > 0) {
                baseTabs.push({ id: 'syllabus', label: 'Curriculum' });
            }
        }

        if (course.assignmentTemplates && course.assignmentTemplates.length > 0) {
            baseTabs.push({ id: 'assignments', label: 'Tasks' });
        }

        if (course.liveClasses && course.liveClasses.length > 0) {
            baseTabs.push({ id: 'live-classes', label: 'Live' });
        }

        if (course.announcements && course.announcements.length > 0) {
            baseTabs.push({ id: 'announcements', label: 'Notices' });
        }
        
        if (course.reviewsData && course.reviewsData.length > 0) {
            baseTabs.push({ id: 'reviews', label: 'Reviews' });
        }

        if (course.faqs && course.faqs.length > 0) {
            baseTabs.push({ id: 'faq', label: 'FAQ' });
        }
        
        return baseTabs;
    }, [course]);

    const handleScroll = () => {
        const header = document.querySelector('header');
        if (header) {
            const headerBottom = header.getBoundingClientRect().bottom;
            setSticky(window.scrollY > headerBottom + 400); 
        }
        
        let currentTab = '';
        const offset = (header ? header.offsetHeight : 64) + 100; 
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
            const topPos = section.offsetTop - header.offsetHeight - 80; 
            window.scrollTo({
                top: topPos,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={cn("bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-all sticky top-16 z-40")}>
            <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
                <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            onClick={() => scrollToSection(tab.id)}
                            className={cn(
                                "py-6 px-4 whitespace-nowrap transition-all hover:text-primary rounded-none border-b-2 h-14",
                                activeTab === tab.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground"
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
