'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, CalendarClock, GraduationCap, Video, Library, HelpCircle, BookMarked, Users as UsersIcon, Crown, Trophy, Bot, Voicemail, Calculator, Heart, Wallet, Award, Bell, User, MessageSquare, LogOut
} from 'lucide-react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if the path is a specific course page. Example: /student/my-courses/1, /student/my-courses/1/assignments
  // It should NOT match /student/my-courses
  const isCourseSpecificPage = /^\/student\/my-courses\/.+/.test(pathname);

  // If it is a course page, render only the children, allowing the nested course layout to take over.
  if (isCourseSpecificPage) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/student/my-courses", icon: BookOpen, label: "Courses" },
    { href: "/student/live-classes", icon: Video, label: "Live Classes" },
    { href: "/student/quizzes", icon: HelpCircle, label: "Quizzes" },
    { href: "/student/deadlines", icon: CalendarClock, label: "Deadlines" },
    { href: "/student/grades", icon: GraduationCap, label: "Grades" },
    { href: "/student/resources", icon: Library, label: "Resources" },
    { href: "/student/planner", icon: BookMarked, label: "Planner" },
    { href: "/student/community", icon: UsersIcon, label: "Community" },
    { href: "/student/leaderboard", icon: Crown, label: "Leaderboard" },
    { href: "/student/achievements", icon: Trophy, label: "Achievements" },
    { href: "/student/tutor", icon: Bot, label: "AI Tutor" },
    { href: "/student/tts", icon: Voicemail, label: "TTS" },
    { href: "/student/calculator", icon: Calculator, label: "Calculator" },
    { href: "/student/wishlist", icon: Heart, label: "Wishlist" },
    { href: "/student/payments", icon: Wallet, label: "Payments" },
    { href: "/student/certificates", icon: Award, label: "Certificates" },
    { href: "/student/notifications", icon: Bell, label: "Notifications" },
    { href: "/student/profile", icon: User, label: "Profile" },
    { href: "/student/guardian", icon: UsersIcon, label: "Guardian" },
    { href: "/student/tickets", icon: MessageSquare, label: "Support" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];
  
  const getIsActive = (href: string) => {
    // Exact match for dashboard and my-courses main page
    if (href === '/student/dashboard' || href === '/student/my-courses') {
        return pathname === href;
    }
    // For all other nested pages, a simple `startsWith` check is enough
    return pathname.startsWith(href);
  };
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t">
        <div className="container mx-auto flex justify-start items-center space-x-1 overflow-x-auto p-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 p-2 w-24 h-16 text-center transition-colors rounded-md",
                  getIsActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
