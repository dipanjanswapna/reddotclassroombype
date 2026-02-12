'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';

type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  getLocalizedPath: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  // Sync state with URL locale segment
  const urlLocale = params?.locale as Language;
  const [language, setLanguage] = useState<Language>(urlLocale || 'en');

  useEffect(() => {
    if (urlLocale && urlLocale !== language) {
      setLanguage(urlLocale);
    }
  }, [urlLocale, language]);

  const getLocalizedPath = useCallback((path: string) => {
    if (!path) return `/${language}`;
    // Remove leading slash for consistency
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // If it's already localized, return as is
    if (cleanPath.startsWith('/en') || cleanPath.startsWith('/bn')) {
        return cleanPath;
    }
    
    // Prepend current language
    return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
  }, [language]);

  const setLanguageAndRedirect = (lang: Language) => {
    if (lang === language) return;
    
    // Replace the locale segment in the current pathname
    const segments = pathname.split('/');
    // segments[0] is "", segments[1] is the current locale
    segments[1] = lang;
    const newPath = segments.join('/') || `/${lang}`;
    
    router.push(newPath);
  };

  const toggleLanguage = () => {
    const newLang = language === 'bn' ? 'en' : 'bn';
    setLanguageAndRedirect(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage: setLanguageAndRedirect, getLocalizedPath }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
