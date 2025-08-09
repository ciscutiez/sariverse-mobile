import { View, ScrollView, RefreshControl } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Plus,
  type LucideIcon,
} from "lucide-react-native";
import { Text } from "~/components/nativewindui/Text";
import { Button } from "~/components/nativewindui/Button";
import { useGetOrders } from "~/hooks/order";
import { useGetOrderItems } from "~/hooks/order-item";
import { useColorScheme } from "~/lib/useColorScheme";
import type { Order, OrderStatus } from "~/types/database";

/* ---------------- Icon Maps ---------------- */
type IconName = "clock" | "check-circle" | "x-circle";

const iconMap: Record<IconName, LucideIcon> = {
  clock: Clock,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
};

const statusIconMap: Record<OrderStatus, LucideIcon> = {
  pending: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

/* ---------------- Orders Screen ---------------- */
export default function OrdersScreen() {
  // const { colors } = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { data: orders, refetch } = useGetOrders();
  const { data: orderItems } = useGetOrderItems();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const pendingOrders =
    orders?.filter((order) => order.status === "pending") || [];
  const completedOrders =
    orders?.filter((order) => order.status === "completed") || [];
  const cancelledOrders =
    orders?.filter((order) => order.status === "cancelled") || [];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="space-y-6 p-4">
          {/* Order Statistics */}
          <View className="flex-row gap-4">
            <OrderStatCard
              icon="clock"
              label="Pending"
              value={pendingOrders.length.toString()}
              variant="warning"
            />
            <OrderStatCard
              icon="check-circle"
              label="Completed"
              value={completedOrders.length.toString()}
              variant="success"
            />
            <OrderStatCard
              icon="x-circle"
              label="Cancelled"
              value={cancelledOrders.length.toString()}
              variant="danger"
            />
          </View>

          {/* Quick Actions */}
          <View className="flex-row items-center justify-between">
            <Text variant="title3">Orders</Text>
            <Link href={"/orders/new" as any} asChild>
              <Button variant="primary" size="sm">
                <Plus size={16} color="white" />
                <Text className="text-white">New Order</Text>
              </Button>
            </Link>
          </View>

          {/* Order List */}
          <View className="space-y-4">
            {orders?.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}` as any} asChild>
                <OrderCard order={order} />
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- OrderStatCard ---------------- */
type Variant = "default" | "warning" | "success" | "danger";

type OrderStatCardProps = {
  icon: IconName;
  label: string;
  value: string;
  variant?: Variant;
};

function OrderStatCard({
  icon,
  label,
  value,
  variant = "default",
}: OrderStatCardProps) {
  const { colors } = useColorScheme();
  const IconComponent = iconMap[icon];

  const variantColors: Record<Variant, string> = {
    default: colors.primary,
    warning: "#f59e0b",
    success: "#10b981",
    danger: "#ef4444",
  };

  return (
    <View className="flex-1 space-y-2 rounded-xl bg-card p-4">
      <View
        style={{ backgroundColor: `${variantColors[variant]}20` }}
        className="h-8 w-8 items-center justify-center rounded-full"
      >
        <IconComponent size={16} color={variantColors[variant]} />
      </View>
      <View>
        <Text variant="title3">{value}</Text>
        <Text variant="footnote" color="tertiary">
          {label}
        </Text>
      </View>
    </View>
  );
}

/* ---------------- OrderCard ---------------- */
function OrderCard({ order }: { order: Order }) {
  const { colors } = useColorScheme();

  const statusColors: Record<OrderStatus, string> = {
    pending: "#f59e0b",
    completed: "#10b981",
    cancelled: "#ef4444",
  };

  const IconComponent = statusIconMap[order.status];

  return (
    <View className="space-y-3 rounded-xl bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text variant="heading">Order #{order.id}</Text>
        <View
          style={{ backgroundColor: `${statusColors[order.status]}20` }}
          className="flex-row items-center gap-1 rounded-full px-3 py-1"
        >
          <IconComponent
            size={12}
            color={statusColors[order.status as OrderStatus]}
          />
          <Text style={{ color: statusColors[order.status] }}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>

      <View className="space-y-1">
        <Text color="tertiary">Customer: {order.customer_name}</Text>
        <Text color="tertiary">
          Total: ₱{order.total_price.toFixed(2)}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text variant="footnote" color="tertiary">
          {new Date(order.created_at).toLocaleDateString()}
        </Text>
        <Button variant="secondary" size="sm">
          <Text>View Details</Text>
          <ChevronRight size={16} color={colors.primary} />
        </Button>
      </View>
    </View>
  );
}
