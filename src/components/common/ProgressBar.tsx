import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export function ProgressBar({
  progress,
  color,
  height = 6,
  showPercentage = false,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(clamped * 100);
  const barColor = color || colors.primary;

  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          width: '100%',
          height,
          backgroundColor: colors.border,
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: barColor,
            borderRadius: height / 2,
          }}
        />
      </View>
      {showPercentage && (
        <Text
          style={{ color: colors.textSecondary }}
          className="text-xs font-medium text-right mt-1"
        >
          {percentage}%
        </Text>
      )}
    </View>
  );
}
