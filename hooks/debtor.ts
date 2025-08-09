import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/utils/supabase';
import { Debtor } from '~/types/database';

// Fetch all debtors
export const useGetDebtors = () =>
  useQuery<Debtor[]>({
    queryKey: ['debtors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('debtors').select('*');
      if (error) throw error;
      return data;
    }
  });

// Fetch debtor by ID
export const useGetDebtorById = (id: string) =>
  useQuery<Debtor>({
    queryKey: ['debtors', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('debtors').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });

// Create debtor
export const useCreateDebtor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Debtor, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('debtors').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtors'] })
  });
};

// Update debtor
export const useUpdateDebtor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Debtor> & { id: string }) => {
      const { data, error } = await supabase.from('debtors').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtors'] })
  });
};

// Delete debtor
export const useDeleteDebtor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('debtors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtors'] })
  });
};
