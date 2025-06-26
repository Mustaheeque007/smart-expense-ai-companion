
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Expense } from '../hooks/useExpenses';
import { Income } from '../hooks/useIncome';

interface FinancialOverviewProps {
  expenses: Expense[];
  income: Income[];
}

export const FinancialOverview = ({ expenses, income }: FinancialOverviewProps) => {
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const isOverspending = netBalance < 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-700">
            <TrendingUp className="h-4 w-4" />
            Total Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(totalIncome)}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-red-700">
            <TrendingDown className="h-4 w-4" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">
            {formatCurrency(totalExpenses)}
          </div>
        </CardContent>
      </Card>

      <Card className={`shadow-lg border-0 ${isOverspending 
        ? 'bg-gradient-to-br from-red-50 to-red-100' 
        : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
        <CardHeader className="pb-2">
          <CardTitle className={`flex items-center gap-2 text-sm font-medium ${isOverspending ? 'text-red-700' : 'text-blue-700'}`}>
            <DollarSign className="h-4 w-4" />
            {isOverspending ? 'Overspending' : 'Savings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isOverspending ? 'text-red-900' : 'text-blue-900'}`}>
            {formatCurrency(Math.abs(netBalance))}
          </div>
          {isOverspending && (
            <p className="text-sm text-red-600 mt-1">
              You're spending {formatCurrency(Math.abs(netBalance))} more than your income
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
