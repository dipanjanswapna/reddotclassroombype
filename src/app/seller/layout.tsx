
'use client';

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
