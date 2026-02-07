'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const language: Language = 'en';

  const toggleLanguage = () => {
    // Language switching disabled - App is English only
  };

  const setLanguageAndStore = (lang: Language) => {
    // Force English
  };

  const value = { language, toggleLanguage, setLanguage: setLanguageAndStore };

  return (
    <LanguageContext.Provider value={value}>
      <div lang="en" dir="ltr">
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
