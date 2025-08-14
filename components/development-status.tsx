import { View, Text } from 'react-native'

import { Wrench } from 'lucide-react-native'

export default function DevelopmentStatus() {
  return (
      <View className="mt-8 bg-purple-50 rounded-2xl p-4 w-full max-w-sm">
          <View className="flex-row items-center justify-center">
            <Wrench size={16} color="#8B5CF6" />
            <Text className="text-purple-700 font-medium text-sm ml-2">In Development</Text>
          </View>
          <Text className="text-purple-600 text-xs text-center mt-1">Expected release in the next update</Text>
        </View>
 
  ) 
}