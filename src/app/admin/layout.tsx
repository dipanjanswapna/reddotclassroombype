'use client';

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
  BarChartHorizontal,
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

/**
 * @fileOverview Refined Admin Portal Layout.
 * Features ultra-clean glassmorphism navigation and efficient item grouping.
 */
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
        { href: "/admin/analytics", icon: BarChartHorizontal, label: "Analytics" },
        { href: "/admin/reports", icon: AreaChart, label: "Reports" },
        { href: "/admin/settings", icon: Settings, label: "System" },
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
    <>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-full overflow-hidden">
        <div className="container max-w-7xl mx-auto">
            {children}
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-primary/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto flex justify-start items-center space-x-1 overflow-x-auto p-1 scrollbar-hide">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-shrink-0 p-2 w-24 h-16 text-center transition-all rounded-xl",
                  getIsActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", getIsActive(item.href) && "animate-pulse")} />
              <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
