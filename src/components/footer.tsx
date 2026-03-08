"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { t } from "@/lib/i18n";
import { HomepageConfig } from "@/lib/types";
import logoSrc from '@/public/logo.png';
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Refined Footer Component
 * Fixed 'undefined reading en' error with safe getter.
 * Standardized with 20px corners and high-density text.
 */
export function Footer({ homepageConfig }: { homepageConfig: HomepageConfig }) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/en' || pathname === '/bn';
  const isBn = language === 'bn';

  // Safe translation getter to prevent runtime crashes
  const getT = (key: string) => t[key]?.[language] || t[key]?.['en'] || key;

  return (
    <footer className={cn(
      "border-t transition-colors px-1", 
      isHomePage ? "bg-transparent" : "bg-background",
      isBn && "font-bengali"
    )}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="sm:col-span-2 md:col-span-4 lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <Image src={homepageConfig?.logoUrl || logoSrc} alt="RED DOT CLASSROOM Logo" width={40} height={40} className="h-10 w-auto group-hover:scale-105 transition-transform" />
              <span className="font-black text-xl font-headline text-primary tracking-tighter uppercase">
                RED DOT CLASSROOM
              </span>
            </Link>
            <p className="text-muted-foreground font-medium leading-relaxed max-w-sm">
              {getT('footer_tagline')}
            </p>
             <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-primary transition-all hover:-translate-y-1" aria-label="Facebook"><Facebook className="w-5 h-5"/></Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-all hover:-translate-y-1" aria-label="Twitter"><Twitter className="w-5 h-5"/></Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-all hover:-translate-y-1" aria-label="YouTube"><Youtube className="w-5 h-5"/></Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-all hover:-translate-y-1" aria-label="LinkedIn"><Linkedin className="w-5 h-5"/></Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-headline font-black uppercase text-[11px] mb-6 text-primary tracking-[0.2em]">{getT('quick_links')}</h3>
            <ul className="space-y-3 text-[13px] font-bold">
              <li><Link href="/courses" className="text-muted-foreground hover:text-primary transition-colors">{getT('rdc_shop')}</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">{getT('nav_blog')}</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">{getT('nav_about')}</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">{getT('nav_contact')}</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">{getT('nav_faq')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline font-black uppercase text-[11px] mb-6 text-primary tracking-[0.2em]">{getT('for_students')}</h3>
            <ul className="space-y-3 text-[13px] font-bold">
              <li><Link href="/signup" className="text-muted-foreground hover:text-primary transition-colors">{getT('register')}</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">{getT('student_guardian_login')}</Link></li>
              <li><Link href="/student/dashboard" className="text-muted-foreground hover:text-primary transition-colors">{getT('dashboard')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline font-black uppercase text-[11px] mb-6 text-primary tracking-[0.2em]">{getT('join_us')}</h3>
            <ul className="space-y-3 text-[13px] font-bold">
               <li><Link href="/auth/teacher-signup" className="text-muted-foreground hover:text-primary transition-colors">{getT('become_a_teacher')}</Link></li>
              <li><Link href="/seller-program/apply" className="text-muted-foreground hover:text-primary transition-colors">{getT('become_a_seller')}</Link></li>
              <li><Link href="/auth/affiliate-signup" className="text-muted-foreground hover:text-primary transition-colors">{getT('become_an_affiliate')}</Link></li>
              <li><Link href="/auth/moderator-signup" className="text-muted-foreground hover:text-primary transition-colors">{getT('become_a_moderator')}</Link></li>
              <li><Link href="/login?type=staff" className="text-muted-foreground hover:text-primary transition-colors">{getT('teacher_seller_staff_login')}</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <div>
                <h3 className="font-headline font-black uppercase text-[11px] mb-6 text-primary tracking-[0.2em]">{getT('legal')}</h3>
                <ul className="space-y-3 text-[13px] font-bold">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">{getT('privacy_policy')}</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">{getT('terms_of_service')}</Link></li>
                </ul>
            </div>
             <div>
                <Image
                    src="https://mir-s3-cdn-cf.behance.net/projects/max_808/ed1f18226284187.Y3JvcCwxMDI0LDgwMCwwLDM2Nw.png"
                    alt="DBID Certified"
                    width={100}
                    height={50}
                    className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                    data-ai-hint="DBID logo"
                />
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-primary/10 pt-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
          <p>&copy; {new Date().getFullYear()} RED DOT CLASSROOM (RDC). {getT('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
