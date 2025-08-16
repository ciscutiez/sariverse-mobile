import { Redirect, Stack } from 'expo-router';
import { useAuth } from '~/lib/auth';
import { useColorScheme } from '~/lib/useColorScheme';

export default function InventoryLayout() {
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
          title: 'Manage your inventory',
          headerShown: false
        }}
      />
    
  
       <Stack.Screen
        name="update"
        options={{
          headerShown: false,
          title: 'Your Products',
        }}
      />
    </Stack>
  );
}
