'use client';

import Link from "next/link";
import Image from "next/image";
import logoSrc from '@/public/logo.png';
import { Facebook, Youtube, Linkedin, ArrowUp, Twitter, MapPin, Phone } from "lucide-react";
import { Button } from "./ui/button";

export function OfflineHubFooter() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  return (
    <footer className="bg-black text-gray-400 font-sans border-t border-white/5">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          <div className="lg:col-span-2 space-y-6">
             <div className="w-48 h-20 relative filter brightness-0 invert opacity-80">
                 <Image src={logoSrc} alt="RED DOT CLASSROOM Logo" fill className="object-contain" priority />
             </div>
            <div className="space-y-2">
                <h3 className="font-black text-white uppercase tracking-widest text-sm">Bangladesh's Elite Education Center</h3>
                <p className="text-sm font-medium leading-relaxed max-w-sm">
                    Pioneering the hybrid education revolution. From Dhaka to your doorstep, we provide the best educators and facilities.
                </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold text-white/60">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary"/> Dhaka, BD</span>
                <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary"/> +8809647121735</span>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-black text-white uppercase tracking-widest text-xs border-l-2 border-primary pl-3">Quick Access</h3>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-tighter">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/courses" className="hover:text-primary transition-colors">Shop All Courses</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Academic Blog</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Our Vision</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Center</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="font-black text-white uppercase tracking-widest text-xs border-l-2 border-primary pl-3">Partner Program</h3>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-tighter">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Support Portal</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Agreement Terms</Link></li>
              <li><Link href="/auth/teacher-signup" className="hover:text-primary transition-colors">Join as Faculty</Link></li>
              <li><Link href="/teachers" className="hover:text-primary transition-colors">Faculty Directory</Link></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h3 className="font-black text-white uppercase tracking-widest text-xs border-l-2 border-primary pl-3">Ecosystem App</h3>
            <p className="text-xs font-medium leading-relaxed">Download the RDC native app for the best synchronized experience.</p>
            <div className="flex flex-col gap-3">
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 justify-start h-12 rounded-xl transition-all">
                    <Image src="https://placehold.co/32x32.png" width={24} height={24} alt="Play Store" className="mr-3" data-ai-hint="google play" />
                    <div className="text-left">
                        <p className="text-[10px] -mb-1 opacity-60">GET IT ON</p>
                        <p className="font-black text-sm text-white">Google Play</p>
                    </div>
                </Button>
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 justify-start h-12 rounded-xl transition-all">
                    <Image src="https://placehold.co/32x32.png" width={24} height={24} alt="App Store" className="mr-3 filter invert" data-ai-hint="apple logo" />
                     <div className="text-left">
                        <p className="text-[10px] -mb-1 opacity-60">DOWNLOAD ON THE</p>
                        <p className="font-black text-sm text-white">App Store</p>
                    </div>
                </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.2em] relative">
          <p className="text-center md:text-left opacity-40">&copy; {new Date().getFullYear()} RDC OFFLINE HUB powered by PRANGONS. All rights reserved.</p>
           <div className="flex gap-6 opacity-60">
              <Link href="#" className="hover:text-primary transition-colors">Facebook</Link>
              <Link href="#" className="hover:text-primary transition-colors">Instagram</Link>
              <Link href="#" className="hover:text-primary transition-colors">YouTube</Link>
          </div>
          <Button size="icon" className="bg-primary hover:bg-primary/90 text-white rounded-xl absolute -top-6 right-4 shadow-2xl shadow-primary/20" onClick={scrollToTop} aria-label="Scroll to top">
            <ArrowUp className="w-5 h-5"/>
          </Button>
        </div>
      </div>
    </footer>
  );
}
