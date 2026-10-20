import React from 'react';
import { useRouter } from 'expo-router';
import { SplashScreenView } from '@/components/SplashScreenView';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function SplashScreenRoute() {
  const router = useRouter();
  const { userProfile } = useSettingsStore();

  const handleFinish = () => {
    if (userProfile) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  };

  return <SplashScreenView onFinish={handleFinish} showSkipButton={true} />;
}
