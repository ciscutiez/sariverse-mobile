import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/lib/auth';
import { OrderItem } from '~/types/database';
import { useGetProfiles } from './profile';

// Fetch all order items for the current profile
export const useGetOrderItems = () => {
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useQuery<OrderItem[]>({
    queryKey: ['order_items', profile_id],
    queryFn: async () => {
      if (!profile_id) return [];
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('profile_id', profile_id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile_id,
  });
};

// Fetch one order item by ID for the current profile
export const useGetOrderItemById = (id: number) => {
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useQuery<OrderItem>({
    queryKey: ['order_items', id, profile_id],
    queryFn: async () => {
      if (!profile_id) return {} as OrderItem;
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('id', id)
        .eq('profile_id', profile_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profile_id && !!id,
  });
};

// Create order item
export const useCreateOrderItem = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useMutation({
    mutationFn: async (payload: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>) => {
      if (!profile_id) throw new Error('Profile ID not found');
      const { data, error } = await supabase
        .from('order_items')
        .insert({ ...payload, profile_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order_items', profile_id] }),
  });
};

// Update order item
export const useUpdateOrderItem = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OrderItem> & { id: number }) => {
      if (!profile_id) throw new Error('Profile ID not found');
      const { data, error } = await supabase
        .from('order_items')
        .update(updates)
        .eq('id', id)
        .eq('profile_id', profile_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order_items', profile_id] }),
  });
};

// Delete order item
export const useDeleteOrderItem = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useMutation({
    mutationFn: async (id: number) => {
      if (!profile_id) throw new Error('Profile ID not found');
      const { data, error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', id)
        .eq('profile_id', profile_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order_items', profile_id] }),
  });
};
