"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Settings,
  LogOut,
  BookCopy,
  Users as UsersIcon,
  BarChart3,
  Paintbrush,
  Banknote,
  LayoutDashboard,
  Badge,
  QrCode,
  PhoneCall,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || userInfo?.role !== 'Seller') {
        router.push('/login');
      }
    }
  }, [user, userInfo, loading, router]);
  
  if (loading || !user || userInfo?.role !== 'Seller') {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const menuItems = [
    { href: "/seller/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/seller/courses", icon: BookCopy, label: "Courses" },
    { href: "/seller/teachers", icon: UsersIcon, label: "Teachers" },
    { href: "/seller/students", icon: UsersIcon, label: "Students" },
    { href: "/seller/call-center", icon: PhoneCall, label: "Call Center" },
    { href: "/seller/scan-attendance", icon: QrCode, label: "Scan" },
    { href: "/seller/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/seller/payouts", icon: Banknote, label: "Payouts" },
    { href: "/seller/branding", icon: Paintbrush, label: "Branding" },
    { href: "/seller/settings", icon: Settings, label: "Settings" },
    { href: "/seller/id-card", icon: Badge, label: "ID Card" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];

  const getIsActive = (href: string) => {
    if (href.endsWith('/dashboard')) {
        return pathname === href;
    }
    if (href === '/') {
        return false;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28">
        {children}
      </main>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="fixed bottom-4 left-4 right-4 z-40 bg-background/70 dark:bg-card/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-1 overflow-hidden transition-all duration-300"
      >
        <div className="flex justify-start items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center gap-1.5 flex-shrink-0 p-2 w-24 h-16 text-center transition-all duration-300 rounded-xl relative",
                  getIsActive(item.href)
                    ? "text-primary-foreground scale-105"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-pill-seller"
                  className="absolute inset-0 bg-primary shadow-lg shadow-primary/30 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "animate-pulse" : "")} />
              <span className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}