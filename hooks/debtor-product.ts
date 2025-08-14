import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/lib/auth';

import { DebtorProduct } from '~/types/database';

export async function addProductToDebtor({
  debtorId,
  productId,
  quantity,
  totalPrice,
}: {
  debtorId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
}) {
  const { data, error } = await supabase
    .from('debtor_products')
    .insert({
      debtor_id: debtorId,
      product_id: productId,
      quantity,
      total_price: totalPrice,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
// Fetch all debtor products
export const useGetDebtorProducts = (debtorId: string) =>
  useQuery({
    queryKey: ['debtor_products', debtorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debtor_products_view')
        .select('*')
        .eq('debtor_id', debtorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

// Fetch debtor product by ID
export const useGetDebtorProductById = (id: number) =>
  useQuery<DebtorProduct>({
    queryKey: ['debtor_products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debtor_products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
export const useAddProductToDebtor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      debtorId,
      productId,
      quantity,
      totalPrice,
    }: {
      debtorId: string;
      productId: string;
      quantity: number;
      totalPrice: number;
    }) => {
      const { data: result, error: rpcError } = await supabase.rpc('add_product_to_debtor', {
        p_debtor_id: debtorId,
        p_product_id: productId,
        p_quantity: quantity,
        p_total_price: totalPrice,
      });
      if (rpcError) throw rpcError;

      // Fetch the newly added product from the view
      const { data: newProduct, error: fetchError } = await supabase
        .from('debtor_products_view')
        .select('*')
        .eq('id', result.id)
        .single();
      if (fetchError) throw fetchError;

      return newProduct;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['debtor-products', variables.debtorId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['debtors'] });
    },
  });
};

// --------------------
// Update debtor product via RPC
// --------------------
export const useUpdateDebtorProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      debtorId,
      quantity,
      totalPrice,
    }: {
      id: number;
      debtorId: string;
      quantity?: number;
      totalPrice?: number;
    }) => {
      const { error: rpcError } = await supabase.rpc('update_debtor_product', {
        p_id: id,
        p_quantity: quantity,
        p_total_price: totalPrice,
      });
      if (rpcError) throw rpcError;

      const { data: updatedProduct, error: fetchError } = await supabase
        .from('debtor_products_view')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      return updatedProduct;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['debtor-products', variables.debtorId] });
    },
  });
};

// --------------------
// Delete debtor product via RPC
// --------------------
export const useDeleteDebtorProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, debtorId }: { id: number; debtorId: string }) => {
      const { error: rpcError } = await supabase.rpc('remove_product_from_debtor', { p_id: id });
      if (rpcError) throw rpcError;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['debtor-products', variables.debtorId] });
    },
  });
};
