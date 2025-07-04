
import React, { useState, useEffect } from 'react';
import { UpdatedDashboardHeader } from '../components/UpdatedDashboardHeader';
import { UpdatedExpenseForm } from '../components/UpdatedExpenseForm';
import { IncomeForm } from '../components/IncomeForm';
import { IncomeList } from '../components/IncomeList';
import { UpdatedExpenseList } from '../components/UpdatedExpenseList';
import { FinancialOverview } from '../components/FinancialOverview';
import { RemindersPanel } from '../components/RemindersPanel';
import { CalendarView } from '../components/CalendarView';
import { YearCalendarView } from '../components/YearCalendarView';
import { SpendingChart } from '../components/SpendingChart';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { UpdatedInsightsPanel } from '../components/UpdatedInsightsPanel';
import { ReportGenerator } from '../components/ReportGenerator';
import { LanguageProvider } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses } from '../hooks/useExpenses';
import { useIncome } from '../hooks/useIncome';
import { useReminders, Reminder } from '../hooks/useReminders';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UpdatedIndex: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { expenses, loading: expensesLoading, fetchExpenses, addExpense } = useExpenses();
  const { income, loading: incomeLoading, fetchIncome, addIncome, updateIncome, deleteIncome } = useIncome();
  const { reminders, fetchReminders, addReminder, updateReminder, deleteReminder, toggleReminder } = useReminders();
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
      console.log('Fetching data for user:', user.email);
      const filter = timeFilter === 'all' ? undefined : timeFilter as 'week' | 'month' | 'year';
      fetchExpenses(filter, searchQuery);
      fetchIncome(filter, searchQuery);
      fetchReminders();
    }
  }, [timeFilter, searchQuery, user, fetchExpenses, fetchIncome, fetchReminders]);

  const handleAddExpense = async (expenseData: any, files?: File[]) => {
    console.log('Adding expense:', expenseData);
    await addExpense(expenseData, files);
    refreshData();
  };

  const handleAddIncome = async (incomeData: any, files?: File[]) => {
    console.log('Adding income:', incomeData);
    await addIncome(incomeData, files);
    refreshData();
  };

  const handleUpdateIncome = async (id: string, incomeData: any) => {
    console.log('Updating income:', id, incomeData);
    await updateIncome(id, incomeData);
    refreshData();
  };

  const handleDeleteIncome = async (id: string) => {
    console.log('Deleting income:', id);
    await deleteIncome(id);
    refreshData();
  };

  const handleAddReminder = async (reminderData: Omit<Reminder, 'id' | 'created_at'>) => {
    console.log('Adding reminder:', reminderData);
    await addReminder(reminderData);
    refreshData();
  };

  const handleUpdateReminder = async (id: string, reminderData: Partial<Reminder>) => {
    console.log('Updating reminder:', id, reminderData);
    if (updateReminder) {
      await updateReminder(id, reminderData);
      refreshData();
    }
  };

  const handleDeleteReminder = async (id: string) => {
    console.log('Deleting reminder:', id);
    if (deleteReminder) {
      await deleteReminder(id);
      refreshData();
    }
  };

  const refreshData = () => {
    const filter = timeFilter === 'all' ? undefined : timeFilter as 'week' | 'month' | 'year';
    fetchExpenses(filter, searchQuery);
    fetchIncome(filter, searchQuery);
    fetchReminders();
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
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <UpdatedDashboardHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
          />
          
          {/* Financial Overview */}
          <div className="mt-6">
            <FinancialOverview expenses={expenses} income={income} />
          </div>

          <div className="mt-6">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="forms">Add Data</TabsTrigger>
                <TabsTrigger value="reminders">Reminders</TabsTrigger>
                <TabsTrigger value="calendar">Monthly</TabsTrigger>
                <TabsTrigger value="year-calendar">Yearly</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Insights */}
                  <div className="lg:col-span-1">
                    <UpdatedInsightsPanel expenses={expenses} />
                  </div>
                  
                  {/* Right Column - Analytics and List */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SpendingChart expenses={expenses} />
                      <CategoryBreakdown expenses={expenses} />
                    </div>
                    <UpdatedExpenseList expenses={expenses} onRefresh={refreshData} />
                    <IncomeList 
                      income={income}
                      onUpdate={handleUpdateIncome}
                      onDelete={handleDeleteIncome}
                      onRefresh={refreshData}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="forms" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <UpdatedExpenseForm onAddExpense={handleAddExpense} />
                  <IncomeForm onAddIncome={handleAddIncome} />
                </div>
              </TabsContent>

              <TabsContent value="reminders" className="space-y-6">
                <RemindersPanel 
                  reminders={reminders} 
                  onAddReminder={handleAddReminder}
                  onUpdateReminder={handleUpdateReminder}
                  onDeleteReminder={handleDeleteReminder}
                  onToggleReminder={toggleReminder}
                  onAddExpense={handleAddExpense}
                />
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6">
                <CalendarView 
                  expenses={expenses}
                  income={income}
                  reminders={reminders}
                />
              </TabsContent>

              <TabsContent value="year-calendar" className="space-y-6">
                <YearCalendarView 
                  expenses={expenses}
                  income={income}
                  reminders={reminders}
                />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <ReportGenerator 
                  expenses={expenses}
                  income={income}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default UpdatedIndex;
