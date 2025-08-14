import type React from "react"
import { View, Pressable } from "react-native"
import { Plus } from "lucide-react-native"
import { Text } from "~/components/nativewindui/Text"

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  message?: string
  actionText?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title = "No data found",
  message = "There's nothing to show here yet.",
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="items-center space-y-4">
        {icon && <View className="rounded-full bg-gray-100 p-4">{icon}</View>}

        <View className="items-center space-y-2">
          <Text className="text-center text-lg font-semibold text-gray-900">{title}</Text>
          <Text className="text-center text-sm text-gray-600 leading-relaxed">{message}</Text>
        </View>

        {actionText && onAction && (
          <Pressable
            onPress={onAction}
            className="mt-4 flex-row items-center space-x-2 rounded-lg bg-violet-600 px-6 py-3"
          >
            <Plus size={16} color="white" />
            <Text className="font-medium text-white">{actionText}</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
