import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: colors.surfaceElevated,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 16,
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 12,
          textAlign: 'center',
          lineHeight: 18,
          maxWidth: 260,
          marginBottom: 16,
        }}
      >
        {description}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 12,
          }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
