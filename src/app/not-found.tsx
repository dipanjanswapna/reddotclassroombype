'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, MessageSquare, AlertCircle, MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Refined 404 Not Found Page.
 * Focuses on high-quality text animations, clean typography, and a premium brand-aligned UI.
 */
export default function NotFound() {
  
  useEffect(() => {
    // Hide main header and footer when this page is active
    document.body.classList.add('body-is-404');
    return () => {
      document.body.classList.remove('body-is-404');
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 }
    },
  };

  const titleText = "404";

  return (
    <div className="fixed inset-0 z-[100] bg-background mesh-gradient flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden">
      
      {/* Dynamic Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] -z-10" />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl text-center flex flex-col items-center relative z-10"
      >
        
        {/* Large Animated 404 Text */}
        <motion.div 
          className="flex mb-2 md:mb-4"
          initial="hidden"
          animate="visible"
        >
          {titleText.split("").map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-8xl sm:text-9xl md:text-[12rem] font-black tracking-tighter text-foreground leading-none select-none"
              animate={{ 
                y: [0, -20, 0],
                rotate: index % 2 === 0 ? [0, 2, 0] : [0, -2, 0]
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
          className="bg-destructive/10 text-destructive px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border border-destructive/20 mb-8 flex items-center gap-2"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Page Not Found
        </motion.div>

        {/* Main Heading & Description */}
        <div className="space-y-4 px-4 max-w-xl">
          <motion.h1 
            variants={itemVariants}
            className="font-headline text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-tight"
          >
            আপনি কি পথ হারিয়েছেন?
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium leading-relaxed"
          >
            দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা খুঁজে পাওয়া যাচ্ছে না অথবা এটি সরিয়ে নেওয়া হয়েছে। নিচের বাটনটি ব্যবহার করে হোমপেজে ফিরে যান।
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div 
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6"
        >
          <Button asChild size="lg" className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest h-14 px-10 shadow-2xl shadow-primary/30 group">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
              Go Back Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl font-black uppercase tracking-widest h-14 px-10 border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all">
            <Link href="/contact" className="flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Support
            </Link>
          </Button>
        </motion.div>

        {/* Footer Brand Attribution */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 sm:mt-24 flex items-center gap-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40"
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
