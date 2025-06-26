
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Expense } from '../hooks/useExpenses';
import { Income } from '../hooks/useIncome';
import { Reminder } from '../hooks/useReminders';

interface YearCalendarViewProps {
  expenses: Expense[];
  income: Income[];
  reminders: Reminder[];
}

export const YearCalendarView = ({ expenses, income, reminders }: YearCalendarViewProps) => {
  const currentYear = new Date().getFullYear();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatCurrency = (amount: number, currency = 'INR') => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
    return `${symbols[currency] || '₹'}${amount.toFixed(2)}`;
  };

  const getEventsForMonth = (month: number) => {
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === currentYear;
    });
    
    const monthIncome = income.filter(item => {
      const incomeDate = new Date(item.date);
      return incomeDate.getMonth() === month && incomeDate.getFullYear() === currentYear;
    });
    
    const monthReminders = reminders.filter(reminder => {
      const reminderDate = new Date(reminder.due_date);
      return reminderDate.getMonth() === month && reminderDate.getFullYear() === currentYear;
    });

    const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);

    return { 
      expenses: monthExpenses, 
      income: monthIncome, 
      reminders: monthReminders,
      totalExpenses,
      totalIncome
    };
  };

  const renderMonth = (month: number) => {
    const { expenses: monthExpenses, income: monthIncome, reminders: monthReminders, totalExpenses, totalIncome } = getEventsForMonth(month);
    const hasEvents = monthExpenses.length > 0 || monthIncome.length > 0 || monthReminders.length > 0;

    return (
      <Card key={month} className="h-48 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{monthNames[month]}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {hasEvents ? (
            <>
              {totalIncome > 0 && (
                <div className="text-xs text-green-600 font-medium">
                  Income: {formatCurrency(totalIncome)}
                </div>
              )}
              {totalExpenses > 0 && (
                <div className="text-xs text-red-600 font-medium">
                  Expenses: {formatCurrency(totalExpenses)}
                </div>
              )}
              {monthReminders.length > 0 && (
                <div className="text-xs text-orange-600 font-medium">
                  {monthReminders.length} Reminder{monthReminders.length > 1 ? 's' : ''}
                </div>
              )}
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {monthExpenses.slice(0, 2).map((expense, idx) => (
                  <div key={idx} className="text-xs text-gray-600 truncate">
                    • {expense.description}
                  </div>
                ))}
                {monthIncome.slice(0, 2).map((inc, idx) => (
                  <div key={idx} className="text-xs text-green-600 truncate">
                    + {inc.description}
                  </div>
                ))}
                {(monthExpenses.length + monthIncome.length) > 4 && (
                  <div className="text-xs text-gray-400">
                    +{monthExpenses.length + monthIncome.length - 4} more...
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-400 text-center py-4">
              No transactions
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-blue-600" />
          {currentYear} Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, i) => renderMonth(i))}
        </div>

        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span>Reminders</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
