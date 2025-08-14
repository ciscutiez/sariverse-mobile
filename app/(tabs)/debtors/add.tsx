"use client"

import { useState } from "react"
import { View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { Text } from "~/components/nativewindui/Text"
import { useCreateDebtor } from "~/hooks/debtor"

export default function AddDebtorScreen() {
  const createDebtor = useCreateDebtor()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
   
    credit_limit: "",
    balance: "0",
    status: "active" as const,
    is_settled: false,
    payment_history: [],
  })

  const [loading, setLoading] = useState(false)

 const generateUniqueCode = () => {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
};

const handleSubmit = async () => {
  if (!formData.name || !formData.credit_limit) {
    Alert.alert("Error", "Please fill in all required fields");
    return;
  }

  setLoading(true);
  try {
    const result = await createDebtor.mutateAsync({
      ...formData,
      credit_limit: Number.parseFloat(formData.credit_limit),
      balance: Number.parseFloat(formData.balance),
      unique_code: generateUniqueCode(),
      due_date: new Date().toISOString(),
    });

    console.log("Debtor created:", result);
    Alert.alert("Success", "Debtor added successfully", [
      { text: "OK", onPress: () => router.back() },
    ]);
  } catch (error: any) {
    console.error("Failed to add debtor:", error);
    Alert.alert("Error", error.message || "Failed to add debtor");
  } finally {
    setLoading(false);
  }
};


  return (
    <View className="flex-1 bg-white">
      {/* Top Gradient Header */}
      <LinearGradient colors={["#8b5cf6", "#a855f7", "#c084fc"]} className="pt-16 pb-5 px-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1 text-center">Add New Debtor</Text>
          <View className="w-6" />
        </View>
      </LinearGradient>

      {/* Form */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Basic Info */}
          <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-300 shadow-sm">
            <View className="flex-row items-center mb-5">
              <Ionicons name="person" size={20} color="#8b5cf6" />
              <Text className="text-gray-800 text-base font-semibold ml-2">Basic Information</Text>
            </View>

            {/* Customer Name */}
            <View className="mb-5">
              <Text className="text-gray-700 text-sm font-medium mb-2">Customer Name *</Text>
              <TextInput
                className="bg-gray-100 text-gray-900 p-4 rounded-xl text-base"
                placeholder="Enter customer name"
                placeholderTextColor="#9ca3af"
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              />
            </View>

            {/* Email & Phone */}
            <View className="flex-row gap-4 mb-5">
              <View className="flex-1">
                <Text className="text-gray-700 text-sm font-medium mb-2">Email</Text>
                <TextInput
                  className="bg-gray-100 text-gray-900 p-4 rounded-xl text-base"
                  placeholder="customer@example.com"
                  placeholderTextColor="#9ca3af"
                  value={formData.email}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 text-sm font-medium mb-2">Phone</Text>
                <TextInput
                  className="bg-gray-100 text-gray-900 p-4 rounded-xl text-base"
                  placeholder="+63 XXX XXX XXXX"
                  placeholderTextColor="#9ca3af"
                  value={formData.phone}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

        
          </View>

          {/* Credit Info */}
          <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-300 shadow-sm">
            <View className="flex-row items-center mb-5">
              <Ionicons name="card" size={20} color="#8b5cf6" />
              <Text className="text-gray-800 text-base font-semibold ml-2">Credit Information</Text>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-gray-700 text-sm font-medium mb-2">Credit Limit (₱) *</Text>
                <TextInput
                  className="bg-gray-100 text-gray-900 p-4 rounded-xl text-base"
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  value={formData.credit_limit}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, credit_limit: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 text-sm font-medium mb-2">Initial Balance (₱)</Text>
                <TextInput
                  className="bg-gray-100 text-gray-900 p-4 rounded-xl text-base"
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  value={formData.balance}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, balance: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="flex-row gap-3 mb-10">
            <TouchableOpacity
              className="flex-1 bg-red-500 p-4 rounded-xl items-center"
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text className="text-white text-base font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-violet-600 p-4 rounded-xl items-center flex-row justify-center"
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
              <Text className="text-white text-base font-semibold">
                {loading ? "Creating..." : "Create Debtor"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
