
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface StoredLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  created_at: string;
}

export const useStoredLinks = () => {
  const [links, setLinks] = useState<StoredLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLinks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stored_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast({
        title: 'Error',
        description: 'Failed to load links.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addLink = useCallback(async (linkData: Omit<StoredLink, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stored_links')
        .insert({
          ...linkData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Link saved successfully!',
      });

      fetchLinks();
      return data;
    } catch (error) {
      console.error('Error adding link:', error);
      toast({
        title: 'Error',
        description: 'Failed to save link.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, toast, fetchLinks]);

  const deleteLink = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('stored_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Link deleted successfully!',
      });

      fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete link.',
        variant: 'destructive',
      });
    }
  }, [fetchLinks, toast]);

  return {
    links,
    loading,
    fetchLinks,
    addLink,
    deleteLink,
  };
};
