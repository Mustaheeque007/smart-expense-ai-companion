
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Expense } from '../hooks/useExpenses';

interface UpdatedInsightsPanelProps {
  expenses: Expense[];
}

export const UpdatedInsightsPanel = ({ expenses }: UpdatedInsightsPanelProps) => {
  const { t } = useLanguage();

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgDailySpending = expenses.length > 0 ? totalSpent / 7 : 0;

  const topCategory = expenses.reduce((acc: Record<string, number>, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const highestCategory = Object.entries(topCategory).reduce((a, b) => 
    a[1] > b[1] ? a : b, ['', 0]
  );

  const insights = [
    {
      icon: TrendingUp,
      color: 'text-green-600',
      title: t('totalSpent'),
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(totalSpent),
      description: 'This period'
    },
    {
      icon: Brain,
      color: 'text-blue-600',
      title: 'AI Prediction',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(avgDailySpending * 30),
      description: 'Monthly estimate'
    },
    {
      icon: AlertCircle,
      color: 'text-orange-600',
      title: 'Top Category',
      value: highestCategory[0] || 'N/A',
      description: highestCategory[1] ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(Number(highestCategory[1])) : ''
    }
  ];

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-green-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Brain className="h-5 w-5 text-purple-600" />
          {t('aiInsights')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <Icon className={`h-5 w-5 mt-1 ${insight.color}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-lg font-bold text-gray-900 mt-1">{insight.value}</p>
                  {insight.description && (
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  )}
                </div>
              </div>
            );
          })}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-blue-600 mt-1" />
              <div>
                <h5 className="font-medium text-blue-900">Smart Tip</h5>
                <p className="text-sm text-blue-800 mt-1">
                  {expenses.length > 0 
                    ? `Your highest spending category is ${highestCategory[0]}. Consider setting a budget limit for better control.`
                    : 'Start tracking your expenses to get personalized AI insights and recommendations.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
