
'use client';

import React, { useState } from 'react';
import { Phone, MessageSquare, X } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type FloatingActionButtonProps = {
  whatsappNumber: string;
};

declare global {
  interface Window {
    Tawk_API?: {
      toggle: () => void;
      maximize: () => void;
      minimize: () => void;
    };
  }
}

export function FloatingActionButton({ whatsappNumber }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!whatsappNumber) {
    return null;
  }

  const cleanedNumber = whatsappNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanedNumber}`;

  const handleLiveChatClick = () => {
    if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
      window.Tawk_API.toggle();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-2">
        <div 
          className={cn(
            "flex flex-col items-center gap-2 transition-all duration-300 ease-in-out",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
            <div className="relative group">
                <span className="absolute right-full mr-3 px-2 py-1 bg-foreground text-background text-[10px] font-black uppercase rounded-lg scale-0 group-hover:scale-100 transition-transform origin-right">
                    Live Chat
                </span>
                <Button
                    size="icon"
                    className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-xl border-2 border-white"
                    onClick={handleLiveChatClick}
                    aria-label="Live Chat"
                >
                    <MessageSquare className="h-6 w-6 text-white" />
                </Button>
            </div>
            <div className="relative group">
                <span className="absolute right-full mr-3 px-2 py-1 bg-foreground text-background text-[10px] font-black uppercase rounded-lg scale-0 group-hover:scale-100 transition-transform origin-right">
                    WhatsApp
                </span>
                <Link
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat on WhatsApp"
                >
                    <Button
                        size="icon"
                        className="w-12 h-12 bg-[#25D366] hover:bg-[#128C7E] rounded-2xl shadow-xl border-2 border-white"
                    >
                        <Phone className="h-6 w-6 text-white" />
                    </Button>
                </Link>
            </div>
        </div>

      <Button
        size="icon"
        className="w-14 h-14 bg-primary hover:bg-primary/90 rounded-2xl shadow-2xl border-2 border-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle support options"
      >
        <div className="transition-transform duration-300 ease-in-out" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)'}}>
            {isOpen ? <X className="h-7 w-7 text-white" /> : <MessageSquare className="h-7 w-7 text-white" />}
        </div>
      </Button>
    </div>
  );
}
