
import React, { useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { SpendingChart } from '../components/SpendingChart';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { InsightsPanel } from '../components/InsightsPanel';
import { LanguageProvider } from '../contexts/LanguageContext';

const Index = () => {
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      amount: 45.99,
      description: 'Grocery shopping',
      category: 'Food & Dining',
      date: '2024-06-24',
      aiSuggested: true
    },
    {
      id: 2,
      amount: 12.50,
      description: 'Coffee',
      category: 'Food & Dining',
      date: '2024-06-23',
      aiSuggested: true
    },
    {
      id: 3,
      amount: 89.99,
      description: 'Gas bill',
      category: 'Utilities',
      date: '2024-06-22',
      aiSuggested: false
    }
  ]);

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now(),
      aiSuggested: true // Simulating AI categorization
    };
    setExpenses([newExpense, ...expenses]);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <DashboardHeader />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column - Forms and Insights */}
            <div className="lg:col-span-1 space-y-6">
              <ExpenseForm onAddExpense={addExpense} />
              <InsightsPanel expenses={expenses} />
            </div>
            
            {/* Right Column - Analytics and List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SpendingChart expenses={expenses} />
                <CategoryBreakdown expenses={expenses} />
              </div>
              <ExpenseList expenses={expenses} />
            </div>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default Index;
