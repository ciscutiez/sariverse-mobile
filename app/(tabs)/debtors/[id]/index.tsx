"use client"

import React from "react"
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import {
  ArrowLeft,
  Edit3,
  Phone,
  Mail,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Package,
  ShoppingCart,
  X,
  CreditCard,
} from "lucide-react-native"
import { useAddProductToDebtor, useGetDebtorProducts } from "~/hooks/debtor-product"
import { useGetDebtorById } from "~/hooks/debtor"
import { useGetInventory } from "~/hooks/inventory"
import { PartialPaymentModal } from "~/components/partial-payment-modal"


export default function DebtorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: debtor, isLoading, refetch } = useGetDebtorById(id!)
  const { data: debtorProducts = [] } = useGetDebtorProducts(id!)
  const { data: inventoryItems = [] } = useGetInventory()
  const addProductMutation = useAddProductToDebtor()
  const [refreshing, setRefreshing] = React.useState(false)
  const [showAddProductModal, setShowAddProductModal] = React.useState(false)
  const [showSettleModal, setShowSettleModal] = React.useState(false)
  const [selectedInventoryId, setSelectedInventoryId] = React.useState("")
  const [quantity, setQuantity] = React.useState("1")
  const [customPrice, setCustomPrice] = React.useState("")
  const [useCustomPrice, setUseCustomPrice] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handleAddProduct = async () => {
    const selectedInventory = inventoryItems.find((item) => item.id === selectedInventoryId)
    if (!selectedInventory || !quantity) {
      Alert.alert("Error", "Please select a product and enter quantity")
      return
    }

    const qty = Number.parseInt(quantity)
    if (qty <= 0 || qty > selectedInventory.stock) {
      Alert.alert("Error", `Invalid quantity. Available stock: ${selectedInventory.stock}`)
      return
    }

    const unitPrice = useCustomPrice ? Number.parseFloat(customPrice) : selectedInventory.srp
    if (!unitPrice || unitPrice <= 0) {
      Alert.alert("Error", "Invalid unit price")
      return
    }

    const totalPrice = unitPrice * qty

    if (!selectedInventory.product_id) {
      Alert.alert("Error", "Selected product is invalid")
      return
    }
    if (!debtor) {
      Alert.alert("Error", "Debtor is not loaded")
      return
    }

    setLoading(true)
    try {
      await addProductMutation.mutateAsync({
        debtorId: id!,
        productId: selectedInventory.product_id.toString(),
        quantity: qty,
        totalPrice,
      })

      Alert.alert("Success", "Product added to debtor successfully")
      setShowAddProductModal(false)
      setSelectedInventoryId("")
      setQuantity("1")
      setCustomPrice("")
      setUseCustomPrice(false)
    } catch (error) {
      Alert.alert("Error", "Failed to add product")
      console.error("Add product error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Loading debtor details...</Text>
      </View>
    )
  }

  if (!debtor) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Debtor not found</Text>
      </View>
    )
  }

  const creditUtilization = (debtor.balance / debtor.credit_limit) * 100
  const isOverLimit = debtor.balance > debtor.credit_limit
  const selectedInventory = inventoryItems.find((item) => item.id === selectedInventoryId)

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white px-6 pb-8 pt-16 shadow-sm">
          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
            <View className="flex-row space-x-3">
              {debtor.balance > 0 && (
                <TouchableOpacity
                  onPress={() => setShowSettleModal(true)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                >
                  <CreditCard size={18} color="#374151" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowAddProductModal(true)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <Plus size={18} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/debtors/${id}/update`)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <Edit3 size={18} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-100 border-2 border-gray-200">
              <Text className="text-2xl font-bold text-gray-700">{debtor.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text className="mb-2 text-2xl font-bold text-gray-900">{debtor.name}</Text>
            <Text className="text-base text-gray-600">{debtor.email}</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View className="mx-6 -mt-4 mb-6">
          <View className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <View className="mb-4 flex-row items-center">
              <Phone size={20} color="#6B7280" />
              <Text className="ml-3 font-medium text-gray-900">{debtor.phone || "No phone number"}</Text>
            </View>
            <View className="flex-row items-center">
              <Mail size={20} color="#6B7280" />
              <Text className="ml-3 font-medium text-gray-900">{debtor.email}</Text>
            </View>
          </View>
        </View>

        {/* Financial Overview */}
        <View className="mx-6 mb-6">
          <Text className="mb-4 text-xl font-bold text-gray-900">Financial Overview</Text>

          <View className="mb-4 flex-row space-x-3">
            <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
              <View
                className={`mb-3 h-12 w-12 items-center justify-center rounded-xl ${
                  isOverLimit ? "bg-red-100" : "bg-green-100"
                }`}
              >
                <DollarSign size={24} color={isOverLimit ? "#EF4444" : "#10B981"} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">₱{debtor.balance.toLocaleString()}</Text>
              <Text className="text-sm text-gray-500">Current Balance</Text>
            </View>

            <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <TrendingUp size={24} color="#3B82F6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">₱{debtor.credit_limit.toLocaleString()}</Text>
              <Text className="text-sm text-gray-500">Credit Limit</Text>
            </View>
          </View>

          {/* Credit Utilization */}
          <View className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">Credit Utilization</Text>
              <Text
                className={`text-sm font-medium ${
                  isOverLimit ? "text-red-500" : creditUtilization > 80 ? "text-yellow-500" : "text-green-500"
                }`}
              >
                {creditUtilization.toFixed(1)}%
              </Text>
            </View>
            <View className="mb-2 h-3 rounded-full bg-gray-200">
              <View
                className={`h-3 rounded-full ${
                  isOverLimit ? "bg-red-500" : creditUtilization > 80 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(creditUtilization, 100)}%` }}
              />
            </View>
            <Text className="text-sm text-gray-500">
              Available: ₱{Math.max(0, debtor.credit_limit - debtor.balance).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Products Section */}
        <View className="mx-6 mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">Products</Text>
            <TouchableOpacity
              onPress={() => setShowAddProductModal(true)}
              className="flex-row items-center rounded-xl bg-gray-900 px-4 py-2"
            >
              <Plus size={16} color="white" />
              <Text className="ml-2 font-medium text-white">Add Product</Text>
            </TouchableOpacity>
          </View>

          {debtorProducts.length === 0 ? (
            <View className="items-center rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <Package size={48} color="#9CA3AF" />
              <Text className="mb-2 mt-4 text-center text-gray-500">No products assigned</Text>
              <Text className="text-center text-sm text-gray-400">Add products to track debtor purchases</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {debtorProducts.slice(0, 5).map((product) => (
                <View key={product.id} className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                        <ShoppingCart size={20} color="#6B7280" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">
                          {product.products?.product_name || product.product_name || "Product"}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          Qty: {product.quantity} • {new Date(product.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-lg font-bold text-gray-900">₱{product.total_price.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View className="mx-6 mb-8">
          <Text className="mb-4 text-xl font-bold text-gray-900">Recent Activity</Text>

          {debtorProducts.length === 0 ? (
            <View className="items-center rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <Clock size={48} color="#9CA3AF" />
              <Text className="mt-4 text-center text-gray-500">No activity found</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {debtorProducts.slice(0, 10).map((activity) => (
                <View
                  key={activity.id}
                  className="flex-row items-center rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
                >
                  <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                    <AlertCircle size={20} color="#EF4444" />
                  </View>

                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      Product Purchase: {activity.products?.product_name || activity.product_name || "Product"}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Qty: {activity.quantity} • {new Date(activity.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text className="text-lg font-bold text-red-500">+₱{activity.total_price.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>


      <PartialPaymentModal
       visible={showSettleModal}
        onClose={() => setShowSettleModal(false)}
        totalDebt={debtor.balance}
        debtorId={id!}
        debtor={debtor}
        onPartialPayment={async (amount: number) => {
      
          console.log(`Processing payment of ₱${amount} for debtor ${id}`)
       
          await refetch()
        }}
      />

      {/* Add Product Modal */}
      <Modal
        visible={showAddProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddProductModal(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-200 p-6">
            <Text className="text-xl font-bold text-gray-900">Add Product</Text>
            <TouchableOpacity onPress={() => setShowAddProductModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* Product Selection */}
            <View className="mb-6">
              <Text className="mb-3 font-medium text-gray-700">Select Product</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
                {inventoryItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedInventoryId(item.id)}
                    className={`min-w-[200px] rounded-xl border-2 p-4 ${
                      selectedInventoryId === item.id ? "border-gray-900 bg-gray-50" : "border-gray-300 bg-white"
                    }`}
                  >
                    <Text className="font-medium text-gray-900">{item.name}</Text>
                    <Text className="text-sm text-gray-600">Stock: {item.stock}</Text>
                    <Text className="font-semibold text-gray-900">₱{item.srp?.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedInventory && (
              <>
                {/* Quantity Input */}
                <View className="mb-6">
                  <Text className="mb-3 font-medium text-gray-700">Quantity</Text>
                  <TextInput
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder={`Max: ${selectedInventory.stock}`}
                    placeholderTextColor="#9CA3AF"
                    className="rounded-xl border border-gray-300 bg-white p-4 text-gray-900"
                  />
                </View>

                {/* Custom Price Option */}
                <View className="mb-6">
                  <TouchableOpacity
                    onPress={() => setUseCustomPrice(!useCustomPrice)}
                    className="mb-3 flex-row items-center"
                  >
                    <View
                      className={`mr-3 h-5 w-5 rounded border-2 ${
                        useCustomPrice ? "border-gray-900 bg-gray-900" : "border-gray-300"
                      }`}
                    >
                      {useCustomPrice && <CheckCircle size={12} color="white" />}
                    </View>
                    <Text className="text-gray-700">Use custom price</Text>
                  </TouchableOpacity>

                  {useCustomPrice && (
                    <TextInput
                      value={customPrice}
                      onChangeText={setCustomPrice}
                      keyboardType="numeric"
                      placeholder="Enter custom price"
                      placeholderTextColor="#9CA3AF"
                      className="rounded-xl border border-gray-300 bg-white p-4 text-gray-900"
                    />
                  )}
                </View>

                {/* Price Summary */}
                <View className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <Text className="mb-2 font-medium text-gray-700">Price Summary</Text>
                  <View className="mb-1 flex-row justify-between">
                    <Text className="text-gray-600">Unit Price:</Text>
                    <Text className="text-gray-900">
                      ₱
                      {(useCustomPrice
                        ? Number.parseFloat(customPrice) || 0
                        : (selectedInventory.srp ?? 0)
                      ).toLocaleString()}
                    </Text>
                  </View>
                  <View className="mb-1 flex-row justify-between">
                    <Text className="text-gray-600">Quantity:</Text>
                    <Text className="text-gray-900">{quantity}</Text>
                  </View>
                  <View className="flex-row justify-between border-t border-gray-200 pt-2">
                    <Text className="font-medium text-gray-900">Total:</Text>
                    <Text className="text-lg font-bold text-gray-900">
                      ₱
                      {(
                        (useCustomPrice ? Number.parseFloat(customPrice) || 0 : (selectedInventory?.srp ?? 0)) *
                        Number.parseInt(quantity || "0")
                      ).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowAddProductModal(false)}
                className="flex-1 items-center rounded-xl bg-gray-100 p-4"
              >
                <Text className="font-medium text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddProduct}
                disabled={!selectedInventoryId || loading}
                className={`flex-1 items-center rounded-xl p-4 ${
                  !selectedInventoryId || loading ? "bg-gray-300" : "bg-gray-900"
                }`}
              >
                <Text className={`font-medium ${!selectedInventoryId || loading ? "text-gray-500" : "text-white"}`}>
                  {loading ? "Adding..." : "Add Product"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}
