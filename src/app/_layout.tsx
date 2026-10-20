import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { initDatabase } from '@/db/database';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { SplashScreenView } from '@/components/SplashScreenView';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { isDark, colors } = useTheme();
  const { userProfile, isLoading } = useSettingsStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isSplash = segments[0] === 'splash';
    const isOnboarding = segments[0] === 'onboarding';

    // If user is logged out and not on an allowed screen, redirect to login
    if (!userProfile && !inAuthGroup && !isSplash && !isOnboarding) {
      router.replace('/(auth)/login');
    }
  }, [userProfile, isLoading, segments, router]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="task/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="task/create"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="project/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="analytics" options={{ headerShown: false }} />
        <Stack.Screen name="focus" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        await useSettingsStore.getState().loadSettings();
        await useTaskStore.getState().loadTasks();
        await useProjectStore.getState().loadProjects();
      } catch (err) {
        console.warn('Initialization error:', err);
      } finally {
        setIsReady(true);
        // Hide native splash screen now so custom animated splash takes over smoothly
        await SplashScreen.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        {(!isReady || !splashFinished) && (
          <SplashScreenView
            onFinish={() => {
              setSplashFinished(true);
            }}
            minDurationMs={1500}
            showSkipButton={true}
          />
        )}
        {isReady && <RootNavigator />}
      </ToastProvider>
    </ThemeProvider>
  );
}
