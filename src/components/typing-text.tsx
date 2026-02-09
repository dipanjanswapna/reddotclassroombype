
'use client';

import { motion } from 'framer-motion';

/**
 * @fileOverview TypingText Component
 * Provides a character-by-character typing animation for string content.
 */
export function TypingText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  
  const characters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.015, delayChildren: 0.1 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      display: 'inline',
      transition: {
        opacity: { duration: 0.01 }
      },
    },
    hidden: {
      opacity: 0,
      display: 'none',
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {characters.map((char, index) => (
        <motion.span
          variants={child}
          key={index}
        >
          {char}
        </motion.span>
      ))}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        className="inline-block w-1 h-[1.1em] bg-primary align-middle ml-0.5"
      />
    </motion.div>
  );
}
