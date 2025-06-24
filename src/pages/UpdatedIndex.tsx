
import React, { useState, useEffect } from 'react';
import { UpdatedDashboardHeader } from '../components/UpdatedDashboardHeader';
import { UpdatedExpenseForm } from '../components/UpdatedExpenseForm';
import { UpdatedExpenseList } from '../components/UpdatedExpenseList';
import { SpendingChart } from '../components/SpendingChart';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { UpdatedInsightsPanel } from '../components/UpdatedInsightsPanel';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useExpenses } from '../hooks/useExpenses';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DashboardContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { expenses, loading, fetchExpenses, addExpense } = useExpenses();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth loading:', authLoading, 'User:', user?.email);
    if (!authLoading && !user) {
      console.log('Redirecting to auth page...');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      console.log('Fetching expenses for user:', user.email);
      const filter = timeFilter === 'all' ? undefined : timeFilter as 'week' | 'month' | 'year';
      fetchExpenses(filter, searchQuery);
    }
  }, [timeFilter, searchQuery, user, fetchExpenses]);

  const handleAddExpense = async (expenseData: any, files?: File[]) => {
    console.log('Adding expense:', expenseData);
    await addExpense(expenseData, files);
    // Refresh expenses after adding
    const filter = timeFilter === 'all' ? undefined : timeFilter as 'week' | 'month' | 'year';
    fetchExpenses(filter, searchQuery);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to AI Expense Tracker</h1>
          <p className="text-gray-600 mb-6">Please sign in to start tracking your expenses</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <UpdatedDashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Forms and Insights */}
          <div className="lg:col-span-1 space-y-6">
            <UpdatedExpenseForm onAddExpense={handleAddExpense} />
            <UpdatedInsightsPanel expenses={expenses} />
          </div>
          
          {/* Right Column - Analytics and List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SpendingChart expenses={expenses} />
              <CategoryBreakdown expenses={expenses} />
            </div>
            <UpdatedExpenseList expenses={expenses} />
          </div>
        </div>
      </div>
    </div>
  );
};

const UpdatedIndex: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <DashboardContent />
      </LanguageProvider>
    </AuthProvider>
  );
};

export default UpdatedIndex;
