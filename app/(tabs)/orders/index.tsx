'use client';

import { View, ScrollView, RefreshControl, ColorValue } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Plus,
  ShoppingBag,
  TrendingUp,
  Calendar,
  type LucideIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { useGetOrders } from '~/hooks/order';
import { useGetOrderItems } from '~/hooks/order-item';

import type { Order } from '~/types/database';
import { FilterChip } from '~/components/filter-chip';

const statusIconMap: Record<Order['status'], LucideIcon> = {
  pending: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

/* ---------------- Orders Screen ---------------- */

export default function OrdersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>(
    'all'
  );

  const { data: orders, refetch } = useGetOrders();
  const { data: orderItems } = useGetOrderItems();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const pendingOrders = orders?.filter((order) => order.status === 'pending') || [];
  const completedOrders = orders?.filter((order) => order.status === 'completed') || [];
  const cancelledOrders = orders?.filter((order) => order.status === 'cancelled') || [];

  const totalRevenue =
    orderItems
      ?.filter((item) => {
        const order = orders?.find((o) => o.id === item.order_id);
        return order?.status === 'completed';
      })
      .reduce((sum, item) => sum + Number(item.total_price), 0) || 0;

  const getOrderItemsForOrder = (orderId: number) =>
    orderItems?.filter((item) => item.order_id === orderId) || [];

  const getOrderTotal = (orderId: number) =>
    getOrderItemsForOrder(orderId).reduce((sum, item) => sum + Number(item.total_price), 0);

  const filteredOrders =
    statusFilter === 'all' ? orders : orders?.filter((order) => order.status === statusFilter);

  return (
    <View className="flex-1 bg-gray-50">
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-16">
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Orders</Text>
            <Text className="text-sm text-purple-100">Manage your customer orders</Text>
          </View>
          <View className="rounded-full bg-white/20 p-3">
            <ShoppingBag size={24} color="white" />
          </View>
        </View>

        {/* Revenue Card */}
        <View className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <View className="mb-2 flex-row items-center gap-2">
            <TrendingUp size={16} color="white" />
            <Text className="font-semibold text-white">Total Revenue</Text>
          </View>
          <Text className="text-3xl font-bold text-white">₱{totalRevenue.toLocaleString()}</Text>
          <Text className="text-sm text-purple-100">{completedOrders.length} completed orders</Text>
        </View>
      </LinearGradient>

      <ScrollView
        className="-mt-4 flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="min-h-full rounded-t-3xl bg-white">
          <View className="gap-4 space-y-6 p-6">
            {/* Stats Row */}
            <View className="flex-row gap-3">
              {/* Pending */}
              <View className="flex-1 rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
                <View className="items-center space-y-1">
                  <Clock size={20} color="#f59e0b" />
                  <Text className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</Text>
                  <Text className="text-xs font-medium text-yellow-600">Pending</Text>
                </View>
              </View>
              {/* Completed */}
              <View className="flex-1 rounded-2xl border border-green-100 bg-green-50 p-4">
                <View className="items-center space-y-1">
                  <CheckCircle size={20} color="#10b981" />
                  <Text className="text-2xl font-bold text-green-600">
                    {completedOrders.length}
                  </Text>
                  <Text className="text-xs font-medium text-green-600">Completed</Text>
                </View>
              </View>
              {/* Cancelled */}
              <View className="flex-1 rounded-2xl border border-red-100 bg-red-50 p-4">
                <View className="items-center space-y-1">
                  <XCircle size={20} color="#ef4444" />
                  <Text className="text-2xl font-bold text-red-600">{cancelledOrders.length}</Text>
                  <Text className="text-center text-xs font-medium text-red-600">Cancelled</Text>
                </View>
              </View>
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}>
              <FilterChip
                label="All"
                isSelected={statusFilter === 'all'}
                onPress={() => setStatusFilter('all')}
              />
              <FilterChip
                label="Pending"
                isSelected={statusFilter === 'pending'}
                onPress={() => setStatusFilter('pending')}
              />
              <FilterChip
                label="Completed"
                isSelected={statusFilter === 'completed'}
                onPress={() => setStatusFilter('completed')}
              />
              <FilterChip
                label="Cancelled"
                isSelected={statusFilter === 'cancelled'}
                onPress={() => setStatusFilter('cancelled')}
              />
            </ScrollView>

            {/* Recent Orders */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-gray-900">Recent Orders</Text>
                <Text className="text-sm text-gray-500">{filteredOrders?.length || 0} orders</Text>
              </View>
              <Link href={'/orders/new' as any} asChild>
                <Button variant="black">
                  <Plus size={16} color="white" />
                  <Text className="font-semibold text-white">New Order</Text>
                </Button>
              </Link>
            </View>

            <View className="gap-4 space-y-4">
              {filteredOrders?.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}` as any} asChild>
                  <OrderCard
                    order={order}
                    orderItems={getOrderItemsForOrder(order.id)}
                    orderTotal={getOrderTotal(order.id)}
                  />
                </Link>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- OrderCard ---------------- */
function OrderCard({
  order,
  orderItems,
  orderTotal,
}: {
  order: Order;
  orderItems: any[];
  orderTotal: number;
}) {
  type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];
  const statusConfig: Record<Order['status'], { colors: GradientColors; textColor: string }> = {
    pending: { colors: ['#F59E0B', '#F97316'], textColor: '#F59E0B' },
    completed: { colors: ['#10B981', '#059669'], textColor: '#10B981' },
    cancelled: { colors: ['#EF4444', '#DC2626'], textColor: '#EF4444' },
  };

  const config = statusConfig[order.status];
  const IconComponent = statusIconMap[order.status];

  return (
    <View
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
      {/* Top Row */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <LinearGradient colors={config.colors} className="rounded-full p-2">
            <ShoppingBag size={16} color="white" />
          </LinearGradient>
          <View>
            <Text className="text-lg font-bold text-gray-900">Order #{order.id}</Text>
            <Text className="text-sm text-gray-500">{order.customer_name}</Text>
          </View>
        </View>

        {/* Fixed Status Badge */}
        <View
          style={{ backgroundColor: `${config.textColor}15` }}
          className="flex-shrink-0 flex-row items-center gap-2 rounded-full px-3 py-2">
          <IconComponent size={12} color={config.textColor} />
          <Text
            style={{ color: config.textColor }}
            className="text-sm font-semibold"
            numberOfLines={1}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Order Total */}
      <View className="mb-4 rounded-xl bg-gray-50 p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <TrendingUp size={16} color="#6B7280" />
            <Text className="font-medium text-gray-600">Total Amount</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">₱{orderTotal.toLocaleString()}</Text>
        </View>
        <Text className="text-sm text-gray-500">
          {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Bottom Row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Calendar size={14} color="#9CA3AF" />
          <Text className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Link href={`/orders/${order.id}`} asChild>
          <Button variant="black">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold text-white">View Details</Text>
              <ChevronRight size={14} color="white" />
            </View>
          </Button>
        </Link>
      </View>
    </View>
  );
}
