import React from 'react';
import { View, Text } from 'react-native';
import { TaskStatus } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          textColor: colors.success,
          bgColor: colors.successLight,
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          textColor: colors.primary,
          bgColor: colors.primaryLight,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          textColor: colors.low,
          bgColor: colors.lowLight,
        };
      case 'todo':
      default:
        return {
          label: 'To Do',
          textColor: colors.textSecondary,
          bgColor: colors.surfaceElevated,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={{
        backgroundColor: config.bgColor,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: config.textColor,
          fontSize: 11,
          fontWeight: '600',
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}
