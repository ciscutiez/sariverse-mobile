import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/utils/supabase';
import { OrderItem } from '~/types/database';

// Fetch all order items
export const useGetOrderItems = () =>
  useQuery<OrderItem[]>({
    queryKey: ['order_items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('order_items').select('*');
      if (error) throw error;
      return data;
    }
  });

// Fetch one order item
export const useGetOrderItemById = (id: number) =>
  useQuery<OrderItem>({
    queryKey: ['order_items', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('order_items').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });

// Create order item
export const useCreateOrderItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('order_items').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order_items'] })
  });
};

// Update order item
export const useUpdateOrderItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OrderItem> & { id: number }) => {
      const { data, error } = await supabase.from('order_items').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order_items'] })
  });
};

// Delete order item
export const useDeleteOrderItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('order_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order_items'] })
  });
};
