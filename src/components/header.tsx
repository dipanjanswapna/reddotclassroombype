
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, Search, X, ChevronDown, Phone } from "lucide-react";
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
import { getHomepageConfig } from "@/lib/firebase/firestore";
import { HomepageConfig } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import logoSrc from '@/public/logo.png';
import { cn } from "@/lib/utils";


export function Header({ containerClassName, variant = "light", wrapperClassName }: { containerClassName?: string; variant?: "light" | "dark", wrapperClassName?: string }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { language } = useLanguage();
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const { user, loading } = useAuth();
  const isDark = variant === 'dark';

  useEffect(() => {
    getHomepageConfig().then(setConfig);
  }, []);

  const mainNavLinks = [
    { href: "/courses?category=class-6-12", label: t.nav_class_6_12[language] },
    { href: "/courses?category=skills", label: t.nav_skills[language] },
    { href: "/courses?category=admission", label: t.nav_admission_test[language] },
    { href: "/offline-hub", label: t.nav_online_batch[language] },
  ];

  const moreLinks = [
    { href: "/blog", label: t.nav_blog[language] },
    { href: "/faq", label: t.nav_faq[language] },
    { href: "/about", label: t.nav_about[language] },
    { href: "/contact", label: t.nav_contact[language] },
  ];

  return (
    <header className={cn("sticky top-0 z-50 w-full py-2", wrapperClassName)}>
      <div className="container">
        <div className={cn("flex h-16 items-center justify-between rounded-full bg-background/80 px-4 shadow-lg backdrop-blur-md border", containerClassName)}>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
                <Image src={logoSrc} alt="RED DOT CLASSROOM Logo" className="h-8 md:h-10 w-auto" priority />
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
              {mainNavLinks.map((link) => (
              <Button key={link.href} variant="ghost" asChild className={cn(isDark && "text-white hover:bg-white/20")}>
                  <Link
                  href={link.href}
                  className="transition-colors hover:text-primary"
                  >
                  {link.label}
                  </Link>
              </Button>
              ))}
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className={cn("flex items-center gap-1", isDark && "text-white hover:bg-white/20")}>
                      {t.nav_more[language]} <ChevronDown className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      {moreLinks.map((link) => (
                          <DropdownMenuItem key={link.href} asChild>
                              <Link href={link.href}>{link.label}</Link>
                          </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
              </DropdownMenu>
          </nav>

          <div className="flex items-center justify-end space-x-2">
              <div className="hidden sm:flex items-center space-x-2">
                  <LanguageToggle className={cn(isDark && "text-white hover:bg-white/20 hover:text-white")} />
                  <Button variant="ghost" className={cn("hidden lg:inline-flex", isDark && "text-white hover:bg-white/20 hover:text-white")}><Phone className="mr-2"/> {t.hotline[language]}: 01641035736</Button>
                  {!user && (
                    <>
                    <Button asChild variant="outline" className={cn(isDark && "text-white border-white/50 hover:bg-white/10 hover:text-white")}>
                        <Link href="/login">{t.login[language]}</Link>
                    </Button>
                    <Button asChild className={cn(isDark && "bg-white text-black hover:bg-gray-200")}>
                        <Link href="/signup">{t.signup[language]}</Link>
                    </Button>
                    </>
                  )}
              </div>
              
              {user && <NotificationBell />}
              {user && <UserNav />}

              <div className="lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle Menu" className={cn(isDark && "text-white hover:bg-white/20")}>
                      <Menu className="h-5 w-5" />
                  </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-full max-w-sm flex flex-col">
                      <SheetHeader className="sr-only">
                          <SheetTitle>Mobile Menu</SheetTitle>
                          <SheetDescription>Main navigation links for the Red Dot Classroom website.</SheetDescription>
                      </SheetHeader>
                      <div className="p-4 border-b">
                      <Link
                          href="/"
                          className="flex items-center space-x-2"
                          onClick={() => setMenuOpen(false)}
                      >
                          <Image src={logoSrc} alt="RED DOT CLASSROOM Logo" className="h-8 w-auto" priority />
                      </Link>
                      </div>
                      
                      <div className="flex-grow overflow-y-auto px-2 py-4">
                      <div className="flex flex-col space-y-1">
                          {mainNavLinks.map((link) => (
                          <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setMenuOpen(false)}
                              className="px-2 py-3 text-base font-medium transition-colors hover:text-primary rounded-md"
                          >
                              {link.label}
                          </Link>
                          ))}
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="more-links" className="border-b-0">
                              <AccordionTrigger className="px-2 py-3 text-base font-medium transition-colors hover:text-primary rounded-md hover:no-underline justify-start gap-1">
                              {t.nav_more[language]}
                              </AccordionTrigger>
                              <AccordionContent>
                              <div className="flex flex-col space-y-1 pl-7">
                                  {moreLinks.map((link) => (
                                  <Link
                                      key={link.href}
                                      href={link.href}
                                      onClick={() => setMenuOpen(false)}
                                      className="px-2 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md"
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

                      <Separator />
                      <div className="p-4 flex flex-col gap-2">
                      <Button variant="ghost" className="w-full justify-start"><Phone className="mr-2"/> {t.hotline[language]}: 01641035736</Button>
                      <Separator />
                      {!user && (
                          <div className="flex gap-2 mt-2">
                          <Button asChild variant="outline" className="w-full">
                              <Link href="/login" onClick={() => setMenuOpen(false)}>
                              {t.login[language]}
                              </Link>
                          </Button>
                          <Button asChild className="w-full">
                              <Link href="/signup" onClick={() => setMenuOpen(false)}>
                              {t.signup[language]}
                              </Link>
                          </Button>
                          </div>
                      )}
                      <div className="pt-2">
                          <LanguageToggle />
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
