import { Receipt, Tag, Boxes, CreditCard, Cog } from 'lucide-react-native';
import { Tabs, Redirect } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';

import { useAuth } from '~/lib/auth';

export default function TabsLayout() {
  const { colors } = useColorScheme();
  const { session, isLoading } = useAuth();

  // Loading state while checking session
  if (isLoading) return null; 

  // If no session, redirect to sign-in
  if (!session) {
    return <Redirect href="/auth/signin" />;
  }
  return (
    <Tabs
      screenOptions={{
        lazy: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
            animation: 'none',
          tabBarIcon: ({ color, size }) => <Tag size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
            animation: 'none',
          tabBarIcon: ({ color, size }) => <Boxes size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="debtors"
        options={{
          title: 'Debtors',
            animation: 'none',
          tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
            animation: 'none',
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
            animation: 'none',
          tabBarIcon: ({ color, size }) => <Cog size={size} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
