import '../global.css';
import 'expo-dev-client';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Icon } from '@roninoss/icons';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Link,  Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { cn } from '~/lib/cn';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
// import { useAuth } from '~/lib/auth';
// import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';
import { AppProviders } from '~/lib/query-client';

import { SafeAreaProvider } from 'react-native-safe-area-context';


export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
// const { session, isLoading } = useAuth();

//   if (isLoading) return null; 

//   if (!session) return <Redirect href="/auth/signin" />;


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <BottomSheetModalProvider>
            <ActionSheetProvider>
              <NavThemeProvider value={NAV_THEME[colorScheme]}>
                <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
                {/* <AuthGate> */}
                <Stack screenOptions={SCREEN_OPTIONS}>
                  {/* <Stack.Screen name="index" options={INDEX_OPTIONS} /> */}
                  {/* <Stack.Screen name="modal" options={MODAL_OPTIONS} /> */}
                  <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name='transactions' options={{ headerShown: false }} />
                    <Stack.Screen name='analytics' options={{ headerShown: false }} />
                    <Stack.Screen name='profile' options={{ headerShown: false}} />
                    {/* <Stack.Screen name='settings' options={{headerShown: false}} />  */}
                </Stack>
                {/* </AuthGate> */}
              </NavThemeProvider>
            </ActionSheetProvider>
          </BottomSheetModalProvider>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// This component handles the session check + redirect
// function AuthGate({ children }: { children: React.ReactNode }) {
//   const { session, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (!session) {
//     return <Redirect href="/auth/signin" />;
//   }

//   return <>{children}</>;
// }

const SCREEN_OPTIONS = {
  animation: 'ios_from_right',
} as const;

const INDEX_OPTIONS = {
  headerLargeTitle: true,
  title: 'Dashboard',
  headerRight: () => <SettingsIcon />,
} as const;

function SettingsIcon() {
  const { colors } = useColorScheme();
  return (
    <Link href="/settings" asChild>
      <Pressable className="opacity-80">
        {({ pressed }) => (
          <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
            <Icon name="cog-outline" color={colors.foreground} />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const MODAL_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom',
  title: 'Settings',
  // headerRight: () => <ThemeToggle />,
} as const;
