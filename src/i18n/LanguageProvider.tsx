'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { dictionaries, Language, TranslationKey } from './dictionaries';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Try to load from localStorage on initial render if in browser
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('kiosk_language') as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'ko')) {
        setLanguageState(savedLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kiosk_language', lang);
    }
  };

  const t = (key: TranslationKey): string => {
    // Return the translated string, fallback to English, or fallback to the key itself
    return dictionaries[language]?.[key] || dictionaries['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};