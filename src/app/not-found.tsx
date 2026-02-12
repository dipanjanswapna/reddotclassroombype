'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Premium Global 404 Page.
 * Implements RDC brand identity with 20px corners, mesh gradients, and px-1 spacing.
 * Self-contained to ensure it renders correctly even when the app is in an error state.
 */
function NotFoundContent() {
  useEffect(() => {
    // Hide standard layout elements for a clean immersive 404 experience
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
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    },
  };

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen overflow-y-auto overflow-x-hidden bg-background flex flex-col select-none mesh-gradient">
      
      {/* Immersive Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, 80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[10%] w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 0],
            y: [0, -80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-[15%] -right-[10%] w-[60vw] h-[60vw] bg-accent/10 rounded-full blur-[140px]" 
        />
      </div>

      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <motion.main 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl flex flex-col items-center text-center px-1"
        >
          
          {/* Status Badge */}
          <motion.div 
            variants={itemVariants}
            className="bg-primary/10 text-primary px-5 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.3em] border border-primary/20 mb-8 flex items-center gap-2.5 shadow-2xl backdrop-blur-xl"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Error 404
          </motion.div>

          {/* Epic 404 Text */}
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-6">
            {["4", "0", "4"].map((digit, i) => (
              <motion.span
                key={i}
                variants={{
                    hidden: { scale: 0.5, opacity: 0, rotate: -15 },
                    visible: { 
                        scale: 1, 
                        opacity: 1, 
                        rotate: 0, 
                        transition: { type: "spring", stiffness: 200, damping: 12, delay: i * 0.15 } 
                    }
                }}
                animate={{ 
                  y: [0, -15, 0],
                }}
                transition={{ 
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
                }}
                className={cn(
                  "font-black leading-none tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]",
                  "text-[clamp(7rem,25vw,18rem)]",
                  digit === "0" ? "text-primary" : "text-foreground"
                )}
              >
                {digit}
              </motion.span>
            ))}
          </div>

          {/* Heading & Subtext */}
          <div className="space-y-6 max-w-2xl mx-auto mb-12">
            <motion.h1 
              variants={itemVariants}
              className="font-headline text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground uppercase leading-[0.95]"
            >
              Lost in <br className="sm:hidden" /> the <span className="text-primary">Cosmos?</span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed opacity-70 px-6"
            >
              The page you are looking for has drifted away into the void or never existed in our curriculum.
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
          >
            <Button 
              asChild 
              size="lg" 
              className="w-full sm:w-72 rounded-[20px] font-black uppercase tracking-widest h-14 md:h-16 shadow-[0_20px_40px_-10px_rgba(var(--primary),0.4)] group text-[11px] md:text-xs border-none"
            >
              <Link href="/" className="flex items-center justify-center gap-3">
                <Home className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                Back to Safety
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-72 rounded-[20px] font-black uppercase tracking-widest h-14 md:h-16 border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-xl hover:bg-white dark:hover:bg-white/10 transition-all text-[11px] md:text-xs"
            >
              <Link href="/contact" className="flex items-center justify-center gap-3">
                <MessageSquare className="w-5 h-5" />
                Contact Support
              </Link>
            </Button>
          </motion.div>

          {/* Footer Branding */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 md:mt-24 flex items-center gap-4 text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/30"
          >
            <span>PRANGONS ECOSYSTEM</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            <span>EST. 2024</span>
          </motion.div>

        </motion.main>
      </div>

      <style jsx global>{`
        .body-is-404 header, 
        .body-is-404 footer, 
        .body-is-404 .whatsapp-fab,
        .body-is-404 nav { 
          display: none !important; 
        }
        .body-is-404 {
          background: hsl(var(--background)) !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
}

export default function NotFound() {
  return (
    <LayoutWrapper>
        <NotFoundContent />
    </LayoutWrapper>
  );
}
