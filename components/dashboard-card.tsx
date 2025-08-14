import { Ionicons } from "@expo/vector-icons"
import { Pressable, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

import { Text } from "~/components/nativewindui/Text"

export interface DashboardCardProps {
  title: string
  value: number
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
}

const cardThemes = {
  Products: {
    gradient: ["#667eea", "#764ba2"] as const,
    iconBg: "rgba(255, 255, 255, 0.2)",
    accent: "#667eea",
  },
  Orders: {
    gradient: ["#f093fb", "#f5576c"] as const,
    iconBg: "rgba(255, 255, 255, 0.2)",
    accent: "#f093fb",
  },
  Debtors: {
    gradient: ["#4facfe", "#00f2fe"] as const,
    iconBg: "rgba(255, 255, 255, 0.2)",
    accent: "#4facfe",
  },
  Inventory: {
    gradient: ["#43e97b", "#38f9d7"] as const,
    iconBg: "rgba(255, 255, 255, 0.2)",
    accent: "#43e97b",
  },
}

export function DashboardCard({ icon, title, value, onPress }: DashboardCardProps) {

  const theme = cardThemes[title as keyof typeof cardThemes] || cardThemes.Products

  return (
    <Pressable
      onPress={onPress}
      className="w-[48%] mb-4 rounded-2xl overflow-hidden shadow-lg"
      style={{
        shadowColor: theme.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5 min-h-[120px] justify-between"
      >
        {/* Top section with icon */}
        <View className="flex-row justify-between items-start">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.iconBg }}
          >
            <Ionicons name={icon} size={24} color="white" />
          </View>

          {/* Decorative accent */}
          <View className="w-2 h-8 rounded-full opacity-30" style={{ backgroundColor: "white" }} />
        </View>

        {/* Bottom section with data */}
        <View>
          <Text className="text-3xl font-bold mb-1" style={{ color: "white" }}>
            {value.toLocaleString()}
          </Text>
          <Text className="text-sm font-medium opacity-90" style={{ color: "white" }}>
            {title}
          </Text>
        </View>

        {/* Subtle background pattern */}
        <View
          className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10"
          style={{ backgroundColor: "white" }}
        />
        <View
          className="absolute -right-8 top-8 w-12 h-12 rounded-full opacity-5"
          style={{ backgroundColor: "white" }}
        />
      </LinearGradient>
    </Pressable>
  )
}
