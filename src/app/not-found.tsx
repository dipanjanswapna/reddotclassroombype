'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Ultimate 404 Not Found Page.
 * - Single page layout (No scroll).
 * - Dynamic scaling for all elements.
 * - Premium Framer Motion animations.
 * - Fully responsive button layout.
 */
export default function NotFound() {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Hide main header and footer when this page is active
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
    <div className="h-screen w-full overflow-hidden bg-background flex items-center justify-center relative px-6 select-none">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 0],
            y: [0, 60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 -right-20 w-[40vw] h-[40vw] bg-accent/10 rounded-full blur-[100px]" 
        />
      </div>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center"
      >
        
        {/* Animated Badge */}
        <motion.div 
          variants={itemVariants}
          className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border border-primary/20 mb-6 md:mb-8 flex items-center gap-2 shadow-lg"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          {translations.badge[language]}
        </motion.div>

        {/* Big Scalable 404 Text */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-2 md:mb-4">
          {["4", "0", "4"].map((digit, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={digitVariants}
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{ 
                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                scale: { type: "spring", stiffness: 200 }
              }}
              className={cn(
                "text-[20vw] md:text-[15rem] font-black leading-none tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)]",
                digit === "0" ? "text-primary" : "text-foreground"
              )}
            >
              {digit}
            </motion.span>
          ))}
        </div>

        {/* Scalable Heading & Text */}
        <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
          <motion.h1 
            variants={itemVariants}
            className="font-headline text-[7vw] sm:text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase leading-tight"
          >
            {translations.heading[language]}
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-sm md:text-xl text-muted-foreground font-medium px-4 leading-relaxed opacity-80"
          >
            {translations.description[language]}
          </motion.p>
        </div>

        {/* Responsive Smart Buttons */}
        <motion.div 
          variants={itemVariants}
          className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-10 sm:px-0"
        >
          <Button 
            asChild 
            size="lg" 
            className="w-full sm:w-auto rounded-xl md:rounded-2xl font-black uppercase tracking-widest h-12 md:h-16 px-8 md:px-12 shadow-2xl shadow-primary/30 group relative overflow-hidden text-xs md:text-sm"
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
            className="w-full sm:w-auto rounded-xl md:rounded-2xl font-black uppercase tracking-widest h-12 md:h-16 px-8 md:px-12 border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 transition-all text-xs md:text-sm"
          >
            <Link href="/contact" className="flex items-center justify-center gap-3">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
              {translations.supportBtn[language]}
            </Link>
          </Button>
        </motion.div>

        {/* Brand Footer Mark */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 md:mt-20 flex items-center gap-3 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40"
        >
          <span>PRANGONS ECOSYSTEM</span>
          <div className="w-1 h-1 rounded-full bg-primary/40" />
          <span>EST. 2024</span>
        </motion.div>

      </motion.main>

      <style jsx global>{`
        .body-is-404 header, 
        .body-is-404 footer, 
        .body-is-404 .whatsapp-fab { 
          display: none !important; 
        }
        
        .mesh-gradient {
          background-color: hsla(0,0%,100%,1);
          background-image: 
            radial-gradient(at 0% 0%, hsla(346,77%,49%,0.03) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsla(142,71%,40%,0.03) 0px, transparent 50%);
        }
        
        .dark .mesh-gradient {
          background-color: hsla(222,47%,11%,1);
          background-image: 
            radial-gradient(at 0% 0%, hsla(340,80%,55%,0.05) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsla(142,76%,36%,0.05) 0px, transparent 50%);
        }
      `}</style>
    </div>
  );
}
