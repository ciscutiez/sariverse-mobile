import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/lib/auth';
import { Profile } from '~/types/database';



// Fetch all profiles
export const useGetProfiles = () =>
  useQuery<Profile>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').single();
      if (error) throw error;
      return data;
    }
  });

// Fetch profile by ID
export const useGetProfileById = (id: number) =>
  useQuery<Profile>({
    queryKey: ['profiles', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });

// Create profile
export const useCreateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Profile, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('profiles').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] })
  });
};

// Update profile
export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: number }) => {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] })
  });
};

// Delete profile
export const useDeleteProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] })
  });
};
