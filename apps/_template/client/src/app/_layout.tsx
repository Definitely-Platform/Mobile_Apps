import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#090a0f' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/callback" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
