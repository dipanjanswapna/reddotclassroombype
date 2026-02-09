'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * @fileOverview Refined 404 Not Found Page.
 * Features custom animations, brand-consistent styling, and full responsiveness.
 */
export default function NotFound() {
  
  useEffect(() => {
    // Hide main header and footer when this page is active
    document.body.classList.add('body-is-404');
    return () => {
      document.body.classList.remove('body-is-404');
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-background mesh-gradient flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] -z-10" />

      <main className="w-full max-w-2xl text-center flex flex-col items-center relative z-10">
        
        {/* Animated Illustration Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="relative w-full max-w-[280px] sm:max-w-md h-48 sm:h-64 md:h-80 mb-6 md:mb-8"
        >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-full h-full relative"
            >
                <Image
                    src="https://picsum.photos/seed/404error/600/400"
                    alt="404 Error Illustration"
                    fill
                    className="object-contain drop-shadow-2xl opacity-90"
                    priority
                    data-ai-hint="space astronaut"
                />
            </motion.div>
            
            {/* Pulsing Error Badge */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-0 right-0 sm:top-4 sm:right-4 md:right-10 bg-destructive text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 border border-white/20"
            >
              <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Error Code: 404
            </motion.div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-3 sm:space-y-4 px-4"
        >
          <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase leading-none">
            OOOPS!! <span className="text-primary">LOST</span> IN SPACE?
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
            This page has been moved or doesn't exist anymore. Don't worry, even the best students get lost sometimes!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-6"
        >
          <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest h-12 sm:h-14 px-8 shadow-xl shadow-primary/20">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              Go Back Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-black uppercase tracking-widest h-12 sm:h-14 px-8 border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:bg-white/80 transition-all">
            <Link href="/contact" className="flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              Contact Support
            </Link>
          </Button>
        </motion.div>

        {/* Brand Footer Attribution */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="mt-12 sm:mt-16 flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground"
        >
          <span>RED DOT CLASSROOM</span>
          <div className="w-1 h-1 rounded-full bg-primary" />
          <span>PRANGONS ECOSYSTEM</span>
        </motion.div>
      </main>
    </div>
  );
}
