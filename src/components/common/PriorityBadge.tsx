import React from 'react';
import { View, Text } from 'react-native';
import { TaskPriority } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

interface PriorityBadgeProps {
  priority: TaskPriority;
  showDotOnly?: boolean;
  variant?: 'standard' | 'short' | 'banner';
}

export function PriorityBadge({
  priority,
  showDotOnly = false,
  variant = 'standard',
}: PriorityBadgeProps) {
  const { colors, isDark } = useTheme();

  const getPriorityConfig = () => {
    switch (priority) {
      case 'urgent':
        return {
          shortCode: 'P1',
          label: 'Urgent',
          bannerLabel: 'URGENT PRIORITY',
          dotColor: colors.urgent,
          textColor: '#EF4444',
          bgColor: isDark ? '#38161A' : '#FEE2E2',
          borderColor: isDark ? '#591C24' : '#FECACA',
        };
      case 'high':
        return {
          shortCode: 'P2',
          label: 'High',
          bannerLabel: 'HIGH PRIORITY',
          dotColor: colors.high,
          textColor: isDark ? '#F59E0B' : '#D97706',
          bgColor: isDark ? '#35230D' : '#FEF3C7',
          borderColor: isDark ? '#5A3A10' : '#FDE68A',
        };
      case 'medium':
        return {
          shortCode: 'P3',
          label: 'Med',
          bannerLabel: 'MEDIUM PRIORITY',
          dotColor: colors.medium,
          textColor: isDark ? '#60A5FA' : '#2563EB',
          bgColor: isDark ? '#152542' : '#EFF6FF',
          borderColor: isDark ? '#1E3A8A' : '#BFDBFE',
        };
      case 'low':
      default:
        return {
          shortCode: 'P4',
          label: 'Low',
          bannerLabel: 'LOW PRIORITY',
          dotColor: colors.low,
          textColor: '#6B7280',
          bgColor: isDark ? '#1F2937' : '#F3F4F6',
          borderColor: isDark ? '#374151' : '#E5E7EB',
        };
    }
  };

  const config = getPriorityConfig();

  if (showDotOnly) {
    return (
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: config.dotColor,
        }}
      />
    );
  }

  if (variant === 'short') {
    return (
      <View
        style={{
          paddingHorizontal: 7,
          paddingVertical: 2,
          borderRadius: 6,
          backgroundColor: config.bgColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: config.textColor,
            fontSize: 11,
            fontWeight: '700',
          }}
        >
          {config.shortCode}
        </Text>
      </View>
    );
  }

  if (variant === 'banner') {
    return (
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 8,
          backgroundColor: config.bgColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: config.textColor,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.5,
          }}
        >
          {config.bannerLabel}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: config.dotColor,
        }}
      />
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
