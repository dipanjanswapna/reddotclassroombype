
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('bn');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []);

  const setLanguageAndStore = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'bn' ? 'en' : 'bn';
    setLanguageAndStore(newLang);
  };

  const value = { language, toggleLanguage, setLanguage: setLanguageAndStore };

  return (
    <LanguageContext.Provider value={value}>
      <div lang={language} dir={language === 'bn' ? 'ltr' : 'ltr'}>
         {children}
      </div>
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
