
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ar' | 'ur' | 'mr';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    title: 'Smart Expense Tracker',
    addExpense: 'Add Expense',
    amount: 'Amount',
    description: 'Description',
    category: 'Category',
    date: 'Date',
    submit: 'Add Expense',
    recentTransactions: 'Recent Transactions',
    spendingOverview: 'Spending Overview',
    categoryBreakdown: 'Category Breakdown',
    aiInsights: 'AI Insights',
    totalSpent: 'Total Spent This Month',
    aiCategorized: 'AI Categorized',
    language: 'Language'
  },
  ar: {
    title: 'متتبع المصروفات الذكي',
    addExpense: 'إضافة مصروف',
    amount: 'المبلغ',
    description: 'الوصف',
    category: 'الفئة',
    date: 'التاريخ',
    submit: 'إضافة مصروف',
    recentTransactions: 'المعاملات الحديثة',
    spendingOverview: 'نظرة عامة على الإنفاق',
    categoryBreakdown: 'تفصيل الفئات',
    aiInsights: 'رؤى الذكاء الاصطناعي',
    totalSpent: 'إجمالي الإنفاق هذا الشهر',
    aiCategorized: 'مصنف بالذكاء الاصطناعي',
    language: 'اللغة'
  },
  ur: {
    title: 'سمارٹ خرچ ٹریکر',
    addExpense: 'خرچ شامل کریں',
    amount: 'رقم',
    description: 'تفصیل',
    category: 'کیٹگری',
    date: 'تاریخ',
    submit: 'خرچ شامل کریں',
    recentTransactions: 'حالیہ لین دین',
    spendingOverview: 'خرچ کا جائزہ',
    categoryBreakdown: 'کیٹگری کی تفصیل',
    aiInsights: 'AI بصیرت',
    totalSpent: 'اس مہینے کل خرچ',
    aiCategorized: 'AI کیٹگرائزڈ',
    language: 'زبان'
  },
  mr: {
    title: 'स्मार्ट खर्च ट्रॅकर',
    addExpense: 'खर्च जोडा',
    amount: 'रक्कम',
    description: 'वर्णन',
    category: 'श्रेणी',
    date: 'दिनांक',
    submit: 'खर्च जोडा',
    recentTransactions: 'अलीकडील व्यवहार',
    spendingOverview: 'खर्चाचा आढावा',
    categoryBreakdown: 'श्रेणी विभाजन',
    aiInsights: 'AI अंतर्दृष्टी',
    totalSpent: 'या महिन्यात एकूण खर्च',
    aiCategorized: 'AI वर्गीकृत',
    language: 'भाषा'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
