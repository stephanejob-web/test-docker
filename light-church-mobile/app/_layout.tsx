import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@shopify/restyle';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAxiosInterceptor } from '@/hooks/useAxiosInterceptor';
import { QueryProvider } from '@/contexts/QueryProvider';
import { TimeProvider } from '@/contexts/TimeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import theme from '@/theme/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const colorScheme = useColorScheme();

  // Configure axios interceptors with toast context
  useAxiosInterceptor();

  return (
    <ThemeProvider theme={theme}>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerTintColor: '#4285F4', // Google Blue for back arrow
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <TimeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </TimeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
