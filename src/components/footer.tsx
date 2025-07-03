
"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { RdcLogo } from "./rdc-logo";
import { useLanguage } from "@/context/language-context";
import { t } from "@/lib/i18n";
import { HomepageConfig } from "@/lib/types";

export function Footer({ homepageConfig }: { homepageConfig: HomepageConfig | null }) {
  const { language } = useLanguage();

  const Logo = ({ className }: { className?: string }) => {
    if (homepageConfig?.logoUrl) {
      return <img src={homepageConfig.logoUrl} alt="RED DOT CLASSROOM Logo" className={className} />;
    }
    return <RdcLogo className={className} />;
  };


  return (
    <footer className="border-t bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="sm:col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Logo className="h-10 w-auto" />
              <span className="font-bold text-xl font-headline text-foreground">
                RED DOT CLASSROOM
              </span>
            </Link>
            <p className="text-muted-foreground">
              {t.footer_tagline[language]}
            </p>
             <div className="flex space-x-4 mt-4">
              <Link href="#" className="text-muted-foreground hover:text-primary" aria-label="Facebook"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary" aria-label="Twitter"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary" aria-label="YouTube"><Youtube /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary" aria-label="LinkedIn"><Linkedin /></Link>
            </div>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-primary">{t.quick_links[language]}</h3>
            <ul className="space-y-2">
              <li><Link href="/courses" className="text-muted-foreground hover:text-primary">{t.rdc_shop[language]}</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary">{t.nav_blog[language]}</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">{t.nav_about[language]}</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">{t.nav_contact[language]}</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">{t.nav_faq[language]}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-primary">{t.for_students[language]}</h3>
            <ul className="space-y-2">
              <li><Link href="/signup" className="text-muted-foreground hover:text-primary">{t.register[language]}</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary">{t.student_guardian_login[language]}</Link></li>
              <li><Link href="/student/dashboard" className="text-muted-foreground hover:text-primary">{t.dashboard[language]}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-primary">{t.join_us[language]}</h3>
            <ul className="space-y-2">
               <li><Link href="/auth/teacher-signup" className="text-muted-foreground hover:text-primary">{t.become_a_teacher[language]}</Link></li>
              <li><Link href="/seller-program/apply" className="text-muted-foreground hover:text-primary">{t.become_a_seller[language]}</Link></li>
              <li><Link href="/auth/affiliate-signup" className="text-muted-foreground hover:text-primary">{t.become_an_affiliate[language]}</Link></li>
              <li><Link href="/auth/moderator-signup" className="text-muted-foreground hover:text-primary">{t.become_a_moderator[language]}</Link></li>
              <li><Link href="/login?type=staff" className="text-muted-foreground hover:text-primary">{t.teacher_seller_staff_login[language]}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-primary">{t.legal[language]}</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">{t.privacy_policy[language]}</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">{t.terms_of_service[language]}</Link></li>
            </ul>
             <div className="mt-4">
                <Image
                    src="https://mir-s3-cdn-cf.behance.net/projects/max_808/ed1f18226284187.Y3JvcCwxMDI0LDgwMCwwLDM2Nw.png"
                    alt="DBID Certified"
                    width={100}
                    height={50}
                    className="object-contain"
                    data-ai-hint="DBID logo"
                />
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM. {t.copyright[language]}</p>
        </div>
      </div>
    </footer>
  );
}
