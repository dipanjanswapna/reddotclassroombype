
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tabs = [
    { id: 'features', label: 'কোর্স সম্পর্কে' },
    { id: 'instructors', label: 'কোর্স ইন্সট্রাক্টর' },
    { id: 'routine', label: 'ক্লাস রুটিন' },
    { id: 'syllabus', label: 'সিলেবাস' },
    { id: 'faq', label: 'FAQ' },
];

export function CourseTabs() {
    const [isSticky, setSticky] = useState(false);
    const [activeTab, setActiveTab] = useState('features');

    const handleScroll = () => {
        const header = document.querySelector('header');
        const heroSection = document.querySelector('.bg-gray-900');
        if (header && heroSection) {
            const heroBottom = heroSection.getBoundingClientRect().bottom;
            if (heroBottom <= header.offsetHeight) {
                setSticky(true);
            } else {
                setSticky(false);
            }
        }
        
        // Active tab logic
        let currentTab = '';
        for (const tab of tabs) {
            const section = document.getElementById(tab.id);
            if (section && section.getBoundingClientRect().top <= (header ? header.offsetHeight + 60 : 120)) {
                currentTab = tab.id;
            }
        }
        if (currentTab) {
            setActiveTab(currentTab);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToSection = (id: string) => {
        const section = document.getElementById(id);
        const header = document.querySelector('header');
        if (section && header) {
            const topPos = section.offsetTop - header.offsetHeight - 20;
            window.scrollTo({
                top: topPos,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={cn("bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-all", isSticky ? "sticky top-16 z-40 shadow-md" : "relative")}>
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
