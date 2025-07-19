
'use client';

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import logoSrc from '@/public/logo.png';
import { StoreCategory } from "@/lib/types";

export function StoreFooter({ categories }: { categories: StoreCategory[] }) {

  return (
    <footer className="border-t bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="sm:col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/store" className="flex items-center space-x-2 mb-4">
              <Image src={logoSrc} alt="RDC Store Logo" width={40} height={40} className="h-10 w-auto" />
              <span className="font-bold text-xl font-headline text-primary">
                RDC Store
              </span>
            </Link>
            <p className="text-muted-foreground">
              Your one-stop shop for all RDC learning materials and merchandise.
            </p>
             <div className="flex space-x-4 mt-4">
              <Link href="#" className="text-gray-500 hover:text-primary" aria-label="Facebook"><Facebook /></Link>
              <Link href="#" className="text-gray-500 hover:text-primary" aria-label="Twitter"><Twitter /></Link>
              <Link href="#" className="text-gray-500 hover:text-primary" aria-label="YouTube"><Youtube /></Link>
              <Link href="#" className="text-gray-500 hover:text-primary" aria-label="LinkedIn"><Linkedin /></Link>
            </div>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-primary">Categories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                    <Link href={`/store?category=${cat.slug}`} className="text-muted-foreground hover:text-primary">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-primary">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Return Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4 text-primary">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About RDC</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
           <div>
            <h3 className="font-headline font-semibold mb-4 text-primary">Main Site</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-muted-foreground hover:text-primary">RDC Homepage</Link></li>
              <li><Link href="/courses" className="text-muted-foreground hover:text-primary">Courses</Link></li>
            </ul>
           </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
