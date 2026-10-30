'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (objOrKey: any) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (val) => (typeof val === 'string' ? val : val?.en || '')
});

export const dictionary: Record<string, { en: string; hi: string }> = {
  portalTitle: {
    en: 'ScholarSync',
    hi: 'स्कॉलरसिंक (ScholarSync)'
  },
  portalSubtitle: {
    en: 'Tribal Scholarship Management Platform — Ministry of Tribal Affairs',
    hi: 'जनजातीय छात्रवृत्ति प्रबंधन एवं सत्यापन पोर्टल — जनजातीय कार्य मंत्रालय'
  },
  navCatalog: { en: 'Scholarships', hi: 'छात्रवृत्तियां' },
  navApplications: { en: 'My Applications', hi: 'मेरे आवेदन' },
  navProfile: { en: 'My Profile', hi: 'मेरी प्रोफाइल' },
  navNotifications: { en: 'Notifications', hi: 'सूचनाएं' },
  navReviewerQueue: { en: 'Review Queue', hi: 'सत्यापन कतार' },
  navAdminConfigs: { en: 'Scholarship Configs', hi: 'योजना विन्यास' },
  navDemoMessages: { en: 'Sent Messages (Demo)', hi: 'भेजे गए संदेश (डेमो)' },
  loginTitle: { en: 'Login to Portal', hi: 'पोर्टल पर लॉगिन करें' },
  mobileLabel: { en: 'Mobile Number', hi: 'मोबाइल नंबर' },
  otpLabel: { en: 'Enter OTP', hi: 'ओटीपी दर्ज करें' },
  sendOtp: { en: 'Get OTP', hi: 'ओटीपी प्राप्त करें' },
  verifyOtp: { en: 'Verify & Login', hi: 'सत्यापित करें और लॉगिन करें' },
  logout: { en: 'Sign Out', hi: 'लॉग आउट' }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved && (saved === 'en' || saved === 'hi')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (objOrKey: any): string => {
    if (!objOrKey) return '';
    if (typeof objOrKey === 'string') {
      if (dictionary[objOrKey]) {
        return dictionary[objOrKey][lang] || dictionary[objOrKey].en;
      }
      return objOrKey;
    }
    if (typeof objOrKey === 'object') {
      return objOrKey[lang] || objOrKey.en || Object.values(objOrKey)[0] || '';
    }
    return String(objOrKey);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  return useContext(I18nContext);
}

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="inline-flex items-center rounded-full border border-[#E5E7EB] p-0.5 bg-[#F8F9FB] text-xs font-medium shadow-xs">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
          lang === 'en'
            ? 'bg-[#D62828] text-white shadow-xs font-semibold'
            : 'text-[#4B5563] hover:text-[#D62828]'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLang('hi')}
        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
          lang === 'hi'
            ? 'bg-[#D62828] text-white shadow-xs font-semibold'
            : 'text-[#4B5563] hover:text-[#D62828]'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}
