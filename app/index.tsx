"use client"
import { useRouter } from "expo-router"
import { View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"


import { useGetProducts } from "~/hooks/product"
import { useGetOrders } from "~/hooks/order"
import { useGetDebtors } from "~/hooks/debtor"
import { useGetInventory } from "~/hooks/inventory"
import { useGetTransactions } from "~/hooks/transaction"

import { DashboardCard } from "~/components/dashboard-card"
import { Text } from "~/components/nativewindui/Text"

function DashboardCardSkeleton() {
  return (
    <View className="w-[48%] mb-4 rounded-2xl overflow-hidden bg-slate-200">
      <View className="p-5 min-h-[120px] justify-between">
        {/* Top section with icon skeleton */}
        <View className="flex-row justify-between items-start">
          <View className="w-12 h-12 rounded-full bg-slate-300 animate-pulse" />
          <View className="w-2 h-8 rounded-full bg-slate-300 animate-pulse" />
        </View>

        {/* Bottom section with data skeleton */}
        <View>
          <View className="h-8 w-16 bg-slate-300 rounded mb-1 animate-pulse" />
          <View className="h-4 w-20 bg-slate-300 rounded animate-pulse" />
        </View>

        {/* Background pattern skeleton */}
        <View className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-slate-300 opacity-10 animate-pulse" />
        <View className="absolute -right-8 top-8 w-12 h-12 rounded-full bg-slate-300 opacity-5 animate-pulse" />
      </View>
    </View>
  )
}

function DashboardSkeleton() {
  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="py-4">
        <View className="h-6 w-48 bg-slate-300 rounded animate-pulse" />
      </View>
      <View className="flex-row flex-wrap justify-between">
        {Array.from({ length: 6 }).map((_, index) => (
          <DashboardCardSkeleton key={index} />
        ))}
      </View>
    </ScrollView>
  )
}

export default function DashboardScreen() {
  const router = useRouter()
 
  const { data: products, isLoading: loadingProducts } = useGetProducts()
  const { data: inventory, isLoading: loadingInventory } = useGetInventory()
  const { data: orders, isLoading: loadingOrders } = useGetOrders()
  const { data: debtors, isLoading: loadingDebtors } = useGetDebtors()
  const { data: transactions, isLoading: loadingTransactions } = useGetTransactions()

  const loading = loadingOrders || loadingDebtors || loadingInventory || loadingProducts || loadingTransactions

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="py-4">
        <Text className="text-black">Welcome to your dashboard</Text>
      </View>
      <View className="flex-row flex-wrap justify-between">
        <DashboardCard
          title="Products"
          value={products?.length ?? 0}
          icon="cube-outline"
          onPress={() => router.push("/products")}
        />
        <DashboardCard
          title="Orders"
          value={orders?.length ?? 0}
          icon="receipt-outline"
          onPress={() => router.push("/orders")}
        />
        <DashboardCard
          title="Debtors"
          value={debtors?.length ?? 0}
          icon="people-outline"
          onPress={() => router.push("/debtors")}
        />
        <DashboardCard
          title="Inventory"
          value={inventory?.length ?? 0}
          icon="layers-outline"
          onPress={() => router.push("/inventory")}
        />
        <DashboardCard
          title="Transactions"
          value={transactions?.length ?? 0}
          icon="swap-horizontal-outline"
          onPress={() => router.push("/transactions" as any)}
        />
        <DashboardCard
          title="Analytics"
          value={0}
          icon="stats-chart-outline"
          onPress={() => router.push("/analytics")}
        />
      </View>
    </ScrollView>
  )
}
