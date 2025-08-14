"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Clock,  Sparkles, ArrowLeft } from "lucide-react-native"
import { useRouter } from "expo-router"
import DevelopmentStatus from "~/components/development-status"

export default function Transactions() {
  const router = useRouter()

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header */}
      <LinearGradient
        colors={["#8B5CF6", "#A855F7", "#C084FC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-16 pb-8"
      >
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">Transactions</Text>
            <Text className="text-white/80 text-sm mt-1">Track your financial activity</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Coming Soon Content */}
      <View className="flex-1 justify-center items-center px-6 py-12">
        <View className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 w-full max-w-sm">
          {/* Icon */}
          <View className="items-center mb-6">
            <View className="bg-purple-100 rounded-full p-4 mb-4">
              <Clock size={32} color="#8B5CF6" />
            </View>
            <View className="flex-row items-center">
              <Sparkles size={16} color="#A855F7" />
              <Text className="text-purple-600 font-semibold text-sm mx-2">COMING SOON</Text>
              <Sparkles size={16} color="#A855F7" />
            </View>
          </View>

          {/* Content */}
          <View className="items-center">
            <Text className="text-gray-900 text-xl font-bold text-center mb-3">Transactions Feature</Text>
            <Text className="text-gray-600 text-center text-sm leading-relaxed mb-6">
         {`     We're`} working hard to bring you comprehensive transaction tracking and financial insights. This feature
              will be available soon!
            </Text>

            {/* Features List */}
            <View className="w-full space-y-3">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-purple-400 rounded-full mr-3" />
                <Text className="text-gray-700 text-sm">Transaction history</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-purple-400 rounded-full mr-3" />
                <Text className="text-gray-700 text-sm">Financial analytics</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-purple-400 rounded-full mr-3" />
                <Text className="text-gray-700 text-sm">Payment tracking</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Development Status */}
      <DevelopmentStatus />
      </View>
    </ScrollView>
  )
}
