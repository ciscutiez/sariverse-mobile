import { Stack } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';


export default function DebtorsLayout() {
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
          title: 'Debtors',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Debtor',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]/[slug]"
        options={({ route }) => ({
          title: route.params?.slug?.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Debtor Details',
        })}
      />
      <Stack.Screen
        name="[id]/[slug]/add-product"
        options={{
          title: 'Add Product',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]/[slug]/edit"
        options={{
          title: 'Edit Debtor',
        }}
      />
    </Stack>
  );
}
