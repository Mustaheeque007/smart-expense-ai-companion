
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Income {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  currency?: string;
  file_attachments?: string[];
}

export const useIncome = () => {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchIncome = useCallback(async (timeFilter?: 'week' | 'month' | 'year', searchQuery?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

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

      if (error) throw error;

      let filteredIncome = data || [];

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredIncome = filteredIncome.filter(income =>
          income.description.toLowerCase().includes(query) ||
          income.category.toLowerCase().includes(query)
        );
      }

      setIncome(filteredIncome);
    } catch (error) {
      console.error('Error fetching income:', error);
      toast({
        title: 'Error',
        description: 'Failed to load income.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addIncome = useCallback(async (incomeData: Omit<Income, 'id' | 'created_at'>, files?: File[]) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income')
        .insert({
          amount: incomeData.amount,
          description: incomeData.description,
          category: incomeData.category,
          date: incomeData.date,
          currency: incomeData.currency || 'USD',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Handle file uploads if any
      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${data.id}/${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('income-attachments')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          return fileName;
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        
        // Update income record with file paths using the correct column name
        const { error: updateError } = await supabase
          .from('income')
          .update({ file_attachments: uploadedFiles })
          .eq('id', data.id);

        if (updateError) throw updateError;
      }

      toast({
        title: 'Success',
        description: 'Income added successfully!',
      });

      return data;
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: 'Error',
        description: 'Failed to add income.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, toast]);

  const updateIncome = useCallback(async (id: string, incomeData: Partial<Income>) => {
    if (!user) return;

    try {
      // Only update the fields that are allowed by the database schema
      const updateData: any = {};
      if (incomeData.amount !== undefined) updateData.amount = incomeData.amount;
      if (incomeData.description !== undefined) updateData.description = incomeData.description;
      if (incomeData.category !== undefined) updateData.category = incomeData.category;
      if (incomeData.date !== undefined) updateData.date = incomeData.date;
      if (incomeData.currency !== undefined) updateData.currency = incomeData.currency;

      const { data, error } = await supabase
        .from('income')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Income updated successfully!',
      });

      return data;
    } catch (error) {
      console.error('Error updating income:', error);
      toast({
        title: 'Error',
        description: 'Failed to update income.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, toast]);

  const deleteIncome = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Income deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting income:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete income.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, toast]);

  return {
    income,
    loading,
    fetchIncome,
    addIncome,
    updateIncome,
    deleteIncome,
  };
};
