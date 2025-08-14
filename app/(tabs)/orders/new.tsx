"use client"

import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, TouchableOpacity } from "react-native"
import { useState } from "react"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { User, XCircle, ArrowLeft, Plus, ShoppingBag, Trash2, Package, ChevronDown } from "lucide-react-native"
import { Text } from "~/components/nativewindui/Text"
import { Button } from "~/components/nativewindui/Button"
import { useCreateOrder } from "~/hooks/order"
import { useGetInventory } from "~/hooks/inventory"
import { Input } from "~/components/Input"

interface OrderItem {
  product_id: number
  quantity: number
  price: number
  name?: string
  stock?: number
}

interface NewOrder {
  customer_name: string
  items: OrderItem[]
}

export default function NewOrderScreen() {
  const router = useRouter()
  const createOrder = useCreateOrder()
  const { data: inventory = [] } = useGetInventory()

  const [newOrder, setNewOrder] = useState<NewOrder>({
    customer_name: "",
    items: [{ product_id: 0, quantity: 1, price: 0 }],
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(0)

  // Filter inventory to only show items that are in stock
  const availableInventory = inventory.filter(
    (item) => item.stock > 0 && item.status !== "out_of_stock" && item.product_id,
  )

  const addItemToOrder = () => {
    setNewOrder((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: 0, quantity: 1, price: 0 }],
    }))
  }

  const removeItemFromOrder = (index: number) => {
    if (newOrder.items.length > 1) {
      setNewOrder((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }))
    }
  }

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    setNewOrder((prev) => {
      const updatedItems = [...prev.items]
      if (field === "product_id") {
        const selectedInventory = availableInventory.find((inv) => inv.product_id === Number(value))
        updatedItems[index] = {
          ...updatedItems[index],
          product_id: Number(value),
          price: selectedInventory?.srp || selectedInventory?.price || 0,
          name: selectedInventory?.name,
          stock: selectedInventory?.stock,
        }
      } else {
        updatedItems[index] = { ...updatedItems[index], [field]: value }
      }
      return { ...prev, items: updatedItems }
    })
  }

  const calculateTotal = () => {
    return newOrder.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!newOrder.customer_name.trim()) {
      errors.customer_name = "Customer name is required"
    }

    if (newOrder.items.length === 0) {
      errors.items = "At least one item is required"
    }

    newOrder.items.forEach((item, index) => {
      if (!item.product_id) {
        errors[`items.${index}.product_id`] = "Product is required"
      }
      if (item.quantity < 1) {
        errors[`items.${index}.quantity`] = "Quantity must be at least 1"
      }
      const selectedInventory = availableInventory.find((inv) => inv.product_id === item.product_id)
      if (selectedInventory && item.quantity > selectedInventory.stock) {
        errors[`items.${index}.quantity`] = `Only ${selectedInventory.stock} available`
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors before submitting.")
      return
    }

    try {
      // Create order with items
      await createOrder.mutateAsync({
        customer_name: newOrder.customer_name,
        status: "pending", // hardcoded to pending as default
        items: newOrder.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      })
      router.push("/orders" as any)
    } catch (error: any) {
      Alert.alert("Error", error.message)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <LinearGradient
        colors={["#8B5CF6", "#A855F7", "#C084FC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-16 pb-8"
      >
        <View className="flex-row items-center justify-between mb-6">
          <Button
            variant="secondary"
            className="bg-white/20 border-0 rounded-full w-10 h-10 p-0"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="white" />
          </Button>

          <View className="flex-1 items-center">
            <Text className="text-white text-xl font-bold">New Order</Text>
            <Text className="text-purple-100 text-sm">Create a new customer order</Text>
          </View>

          <View className="w-10" />
        </View>

        <View className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="bg-white/20 rounded-full p-3">
                <ShoppingBag size={20} color="white" />
              </View>
              <View>
                <Text className="text-white font-semibold">Order Total</Text>
                <Text className="text-purple-100 text-sm">{newOrder.items.length} items</Text>
              </View>
            </View>
            <Text className="text-white text-xl font-bold">{formatCurrency(calculateTotal())}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 -mt-4">
        <View className="bg-white rounded-t-3xl min-h-full">
          <View className="p-6 space-y-8">
            {/* Customer Information */}
            <View className="space-y-6">
              <View className="flex-row items-center gap-3 mb-4">
                <LinearGradient colors={["#8B5CF6", "#A855F7"]} className="rounded-full p-2">
                  <User size={16} color="white" />
                </LinearGradient>
                <Text className="text-gray-900 text-lg font-bold">Customer Information</Text>
              </View>

              <View className="bg-gray-50 rounded-2xl  p-5">
                <Input
                style={[{ color: 'black' }]}
                  label="Customer Name *"
                  placeholder="Enter customer name"
                  value={newOrder.customer_name}
                  onChangeText={(value) => setNewOrder((prev) => ({ ...prev, customer_name: value }))}
                  className={`bg-white  ${validationErrors.customer_name ? "border-red-500" : ""}`}
                />
                {validationErrors.customer_name && (
                  <Text className="text-red-500 text-sm mt-2">{validationErrors.customer_name}</Text>
                )}
              </View>
            </View>

            {/* Order Items */}
            <View className="space-y-6 pt-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <LinearGradient colors={["#10B981", "#059669"]} className="rounded-full p-2">
                    <Package size={16} color="white" />
                  </LinearGradient>
                  <Text className="text-gray-900 text-lg font-bold">Order Items *</Text>
                </View>
                <Button
                  variant="secondary"
                  className="bg-blue-50 border-blue-200 rounded-full px-4 py-2"
                  onPress={addItemToOrder}
                >
                  <View className="flex-row items-center gap-1">
                    <Plus size={14} color="#3B82F6" />
                    <Text className="text-blue-600 text-sm font-medium">Add Item</Text>
                  </View>
                </Button>
              </View>

              {validationErrors.items && <Text className="text-red-500 text-sm mb-2">{validationErrors.items}</Text>}

              <View className="space-y-4">
                {newOrder.items.map((item, index) => {
                  const selectedInventory = availableInventory.find((inv) => inv.product_id === item.product_id)

                  return (
                    <View key={index} className="bg-gray-50 rounded-2xl p-5 space-y-4">
                      {/* Product Selection */}
                      <View>
                        <Text className="text-gray-700 text-sm font-medium mb-3">Product *</Text>
                        <TouchableOpacity
                          className={`bg-white rounded-xl p-4 border ${
                            validationErrors[`items.${index}.product_id`] ? "border-red-500" : "border-gray-200"
                          }`}
                          onPress={() => {
                            setSelectedItemIndex(index)
                            setShowProductModal(true)
                          }}
                        >
                          <View className="flex-row items-center justify-between">
                            <Text className={selectedInventory ? "text-gray-900" : "text-gray-400"}>
                              {selectedInventory ? selectedInventory.name : "Select product"}
                            </Text>
                            <ChevronDown size={16} color="#6B7280" />
                          </View>
                          {selectedInventory && (
                            <Text className="text-gray-500 text-xs mt-2">
                              Stock: {selectedInventory.stock} |{" "}
                              {formatCurrency(selectedInventory.srp || selectedInventory.price || 0)}
                            </Text>
                          )}
                        </TouchableOpacity>
                        {validationErrors[`items.${index}.product_id`] && (
                          <Text className="text-red-500 text-xs mt-2">
                            {validationErrors[`items.${index}.product_id`]}
                          </Text>
                        )}
                      </View>

                      {/* Quantity/Total Row */}
                      <View className="flex-row gap-4">
                        {/* Quantity */}
                        <View className="flex-1">
                          <Text className="text-gray-700 text-sm font-medium mb-3">Quantity *</Text>
                          <Input
                          style={[{ color: 'black' }]}
                            placeholder="1"
                            keyboardType="numeric"
                            value={item.quantity.toString()}
                            onChangeText={(value) => handleItemChange(index, "quantity", Number(value) || 1)}
                            className={`bg-gray-100 rounded-xl p-4 border text-black border-gray-200 ${validationErrors[`items.${index}.quantity`] ? "border-red-500" : ""}`}
                          />
                          {validationErrors[`items.${index}.quantity`] && (
                            <Text className="text-red-500 text-xs mt-2">
                              {validationErrors[`items.${index}.quantity`]}
                            </Text>
                          )}
                        </View>

                        {/* Total */}
                        <View className="flex-1">
                          <Text className="text-gray-700 text-sm font-medium mb-3">Total</Text>
                          <View className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                            <Text className="text-gray-900 font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </Text>
                          </View>
                        </View>

                        {/* Remove Button */}
                        <View className="justify-end">
                          <Button
                            variant="secondary"
                            className="bg-red-50 border-red-200 rounded-xl w-12 h-12 p-0"
                            onPress={() => removeItemFromOrder(index)}
                            disabled={newOrder.items.length === 1}
                          >
                            <Trash2 size={16} color={newOrder.items.length === 1 ? "#9CA3AF" : "#EF4444"} />
                          </Button>
                        </View>
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>

            {/* Submit Button */}
            <View className="pt-8">
              <LinearGradient
                colors={["#8B5CF6", "#A855F7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl"
              >
                <Button
                  variant="primary"
                  className="bg-transparent border-0 py-4"
                  onPress={handleSubmit}
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? (
                    <View className="flex-row items-center gap-2">
                      <View className="animate-spin">
                        <Plus size={16} color="white" />
                      </View>
                      <Text className="text-white font-semibold">Creating Order...</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Plus size={16} color="white" />
                      <Text className="text-white font-semibold text-lg">
                        Create Order - {formatCurrency(calculateTotal())}
                      </Text>
                    </View>
                  )}
                </Button>
              </LinearGradient>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Product Selection Modal */}
      <Modal visible={showProductModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="px-6 pt-16 pb-6 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">Select Product</Text>
              <Button
                variant="secondary"
                className="bg-gray-100 border-0 rounded-full w-8 h-8 p-0"
                onPress={() => setShowProductModal(false)}
              >
                <XCircle size={16} color="#6B7280" />
              </Button>
            </View>
          </View>

          <ScrollView className="flex-1 p-6 ">
            <View className="space-y-4 gap-4">
              {availableInventory.map((inventoryItem) => (
                <TouchableOpacity
                  key={inventoryItem.id}
                  className="bg-gray-50 rounded-2xl p-5 border border-gray-200"
                  onPress={() => {
                    handleItemChange(selectedItemIndex, "product_id", inventoryItem.product_id ?? 0)
                    setShowProductModal(false)
                  }}
                >
                  <View className="space-y-3">
                    <Text className="text-gray-900 font-semibold">{inventoryItem.name}</Text>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">Stock: {inventoryItem.stock}</Text>
                      <Text className="text-gray-900 font-medium">
                        {formatCurrency(inventoryItem.srp || inventoryItem.price || 0)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}
