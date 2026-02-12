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

export function Footer({ homepageConfig }: { homepageConfig: HomepageConfig }) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isBn = language === 'bn';

  return (
    <footer className={cn(
      "border-t transition-colors", 
      isHomePage ? "bg-transparent" : "bg-background",
      isBn && "font-bengali"
    )}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="sm:col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image src={homepageConfig?.logoUrl || logoSrc} alt="RED DOT CLASSROOM Logo" width={40} height={40} className="h-10 w-auto" />
              <span className="font-black text-xl font-headline text-primary tracking-tighter uppercase">
                RED DOT CLASSROOM
              </span>
            </Link>
            <p className="text-muted-foreground font-medium leading-relaxed">
              {t.footer_tagline[language]}
            </p>
             <div className="flex space-x-4 mt-6">
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5"/></Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5"/></Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="YouTube"><Youtube className="w-5 h-5"/></Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="LinkedIn"><Linkedin className="w-5 h-5"/></Link>
            </div>
          </div>
          <div>
            <h3 className="font-headline font-black uppercase text-sm mb-6 text-primary tracking-widest">{t.quick_links[language]}</h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/courses" className="text-muted-foreground hover:text-primary transition-colors">{t.rdc_shop[language]}</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">{t.nav_blog[language]}</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">{t.nav_about[language]}</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">{t.nav_contact[language]}</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">{t.nav_faq[language]}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-black uppercase text-sm mb-6 text-primary tracking-widest">{t.for_students[language]}</h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/signup" className="text-muted-foreground hover:text-primary transition-colors">{t.register[language]}</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">{t.student_guardian_login[language]}</Link></li>
              <li><Link href="/student/dashboard" className="text-muted-foreground hover:text-primary transition-colors">{t.dashboard[language]}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-black uppercase text-sm mb-6 text-primary tracking-widest">{t.join_us[language]}</h3>
            <ul className="space-y-3 text-sm font-bold">
               <li><Link href="/auth/teacher-signup" className="text-muted-foreground hover:text-primary transition-colors">{t.become_a_teacher[language]}</Link></li>
              <li><Link href="/seller-program/apply" className="text-muted-foreground hover:text-primary transition-colors">{t.become_a_seller[language]}</Link></li>
              <li><Link href="/auth/affiliate-signup" className="text-muted-foreground hover:text-primary transition-colors">{t.become_an_affiliate[language]}</Link></li>
              <li><Link href="/auth/moderator-signup" className="text-muted-foreground hover:text-primary transition-colors">{t.become_a_moderator[language]}</Link></li>
              <li><Link href="/login?type=staff" className="text-muted-foreground hover:text-primary transition-colors">{t.teacher_seller_staff_login[language]}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-black uppercase text-sm mb-6 text-primary tracking-widest">{t.legal[language]}</h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">{t.privacy_policy[language]}</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">{t.terms_of_service[language]}</Link></li>
            </ul>
             <div className="mt-6">
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
        <div className="mt-12 border-t border-primary/10 pt-8 text-center text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          <p>&copy; {new Date().getFullYear()} RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM. {t.copyright[language]}</p>
        </div>
      </div>
    </footer>
  );
}