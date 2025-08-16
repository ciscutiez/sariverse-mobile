import { Stack, Redirect } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { useAuth } from '~/lib/auth';

export default function ProductsLayout() {
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
          headerShown: false,
          title: 'Your Products',
        }}
      />
      <Stack.Screen name="add" options={{ headerShown: false }} />
      <Stack.Screen name="[id]/update" options={{ headerShown: false }} />
    </Stack>
  );
}
