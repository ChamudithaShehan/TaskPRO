import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  onBack,
}: AppHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
      }}
      className="px-4 py-3 border-b flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1 gap-2">
        {showBack && (
          <Pressable
            hitSlop={10}
            onPress={handleBack}
            className="w-9 h-9 rounded-full items-center justify-center -ml-1 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
        )}

        <View className="flex-1">
          <Text
            numberOfLines={1}
            style={{ color: colors.textPrimary }}
            className="text-lg font-bold tracking-tight"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              numberOfLines={1}
              style={{ color: colors.textSecondary }}
              className="text-xs font-medium"
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightAction && <View className="flex-row items-center">{rightAction}</View>}
    </View>
  );
}
