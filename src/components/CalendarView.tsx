
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Expense } from '../hooks/useExpenses';
import { Income } from '../hooks/useIncome';
import { Reminder } from '../hooks/useReminders';

interface CalendarViewProps {
  expenses: Expense[];
  income: Income[];
  reminders: Reminder[];
}

export const CalendarView = ({ expenses, income, reminders }: CalendarViewProps) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getEventsForDate = (date: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    
    const dayExpenses = expenses.filter(expense => expense.date === dateString);
    const dayIncome = income.filter(item => item.date === dateString);
    const dayReminders = reminders.filter(reminder => reminder.due_date === dateString);

    return { expenses: dayExpenses, income: dayIncome, reminders: dayReminders };
  };

  const renderDay = (date: number) => {
    const { expenses: dayExpenses, income: dayIncome, reminders: dayReminders } = getEventsForDate(date);
    const hasEvents = dayExpenses.length > 0 || dayIncome.length > 0 || dayReminders.length > 0;
    const isToday = date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

    return (
      <div
        key={date}
        className={`min-h-[80px] p-2 border border-gray-200 ${
          isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
        }`}
      >
        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
          {date}
        </div>
        {hasEvents && (
          <div className="space-y-1">
            {dayExpenses.length > 0 && (
              <div className="w-full h-1 bg-red-400 rounded"></div>
            )}
            {dayIncome.length > 0 && (
              <div className="w-full h-1 bg-green-400 rounded"></div>
            )}
            {dayReminders.length > 0 && (
              <div className="w-full h-1 bg-orange-400 rounded"></div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-blue-600" />
          {monthNames[currentMonth]} {currentYear}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-0 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-0 border border-gray-200">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={i} className="min-h-[80px] p-2 border border-gray-200 bg-gray-50"></div>
          ))}
          
          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-red-400 rounded"></div>
            <span>Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-green-400 rounded"></div>
            <span>Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-orange-400 rounded"></div>
            <span>Reminders</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
