
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
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';

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
        { href: "/admin/homepage", icon: Home, label: "Homepage" },
        { href: "/admin/users", icon: UserCog, label: "Staff Users" },
        { href: "/admin/students", icon: Users, label: "Student Users" },
        { href: "/admin/sellers", icon: Handshake, label: "Sellers" },
        { href: "/admin/courses", icon: BookCopy, label: "Courses" },
        { href: "/admin/teachers", icon: UserCog, label: "Teachers" },
        { href: "/admin/promo-codes", icon: TicketPercent, label: "Promo Codes" },
        { href: "/admin/pre-bookings", icon: CalendarPlus, label: "Pre-bookings" },
        { href: "/admin/financials", icon: DollarSign, label: "Financials" },
        { href: "/admin/reports", icon: AreaChart, label: "Reports" },
        { href: "/admin/settings", icon: Settings, label: "Settings" },
        { href: "/admin/id-card", icon: Badge, label: "ID Card" },
        { href: "/", icon: LogOut, label: "Logout" },
    ];

    const getIsActive = (href: string) => {
        if (href === '/admin/dashboard') {
            return pathname === href;
        }
        // De-dupe / from the end of the href
        const newHref = href.endsWith('/') ? href.slice(0, -1) : href;
        if (newHref === '') return false; // Don't match the root logout button
        return pathname.startsWith(newHref);
    };

  return (
    <>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t">
        <div className="container mx-auto flex justify-start items-center space-x-1 overflow-x-auto p-1">
          {menuItems.map((item) => (
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
