
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Link2, BarChart3, DollarSign, PhoneCall, User, Badge, LogOut
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || userInfo?.role !== 'Affiliate') {
        router.push('/login');
      }
    }
  }, [user, userInfo, loading, router]);
  
  if (loading || !user || userInfo?.role !== 'Affiliate') {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const menuItems = [
    { href: "/affiliate/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/affiliate/links", icon: Link2, label: "Links" },
    { href: "/affiliate/analytics", icon: BarChart3, label: "Stats" },
    { href: "/affiliate/payouts", icon: DollarSign, label: "Payouts" },
    { href: "/affiliate/absent-students", icon: PhoneCall, label: "Calls" },
    { href: "/affiliate/profile", icon: User, label: "Profile" },
    { href: "/affiliate/id-card", icon: Badge, label: "ID Card" },
    { href: "/", icon: LogOut, label: "Logout", action: logout },
  ];

  const getIsActive = (href: string) => {
    if (href.endsWith('/dashboard')) return pathname === href;
    if (href === '/') return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-background">
      <main className="flex-1 px-1 pt-20 pb-28 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 bg-background/80 dark:bg-card/80 backdrop-blur-2xl border border-primary/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] h-16 rounded-[25px] flex justify-center overflow-hidden"
      >
        <div className="flex justify-start md:justify-center items-center h-full w-full max-w-full overflow-x-auto no-scrollbar scroll-smooth gap-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.action}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[72px] md:min-w-[90px] h-full text-center transition-all duration-300 relative px-1",
                  getIsActive(item.href)
                    ? "text-cyan-600"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-pill-affiliate"
                  className="absolute inset-x-1 inset-y-2 bg-cyan-600/10 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "text-cyan-600 scale-110" : "scale-100")} />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}
