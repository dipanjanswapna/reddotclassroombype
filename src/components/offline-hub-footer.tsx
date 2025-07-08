
'use client';

import Link from "next/link";
import Image from "next/image";
import logoSrc from '@/public/logo.png';
import { Facebook, Youtube, Linkedin, ArrowUp, Twitter } from "lucide-react";
import { Button } from "./ui/button";

export function OfflineHubFooter() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="bg-[#1a0505] text-gray-300 font-sans">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-2">
             <div className="w-32 h-32 bg-white/10 p-4 rounded-md flex items-center justify-center mb-4 border-2 border-red-500">
                 <Image src={logoSrc} alt="RED DOT CLASSROOM Logo" className="h-24 w-auto filter brightness-0 invert" />
             </div>
            <h3 className="font-bold text-white mb-2">Best Education Center</h3>
            <p className="text-sm">Dhaka, Bangladesh</p>
            <p className="text-sm">+8809647121735</p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Useful Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-red-400 transition-colors">Home</Link></li>
              <li><Link href="/courses" className="hover:text-red-400 transition-colors">Courses</Link></li>
              <li><Link href="/blog" className="hover:text-red-400 transition-colors">Blog</Link></li>
              <li><Link href="/about" className="hover:text-red-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-red-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Our Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-red-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-red-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-red-400 transition-colors">Terms and Conditions</Link></li>
              <li><Link href="/auth/teacher-signup" className="hover:text-red-400 transition-colors">Become Teacher</Link></li>
              <li><Link href="/teachers" className="hover:text-red-400 transition-colors">All Instructors</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Get In Touch</h3>
            <p className="text-sm mb-4">If you need any kind of help you can know us on socials or mail us</p>
            <div className="flex space-x-4 mb-4">
              <Link href="#" aria-label="Facebook"><Facebook className="w-5 h-5 hover:text-red-400 transition-colors" /></Link>
              <Link href="#" aria-label="LinkedIn"><Linkedin className="w-5 h-5 hover:text-red-400 transition-colors" /></Link>
              <Link href="#" aria-label="YouTube"><Youtube className="w-5 h-5 hover:text-red-400 transition-colors" /></Link>
            </div>
            <div className="flex flex-col gap-2">
                <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700 justify-start h-auto py-2">
                    <Image src="https://placehold.co/32x32.png" width={24} height={24} alt="Play Store" className="mr-2" data-ai-hint="google play" />
                    <div>
                        <p className="text-xs -mb-1 text-left">Get it on</p>
                        <p className="font-semibold text-left text-base">Google Play</p>
                    </div>
                </Button>
                <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700 justify-start h-auto py-2">
                    <Image src="https://placehold.co/32x32.png" width={24} height={24} alt="App Store" className="mr-2 filter invert" data-ai-hint="apple logo" />
                     <div>
                        <p className="text-xs -mb-1 text-left">Download on the</p>
                        <p className="font-semibold text-left text-base">App Store</p>
                    </div>
                </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-red-500/10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm relative">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} RDC OFFLINE HUB. All rights reserved.</p>
           <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-red-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-red-400 transition-colors">Terms and Conditions</Link>
          </div>
          <Button size="icon" className="bg-teal-500 hover:bg-teal-600 rounded-md absolute -top-5 right-4 shadow-lg" onClick={scrollToTop}>
            <ArrowUp className="w-5 h-5"/>
          </Button>
        </div>
      </div>
    </footer>
  );
}
