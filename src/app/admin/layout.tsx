"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users, BookCopy, UserCog, AreaChart, Settings, LogOut, LayoutDashboard, DollarSign, Home, TicketPercent, Building, QrCode, PhoneCall, Database, Users2, Megaphone, Store, ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, userInfo, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user || userInfo?.role !== 'Admin') {
                router.push('/login');
            }
        }
    }, [user, userInfo, loading, router]);
    
    if (loading || !user || userInfo?.role !== 'Admin') {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    const menuItems = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Home" },
        { href: "/admin/homepage", icon: Home, label: "CMS" },
        { href: "/admin/store/products", icon: Store, label: "Store" },
        { href: "/admin/store/orders", icon: ShoppingCart, label: "Orders" },
        { href: "/admin/offline-hub", icon: Building, label: "Offline" },
        { href: "/admin/scan-attendance", icon: QrCode, label: "Scan" },
        { href: "/admin/group-access", icon: Users2, label: "Groups" },
        { href: "/admin/absent-students", icon: PhoneCall, label: "Calls" },
        { href: "/admin/users", icon: UserCog, label: "Staff" },
        { href: "/admin/students", icon: Users, label: "Users" },
        { href: "/admin/courses", icon: BookCopy, label: "Courses" },
        { href: "/admin/question-bank", icon: Database, label: "Q-Bank" },
        { href: "/admin/notices", icon: Megaphone, label: "Notice" },
        { href: "/admin/promo-codes", icon: TicketPercent, label: "Promos" },
        { href: "/admin/financials", icon: DollarSign, label: "Sales" },
        { href: "/admin/analytics", icon: AreaChart, label: "Analytics" },
        { href: "/admin/settings", icon: Settings, label: "System" },
        { href: "/", icon: LogOut, label: "Exit", action: logout },
    ];

    const getIsActive = (href: string) => {
        if (href.endsWith('/dashboard') || href.endsWith('/manage-user')) return pathname === href;
        if (href === '/') return false;
        return pathname.startsWith(href);
    };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 px-1.5 sm:px-2 lg:px-4 pt-20 pb-28 overflow-x-hidden">
        <div className="container max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 dark:bg-card/95 backdrop-blur-xl border-t border-primary/10 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] h-14 px-2 flex justify-center overflow-hidden"
      >
        <div className="flex justify-start md:justify-center items-center h-full w-full max-w-full overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.action}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[68px] md:min-w-[85px] h-full text-center transition-all duration-300 relative px-1",
                  getIsActive(item.href)
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-pill-admin"
                  className="absolute inset-x-1 inset-y-2 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-line-admin"
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                />
              )}
              <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "text-primary" : "")} />
              <span className="text-[9px] font-black uppercase tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}