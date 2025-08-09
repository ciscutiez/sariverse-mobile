import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/utils/supabase';
import { Inventory } from '~/types/database';

// Fetch all inventory items
export const useGetInventory = () =>
  useQuery<Inventory[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) throw error;
      return data;
    }
  });

// Fetch one inventory item
export const useGetInventoryById = (id: string) =>
  useQuery<Inventory>({
    queryKey: ['inventory', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });

// Create inventory item
export const useCreateInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Inventory, 'created_at'>) => {
      const { data, error } = await supabase.from('inventory').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] })
  });
};

// Update inventory item
export const useUpdateInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Inventory> & { id: string }) => {
      const { data, error } = await supabase.from('inventory').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] })
  });
};

// Delete inventory item
export const useDeleteInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] })
  });
};
