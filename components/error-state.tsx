import { View, Pressable } from "react-native"
import { AlertCircle, RefreshCw } from "lucide-react-native"
import { Text } from "~/components/nativewindui/Text"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We encountered an error while loading your data. Please try again.",
  onRetry,
  retryText = "Try Again",
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="items-center space-y-4">
        <View className="rounded-full bg-red-100 p-4">
          <AlertCircle size={48} color="#EF4444" />
        </View>

        <View className="items-center space-y-2">
          <Text className="text-center text-lg font-semibold text-gray-900">{title}</Text>
          <Text className="text-center text-sm text-gray-600 leading-relaxed">{message}</Text>
        </View>

        {onRetry && (
          <Pressable
            onPress={onRetry}
            className="mt-4 flex-row items-center space-x-2 rounded-lg bg-violet-600 px-6 py-3"
          >
            <RefreshCw size={16} color="white" />
            <Text className="font-medium text-white">{retryText}</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
