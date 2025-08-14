import { Stack } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';

export default function ProductsLayout() {
  const { colors } = useColorScheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Your Products',
        }}
      />
      <Stack.Screen name="add" options={{ headerShown: false }} />
      <Stack.Screen name="[id]/update" options={{ headerShown: false }} />
    </Stack>
  );
}
