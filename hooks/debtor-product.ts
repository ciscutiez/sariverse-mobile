import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/utils/supabase';
import { DebtorProduct } from '~/types/database';

// Fetch all debtor products
export const useGetDebtorProducts = () =>
  useQuery<DebtorProduct[]>({
    queryKey: ['debtor_products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('debtor_products').select('*');
      if (error) throw error;
      return data;
    }
  });

// Fetch debtor product by ID
export const useGetDebtorProductById = (id: number) =>
  useQuery<DebtorProduct>({
    queryKey: ['debtor_products', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('debtor_products').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });

// Create debtor product
export const useCreateDebtorProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<DebtorProduct, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('debtor_products').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtor_products'] })
  });
};

// Update debtor product
export const useUpdateDebtorProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DebtorProduct> & { id: number }) => {
      const { data, error } = await supabase.from('debtor_products').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtor_products'] })
  });
};

// Delete debtor product
export const useDeleteDebtorProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('debtor_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtor_products'] })
  });
};
