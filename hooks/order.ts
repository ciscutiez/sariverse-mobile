import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order } from '~/types/database';
import { supabase } from '~/utils/supabase';

// Fetch all orders
export const useGetOrders = () =>
  useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) throw error;
      return data;
    }
  });

// Fetch order by ID
export const useGetOrderById = (id: number) =>
  useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });

// Create order
export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    // Use Partial<Record<string, any>> to bypass until types are fixed
    mutationFn: async (payload: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>> & {
      customer_name: string;
      total_amount: number;
      status: 'pending' | 'completed' | 'cancelled';
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] })
  });
};


// Update order
export const useUpdateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Order> & { id: number }) => {
      const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] })
  });
};

// Delete order
export const useDeleteOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] })
  });
};
