
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  DollarSign,
  User,
  LogOut,
} from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/affiliate/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/affiliate/links", icon: Link2, label: "Links" },
    { href: "/affiliate/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/affiliate/payouts", icon: DollarSign, label: "Payouts" },
    { href: "/affiliate/profile", icon: User, label: "Profile" },
    { href: "/", icon: LogOut, label: "Logout" },
  ];

  const getIsActive = (href: string) => {
    if (href === '/affiliate/dashboard') {
        return pathname === href;
    }
    const newHref = href.endsWith('/') ? href.slice(0, -1) : href;
    if (newHref === '') return false;
    return pathname.startsWith(newHref);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
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
    </div>
  );
}
