

"use client";

import Link from "next/link";
import { Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { RdcLogo } from "./rdc-logo";
import { useLanguage } from "@/context/language-context";
import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { getHomepageConfig } from "@/lib/firebase/firestore";
import { HomepageConfig } from "@/lib/types";

export function Footer() {
  const { language } = useLanguage();
  const [config, setConfig] = useState<HomepageConfig | null>(null);

  useEffect(() => {
    getHomepageConfig().then(setConfig);
  }, []);

  const Logo = ({ className }: { className?: string }) => {
    if (config?.logoUrl) {
      return <img src={config.logoUrl} alt="RED DOT CLASSROOM Logo" className={className} />;
    }
    return <RdcLogo className={className} />;
  };


  return (
    <footer className="border-t bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="sm:col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Logo className="h-10 w-auto" />
              <span className="font-bold text-xl font-headline text-white">
                RED DOT CLASSROOM
              </span>
            </Link>
            <p className="text-gray-400">
              {t.footer_tagline[language]}
            </p>
             <div className="flex space-x-4 mt-4">
              <Link href="#" className="text-gray-400 hover:text-white"><Facebook /></Link>
              <Link href="#" className="text-gray-400 hover:text-white"><Twitter /></Link>
              <Link href="#" className="text-gray-400 hover:text-white"><Youtube /></Link>
              <Link href="#" className="text-gray-400 hover:text-white"><Linkedin /></Link>
            </div>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-white">{t.quick_links[language]}</h3>
            <ul className="space-y-2">
              <li><Link href="/courses" className="hover:text-white">{t.rdc_shop[language]}</Link></li>
              <li><Link href="/blog" className="hover:text-white">{t.nav_blog[language]}</Link></li>
              <li><Link href="/about" className="hover:text-white">{t.nav_about[language]}</Link></li>
              <li><Link href="/contact" className="hover:text-white">{t.nav_contact[language]}</Link></li>
              <li><Link href="/faq" className="hover:text-white">{t.nav_faq[language]}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-white">{t.for_students[language]}</h3>
            <ul className="space-y-2">
              <li><Link href="/signup" className="hover:text-white">{t.register[language]}</Link></li>
              <li><Link href="/login" className="hover:text-white">{t.student_guardian_login[language]}</Link></li>
              <li><Link href="/student/dashboard" className="hover:text-white">{t.dashboard[language]}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-white">{t.join_us[language]}</h3>
            <ul className="space-y-2">
               <li><Link href="/auth/teacher-signup" className="hover:text-white">{t.become_a_teacher[language]}</Link></li>
              <li><Link href="/partner-program/apply" className="hover:text-white">{t.become_a_partner[language]}</Link></li>
              <li><Link href="/auth/affiliate-signup" className="hover:text-white">{t.become_an_affiliate[language]}</Link></li>
              <li><Link href="/auth/moderator-signup" className="hover:text-white">{t.become_a_moderator[language]}</Link></li>
              <li><Link href="/login?type=staff" className="hover:text-white">{t.teacher_partner_staff_login[language]}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-white">{t.legal[language]}</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-white">{t.privacy_policy[language]}</Link></li>
              <li><Link href="/terms" className="hover:text-white">{t.terms_of_service[language]}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM. {t.copyright[language]}</p>
        </div>
      </div>
    </footer>
  );
}
