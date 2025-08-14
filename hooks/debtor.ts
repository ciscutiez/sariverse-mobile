import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/lib/auth';
import { Debtor } from '~/types/database';
import { useGetProfiles } from './profile';

// Fetch all debtors for the current profile
export const useGetDebtors = () => {
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useQuery<Debtor[]>({
    queryKey: ['debtors', profile_id],
    queryFn: async () => {
      if (!profile_id) return [];
      const { data, error } = await supabase
        .from('debtors')
        .select('*')
        .eq('profile_id', profile_id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile_id,
  });
};

// Fetch debtor by ID for the current profile
export const useGetDebtorById = (id: string) => {
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useQuery<Debtor>({
    queryKey: ['debtors', id, profile_id],
    queryFn: async () => {
      if (!profile_id) return {} as Debtor;
      const { data, error } = await supabase
        .from('debtors')
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

// Create debtor for the current profile
export const useCreateDebtor = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useMutation({
    mutationFn: async (payload: Omit<Debtor, 'created_at' | 'updated_at'>) => {
      if (!profile_id) throw new Error('Profile ID not found');
      const { data, error } = await supabase
        .from('debtors')
        .insert({ ...payload, profile_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtors', profile_id] }),
  });
};

// Update debtor for the current profile
export const useUpdateDebtor = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Debtor> & { id: string }) => {
      if (!profile_id) throw new Error('Profile ID not found');
      const { data, error } = await supabase
        .from('debtors')
        .update(updates)
        .eq('id', id)
        .eq('profile_id', profile_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtors', profile_id] }),
  });
};

// Delete debtor for the current profile
export const useDeleteDebtor = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();
  const profile_id = profile?.id;

  return useMutation({
    mutationFn: async (id: string) => {
      if (!profile_id) throw new Error('Profile ID not found');
      const { data, error } = await supabase
        .from('debtors')
        .delete()
        .eq('id', id)
        .eq('profile_id', profile_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtors', profile_id] }),
  });
};
