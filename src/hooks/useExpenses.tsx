
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  ai_suggested: boolean;
  created_at: string;
  attachments?: ExpenseAttachment[];
}

export interface ExpenseAttachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchExpenses = useCallback(async (timeFilter?: 'week' | 'month' | 'year', searchQuery?: string) => {
    if (!user) {
      console.log('No user found, skipping expense fetch');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching expenses with filter:', timeFilter, 'search:', searchQuery);
      
      let query = supabase
        .from('expenses')
        .select(`
          *,
          expense_attachments (
            id,
            file_name,
            file_path,
            file_type,
            file_size
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      // Apply time filter
      if (timeFilter) {
        const now = new Date();
        let startDate: Date;

        switch (timeFilter) {
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }

        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }

      let filteredExpenses = data || [];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredExpenses = filteredExpenses.filter(expense =>
          expense.description.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query)
        );
      }

      const processedExpenses = filteredExpenses.map(expense => ({
        ...expense,
        attachments: expense.expense_attachments || []
      }));

      console.log('Fetched expenses:', processedExpenses.length);
      setExpenses(processedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenses.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addExpense = useCallback(async (expenseData: Omit<Expense, 'id' | 'created_at' | 'attachments'>, files?: File[]) => {
    if (!user) {
      console.log('No user found, cannot add expense');
      return;
    }

    try {
      console.log('Adding expense:', expenseData);
      
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          user_id: user.id,
        })
        .select()
        .single();

      if (expenseError) {
        console.error('Error adding expense:', expenseError);
        throw expenseError;
      }

      console.log('Expense added:', expense);

      // Upload files if any
      if (files && files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${expense.id}/${Date.now()}.${fileExt}`;

          console.log('Uploading file:', fileName);

          const { error: uploadError } = await supabase.storage
            .from('expense-attachments')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
          }

          // Save attachment record
          const { error: attachmentError } = await supabase.from('expense_attachments').insert({
            expense_id: expense.id,
            file_name: file.name,
            file_path: fileName,
            file_type: file.type,
            file_size: file.size,
          });

          if (attachmentError) {
            console.error('Error saving attachment:', attachmentError);
            throw attachmentError;
          }
        }
      }

      toast({
        title: 'Success',
        description: 'Expense added successfully!',
      });

      return expense;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      console.log('User changed, fetching expenses for:', user.email);
      fetchExpenses();
    }
  }, [user, fetchExpenses]);

  return {
    expenses,
    loading,
    fetchExpenses,
    addExpense,
  };
};
