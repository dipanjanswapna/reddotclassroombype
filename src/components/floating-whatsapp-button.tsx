
'use client';

import { Phone } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

type FloatingWhatsAppButtonProps = {
  number: string;
};

export function FloatingWhatsAppButton({ number }: FloatingWhatsAppButtonProps) {
  if (!number) {
    return null;
  }

  const cleanedNumber = number.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanedNumber}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
      aria-label="Chat on WhatsApp"
    >
      <Button
        size="icon"
        className="w-16 h-16 bg-[#25D366] hover:bg-[#128C7E] rounded-full shadow-lg animate-bounce"
      >
        <Phone className="h-8 w-8 text-white" />
      </Button>
    </Link>
  );
}
