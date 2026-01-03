import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@shopify/restyle';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { QueryProvider } from '@/contexts/QueryProvider';
import { TimeProvider } from '@/contexts/TimeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import theme from '@/theme/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <TimeProvider>
          <ToastProvider>
            <ThemeProvider theme={theme}>
              <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack
                  screenOptions={{
                    headerBackTitleVisible: false, // Hide "tabs" or previous screen name
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
          </ToastProvider>
        </TimeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
