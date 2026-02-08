'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  DollarSign,
  User,
  LogOut,
  Badge,
  PhoneCall,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading } = useAuth();
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
        <div className="flex items-center justify-center h-screen bg-background">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const menuItems = [
    { href: "/affiliate/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/affiliate/links", icon: Link2, label: "Links" },
    { href: "/affiliate/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/affiliate/payouts", icon: DollarSign, label: "Payouts" },
    { href: "/affiliate/absent-students", icon: PhoneCall, label: "Call Center" },
    { href: "/affiliate/profile", icon: User, label: "Profile" },
    { href: "/affiliate/id-card", icon: Badge, label: "ID Card" },
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
    <div className="min-h-screen flex flex-col bg-background">
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
    </div>
  );
}
