'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, CalendarClock, GraduationCap, Video, Library, HelpCircle, BookMarked, Users as UsersIcon, Crown, Trophy, Bot, Voicemail, Calculator, Heart, Wallet, Award, Bell, User, MessageSquare, LogOut, Badge, ClipboardEdit, FileCheck2, Settings, Share2, Gift
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';

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
    { href: "/student/live-classes", icon: Video, label: "Live Classes" },
    { href: "/student/quizzes", icon: HelpCircle, label: "Quizzes" },
    { href: "/student/exams", icon: ClipboardEdit, label: "Exams" },
    { href: "/student/deadlines", icon: CalendarClock, label: "Deadlines" },
    { href: "/student/grades", icon: FileCheck2, label: "Grades" },
    { href: "/student/resources", icon: Library, label: "Resources" },
    { href: "/student/referrals", icon: Share2, label: "Referrals" },
    { href: "/student/rewards", icon: Gift, label: "Rewards" },
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
    { href: "/student/id-card", icon: Badge, label: "ID Card" },
    { href: "/student/guardian", icon: UsersIcon, label: "Guardian" },
    { href: "/student/tickets", icon: MessageSquare, label: "Support" },
    { href: "/student/settings", icon: Settings, label: "Settings" },
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
  
  // This layout handles the main student dashboard pages.
  // A nested layout at /student/my-courses/[courseId]/layout.tsx will handle course-specific navigation.
  if (pathname.startsWith('/student/my-courses/') && pathname.split('/').length > 3) {
      return <>{children}</>;
  }

  return (
    <>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
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
    </>
  );
}