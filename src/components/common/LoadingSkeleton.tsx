import React, { useEffect, useMemo } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
}: LoadingSkeletonProps) {
  const { colors } = useTheme();
  const opacityAnim = useMemo(() => new Animated.Value(0.4), []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity: opacityAnim,
        },
      ]}
      className={className}
    />
  );
}

export function TaskListSkeleton() {
  return (
    <View className="gap-3 py-2">
      <LoadingSkeleton height={68} borderRadius={16} />
      <LoadingSkeleton height={68} borderRadius={16} />
      <LoadingSkeleton height={68} borderRadius={16} />
    </View>
  );
}
