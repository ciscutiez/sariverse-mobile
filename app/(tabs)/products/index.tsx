// products.tsx
import { View, ScrollView, RefreshControl, Pressable, Image, TextInput, Text } from 'react-native';
import { useState, useMemo } from 'react';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Plus, ExternalLink, Package2, Pencil, Search } from 'lucide-react-native';

import { useGetProducts } from '~/hooks/product';
import type { ProductWithInventory } from '~/types/database';
import { Button } from '~/components/nativewindui/Button';
import { FilterChip } from '~/components/filter-chip';

function ProductCard({ product }: { product: ProductWithInventory }) {
  return (
    <View className="gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-xl">
      {/* Header image area */}
      <View className="relative h-48 bg-slate-800">
        {product.product_image ? (
          <Image
            source={{ uri: product.product_image }}
            className="h-full w-full"
            style={{ resizeMode: 'cover' }}
          />
        ) : (
          <View className="flex h-full w-full items-center justify-center">
            <Package size={48} color="#94a3b8" />
          </View>
        )}
        {/* Category */}
        {product.category ? (
          <View className="absolute left-3 top-3">
            <View className="rounded-full border border-gray-300 bg-white/70 px-3 py-1 backdrop-blur-sm">
              <Text className="text-xs font-medium text-gray-700">{product.category}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View className="gap-4 space-y-3 p-4">
        {/* Product name */}
        <View className="space-y-1">
          <Text className="text-lg font-semibold leading-tight text-gray-900">
            {product.name || 'Unnamed Product'}
          </Text>
        </View>

        {/* Prices */}
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Base Price</Text>
            <Text className="font-semibold text-gray-900">₱{product.price?.toFixed(2) ?? '0.00'}</Text>
          </View>
          {product.inventory?.[0]?.srp ? (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-1">
                <Text className="text-sm text-gray-500">Retail Price</Text>
              </View>
              <Text className="text-lg font-bold text-green-600">
                ₱{product.inventory[0].srp.toFixed(2)}
              </Text>
            </View>
          ) : (
            <LinearGradient
              colors={['rgba(229, 231, 235, 0.8)', 'rgba(243, 244, 246, 0.6)']}
              className="rounded-lg border border-gray-300 p-4">
              <View className="items-center space-y-3">
                <View className="rounded-full bg-gray-200/60 p-2">
                  <ExternalLink size={20} color="#6b7280" />
                </View>
                <View className="items-center space-y-1">
                  <Text className="text-center text-sm font-medium text-gray-700">
                    No retail price and stock set
                  </Text>
                  <Text className="text-center text-xs text-gray-500">
                    Set up inventory to start selling
                  </Text>
                </View>
                <Link href="/inventory" asChild>
                  <Pressable className="flex-row items-center space-x-2 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-100 to-purple-100 px-4 py-2">
                    <ExternalLink size={14} color="#6d28d9" />
                    <Text className="text-sm font-medium text-violet-700">Set in Inventory</Text>
                  </Pressable>
                </Link>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* Stock */}
        {product.inventory?.[0]?.stock != null && (
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Stock</Text>
            <View className="flex-row items-center space-x-2">
              <View
                className={`h-2 w-2 rounded-full ${
                  product.inventory[0].stock > 10
                    ? 'bg-green-400'
                    : product.inventory[0].stock > 0
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                }`}
              />
              <Text
                className={`font-medium ${
                  product.inventory[0].stock > 10
                    ? 'text-green-600'
                    : product.inventory[0].stock > 0
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}>
                {String(product.inventory[0].stock)} units
              </Text>
            </View>
          </View>
        )}

        <Link href={`/products/${String(product.id)}/update`} asChild>
          <Button variant="black">
            <Pencil size={14} />
            <Text className="text-sm font-medium text-white">Edit Product</Text>
          </Button>
        </Link>
      </View>
    </View>
  );
}

/* ---------------- Main Screen ---------------- */
export default function ProductsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { data: products, refetch } = useGetProducts();

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const availableCategories = useMemo(() => {
    if (!products) return [];
    const categories = [...new Set(products.map((product) => product.category))];
    return categories.filter(Boolean);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const name = (product.name ?? '').toLowerCase();
      const category = (product.category ?? '').toLowerCase();
      const matchesSearch =
        name.includes(searchQuery.toLowerCase()) || category.includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category ?? '');
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
  };

  const totalProducts = products?.length || 0;
  const filteredCount = filteredProducts.length;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-16">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Products</Text>
            <Text className="text-sm text-purple-100">Manage your inventory</Text>
          </View>
          <View className="rounded-full bg-white/20 p-3">
            <Package size={24} color="white" />
          </View>
        </View>
        <View className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <View className="mb-2 flex-row items-center gap-2">
            <Package2 size={16} color="white" />
            <Text className="font-semibold text-white">Total Products</Text>
          </View>
          <Text className="text-3xl font-bold text-white">{String(totalProducts)}</Text>
        </View>
      </LinearGradient>

      {/* Body */}
      <ScrollView
        className="-mt-4 flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="min-h-full rounded-t-3xl bg-white">
          <View className="gap-4 space-y-6 p-6">
            <View className="relative">
              <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                <Search size={20} color="#6b7280" />
              </View>
              <TextInput
                className="rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-base text-gray-900"
                placeholder="Search products..."
                placeholderTextColor="#6b7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {availableCategories.length > 0 && (
              <View className="gap-3 space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium text-gray-700">Filter by Category</Text>
                  {selectedCategories.length > 0 && (
                    <Pressable onPress={clearAllFilters}>
                      <Text className="text-sm font-medium text-violet-600">Clear All</Text>
                    </Pressable>
                  )}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2 px-1">
                    {availableCategories.map((category) => (
                      <FilterChip
                        key={String(category)}
                        label={category}
                        isSelected={selectedCategories.includes(category)}
                        onPress={() => toggleCategory(category)}
                        onRemove={
                          selectedCategories.includes(category)
                            ? () => toggleCategory(category)
                            : undefined
                        }
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Header for list */}
            <View className="flex-row items-center justify-between py-4">
              <View>
                <Text className="text-xl font-bold text-gray-900">
                  {searchQuery || selectedCategories.length > 0
                    ? 'Filtered Products'
                    : 'Recent Products'}
                </Text>
                <Text className="text-sm text-gray-500">
                  {searchQuery || selectedCategories.length > 0
                    ? `${filteredCount} of ${totalProducts} products`
                    : `${totalProducts} total products`}
                </Text>
              </View>
              <Link href="/products/add" asChild>
                <Button variant="black">
                  <Plus size={16} color="white" />
                  <Text className="font-semibold text-white">Add Product</Text>
                </Button>
              </Link>
            </View>

            {/* Product list */}
            <View className="gap-4 space-y-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Link key={String(product.id)} href={`/products/${String(product.id)}` as any} asChild>
                    <Pressable>
                      <ProductCard product={product} />
                    </Pressable>
                  </Link>
                ))
              ) : (
                <View className="items-center py-12">
                  <Package size={48} color="#9ca3af" />
                  <Text className="mt-4 text-lg font-medium text-gray-500">
                    {searchQuery || selectedCategories.length > 0
                      ? 'No products found'
                      : 'No products yet'}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-400">
                    {searchQuery || selectedCategories.length > 0
                      ? 'Try adjusting your search or filters'
                      : 'Add your first product to get started'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
