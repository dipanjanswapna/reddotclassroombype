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
 * @fileOverview Refined Admin Layout with Geometric Standards and Sentence Case labels.
 * Implements solid pro-cards and standardized rounding.
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

    const menuItems = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/homepage", icon: Home, label: "Manage CMS" },
        { href: "/admin/store/products", icon: Store, label: "Store Inventory" },
        { href: "/admin/store/orders", icon: ShoppingCart, label: "Orders" },
        { href: "/admin/store/categories", icon: Layers3, label: "Categories" },
        { href: "/admin/store/rewards", icon: Gift, label: "Rewards" },
        { href: "/admin/store/redeem-requests", icon: Truck, label: "Redeem Requests" },
        { href: "/admin/offline-hub", icon: Building, label: "Offline Hub" },
        { href: "/admin/scan-attendance", icon: QrCode, label: "Scan Attendance" },
        { href: "/admin/group-access", icon: Users2, label: "Group Access" },
        { href: "/admin/absent-students", icon: PhoneCall, label: "Call Center" },
        { href: "/admin/callback-requests", icon: MessageSquare, label: "Callbacks" },
        { href: "/admin/users", icon: UserCog, label: "Staff Members" },
        { href: "/admin/students", icon: Users, label: "Students" },
        { href: "/admin/teachers", icon: UserCheck, label: "Elite Faculty" },
        { href: "/admin/sellers", icon: Handshake, label: "Partners" },
        { href: "/admin/doubt-solvers", icon: HelpCircle, label: "Doubt Solvers" },
        { href: "/admin/courses", icon: BookCopy, label: "Academic Courses" },
        { href: "/admin/pre-bookings", icon: Bookmark, label: "Pre-bookings" },
        { href: "/admin/question-bank", icon: Database, label: "Question Bank" },
        { href: "/admin/notices", icon: Megaphone, label: "Notice Board" },
        { href: "/admin/promo-codes", icon: TicketPercent, label: "Promo Codes" },
        { href: "/admin/financials", icon: DollarSign, label: "Sales & Revenue" },
        { href: "/admin/analytics", icon: AreaChart, label: "Web Analytics" },
        { href: "/admin/reports", icon: FileBarChart, label: "Reports" },
        { href: "/admin/id-card", icon: IdCard, label: "Official ID" },
        { href: "/admin/settings", icon: Settings, label: "System Settings" },
        { href: "/", icon: LogOut, label: "Exit Panel", action: logout },
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
        className="fixed bottom-4 left-4 right-4 z-50 bg-white/90 dark:bg-card/90 backdrop-blur-xl border border-border shadow-xl h-16 rounded-[20px] flex justify-center overflow-hidden"
      >
        <div className="flex justify-start items-center h-full w-full max-w-full overflow-x-auto no-scrollbar scroll-smooth gap-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.action}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[85px] h-full text-center transition-all duration-300 relative px-1",
                  getIsActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-pill-admin-master"
                  className="absolute inset-x-1 inset-y-2 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-5 h-5", getIsActive(item.href) ? "text-primary" : "")} />
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-tight whitespace-nowrap",
                getIsActive(item.href) ? "text-primary" : "text-muted-foreground"
              )}>{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}