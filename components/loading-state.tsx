import { View, ActivityIndicator } from "react-native"
import { Text } from "~/components/nativewindui/Text"

interface LoadingStateProps {
  message?: string
  size?: "small" | "large"
}

export default function LoadingState({ message = "Loading...", size = "large" }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <ActivityIndicator size={size} color="#8B5CF6" className="mb-4" />
      <Text className="text-center text-gray-600">{message}</Text>
    </View>
  )
}
