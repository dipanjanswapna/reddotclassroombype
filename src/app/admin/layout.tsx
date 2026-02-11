
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users, BookCopy, UserCog, AreaChart, Settings, LogOut, LayoutDashboard, DollarSign, Home, TicketPercent, Building, QrCode, PhoneCall, Database, Users2, Megaphone, Store, ShoppingCart, Layers3, Gift, Truck, UserCheck, Handshake, HelpCircle, Bookmark, FileBarChart, IdCard, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

/**
 * @fileOverview Refined Admin Layout with 28 Ordered Buttons and px-1 wall-to-wall UI.
 * Features a high-density horizontally scrollable bottom nav with white-pill active state.
 */
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
            <div className="flex items-center justify-center h-screen bg-background">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    // Comprehensive and ordered Admin Menu List (28 Items)
    const menuItems = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/homepage", icon: Home, label: "CMS" },
        { href: "/admin/store/products", icon: Store, label: "Store" },
        { href: "/admin/store/orders", icon: ShoppingCart, label: "Orders" },
        { href: "/admin/store/categories", icon: Layers3, label: "Categories" },
        { href: "/admin/store/rewards", icon: Gift, label: "Rewards" },
        { href: "/admin/store/redeem-requests", icon: Truck, label: "Redeem" },
        { href: "/admin/offline-hub", icon: Building, label: "Offline Hub" },
        { href: "/admin/scan-attendance", icon: QrCode, label: "Scan" },
        { href: "/admin/group-access", icon: Users2, label: "Groups" },
        { href: "/admin/absent-students", icon: PhoneCall, label: "Calls" },
        { href: "/admin/callback-requests", icon: MessageSquare, label: "Callbacks" },
        { href: "/admin/users", icon: UserCog, label: "Staff" },
        { href: "/admin/students", icon: Users, label: "Students" },
        { href: "/admin/teachers", icon: UserCheck, label: "Teachers" },
        { href: "/admin/sellers", icon: Handshake, label: "Partners" },
        { href: "/admin/doubt-solvers", icon: HelpCircle, label: "Solvers" },
        { href: "/admin/courses", icon: BookCopy, label: "Courses" },
        { href: "/admin/pre-bookings", icon: Bookmark, label: "Pre-book" },
        { href: "/admin/question-bank", icon: Database, label: "Q-Bank" },
        { href: "/admin/notices", icon: Megaphone, label: "Notices" },
        { href: "/admin/promo-codes", icon: TicketPercent, label: "Promos" },
        { href: "/admin/financials", icon: DollarSign, label: "Sales" },
        { href: "/admin/analytics", icon: AreaChart, label: "Traffic" },
        { href: "/admin/reports", icon: FileBarChart, label: "Reports" },
        { href: "/admin/id-card", icon: IdCard, label: "ID Card" },
        { href: "/admin/settings", icon: Settings, label: "System" },
        { href: "/", icon: LogOut, label: "Exit", action: logout },
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
      
      {/* Premium Bottom Navigation with White Pill Active State */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 bg-background/80 dark:bg-card/80 backdrop-blur-2xl border border-primary/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] h-16 rounded-[25px] flex justify-center overflow-hidden"
      >
        <div className="flex justify-start items-center h-full w-full max-w-full overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth gap-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.action}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[72px] md:min-w-[90px] h-full text-center transition-all duration-300 relative px-1",
                  getIsActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-pill-admin-master"
                  className="absolute inset-x-1 inset-y-2 bg-white dark:bg-primary shadow-[0_4px_15px_rgba(0,0,0,0.1)] rounded-[20px] -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "text-primary scale-110" : "scale-100")} />
              <span className={cn(
                "text-[9px] md:text-[10px] font-black uppercase tracking-tight whitespace-nowrap",
                getIsActive(item.href) ? "text-primary" : "text-muted-foreground"
              )}>{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}
