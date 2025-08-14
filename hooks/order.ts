import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/lib/auth';
import { Debtor, Order, OrderItem, Product } from '~/types/database';
import { useGetProfiles } from './profile';

export type OrderWithRelations = Order & {
  debtors?: Pick<Debtor, "name" | "phone">
  order_items: (OrderItem & {
    products: Pick<Product, "name" | "price">
  })[]
}

// Fetch all orders for current profile
export const useGetOrders = () => {
  const { data: profile } = useGetProfiles();

  return useQuery<Order[]>({
    queryKey: ['orders', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("Profile not found");

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('profile_id', profile.id);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
};

// Fetch order by ID (only if order belongs to current profile)
export const useGetOrderById = (id: number) => {
  const { data: profile } = useGetProfiles();

  return useQuery<OrderWithRelations>({
    queryKey: ["orders", id, profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("Profile not found");

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          debtors (name, phone),
          order_items (
            *,
            products (name, price)
          )
        `)
        .eq("id", id)
        .eq("profile_id", profile.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id && !!id,
  });
};

// Create order associated with current profile
export const useCreateOrder = () => {
  const qc = useQueryClient()
  const { data: profile } = useGetProfiles()

  return useMutation({
    mutationFn: async (payload: {
      customer_name: string
      status: 'pending' | 'completed' | 'cancelled'
      items: { product_id: number; quantity: number; price: number }[]
    }) => {
      if (!profile?.id) throw new Error('Profile not found')

      // 1. Insert into orders (without items)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: payload.customer_name,
          status: payload.status,
          profile_id: profile.id,
        })
        .select()
        .single()

      if (orderError) throw orderError
      if (!order?.id) throw new Error('Order ID missing')

      // 2. Insert order items referencing order.id
      const orderItemsToInsert = payload.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        profile_id: profile.id,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert)

      if (itemsError) throw itemsError

      return order
    },
  onSuccess: () => qc.invalidateQueries({ queryKey: ['orders', profile?.id] })
  })
}

// Update order only if it belongs to current profile
export const useUpdateOrder = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Order> & { id: number }) => {
      if (!profile?.id) throw new Error("Profile not found");

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .eq('profile_id', profile.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders', profile?.id] }),
  });
};

// Delete order only if it belongs to current profile
export const useDeleteOrder = () => {
  const qc = useQueryClient();
  const { data: profile } = useGetProfiles();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!profile?.id) throw new Error("Profile not found");

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .eq('profile_id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders', profile?.id] }),
  });
};
