import { View, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import { Icon } from '@roninoss/icons';
import { Text } from '~/components/nativewindui/Text';
import { useGetProducts } from '~/hooks/product';
import { useColorScheme } from '~/lib/useColorScheme';
import { Button } from '~/components/nativewindui/Button';
import type { Product } from '~/types/database';
import { Edit } from 'lucide-react-native';

export default function ProductsScreen() {
  // const { colors } = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { data: products, refetch } = useGetProducts();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4 space-y-6">
          {/* Quick Actions */}
          <View className="flex-row justify-between items-center">
            <Text variant="title3">Products</Text>
            <Link href={"/products/add" as any} asChild>
              <Button variant="primary" size="sm">
                <Icon name="plus" size={16} color="white" />
                <Text className="text-white">Add Product</Text>
              </Button>
            </Link>
          </View>

          {/* Product List */}
          <View className="grid grid-cols-2 gap-4">
            {products?.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`as any} asChild>
                <ProductCard product={product} />
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ProductCard({ product }: { product: Product }) {
  // const { colors } = useColorScheme();

  return (
    <View className="bg-card p-4 rounded-xl space-y-3">
      <View className="h-32 bg-muted rounded-lg items-center justify-center">
        {/* {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <Icon name="image" size={32} color={colors.muted} />
        )} */}
      </View>
      
      <View className="space-y-1">
        <Text variant="heading" numberOfLines={1}>{product.name}</Text>
        <Text variant="subhead" color="tertiary" numberOfLines={1}>
          {product.description}
        </Text>
      </View>

      <View className="flex-row justify-between items-center">
        <Text variant="title3">₱{product.price.toFixed(2)}</Text>
        <Button variant="tonal" size="sm">
          <Edit />
        </Button>
      </View>
    </View>
  );
}
