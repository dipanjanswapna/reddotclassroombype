
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  HelpCircle,
  Settings,
  LogOut,
  User,
  Badge,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function DoubtSolverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userInfo, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || userInfo?.role !== 'Doubt Solver') {
        router.push('/login');
      }
    }
  }, [user, userInfo, loading, router]);
  
  if (loading || !user || userInfo?.role !== 'Doubt Solver') {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoadingSpinner className="w-12 h-12" />
        </div>
    );
  }

  const menuItems = [
    { href: "/doubt-solver/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/doubt-solver/my-doubts", icon: HelpCircle, label: "My Doubts" },
    { href: "/doubt-solver/profile", icon: User, label: "Profile" },
    { href: "/doubt-solver/id-card", icon: Badge, label: "ID Card" },
    { href: "/doubt-solver/settings", icon: Settings, label: "Settings" },
    { href: "/", icon: LogOut, label: "Logout", action: logout },
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
              onClick={item.action}
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
