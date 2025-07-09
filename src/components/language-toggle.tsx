
'use client';

import { useLanguage } from '@/context/language-context';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className={cn("font-semibold gap-1.5", className)}
    >
        <Globe className="h-4 w-4"/>
      {language === 'bn' ? 'English' : 'বাংলা'}
    </Button>
  );
}
