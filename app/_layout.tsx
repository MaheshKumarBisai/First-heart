import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync, savePushToken } from '../config/notifications';

export default function RootLayout() {
  useEffect(() => {
    async function setupNotifications() {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await savePushToken(token);
        }
      } catch (e) {
        console.log('Mobile notification setup error:', e);
      }
    }
    setupNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
      </Stack>
    </SafeAreaProvider>
  );
}
