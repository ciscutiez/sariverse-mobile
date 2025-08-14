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
      {/* Debtors list */}
      <Stack.Screen
        name="index"
        options={{
          title: 'Debtors',
          headerShown: false
        }}
      />

      {/* Dynamic debtor details */}
      <Stack.Screen
        name="[id]/index"
        options={{
          title: 'Debtor Details',
          headerShown: false,
        }}
      />

      {/* Add debtor record */}
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Record',
          headerShown: false,
        }}
      />

      {/* Update debtor record */}
      <Stack.Screen
        name="[id]/update"
        options={{
          title: 'Update Record',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
