
'use client';

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X, ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "./user-nav";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/context/cart-context";
import { Badge } from "./ui/badge";
import { StoreCategory } from "@/lib/types";
import { usePathname } from "next/navigation";
import { RhombusLogo } from "./rhombus-logo";
import { useLanguage } from "@/context/language-context";
import { t } from "@/lib/i18n";


export function StoreHeader({ categories }: { categories: StoreCategory[] }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const pathname = usePathname();
  const { language } = useLanguage();
  
  const getDashboardLink = () => {
    if (!user) return '/login';
    // Simplified, ideally this comes from userInfo
    return '/student/dashboard'; 
  }

  const navLinks = [
    { href: "/store", label: t.nav_home[language], highlight: true },
    { href: "/store/academic", label: t.nav_academic_prep[language] },
    { href: "/store/ebooks", label: t.nav_ebook[language] },
    { href: "/store/stationery", label: t.nav_stationery[language] },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store">
            <RhombusLogo />
          </Link>
        </div>
        
        <nav className="hidden lg:flex items-center gap-4 text-sm font-medium">
            {navLinks.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                    )}
                >
                    {link.label}
                </Link>
            ))}
        </nav>

        <div className="flex items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">{itemCount}</Badge>
                )}
            </Button>
            {user ? (
                <UserNav />
            ) : (
                <Button asChild variant="outline"><Link href="/login">Login</Link></Button>
            )}
            <div className="lg:hidden">
                <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon"><Menu/></Button>
                    </SheetTrigger>
                    <SheetContent>
                        <nav className="flex flex-col gap-4 mt-8">
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "font-medium hover:text-primary",
                                        pathname === link.href ? "text-primary" : ""
                                    )}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
