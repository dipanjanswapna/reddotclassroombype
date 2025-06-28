'use client';

import { useLanguage } from '@/context/language-context';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="font-semibold gap-1.5"
    >
        <Globe className="h-4 w-4"/>
      {language === 'bn' ? 'English' : 'বাংলা'}
    </Button>
  );
}
