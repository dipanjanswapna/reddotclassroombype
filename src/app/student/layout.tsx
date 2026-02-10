
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, CalendarClock, Video, Library, HelpCircle, BookMarked, Users as UsersIcon, Trophy, Bot, Voicemail, Calculator, Heart, Wallet, Award, Bell, User, MessageSquare, LogOut, Badge, ClipboardEdit, FileCheck2, Settings, Share2, Gift
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || userInfo?.role !== 'Student') {
        router.push('/login');
      }
    }
  }, [user, userInfo, loading, router]);

  if (loading || !user || userInfo?.role !== 'Student') {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const navItems = [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/student/my-courses", icon: BookOpen, label: "Courses" },
    { href: "/student/planner", icon: BookMarked, label: "Planner" },
    { href: "/student/live-classes", icon: Video, label: "Live" },
    { href: "/student/quizzes", icon: HelpCircle, label: "Quizzes" },
    { href: "/student/exams", icon: ClipboardEdit, label: "Exams" },
    { href: "/student/grades", icon: FileCheck2, label: "Grades" },
    { href: "/student/referrals", icon: Share2, label: "Referrals" },
    { href: "/student/rewards", icon: Gift, label: "Rewards" },
    { href: "/student/tutor", icon: Bot, label: "AI Tutor" },
    { href: "/student/tts", icon: Voicemail, label: "TTS" },
    { href: "/student/calculator", icon: Calculator, label: "Calc" },
    { href: "/student/wishlist", icon: Heart, label: "Saved" },
    { href: "/student/payments", icon: Wallet, label: "Payments" },
    { href: "/student/profile", icon: User, label: "Profile" },
    { href: "/student/tickets", icon: MessageSquare, label: "Support" },
    { href: "/student/settings", icon: Settings, label: "System" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];
  
  const getIsActive = (href: string) => {
    if (href.endsWith('/dashboard') || href.endsWith('/my-courses')) {
        return pathname === href;
    }
    if (href === '/') {
        return false;
    }
    return pathname.startsWith(href);
  };
  
  // Skip bottom nav for specific sub-pages if needed
  if (pathname.startsWith('/student/my-courses/') && pathname.split('/').length > 3) {
      return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28">
        {children}
      </main>
      
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="fixed bottom-4 left-4 right-4 z-40 bg-background/70 dark:bg-card/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-1 overflow-hidden"
      >
        <div className="flex justify-start items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center gap-1.5 flex-shrink-0 p-2 w-20 h-16 text-center transition-all duration-300 rounded-xl relative",
                  getIsActive(item.href)
                    ? "text-primary-foreground scale-105"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-pill-student"
                  className="absolute inset-0 bg-primary shadow-lg shadow-primary/30 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "animate-pulse" : "")} />
              <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}
