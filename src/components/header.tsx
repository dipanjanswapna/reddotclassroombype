"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ChevronDown, Phone, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UserNav } from "./user-nav";
import { useLanguage } from "@/context/language-context";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "./language-toggle";
import { NotificationBell } from "./notification-bell";
import { HomepageConfig } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import logoSrc from '@/public/logo.png';
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/context/cart-context";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Separator } from "./ui/separator";

/**
 * @fileOverview Professional Header with clean geometric style and no glassmorphism.
 */
export function Header({ containerClassName, variant = "light", wrapperClassName, homepageConfig }: { containerClassName?: string; variant?: "light" | "dark", wrapperClassName?: string, homepageConfig: HomepageConfig | null }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { language, getLocalizedPath } = useLanguage();
  const { user } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const isDark = variant === 'dark';

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const mainNavLinks = [
    { href: getLocalizedPath("/store"), label: t.nav_rdc_store[language] },
    { href: getLocalizedPath("/courses"), label: t.rdc_shop[language]},
    { href: getLocalizedPath("/courses?category=admission"), label: t.nav_admission_test[language] },
    { href: getLocalizedPath("/offline-hub"), label: t.nav_offline_hub[language] },
  ];

  const moreLinks = [
    { href: getLocalizedPath("/courses?category=class-6-12"), label: t.nav_class_6_12[language] },
    { href: getLocalizedPath("/courses?category=skills"), label: t.nav_skills[language] },
    { href: getLocalizedPath("/blog"), label: t.nav_blog[language] },
    { href: getLocalizedPath("/faq"), label: t.nav_faq[language] },
    { href: getLocalizedPath("/about"), label: t.nav_about[language] },
    { href: getLocalizedPath("/contact"), label: t.nav_contact[language] },
  ];

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn("fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-background border-b border-border", wrapperClassName)}
    >
      <div className="container">
        <div className={cn(
          "flex h-16 items-center justify-between px-4 transition-all duration-300",
          containerClassName
        )}>
          <div className="flex items-center gap-2">
            <Link href={getLocalizedPath("/")} className="flex items-center space-x-2 group">
                <Image 
                  src={homepageConfig?.logoUrl || logoSrc} 
                  alt="Red Dot Classroom Logo" 
                  width={120} 
                  height={40} 
                  className="h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                  priority 
                />
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold">
              {mainNavLinks.map((link) => (
                <Button key={link.href} variant="ghost" asChild className="rounded-lg hover:bg-muted transition-colors px-4">
                    <Link href={link.href}>
                      {link.label}
                    </Link>
                </Button>
              ))}
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-1 rounded-lg hover:bg-muted transition-colors px-4">
                      {t.nav_more[language]} <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="rounded-xl shadow-lg p-2 border-border">
                      {moreLinks.map((link) => (
                          <DropdownMenuItem key={link.href} asChild className="rounded-lg cursor-pointer">
                              <Link href={link.href}>{link.label}</Link>
                          </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
              </DropdownMenu>
          </nav>

          <div className="flex items-center justify-end space-x-2">
              <div className="hidden sm:flex items-center space-x-1">
                  <LanguageToggle className="rounded-lg h-9 hover:bg-muted" />
                  <ThemeToggle className="rounded-lg h-9 hover:bg-muted" />
                  
                  <Separator orientation="vertical" className="h-6 mx-2 hidden lg:block" />
                  
                  {!user && (
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm" className="rounded-lg font-bold">
                          <Link href={getLocalizedPath("/login")}>{t.login[language]}</Link>
                      </Button>
                      <Button asChild size="sm" className="rounded-lg font-bold">
                          <Link href={getLocalizedPath("/signup")}>{t.signup[language]}</Link>
                      </Button>
                    </div>
                  )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="relative rounded-lg hover:bg-muted" onClick={() => setIsCartOpen(true)}>
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-[10px] border-2 border-background">{itemCount}</Badge>
                  )}
                </Button>
                
                {user && <NotificationBell />}
                {user && <UserNav />}
              </div>

              <div className="lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle Menu" className="rounded-lg">
                      <Menu className="h-6 w-6" />
                  </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-full max-w-sm flex flex-col bg-white dark:bg-background border-r">
                      <SheetHeader className="p-6 border-b text-left">
                          <SheetTitle className="flex items-center gap-2">
                            <Image src={homepageConfig?.logoUrl || logoSrc} alt="Logo" width={100} height={32} className="h-8 w-auto object-contain" />
                          </SheetTitle>
                          <SheetDescription>Empowering learners across Bangladesh.</SheetDescription>
                      </SheetHeader>
                      
                      <div className="flex-grow overflow-y-auto px-4 py-6">
                        <div className="flex flex-col space-y-1">
                            {mainNavLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="px-4 py-3 text-lg font-bold transition-all hover:bg-muted rounded-xl"
                            >
                                {link.label}
                            </Link>
                            ))}
                            <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="more-links" className="border-b-0">
                                <AccordionTrigger className="px-4 py-3 text-lg font-bold transition-all hover:bg-muted rounded-xl hover:no-underline justify-between">
                                {t.nav_more[language]}
                                </AccordionTrigger>
                                <AccordionContent>
                                <div className="flex flex-col space-y-1 pl-4 mt-2 border-l-2 border-primary/20 ml-4">
                                    {moreLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="px-4 py-2 text-base font-semibold transition-all hover:text-primary"
                                    >
                                        {link.label}
                                    </Link>
                                    ))}
                                </div>
                                </AccordionContent>
                            </AccordionItem>
                            </Accordion>
                        </div>
                      </div>

                      <div className="p-6 bg-muted/30 space-y-6">
                        <div className="flex flex-col gap-3">
                          <Button variant="outline" className="w-full justify-start rounded-xl h-12 font-bold gap-3" asChild>
                            <a href="tel:01641035736">
                              <Phone className="h-4 w-4 text-primary"/>
                              {t.hotline[language]}: 01641035736
                            </a>
                          </Button>
                        </div>
                        
                        {!user && (
                            <div className="grid grid-cols-2 gap-3">
                              <Button asChild variant="outline" className="w-full rounded-xl h-12 font-bold">
                                  <Link href={getLocalizedPath("/login")} onClick={() => setMenuOpen(false)}>
                                  {t.login[language]}
                                  </Link>
                              </Button>
                              <Button asChild className="w-full rounded-xl h-12 font-bold">
                                  <Link href={getLocalizedPath("/signup")} onClick={() => setMenuOpen(false)}>
                                  {t.signup[language]}
                                  </Link>
                              </Button>
                            </div>
                        )}
                      </div>
                  </SheetContent>
              </Sheet>
              </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}