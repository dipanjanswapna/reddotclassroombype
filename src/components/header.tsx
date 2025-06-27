"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RdcLogo } from "./rdc-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/tutor", label: "AI Tutor" },
];

const journeyLinks = [
    { href: "/courses?category=6-10", label: "ক্লাস ৬-১০" },
    { href: "/courses?category=hsc", label: "একাদশ-দ্বাদশ" },
    { href: "/courses?category=admission", label: "বিশ্ববিদ্যালয় ভর্তি" },
    { href: "/courses?category=skills", label: "স্কিলস" },
];

export function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <RdcLogo className="h-8 w-auto" />
            <span className="font-bold text-lg hidden lg:inline-block">Red Dot Classroom</span>
          </Link>
          <nav className="flex items-center space-x-1 text-sm font-medium">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  শেখার যাত্রা শুরু <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {journeyLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                        <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {navLinks.map((link) => (
              <Button key={link.href} variant="ghost" asChild>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </Button>
            ))}
             <div className="relative ml-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="কী খুঁজতে চান?" className="pl-10 w-48" />
             </div>
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="flex h-full flex-col">
                <div className="p-4 border-b">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    <RdcLogo className="h-8 w-auto" />
                    <span className="font-bold text-lg">Red Dot Classroom</span>
                  </Link>
                </div>
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="কী খুঁজতে চান?" className="pl-10 w-full" />
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto px-2">
                  <div className="flex flex-col space-y-1">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="journey-links" className="border-b-0">
                        <AccordionTrigger className="px-2 py-3 text-base font-medium transition-colors hover:text-primary rounded-md hover:no-underline justify-start gap-1">
                          শেখার যাত্রা শুরু
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col space-y-1 pl-7">
                            {journeyLinks.map((link) => (
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
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="px-2 py-3 text-base font-medium transition-colors hover:text-primary rounded-md"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="p-4 flex gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      লগইন
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/signup" onClick={() => setMenuOpen(false)}>
                      সাইন আপ
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <Link href="/" className="md:hidden flex-1 flex justify-center items-center">
            <RdcLogo className="h-8 w-auto" />
        </Link>


        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/login">লগইন</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">সাইন আপ</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
