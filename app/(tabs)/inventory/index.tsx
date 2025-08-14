"use client"

import { View, ScrollView, RefreshControl, Pressable } from "react-native"
import { useState } from "react"
import { Link } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

import { Text } from "~/components/nativewindui/Text"
import { useGetInventory } from "~/hooks/inventory"

import type { Inventory } from "~/types/database"
import { Edit, Package, AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react-native"

export default function InventoryScreen() {

  const [refreshing, setRefreshing] = useState(false)
  const { data: inventory, refetch } = useGetInventory()

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const lowStockItems = inventory?.filter((item) => item.status === "low_stock") || []
  const outOfStockItems = inventory?.filter((item) => item.status === "out_of_stock") || []
  const inStockItems = inventory?.filter((item) => item.status === "in_stock") || []
  const totalValue = inventory?.reduce((sum, item) => sum + (item.srp || 0) * item.stock, 0) || 0

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#8B5CF6", "#A855F7", "#C084FC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-16 pb-8"
      >
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white text-2xl font-bold">Inventory</Text>
            <Text className="text-purple-100 text-sm">Manage your stock levels</Text>
          </View>
          <View className="bg-white/20 rounded-full p-3">
            <Package size={24} color="white" />
          </View>
        </View>

        <View className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <View className="flex-row items-center gap-2 mb-2">
            <TrendingUp size={16} color="white" />
            <Text className="text-white font-semibold">Total Inventory Value</Text>
          </View>
          <Text className="text-white text-3xl font-bold">₱{totalValue.toLocaleString()}</Text>
        </View>
      </LinearGradient>

      {/* Body */}
      <ScrollView
        className="-mt-4 flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="min-h-full rounded-t-3xl bg-white">
          <View className="space-y-6 gap-4 p-6">
            {/* Stats */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-green-50 p-4 rounded-2xl border border-green-100">
                <View className="items-center space-y-1">
                  <CheckCircle size={20} color="#10b981" />
                  <Text className="text-green-600 text-2xl font-bold">{inStockItems.length}</Text>
                  <Text className="text-green-600 text-xs font-medium">In Stock</Text>
                </View>
              </View>
              <View className="flex-1 bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                <View className="items-center space-y-1">
                  <AlertTriangle size={20} color="#f59e0b" />
                  <Text className="text-yellow-600 text-2xl font-bold">{lowStockItems.length}</Text>
                  <Text className="text-yellow-600 text-xs font-medium">Low Stock</Text>
                </View>
              </View>
              <View className="flex-1 bg-red-50 p-4 rounded-2xl border border-red-100">
                <View className="items-center space-y-1">
                  <XCircle size={20} color="#ef4444" />
                  <Text className="text-red-600 text-2xl font-bold">{outOfStockItems.length}</Text>
                  <Text className="text-red-600 text-xs font-medium text-center">Out of Stock</Text>
                </View>
              </View>
            </View>

            {/* Header for list */}
            <View className="flex-row items-center justify-between py-4">
              <View>
                <Text className="text-xl font-bold text-gray-900">Inventory Items</Text>
                <Text className="text-sm text-gray-500">{inventory?.length || 0} total items</Text>
              </View>
            
            </View>

            {/* Inventory list */}
            <View className="space-y-4 gap-4">
              {inventory?.map((item) => (
                <Link key={item.id} href={`/inventory/${item.id}` as any} asChild>
                  <InventoryItemCard item={item} />
                </Link>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function InventoryItemCard({ item }: { item: Inventory }) {
  const statusConfig = {
    in_stock: { color: "#10b981", label: "In Stock", icon: CheckCircle },
    low_stock: { color: "#f59e0b", label: "Low Stock", icon: AlertTriangle },
    out_of_stock: { color: "#ef4444", label: "Out of Stock", icon: XCircle },
  }

  const config = statusConfig[item.status]
  const StatusIcon = config.icon

  return (
 
      <View className="bg-white/80 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        {/* Header */}
        <View className="relative bg-gradient-to-br from-gray-200 to-gray-100 p-4">
          <View className="absolute top-3 left-3">
            <View className="bg-white/70 backdrop-blur-sm rounded-full px-3 py-1 border border-gray-300 flex-row items-center space-x-1">
              <StatusIcon size={12} color={config.color} />
              <Text className="text-gray-700 text-xs font-medium">{config.label}</Text>
            </View>
          </View>
          <View className="mt-8">
            <Text className="text-gray-900 text-lg font-semibold">{item.name}</Text>

          </View>
        </View>

        {/* Content */}
        <View className="p-4 space-y-3">
          {/* Stock and Price */}
          <View className="space-y-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500 text-sm">Current Stock</Text>
              <Text className="text-gray-900 font-semibold">{item.stock} units</Text>
            </View>

            {item.srp ? (
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-1">
                  <Package size={12} color="#6b7280" />
                  <Text className="text-gray-500 text-sm">Retail Price</Text>
                </View>
                <Text className="text-green-600 font-bold text-lg">₱{item.srp.toFixed(2)}</Text>
              </View>
            ) : (
              <View className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <View className="items-center space-y-2">
                  <Text className="text-gray-700 text-sm font-medium text-center">No retail price set</Text>
                  <Text className="text-gray-500 text-xs text-center">Update inventory to set pricing</Text>
                </View>
              </View>
            )}
          </View>

          {/* Stock Level Indicator */}
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-500 text-sm">Stock Level</Text>
            <View className="flex-row items-center space-x-2">
              <View
                className={`w-2 h-2 rounded-full ${
                  item.status === "in_stock"
                    ? "bg-green-400"
                    : item.status === "low_stock"
                      ? "bg-yellow-400"
                      : "bg-red-400"
                }`}
              />
              <Text
                className={`font-medium ${
                  item.status === "in_stock"
                    ? "text-green-600"
                    : item.status === "low_stock"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {item.status === "in_stock" ? "Good" : item.status === "low_stock" ? "Low" : "Empty"}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
            <Text className="text-gray-400 text-xs">Updated {new Date(item.last_updated).toLocaleDateString()}</Text>
            <Link href={`/inventory/update` as any} asChild>
              <Pressable className="bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200 rounded-lg px-3 py-1 flex-row items-center space-x-1">
                <Edit size={12} color="#6d28d9" />
                <Text className="text-violet-700 text-xs font-medium">Update</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>

  )
}
