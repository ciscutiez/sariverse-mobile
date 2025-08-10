import { View, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';

import { Text } from '~/components/nativewindui/Text';
import { useGetInventory } from '~/hooks/inventory';
import { useColorScheme } from '~/lib/useColorScheme';
import { Button } from '~/components/nativewindui/Button';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import type { Inventory } from '~/types/database';
import { Edit, Package, AlertTriangle, XOctagon, Plus, CheckCircle, XCircle } from 'lucide-react-native';


export default function InventoryScreen() {
  const { colors } = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { data: inventory, refetch } = useGetInventory();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const lowStockItems = inventory?.filter(item => item.status === 'low_stock') || [];
  const outOfStockItems = inventory?.filter(item => item.status === 'out_of_stock') || [];
  const inStockItems = inventory?.filter(item => item.status === 'in_stock') || [];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4 space-y-6">
          {/* Inventory Statistics */}
          <View className="flex-row gap-4">
  <InventoryStatCard
    icon={Package}
    label="In Stock"
    value={inStockItems.length.toString()}
    variant="default"
  />
  <InventoryStatCard
    icon={AlertTriangle}
    label="Low Stock"
    value={lowStockItems.length.toString()}
    variant="warning"
  />
  <InventoryStatCard
    icon={XOctagon}
    label="Out of Stock"
    value={outOfStockItems.length.toString()}
    variant="danger"
  />
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-between items-center">
            <Text variant="title3">Inventory</Text>
            <Link href={"/inventory/add" as any} asChild>
              <Button variant="primary" size="sm">
                <Plus  size={16} color="white" />
                <Text className="text-white">Add Item</Text>
              </Button>
            </Link>
          </View>

          {/* Inventory List */}
          <View className="space-y-4">
            {inventory?.map((item) => (
              <Link key={item.id} href={`/inventory/${item.id}` as any} asChild>
                <InventoryItemCard item={item} />
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InventoryStatCard({ 
  icon: IconComponent, 
  label, 
  value, 
  variant = 'default' 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  variant?: 'default' | 'warning' | 'danger';
}) {
  const { colors } = useColorScheme();
  
  const variantColors = {
    default: colors.primary,
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  return (
    <View className="flex-1 bg-card p-4 rounded-xl space-y-2">
      <View 
        style={{ backgroundColor: `${variantColors[variant]}20` }}
        className="w-8 h-8 rounded-full items-center justify-center"
      >
        <IconComponent size={16} color={variantColors[variant]} />
      </View>
      <View>
        <Text variant="title3">{value}</Text>
        <Text variant="footnote" color="tertiary">{label}</Text>
      </View>
    </View>
  );
}


function InventoryItemCard({ item }: { item: Inventory }) {
  const { colors } = useColorScheme();

  const statusColors = {
    in_stock: colors.primary,
    low_stock: '#f59e0b',
    out_of_stock: '#ef4444'
  };

const statusIcon = {
  in_stock: CheckCircle,
  low_stock: AlertTriangle,
  out_of_stock: XCircle
};
const StatusIconComponent = statusIcon[item.status];
  return (
    <View className="bg-card p-4 rounded-xl space-y-3">
      <View className="flex-row items-center justify-between">
        <Text variant="heading">{item.name}</Text>
        <View 
          style={{ backgroundColor: `${statusColors[item.status]}20` }}
          className="py-1 px-3 rounded-full flex-row items-center gap-1"
        >
        <StatusIconComponent size={12} color={statusColors[item.status]} />
          <Text style={{ color: statusColors[item.status] }}>
            {item.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Text>
        </View>
      </View>
      
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text color="tertiary">SKU: {item.sku}</Text>
          <Text color="tertiary">Stock: {item.stock}</Text>
        </View>
        
        {item.srp && (
          <Text color="tertiary">SRP: ₱{item.srp.toFixed(2)}</Text>
        )}
        
        <ProgressIndicator
          className="h-2 bg-muted rounded-full overflow-hidden"
          value={item.stock}
          max={100}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <Text variant="footnote" color="tertiary">
          Last updated: {new Date(item.last_updated).toLocaleDateString()}
        </Text>
        <Button variant="secondary" size="sm">
          <Text>Update Stock</Text>
          <Edit size={16} color={colors.primary} />
        </Button>
      </View>
    </View>
  );
}
