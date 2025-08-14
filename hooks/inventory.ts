import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/lib/auth';
import { Inventory } from '~/types/database';
import { useGetProfiles } from './profile';

// Fetch all inventory items
export const useGetInventory = () => {
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useQuery<Inventory[]>({
    queryKey: ['inventory', profile_id],
    queryFn: async () => {
      if (!profile_id) return [];
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('profile_id', profile_id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile_id,
  });
};

// Fetch one inventory item by ID
export const useGetInventoryById = (id: string) => {
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useQuery<Inventory>({
    queryKey: ['inventory', id, profile_id],
    queryFn: async () => {
      if (!profile_id) return {} as Inventory;
      const { data, error } = await supabase
        .from('inventory')
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

// Create inventory item
export const useCreateInventory = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useMutation({
    mutationFn: async (payload: Omit<Inventory, 'created_at'>) => {
      if (!profile_id) throw new Error('Profile ID not found');
      const { data, error } = await supabase
        .from('inventory')
        .insert({ ...payload, profile_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', profile_id] }),
  });
};

// Update inventory item
export const useUpdateInventory = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Inventory> & { id: string }) => {
      if (!profile_id) throw new Error('Profile ID not found');
      const { data, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .eq('profile_id', profile_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', profile_id] }),
  });
};

// Delete inventory item
export const useDeleteInventory = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useMutation({
    mutationFn: async (id: string) => {
      if (!profile_id) throw new Error('Profile ID not found');
      const { data, error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id)
        .eq('profile_id', profile_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', profile_id] }),
  });
};
