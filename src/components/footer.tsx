
"use client";

import Link from "next/link";
import Image from "next/image";
import logoSrc from '@/public/logo.png';
import { Facebook, Youtube, Linkedin, ArrowUp, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/context/language-context";
import { t } from "@/lib/i18n";
import { HomepageConfig } from "@/lib/types";

export function Footer({ homepageConfig }: { homepageConfig: HomepageConfig | null }) {
  const { language } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="bg-[#1a0505] text-gray-300 font-sans border-t border-primary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
             <div className="w-48 h-48 bg-white/5 p-4 rounded-xl flex items-center justify-center border-2 border-primary shadow-2xl overflow-hidden group hover:border-primary/80 transition-colors">
                 <Image 
                    src={logoSrc} 
                    alt="RED DOT CLASSROOM Logo" 
                    width={160} 
                    height={160} 
                    className="h-40 w-auto filter brightness-0 invert transition-transform duration-500 group-hover:scale-110" 
                 />
             </div>
            <div>
                <h3 className="font-headline font-bold text-white text-xl">RED DOT CLASSROOM</h3>
                <p className="text-sm mt-2 text-gray-400 max-w-xs">
                    Empowering learners across Bangladesh with high-quality education and innovative learning tools.
                </p>
            </div>
            <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary"/> Dhaka, Bangladesh</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary"/> +8801641035736</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary"/> support@reddotclassroom.com</p>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="font-headline font-bold text-white mb-6 uppercase tracking-wider text-sm">{t.quick_links[language]}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/courses" className="hover:text-primary transition-colors">RDC Shop</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Our Blog</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-headline font-bold text-white mb-6 uppercase tracking-wider text-sm">Our Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">{t.privacy_policy[language]}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">{t.terms_of_service[language]}</Link></li>
              <li><Link href="/auth/teacher-signup" className="hover:text-primary transition-colors">Become a Teacher</Link></li>
              <li><Link href="/seller-program/apply" className="hover:text-primary transition-colors">Become a Seller</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          {/* Action Column */}
          <div>
            <h3 className="font-headline font-bold text-white mb-6 uppercase tracking-wider text-sm">Get In Touch</h3>
            <p className="text-sm mb-6 text-gray-400 italic">"Learn Smart, Stay Organized, Achieve More!"</p>
            <div className="flex space-x-4 mb-8">
              <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary transition-all group" aria-label="Facebook">
                <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </Link>
              <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary transition-all group" aria-label="Twitter">
                <Twitter className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </Link>
              <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary transition-all group" aria-label="YouTube">
                <Youtube className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 justify-start h-auto py-2.5 px-4 rounded-xl transition-all" asChild>
                    <Link href={homepageConfig?.appPromo?.googlePlayUrl || "#"}>
                        <Image src="https://picsum.photos/seed/gp/32/32" width={24} height={24} alt="Play Store" className="mr-3" data-ai-hint="google play" />
                        <div>
                            <p className="text-[10px] -mb-1 text-left opacity-60">Get it on</p>
                            <p className="font-bold text-left text-sm">Google Play</p>
                        </div>
                    </Link>
                </Button>
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 justify-start h-auto py-2.5 px-4 rounded-xl transition-all" asChild>
                    <Link href={homepageConfig?.appPromo?.appStoreUrl || "#"}>
                        <Image src="https://picsum.photos/seed/as/32/32" width={24} height={24} alt="App Store" className="mr-3 filter invert" data-ai-hint="apple logo" />
                        <div>
                            <p className="text-[10px] -mb-1 text-left opacity-60">Download on the</p>
                            <p className="font-bold text-left text-sm">App Store</p>
                        </div>
                    </Link>
                </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs relative">
          <div className="flex items-center gap-4">
            <p className="text-gray-500">&copy; {new Date().getFullYear()} RED DOT CLASSROOM (RDC). All rights reserved.</p>
            <div className="hidden md:block h-4 w-px bg-white/10" />
            <div className="flex gap-4">
                <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <Image
                src="https://mir-s3-cdn-cf.behance.net/projects/max_808/ed1f18226284187.Y3JvcCwxMDI0LDgwMCwwLDM2Nw.png"
                alt="DBID Certified"
                width={80}
                height={40}
                className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"
                data-ai-hint="DBID logo"
            />
          </div>

          <Button 
            size="icon" 
            className="bg-primary hover:bg-primary/90 rounded-full absolute -top-6 right-4 shadow-2xl h-12 w-12 group transition-transform hover:-translate-y-1" 
            onClick={scrollToTop} 
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6 text-white transition-transform group-hover:-translate-y-1"/>
          </Button>
        </div>
      </div>
    </footer>
  );
}
