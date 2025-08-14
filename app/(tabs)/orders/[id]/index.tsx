import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  User,
  Calendar,
  CreditCard,
  Package,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
} from 'lucide-react-native';
import {  useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/lib/auth';
import { useGetOrderById } from '~/hooks/order';




const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#10B981';
    case 'processing':
      return '#F59E0B';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'processing':
      return Clock;
    case 'cancelled':
      return XCircle;
    default:
      return AlertCircle;
  }
};

const getPaymentMethodColor = (method: string | null) => {
  switch (method) {
    case 'cash':
      return '#10B981';
    case 'gcash':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetOrderById(Number(id));
  const markAsPaidMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          payment_method: 'cash',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <LinearGradient
          colors={['#8B5CF6', '#A855F7', '#C084FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-8 pt-12">
          <View className="mb-6 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">Loading...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-lg text-gray-500">Order not found</Text>
      </View>
    );
  }

  const StatusIcon = getStatusIcon(order.status);
  const totalAmount = order.order_items.reduce((sum, item) => sum + Number(item.total_price), 0);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-12">
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Order #{order.id}</Text>
        </View>

        <View className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm text-white/80">Total Amount</Text>
            <View className="flex-row items-center">
              <StatusIcon size={16} color={getStatusColor(order.status)} />
              <Text className="ml-1 text-sm capitalize text-white/80">{order.status}</Text>
            </View>
          </View>
          <Text className="text-2xl font-bold text-white">₱{totalAmount.toLocaleString()}</Text>
        </View>
      </LinearGradient>

      <ScrollView className="-mt-4 flex-1 px-6">
        {/* Order Information */}
        <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 rounded-full bg-purple-100 p-2">
              <Receipt size={20} color="#8B5CF6" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">Order Information</Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center">
              <User size={16} color="#6B7280" />
              <Text className="ml-2 flex-1 text-gray-600">Customer</Text>
              <Text className="font-medium text-gray-900">{order.customer_name}</Text>
            </View>

            <View className="flex-row items-center">
              <Calendar size={16} color="#6B7280" />
              <Text className="ml-2 flex-1 text-gray-600">Order Date</Text>
              <Text className="font-medium text-gray-900">
                {new Date(order.created_at).toLocaleDateString()}
              </Text>
            </View>

            {order.payment_method && (
              <View className="flex-row items-center">
                <CreditCard size={16} color="#6B7280" />
                <Text className="ml-2 flex-1 text-gray-600">Payment Method</Text>
                <View className="rounded-full bg-gray-100 px-3 py-1">
                  <Text
                    className="text-sm font-medium capitalize"
                    style={{ color: getPaymentMethodColor(order.payment_method) }}>
                    {order.payment_method}
                  </Text>
                </View>
              </View>
            )}

            {order.debtors && (
              <View className="flex-row items-center">
                <User size={16} color="#6B7280" />
                <Text className="ml-2 flex-1 text-gray-600">Debtor</Text>
                <View>
                  <Text className="font-medium text-gray-900">{order.debtors.name}</Text>
                  <Text className="text-sm text-gray-500">{order.debtors.phone}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 rounded-full bg-blue-100 p-2">
              <Package size={20} color="#3B82F6" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">Order Items</Text>
            <Text className="ml-2 text-gray-500">({order.order_items.length})</Text>
          </View>

          <View className="space-y-4">
            {order.order_items.map((item) => (
              <View
                key={item.id}
                className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <View className="mb-2 flex-row items-start justify-between">
                  <View className="mr-4 flex-1">
                    <Text className="font-medium text-gray-900">{item.products.name}</Text>
                    <Text className="text-sm text-gray-500">SKU: {item.products.sku}</Text>
                  </View>
                  <Text className="font-semibold text-gray-900">
                    ₱{Number(item.total_price).toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">
                    ₱{Number(item.products.price).toLocaleString()} × {item.quantity}
                  </Text>
                  <View className="rounded bg-gray-100 px-2 py-1">
                    <Text className="text-xs font-medium text-gray-700">Qty: {item.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Order Summary</Text>

          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">₱{totalAmount.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Tax</Text>
              <Text className="text-gray-900">₱0.00</Text>
            </View>
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between">
                <Text className="text-lg font-semibold text-gray-900">Total</Text>
                <Text className="text-lg font-bold text-purple-600">
                  ₱{totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Button */}
        {order.status === 'pending' && (
          <View className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <Text className="mb-4 text-lg font-semibold text-gray-900">Payment</Text>
            <TouchableOpacity
              onPress={() => markAsPaidMutation.mutate()}
              disabled={markAsPaidMutation.isPending}
              className="flex-row items-center justify-center rounded-xl bg-green-500 p-4"
              style={{ opacity: markAsPaidMutation.isPending ? 0.7 : 1 }}>
              <DollarSign size={20} color="white" />
              <Text className="ml-2 text-lg font-semibold text-white">
                {markAsPaidMutation.isPending ? 'Processing...' : 'Mark as Paid (Cash)'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
