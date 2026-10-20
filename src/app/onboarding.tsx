import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  Flame,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react-native';

import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTheme } from '@/theme/ThemeContext';

const SLIDES = [
  {
    icon: CheckCircle2,
    color: '#6366F1',
    title: 'Focus on What Matters',
    description:
      'Manage daily goals, projects, and deadlines with an elegant, clutter-free utility inspired by Things 3 and Linear.',
  },
  {
    icon: Flame,
    color: '#F59E0B',
    title: 'Build Daily Momentum',
    description:
      'Track your progress with subtle completion rings, Pomodoro focus sessions, and insightful productivity analytics.',
  },
  {
    icon: ShieldCheck,
    color: '#10B981',
    title: 'Private & Local-First',
    description:
      'Your tasks and personal records stay safely on your device with high-performance encrypted SQLite storage.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { setOnboardingCompleted } = useSettingsStore();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFinish = async () => {
    await setOnboardingCompleted();
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleFinish();
    }
  };

  const currentSlide = SLIDES[currentIndex];
  const IconComponent = currentSlide.icon;

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1 justify-between p-6"
    >
      {/* Top Bar: Skip button */}
      <View className="flex-row justify-end">
        {currentIndex < SLIDES.length - 1 ? (
          <Pressable onPress={handleFinish} hitSlop={10} className="py-2 px-3">
            <Text
              style={{ color: colors.textSecondary }}
              className="text-xs font-semibold uppercase tracking-wider"
            >
              Skip
            </Text>
          </Pressable>
        ) : (
          <View className="h-8" />
        )}
      </View>

      {/* Main Slide Content */}
      <View className="items-center px-4">
        <View
          style={{ backgroundColor: `${currentSlide.color}15` }}
          className="w-28 h-28 rounded-3xl items-center justify-center mb-8"
        >
          <IconComponent
            size={56}
            color={currentSlide.color}
            strokeWidth={2.2}
          />
        </View>

        <Text
          style={{ color: colors.textPrimary }}
          className="text-2xl font-black text-center tracking-tight mb-3"
        >
          {currentSlide.title}
        </Text>

        <Text
          style={{ color: colors.textSecondary }}
          className="text-sm text-center leading-6 max-w-[300px]"
        >
          {currentSlide.description}
        </Text>

        {/* Indicators */}
        <View className="flex-row gap-2 mt-8">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={{
                backgroundColor:
                  currentIndex === index ? colors.primary : colors.border,
                width: currentIndex === index ? 24 : 8,
              }}
              className="h-2 rounded-full transition-all"
            />
          ))}
        </View>
      </View>

      {/* Bottom Action Button */}
      <View className="pb-4">
        <Pressable
          onPress={handleNext}
          style={{ backgroundColor: colors.primary }}
          className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel={
            currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next slide'
          }
        >
          <Text className="text-white text-base font-bold">
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
