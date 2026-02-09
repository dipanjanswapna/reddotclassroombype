'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Refined 404 Not Found Page with premium Framer Motion animations.
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
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 100, damping: 12 } 
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", damping: 10, stiffness: 200 }
    },
  };

  const titleText = "404";

  return (
    <div className="min-h-screen bg-background mesh-gradient flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
      
      {/* Animated Background decorative blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[120px] -z-10" 
      />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl text-center flex flex-col items-center relative z-10 py-10"
      >
        
        {/* Animated 404 Text - Each number animate separately */}
        <div className="flex mb-4 md:mb-8">
          {titleText.split("").map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-8xl sm:text-[10rem] md:text-[12rem] lg:text-[15rem] font-black tracking-tighter text-foreground leading-none select-none drop-shadow-2xl inline-block"
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ 
                y: {
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: index * 0.3
                }
              }}
            >
              {letter === "0" ? <span className="text-primary">0</span> : letter}
            </motion.span>
          ))}
        </div>

        {/* Status Badge */}
        <motion.div 
          variants={itemVariants}
          className="bg-primary/10 text-primary px-5 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.3em] border border-primary/20 mb-8 flex items-center gap-2 shadow-lg shadow-primary/5"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <AlertCircle className="w-4 h-4" />
          </motion.div>
          {translations.badge[language]}
        </motion.div>

        {/* Main Heading & Description */}
        <div className="space-y-6 px-4 max-w-2xl">
          <motion.h1 
            variants={itemVariants}
            className="font-headline text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground uppercase leading-tight"
          >
            {translations.heading[language]}
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-lg md:text-xl text-muted-foreground font-medium leading-relaxed opacity-80"
          >
            {translations.description[language]}
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto px-6"
        >
          <Button asChild size="lg" className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest h-14 md:h-16 px-10 md:px-12 shadow-2xl shadow-primary/30 group relative overflow-hidden">
            <Link href="/" className="flex items-center justify-center gap-3">
              <Home className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
              {translations.homeBtn[language]}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest h-14 md:h-16 px-10 md:px-12 border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-xl">
            <Link href="/contact" className="flex items-center justify-center gap-3">
              <MessageSquare className="w-5 h-5" />
              {translations.supportBtn[language]}
            </Link>
          </Button>
        </motion.div>

        {/* Footer Brand Label */}
        <motion.div 
          variants={itemVariants}
          className="mt-20 sm:mt-24 flex items-center gap-4 text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/30"
        >
          <span>RDC ECOSYSTEM</span>
          <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
          <span>EST. 2024</span>
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
