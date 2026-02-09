'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Refined 404 Not Found Page.
 * Fixed responsiveness to prevent content cutoff and added bilingual support.
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
    badge: { en: 'Page Not Found', bn: 'পৃষ্ঠাটি পাওয়া যায়নি' },
    heading: { en: 'Are you lost?', bn: 'আপনি কি পথ হারিয়েছেন?' },
    description: { 
      en: 'Sorry, the page you are looking for does not exist or has been moved. Use the button below to return to the homepage.', 
      bn: 'দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা খুঁজে পাওয়া যাচ্ছে না অথবা এটি সরিয়ে নেওয়া হয়েছে। নিচের বাটনটি ব্যবহার করে হোমপেজে ফিরে যান।' 
    },
    homeBtn: { en: 'Go Back Home', bn: 'হোমে ফিরে যান' },
    supportBtn: { en: 'Support', bn: 'সাপোর্ট' },
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
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 }
    },
  };

  const titleText = "404";

  return (
    <div className="min-h-screen bg-background mesh-gradient flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
      
      {/* Dynamic Background Effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[120px] -z-10" />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl text-center flex flex-col items-center relative z-10 py-10"
      >
        
        {/* Responsive 404 Text */}
        <motion.div 
          className="flex mb-4 md:mb-6"
          initial="hidden"
          animate="visible"
        >
          {titleText.split("").map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-7xl sm:text-9xl md:text-[10rem] lg:text-[13rem] font-black tracking-tighter text-foreground leading-none select-none drop-shadow-2xl"
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: index * 0.2
              }}
            >
              {letter === "0" ? <span className="text-primary">0</span> : letter}
            </motion.span>
          ))}
        </motion.div>

        {/* Status Badge */}
        <motion.div 
          variants={itemVariants}
          className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border border-primary/20 mb-6 flex items-center gap-2"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {translations.badge[language]}
        </motion.div>

        {/* Main Heading & Description */}
        <div className="space-y-4 px-4 max-w-2xl">
          <motion.h1 
            variants={itemVariants}
            className="font-headline text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-tight"
          >
            {translations.heading[language]}
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xs sm:text-base md:text-lg text-muted-foreground font-medium leading-relaxed"
          >
            {translations.description[language]}
          </motion.p>
        </div>

        {/* Responsive Action Buttons */}
        <motion.div 
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6"
        >
          <Button asChild size="lg" className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest h-12 md:h-14 px-8 md:px-10 shadow-xl shadow-primary/20 group">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-translate-y-1" />
              {translations.homeBtn[language]}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest h-12 md:h-14 px-8 md:px-10 border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all">
            <Link href="/contact" className="flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
              {translations.supportBtn[language]}
            </Link>
          </Button>
        </motion.div>

        {/* Brand Attribution */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 sm:mt-20 flex items-center gap-3 text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40"
        >
          <span>RED DOT CLASSROOM</span>
          <div className="w-1 h-1 rounded-full bg-primary/40" />
          <span>PRANGONS ECOSYSTEM</span>
        </motion.div>
      </motion.main>

      <style jsx global>{`
        .mesh-gradient {
          background-color: hsla(0,0%,100%,1);
          background-image: 
            radial-gradient(at 0% 0%, hsla(346,77%,49%,0.05) 0px, transparent 50%),
            radial-gradient(at 100% 0%, hsla(142,71%,40%,0.05) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsla(346,77%,49%,0.05) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(142,71%,40%,0.05) 0px, transparent 50%);
        }
        .dark .mesh-gradient {
          background-color: hsla(222,47%,11%,1);
          background-image: 
            radial-gradient(at 0% 0%, hsla(340,80%,55%,0.1) 0px, transparent 50%),
            radial-gradient(at 100% 0%, hsla(142,76%,36%,0.1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsla(340,80%,55%,0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(142,76%,36%,0.1) 0px, transparent 50%);
        }
      `}</style>
    </div>
  );
}
