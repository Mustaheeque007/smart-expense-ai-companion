
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  category: string;
  due_date: string;
  amount?: number;
  is_completed: boolean;
  created_at: string;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReminders = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reminders.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addReminder = useCallback(async (reminderData: Omit<Reminder, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminderData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Reminder added successfully!',
      });

      fetchReminders();
      return data;
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reminder.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, toast, fetchReminders]);

  const toggleReminder = useCallback(async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: isCompleted })
        .eq('id', id);

      if (error) throw error;

      fetchReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reminder.',
        variant: 'destructive',
      });
    }
  }, [fetchReminders, toast]);

  return {
    reminders,
    loading,
    fetchReminders,
    addReminder,
    toggleReminder,
  };
};
