
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ChevronDown, Phone, Globe } from "lucide-react";
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
import { NotificationBell } from "./notification-bell";
import { HomepageConfig } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import logoSrc from '@/public/logo.png';
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function Header({ containerClassName, variant = "light", wrapperClassName, homepageConfig }: { containerClassName?: string; variant?: "light" | "dark", wrapperClassName?: string, homepageConfig: HomepageConfig | null }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { language } = useLanguage();
  const { user } = useAuth();
  const isDark = variant === 'dark';

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
    <header className={cn("fixed top-0 left-0 right-0 z-50 w-full flex justify-center bg-transparent pt-3 pointer-events-none transition-all duration-300", wrapperClassName)}>
      <div className="container max-w-7xl pointer-events-auto px-4">
        <div className={cn(
          "flex h-12 items-center justify-between rounded-full bg-background/80 dark:bg-card/80 backdrop-blur-xl border border-primary/40 px-4 sm:px-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden",
          containerClassName
        )}>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2 shrink-0 transition-transform hover:scale-105 active:scale-95">
                <Image src={logoSrc} alt="RED DOT CLASSROOM Logo" className="h-7 w-auto" priority />
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-1">
              {mainNavLinks.map((link) => (
              <Button key={link.href} variant="ghost" asChild className={cn("h-8 px-3 text-xs font-semibold uppercase tracking-tight", isDark && "text-white hover:bg-white/10")}>
                  <Link
                  href={link.href}
                  className="transition-colors hover:text-primary whitespace-nowrap"
                  >
                  {link.label}
                  </Link>
              </Button>
              ))}
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className={cn("h-8 px-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-tight", isDark && "text-white hover:bg-white/10")}>
                      {t.nav_more[language]} <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 bg-background/95 backdrop-blur-lg border-primary/20">
                      {moreLinks.map((link) => (
                          <DropdownMenuItem key={link.href} asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary font-medium">
                              <Link href={link.href}>{link.label}</Link>
                          </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
              </DropdownMenu>
          </nav>

          <div className="flex items-center justify-end space-x-2">
              <div className="hidden sm:flex items-center space-x-1">
                  <ThemeToggle className={cn("h-8 w-8 rounded-full", isDark && "text-white hover:bg-white/10 hover:text-white")} />
                  {!user && (
                    <div className="flex items-center gap-1 ml-2">
                        <Button asChild variant="ghost" size="sm" className={cn("h-8 text-xs font-bold", isDark && "text-white hover:bg-white/10 hover:text-white")}>
                            <Link href="/login">{t.login[language]}</Link>
                        </Button>
                        <Button asChild size="sm" className={cn("h-8 px-4 text-xs font-bold rounded-full shadow-lg active:shadow-inner bg-primary hover:bg-primary/90")}>
                            <Link href="/signup">{t.signup[language]}</Link>
                        </Button>
                    </div>
                  )}
              </div>
              
              {user && (
                <div className="flex items-center gap-1 border-l border-primary/20 pl-2">
                    <NotificationBell />
                    <UserNav />
                </div>
              )}

              <div className="lg:hidden flex items-center">
              <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle Menu" className={cn("h-8 w-8 rounded-full", isDark && "text-white hover:bg-white/10")}>
                      <Menu className="h-5 w-5" />
                  </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-full max-w-xs flex flex-col bg-background/95 backdrop-blur-2xl border-r-primary/20">
                      <SheetHeader className="p-6 border-b border-primary/10">
                          <Link
                              href="/"
                              className="flex items-center space-x-2"
                              onClick={() => setMenuOpen(false)}
                          >
                              <Image src={logoSrc} alt="RED DOT CLASSROOM Logo" className="h-10 w-auto" priority />
                          </Link>
                          <SheetDescription className="text-left mt-2">Empowering learners in Bangladesh.</SheetDescription>
                      </SheetHeader>
                      
                      <div className="flex-grow overflow-y-auto px-4 py-6">
                      <div className="flex flex-col space-y-2">
                          {mainNavLinks.map((link) => (
                          <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setMenuOpen(false)}
                              className="px-4 py-3 text-lg font-bold transition-colors hover:text-primary hover:bg-primary/5 rounded-xl"
                          >
                              {link.label}
                          </Link>
                          ))}
                          <Separator className="my-2 opacity-50" />
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="more-links" className="border-b-0">
                              <AccordionTrigger className="px-4 py-3 text-lg font-bold transition-colors hover:text-primary hover:bg-primary/5 rounded-xl hover:no-underline justify-between">
                              {t.nav_more[language]}
                              </AccordionTrigger>
                              <AccordionContent>
                              <div className="flex flex-col space-y-1 pl-4 mt-1 border-l-2 border-primary/10 ml-4">
                                  {moreLinks.map((link) => (
                                  <Link
                                      key={link.href}
                                      href={link.href}
                                      onClick={() => setMenuOpen(false)}
                                      className="px-4 py-2.5 text-base font-medium transition-colors hover:text-primary hover:bg-primary/5 rounded-lg"
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

                      <div className="p-6 mt-auto border-t border-primary/10 bg-accent/5">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 text-primary" />
                                <span>{t.hotline[language]}: 01641035736</span>
                            </div>
                            {!user && (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button asChild variant="outline" className="rounded-xl border-primary/20 font-bold">
                                        <Link href="/login" onClick={() => setMenuOpen(false)}>{t.login[language]}</Link>
                                    </Button>
                                    <Button asChild className="rounded-xl font-bold">
                                        <Link href="/signup" onClick={() => setMenuOpen(false)}>{t.signup[language]}</Link>
                                    </Button>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Theme</span>
                                <ThemeToggle />
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
