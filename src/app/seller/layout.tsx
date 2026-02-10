"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookCopy, Users, PhoneCall, QrCode, BarChart3, Banknote, Paintbrush, Badge, LogOut
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading, logout } = useAuth();
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
    { href: "/seller/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/seller/courses", icon: BookCopy, label: "Courses" },
    { href: "/seller/teachers", icon: Users, label: "Faculty" },
    { href: "/seller/call-center", icon: PhoneCall, label: "Calls" },
    { href: "/seller/scan-attendance", icon: QrCode, label: "Scan" },
    { href: "/seller/analytics", icon: BarChart3, label: "Stats" },
    { href: "/seller/payouts", icon: Banknote, label: "Payouts" },
    { href: "/seller/branding", icon: Paintbrush, label: "Branding" },
    { href: "/seller/profile", icon: Users, label: "Profile" },
    { href: "/seller/id-card", icon: Badge, label: "ID Card" },
    { href: "/", icon: LogOut, label: "Logout", action: logout },
  ];

  const getIsActive = (href: string) => {
    if (href.endsWith('/dashboard')) return pathname === href;
    if (href === '/') return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 px-4 pt-20 pb-28 overflow-x-hidden">
        <div className="container max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 bg-background/80 dark:bg-card/80 backdrop-blur-2xl border border-primary/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] h-16 rounded-2xl flex justify-center overflow-hidden"
      >
        <div className="flex justify-start md:justify-center items-center h-full w-full max-w-7xl overflow-x-auto no-scrollbar scroll-smooth gap-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.action}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[72px] md:min-w-[90px] h-full text-center transition-all duration-300 relative px-1",
                  getIsActive(item.href)
                    ? "text-indigo-600"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-pill-seller"
                  className="absolute inset-x-1 inset-y-2 bg-indigo-600/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "text-indigo-600" : "")} />
              <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}