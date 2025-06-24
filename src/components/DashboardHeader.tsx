
import React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Brain, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const DashboardHeader = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl">
          <Wallet className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Brain className="h-4 w-4" />
            AI-Powered Financial Intelligence
          </p>
        </div>
      </div>
      
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-600" />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32 border-0 bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="ur">اردو</SelectItem>
              <SelectItem value="mr">मराठी</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
};
