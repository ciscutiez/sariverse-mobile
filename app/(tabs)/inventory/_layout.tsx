import { Stack } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';

export default function InventoryLayout() {
  const { colors } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Inventory',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Item',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Item Details',
        }}
      />
    </Stack>
  );
}
