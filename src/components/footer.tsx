
"use client";

import Link from "next/link";
import { Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { RdcLogo } from "./rdc-logo";
import { useLanguage } from "@/context/language-context";
import { t } from "@/lib/i18n";

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="border-t bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <RdcLogo className="h-10 w-auto" />
              <span className="font-bold text-xl font-headline text-white">
                Red Dot Classroom
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
              <li><Link href="/login" className="hover:text-white">{t.login[language]}</Link></li>
              <li><Link href="/signup" className="hover:text-white">{t.register[language]}</Link></li>
              <li><Link href="/student/dashboard" className="hover:text-white">{t.dashboard[language]}</Link></li>
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
          <p>&copy; {new Date().getFullYear()} Red Dot Classroom. {t.copyright[language]}</p>
        </div>
      </div>
    </footer>
  );
}
