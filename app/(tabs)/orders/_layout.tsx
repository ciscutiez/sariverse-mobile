import { Stack, Redirect } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { useAuth } from '~/lib/auth'; 

export default function OrdersLayout() {
  const { colors } = useColorScheme();
  const { session, isLoading } = useAuth();

  if (isLoading) return null; 

  if (!session) {
    return <Redirect href="/auth/signin" />;
  }

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
          title: 'Orders',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Order',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
