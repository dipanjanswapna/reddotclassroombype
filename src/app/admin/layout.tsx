
"use client";

import Link from 'next/link';
import {
  Users,
  BookCopy,
  UserCog,
  AreaChart,
  Settings,
  LogOut,
  LayoutDashboard,
  DollarSign,
  Home,
  TicketPercent,
  CalendarPlus,
  Handshake,
  Badge,
  Notebook,
  Building,
  QrCode,
  Search,
  PhoneCall,
  Database,
  Users2,
  Megaphone,
  Store,
  ShoppingCart,
  Tags,
  Gift,
  Share2,
  HelpCircle,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { motion } from 'framer-motion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, userInfo, loading } = useAuth();
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
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/homepage", icon: Home, label: "Home CMS" },
        { href: "/admin/store/products", icon: Store, label: "Products" },
        { href: "/admin/store/categories", icon: Tags, label: "Catalog" },
        { href: "/admin/store/orders", icon: ShoppingCart, label: "Orders" },
        { href: "/admin/store/rewards", icon: Gift, label: "Rewards" },
        { href: "/admin/store/redeem-requests", icon: Gift, label: "Redeems" },
        { href: "/admin/offline-hub", icon: Building, label: "Offline Hub" },
        { href: "/admin/scan-attendance", icon: QrCode, label: "Scan" },
        { href: "/admin/group-access", icon: Users2, label: "Groups" },
        { href: "/admin/absent-students", icon: PhoneCall, label: "Call Hub" },
        { href: "/admin/callback-requests", icon: PhoneCall, label: "Callbacks" },
        { href: "/admin/users", icon: UserCog, label: "Staff" },
        { href: "/admin/students", icon: Users, label: "Students" },
        { href: "/admin/doubt-solvers", icon: HelpCircle, label: "Experts" },
        { href: "/admin/manage-user", icon: Search, label: "User Search" },
        { href: "/admin/sellers", icon: Handshake, label: "Partners" },
        { href: "/admin/courses", icon: BookCopy, label: "Courses" },
        { href: "/admin/question-bank", icon: Database, label: "Question Bank" },
        { href: "/admin/notices", icon: Megaphone, label: "Notices" },
        { href: "/admin/blog", icon: Notebook, label: "Blog" },
        { href: "/admin/teachers", icon: UserCog, label: "Teachers" },
        { href: "/admin/promo-codes", icon: TicketPercent, label: "Promos" },
        { href: "/admin/referrals", icon: Share2, label: "Referrals" },
        { href: "/admin/pre-bookings", icon: CalendarPlus, label: "Campaigns" },
        { href: "/admin/financials", icon: DollarSign, label: "Sales" },
        { href: "/admin/analytics", icon: AreaChart, label: "Analytics" },
        { href: "/admin/reports", icon: AreaChart, label: "Reports" },
        { href: "/admin/settings", icon: Settings, label: "System" },
        { href: "/admin/id-card", icon: Badge, label: "ID Card" },
        { href: "/", icon: LogOut, label: "Logout" },
    ];

    const getIsActive = (href: string) => {
        if (href.endsWith('/dashboard') || href.endsWith('/manage-user')) {
            return pathname === href;
        }
        if (href === '/') {
            return false;
        }
        return pathname.startsWith(href);
    };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20">
        {children}
      </main>
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 dark:bg-card/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-14 px-2"
      >
        <div className="flex justify-start items-center h-full max-w-full overflow-x-auto no-scrollbar scroll-smooth gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-shrink-0 min-w-[70px] h-full text-center transition-all duration-300 relative",
                  getIsActive(item.href)
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-pill-admin"
                  className="absolute inset-x-1 inset-y-1.5 bg-primary/10 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {getIsActive(item.href) && (
                <motion.div 
                  layoutId="active-nav-line-admin"
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                />
              )}
              <item.icon className={cn("w-4 h-4", getIsActive(item.href) ? "text-primary" : "")} />
              <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}
