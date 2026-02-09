"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, Search, X, ChevronDown, Phone, ShoppingCart } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
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

export function Header({ containerClassName, variant = "light", wrapperClassName, homepageConfig }: { containerClassName?: string; variant?: "light" | "dark", wrapperClassName?: string, homepageConfig: HomepageConfig | null }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { language } = useLanguage();
  const { user, loading } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const isDark = variant === 'dark';

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const mainNavLinks = [
    { href: "/store", label: t.nav_rdc_store[language] },
    { href: "/courses", label: t.rdc_shop[language]},
    { href: "/courses?category=admission", label: t.nav_admission_test[language] },
    { href: "/offline-hub", label: t.nav_online_batch[language] },
  ];

  const moreLinks = [
    { href: "/courses?category=class-6-12", label: t.nav_class_6_12[language] },
    { href: "/courses?category=skills", label: t.nav_skills[language] },
    { href: "/blog", label: t.nav_blog[language] },
    { href: "/faq", label: t.nav_faq[language] },
    { href: "/about", label: t.nav_about[language] },
    { href: "/contact", label: t.nav_contact[language] },
  ];

  return (
    <header className={cn("sticky top-0 z-50 w-full py-3 transition-all duration-300", wrapperClassName)}>
      <div className="container">
        <div className={cn(
          "flex h-16 items-center justify-between rounded-full bg-background/70 dark:bg-card/50 backdrop-blur-xl border border-white/20 dark:border-white/10 px-4 shadow-xl transition-all duration-300",
          containerClassName
        )}>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative h-8 md:h-10 w-auto transition-transform duration-300 group-hover:scale-105">
                  <Image 
                    src={homepageConfig?.logoUrl || logoSrc} 
                    alt="RED DOT CLASSROOM Logo" 
                    width={120} 
                    height={40} 
                    className="h-full w-auto object-contain"
                    priority 
                  />
                </div>
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold">
              {mainNavLinks.map((link) => (
              <Button key={link.href} variant="ghost" asChild className={cn(
                "rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300",
                isDark && "text-white hover:bg-white/20"
              )}>
                  <Link href={link.href}>
                    {link.label}
                  </Link>
              </Button>
              ))}
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className={cn(
                        "flex items-center gap-1 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300",
                        isDark && "text-white hover:bg-white/20"
                      )}>
                      {t.nav_more[language]} <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="rounded-xl border-white/10 shadow-2xl">
                      {moreLinks.map((link) => (
                          <DropdownMenuItem key={link.href} asChild className="rounded-lg">
                              <Link href={link.href}>{link.label}</Link>
                          </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
              </DropdownMenu>
          </nav>

          <div className="flex items-center justify-end space-x-2">
              <div className="hidden sm:flex items-center space-x-1">
                  <LanguageToggle className={cn("rounded-full h-9", isDark && "text-white hover:bg-white/20")} />
                  <ThemeToggle className={cn("rounded-full h-9", isDark && "text-white hover:bg-white/20")} />
                  
                  <Separator orientation="vertical" className="h-6 mx-2 hidden lg:block opacity-50" />
                  
                  <Button variant="ghost" size="sm" className={cn(
                    "hidden lg:inline-flex rounded-full text-xs font-bold gap-2", 
                    isDark && "text-white hover:bg-white/20"
                  )}>
                    <Phone className="h-3.5 w-3.5 text-primary"/> 01641035736
                  </Button>

                  {!user && (
                    <div className="flex items-center gap-2 ml-2">
                      <Button asChild variant="ghost" size="sm" className={cn(
                        "rounded-full font-bold",
                        isDark && "text-white hover:bg-white/20"
                      )}>
                          <Link href="/login">{t.login[language]}</Link>
                      </Button>
                      <Button asChild size="sm" className={cn(
                        "rounded-full font-bold px-6 shadow-lg shadow-primary/20",
                        isDark && "bg-white text-black hover:bg-gray-200"
                      )}>
                          <Link href="/signup">{t.signup[language]}</Link>
                      </Button>
                    </div>
                  )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className={cn("relative rounded-full", isDark && "text-white hover:bg-white/20")} onClick={() => setIsCartOpen(true)}>
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
                  <Button variant="ghost" size="icon" aria-label="Toggle Menu" className={cn("rounded-full", isDark && "text-white hover:bg-white/20")}>
                      <Menu className="h-6 w-6" />
                  </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-full max-w-sm flex flex-col bg-background/90 backdrop-blur-2xl border-r-0">
                      <SheetHeader className="p-6 border-b bg-muted/20">
                          <SheetTitle className="text-left flex items-center gap-2">
                            <Image src={homepageConfig?.logoUrl || logoSrc} alt="Logo" width={100} height={32} className="h-8 w-auto object-contain" />
                          </SheetTitle>
                          <SheetDescription className="text-left text-xs">Empowering learners across Bangladesh.</SheetDescription>
                      </SheetHeader>
                      
                      <div className="flex-grow overflow-y-auto px-4 py-6">
                        <div className="flex flex-col space-y-2">
                            {mainNavLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="px-4 py-3 text-lg font-bold transition-all hover:bg-primary/10 hover:text-primary rounded-xl"
                            >
                                {link.label}
                            </Link>
                            ))}
                            <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="more-links" className="border-b-0">
                                <AccordionTrigger className="px-4 py-3 text-lg font-bold transition-all hover:bg-primary/10 hover:text-primary rounded-xl hover:no-underline justify-between">
                                {t.nav_more[language]}
                                </AccordionTrigger>
                                <AccordionContent>
                                <div className="flex flex-col space-y-1 pl-4 mt-2 border-l-2 border-primary/20 ml-4">
                                    {moreLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="px-4 py-2 text-base font-semibold transition-all hover:text-primary rounded-lg"
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

                      <Separator className="opacity-50" />
                      <div className="p-6 bg-muted/10 space-y-6">
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
                                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                                  {t.login[language]}
                                  </Link>
                              </Button>
                              <Button asChild className="w-full rounded-xl h-12 font-bold shadow-lg shadow-primary/20">
                                  <Link href="/signup" onClick={() => setMenuOpen(false)}>
                                  {t.signup[language]}
                                  </Link>
                              </Button>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-center px-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Preferences</p>
                            <div className="flex gap-2">
                              <LanguageToggle className="rounded-full bg-background shadow-sm border border-white/10" />
                              <ThemeToggle className="rounded-full bg-background shadow-sm border border-white/10" />
                            </div>
                        </div>
                      </div>
                  </SheetContent>
              </Sheet>
              </div>
          </div>
        </div>
      </div>
    </header>
  );
}