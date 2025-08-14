"use client"
import { View, ScrollView, TouchableOpacity } from "react-native"
import { Text } from "~/components/nativewindui/Text"
import { ArrowLeft, BarChart3, TrendingUp, PieChart, Calendar, Target } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import DevelopmentStatus from "~/components/development-status"

export default function AnalyticsScreen() {
  const router = useRouter()

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header */}
      <LinearGradient
        colors={["#8B5CF6", "#A855F7", "#C084FC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-12 pb-8"
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Analytics</Text>
          <View className="w-10" />
        </View>
      </LinearGradient>

      {/* Coming Soon Content */}
      <View className="flex-1 items-center justify-center px-6 py-12">
        <View className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 w-full max-w-sm">
          {/* Icon */}
          <View className="items-center mb-6">
            <LinearGradient
              colors={["#8B5CF6", "#A855F7"]}
              className="w-20 h-20 rounded-full items-center justify-center"
            >
              <BarChart3 size={32} color="white" />
            </LinearGradient>
          </View>

          {/* Main Message */}
          <Text className="text-2xl font-bold text-gray-900 text-center mb-3">Analytics Coming Soon</Text>
          <Text className="text-gray-600 text-center mb-8 leading-relaxed">
          {`  We're `}building powerful analytics to help you understand your business better.
          </Text>

          {/* Features Preview */}
          <View className="space-y-4 mb-8">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                <TrendingUp size={16} color="#8B5CF6" />
              </View>
              <Text className="text-gray-700 flex-1">Sales trends & insights</Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                <PieChart size={16} color="#8B5CF6" />
              </View>
              <Text className="text-gray-700 flex-1">Product performance</Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Calendar size={16} color="#8B5CF6" />
              </View>
              <Text className="text-gray-700 flex-1">Revenue forecasting</Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Target size={16} color="#8B5CF6" />
              </View>
              <Text className="text-gray-700 flex-1">Goal tracking</Text>
            </View>
          </View>

          {/* Status */}
        <DevelopmentStatus />
        </View>
      </View>
    </ScrollView>
  )
}
