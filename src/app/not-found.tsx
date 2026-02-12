'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

/**
 * @fileOverview NotFoundContent handles the visual part of the 404 page.
 */
function NotFoundContent() {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Global CSS to ensure 404 page is always full-screen and clean
    document.body.classList.add('body-is-404');
    return () => {
      document.body.classList.remove('body-is-404');
    };
  }, []);

  const translations = {
    badge: { en: 'Error 404', bn: 'ত্রুটি ৪০৪' },
    heading: { en: 'Lost in the Cosmos?', bn: 'পথ হারিয়েছেন কি?' },
    description: { 
      en: 'The page you are looking for has drifted away or never existed.', 
      bn: 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা সম্ভবত সরিয়ে ফেলা হয়েছে বা কখনো ছিল না।' 
    },
    homeBtn: { en: 'Back to Safety', bn: 'হোমে ফিরে যান' },
    supportBtn: { en: 'Contact Support', bn: 'সাপোর্ট নিন' },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    },
  };

  const digitVariants = {
    hidden: { scale: 0.5, opacity: 0, rotate: -10 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 10,
        delay: i * 0.1
      }
    }),
  };

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen overflow-y-auto overflow-x-hidden bg-background flex flex-col select-none mesh-gradient">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[120px]" 
        />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-grow flex items-center justify-center p-6 md:p-12 min-h-fit">
        <motion.main 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-5xl flex flex-col items-center text-center py-8"
        >
          
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border border-primary/20 mb-4 md:mb-6 flex items-center gap-2 shadow-lg"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            {translations.badge[language]}
          </motion.div>

          {/* 404 Text */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-2">
            {["4", "0", "4"].map((digit, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={digitVariants}
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
                }}
                className={cn(
                  "font-black leading-none tracking-tighter drop-shadow-xl",
                  "text-[clamp(6rem,20vw,15rem)]",
                  digit === "0" ? "text-primary" : "text-foreground"
                )}
              >
                {digit}
              </motion.span>
            ))}
          </div>

          {/* Heading & Description */}
          <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto px-4">
            <motion.h1 
              variants={itemVariants}
              className="font-headline text-[clamp(1.5rem,6vw,3.5rem)] font-black tracking-tight text-foreground uppercase leading-tight"
            >
              {translations.heading[language]}
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-sm md:text-xl text-muted-foreground font-medium leading-relaxed opacity-80"
            >
              {translations.description[language]}
            </motion.p>
          </div>

          {/* Buttons */}
          <motion.div 
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-6 sm:px-0"
          >
            <Button 
              asChild 
              size="lg" 
              className="w-full sm:w-64 rounded-xl md:rounded-2xl font-black uppercase tracking-widest h-12 md:h-16 shadow-2xl shadow-primary/30 group text-[10px] md:text-xs"
            >
              <Link href="/" className="flex items-center justify-center gap-3">
                <Home className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-translate-y-1" />
                {translations.homeBtn[language]}
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-64 rounded-xl md:rounded-2xl font-black uppercase tracking-widest h-12 md:h-16 border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 transition-all text-[10px] md:text-xs"
            >
              <Link href="/contact" className="flex items-center justify-center gap-3">
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                {translations.supportBtn[language]}
              </Link>
            </Button>
          </motion.div>

          {/* Footer Mark */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 md:mt-20 flex items-center gap-3 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40"
          >
            <span>PRANGONS ECOSYSTEM</span>
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            <span>EST. 2024</span>
          </motion.div>

        </motion.main>
      </div>

      <style jsx global>{`
        .body-is-404 header, 
        .body-is-404 footer, 
        .body-is-404 .whatsapp-fab { 
          display: none !important; 
        }
        .body-is-404 {
          height: -webkit-fill-available;
        }
      `}</style>
    </div>
  );
}

/**
 * @fileOverview The NotFound component wraps the content in necessary providers
 * because it is rendered at the root level outside the localized layout.
 */
export default function NotFound() {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <LayoutWrapper>
          <NotFoundContent />
        </LayoutWrapper>
      </body>
    </html>
  );
}
