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

// Paths that should not receive a locale prefix
const dashboardPrefixes = [
  '/admin',
  '/student',
  '/teacher',
  '/moderator',
  '/seller',
  '/affiliate',
  '/doubt-solver',
];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  // Sync state with URL locale segment if available
  const urlLocale = params?.locale as Language;
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Priority: URL > LocalStorage > Default
    const savedLang = localStorage.getItem('rdc_preferred_lang') as Language;
    if (urlLocale) {
      setLanguage(urlLocale);
      localStorage.setItem('rdc_preferred_lang', urlLocale);
    } else if (savedLang && (savedLang === 'en' || savedLang === 'bn')) {
      setLanguage(savedLang);
    }
  }, [urlLocale]);

  const getLocalizedPath = useCallback((path: string) => {
    if (!path) return `/${language}`;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Check if the target path is a dashboard path
    const isDashboard = dashboardPrefixes.some(prefix => cleanPath.startsWith(prefix));
    if (isDashboard) {
        return cleanPath;
    }
    
    // If already localized, return as is
    if (cleanPath.startsWith('/en') || cleanPath.startsWith('/bn')) {
        return cleanPath;
    }
    
    // Return localized path
    return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
  }, [language]);

  const setLanguageAndRedirect = (lang: Language) => {
    if (lang === language) return;
    
    localStorage.setItem('rdc_preferred_lang', lang);
    setLanguage(lang);

    const segments = pathname.split('/');
    const currentLocale = segments[1];

    if (locales.includes(currentLocale)) {
        // We are on a localized page, replace prefix
        segments[1] = lang;
        router.push(segments.join('/') || `/${lang}`);
    } else {
        // We are on a dashboard or unlocalized page, just update state (handled above)
        // No redirect needed for dashboards, they don't use prefixes
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'bn' ? 'en' : 'bn';
    setLanguageAndRedirect(newLang);
  };

  const locales = ['en', 'bn'];

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
