
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
import { RdcLogo } from "./rdc-logo";
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


export function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { language } = useLanguage();
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    getHomepageConfig().then(setConfig);
  }, []);

  const mainNavLinks = [
    { href: "/courses?category=class-6-12", label: t.nav_class_6_12[language] },
    { href: "/courses?category=skills", label: t.nav_skills[language] },
    { href: "/courses?category=admission", label: t.nav_admission_test[language] },
    { href: "/courses?category=online-batch", label: t.nav_online_batch[language] },
  ];

  const moreLinks = [
    { href: "/blog", label: t.nav_blog[language] },
    { href: "/faq", label: t.nav_faq[language] },
    { href: "/about", label: t.nav_about[language] },
    { href: "/contact", label: t.nav_contact[language] },
  ];

  const Logo = ({ className }: { className?: string }) => {
    if (config?.logoUrl) {
      // Using <img> to allow any image URL without next.config.js modification
      return <img src={config.logoUrl} alt="RED DOT CLASSROOM Logo" className={className} />;
    }
    return <RdcLogo className={className} />;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        
        <div className="flex items-center">
            <div className="lg:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle Menu">
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
                        <Logo className="h-8 w-auto" />
                        <span className="font-bold text-lg">RED DOT CLASSROOM</span>
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
                    {user ? (
                        <div className="w-full mt-2">
                           <UserNav />
                        </div>
                    ) : (
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
            <div className="hidden lg:flex items-center">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Logo className="h-8 w-auto" />
                    <span className="font-bold text-lg hidden lg:inline-block">RED DOT CLASSROOM</span>
                </Link>
                <nav className="flex items-center space-x-1 text-sm font-medium">
                    {mainNavLinks.map((link) => (
                    <Button key={link.href} variant="ghost" asChild>
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
                            <Button variant="ghost" className="flex items-center gap-1">
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
            </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden">
            <Link href="/">
                <Logo className="h-8 w-auto" />
            </Link>
        </div>
        
        <div className="flex items-center justify-end space-x-2">
          {user ? (
            <>
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
              <NotificationBell />
              <UserNav />
            </>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <LanguageToggle />
              <Button variant="ghost" className="hidden lg:inline-flex"><Phone className="mr-2"/> {t.hotline[language]}: 01641035736</Button>
              <Button asChild variant="outline">
                <Link href="/login">{t.login[language]}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{t.signup[language]}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
