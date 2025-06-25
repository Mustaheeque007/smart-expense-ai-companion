
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

  const addIncome = useCallback(async (incomeData: Omit<Income, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income')
        .insert({
          ...incomeData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

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

  return {
    income,
    loading,
    fetchIncome,
    addIncome,
  };
};
