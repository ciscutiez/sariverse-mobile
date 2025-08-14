import { Pressable } from "react-native"
import { X } from "lucide-react-native"
import { Text } from "~/components/nativewindui/Text"

interface FilterChipProps {
  label: string
  isSelected: boolean
  onPress: () => void
  onRemove?: () => void
}

export function FilterChip({ label, isSelected, onPress, onRemove }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-full border px-3 py-2 ${
        isSelected ? "border-violet-500 bg-violet-100" : "border-gray-300 bg-white"
      }`}
    >
      <Text className={`text-sm font-medium ${isSelected ? "text-violet-700" : "text-gray-700"}`}>{label}</Text>
      {isSelected && onRemove && (
        <Pressable onPress={onRemove} className="ml-2">
          <X size={14} color="#6d28d9" />
        </Pressable>
      )}
    </Pressable>
  )
}
