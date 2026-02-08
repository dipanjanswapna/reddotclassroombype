'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, BookMarked, Video, HelpCircle, 
  Users as UsersIcon, Trophy, Calculator, Heart, Wallet, 
  MessageSquare, LogOut, Badge, FileCheck2, Share2, Gift
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';

/**
 * @fileOverview Refined Student Portal Layout.
 * Synchronized vertical rhythm and adaptive glassmorphism navigation.
 */
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
        <div className="flex items-center justify-center h-screen bg-background">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const navItems = [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/student/my-courses", icon: BookOpen, label: "Courses" },
    { href: "/student/planner", icon: BookMarked, label: "Planner" },
    { href: "/student/live-classes", icon: Video, label: "Live" },
    { href: "/student/quizzes", icon: HelpCircle, label: "Quizzes" },
    { href: "/student/grades", icon: FileCheck2, label: "Grades" },
    { href: "/student/referrals", icon: Share2, label: "Referrals" },
    { href: "/student/rewards", icon: Gift, label: "Rewards" },
    { href: "/student/calculator", icon: Calculator, label: "Tools" },
    { href: "/student/wishlist", icon: Heart, label: "Wishlist" },
    { href: "/student/payments", icon: Wallet, label: "Payments" },
    { href: "/student/profile", icon: UsersIcon, label: "Profile" },
    { href: "/student/id-card", icon: Badge, label: "ID Card" },
    { href: "/student/tickets", icon: MessageSquare, label: "Support" },
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
  
  // Prevent double layouts for lesson pages
  if (pathname.startsWith('/student/my-courses/') && pathname.split('/').length > 3) {
      return <div className="min-h-screen bg-background pb-20">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden max-w-full">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-7xl mx-auto w-full">
          {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-2xl border-t border-primary/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto flex justify-start items-center space-x-1 overflow-x-auto p-1 scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 p-2 w-20 md:w-24 h-16 text-center transition-all rounded-xl",
                  getIsActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", getIsActive(item.href) && "animate-pulse")} />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}