import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Easing,
  Pressable,
} from 'react-native';
import { ShieldCheck, Database } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';

interface SplashScreenViewProps {
  onFinish?: () => void;
  minDurationMs?: number;
  showSkipButton?: boolean;
}

export function SplashScreenView({
  onFinish,
  minDurationMs = 1600,
  showSkipButton = false,
}: SplashScreenViewProps) {
  const { isDark, colors } = useTheme();

  // Animations initialized safely with lazy state for React 19
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.82));
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [rippleScale] = useState(() => new Animated.Value(1));
  const [rippleOpacity] = useState(() => new Animated.Value(0.6));
  const [progressAnim] = useState(() => new Animated.Value(0));
  const [exitFade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Ripple / Radar ring animation loop
    const rippleLoop = Animated.loop(
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 1.85,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    rippleLoop.start();

    // 3. Subtle logo breathing
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 4. Progress bar loader
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: minDurationMs - 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // 5. Exit sequence
    const timer = setTimeout(() => {
      Animated.timing(exitFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        rippleLoop.stop();
        pulseLoop.stop();
        if (onFinish) {
          onFinish();
        }
      });
    }, minDurationMs);

    return () => {
      clearTimeout(timer);
      rippleLoop.stop();
      pulseLoop.stop();
    };
  }, [
    exitFade,
    fadeAnim,
    minDurationMs,
    onFinish,
    progressAnim,
    pulseAnim,
    rippleOpacity,
    rippleScale,
    scaleAnim,
  ]);

  const handleSkip = () => {
    Animated.timing(exitFade, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const bgColor = isDark ? '#0A0D18' : '#F8F9FC';
  const cardBg = isDark ? '#151926' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const primaryColor = isDark ? '#5D5FEF' : '#4338CA';
  const ringBorderColor = isDark ? 'rgba(93, 95, 239, 0.25)' : 'rgba(67, 56, 202, 0.15)';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, opacity: exitFade },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated concentric halo/ripple */}
        <View style={styles.haloContainer}>
          <Animated.View
            style={[
              styles.rippleRing,
              {
                borderColor: primaryColor,
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
              },
            ]}
          />
          <View
            style={[
              styles.innerGlow,
              {
                borderColor: ringBorderColor,
                backgroundColor: isDark
                  ? 'rgba(93, 95, 239, 0.08)'
                  : 'rgba(67, 56, 202, 0.05)',
              },
            ]}
          />

          {/* Logo Emblem */}
          <Animated.View
            style={[
              styles.emblemBox,
              {
                backgroundColor: primaryColor,
                transform: [{ scale: pulseAnim }],
                shadowColor: primaryColor,
              },
            ]}
          >
            <ShieldCheck size={56} color="#FFFFFF" strokeWidth={2.4} />
          </Animated.View>
        </View>

        {/* Brand Name & PRO Pill */}
        <View style={styles.brandRow}>
          <Text style={[styles.brandTitle, { color: textColor }]}>Task</Text>
          <View style={[styles.proBadge, { backgroundColor: primaryColor }]}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>

        {/* Tagline */}
        <Text style={[styles.tagline, { color: subtextColor }]}>
          Master Your Day • Effortless Task Flow
        </Text>

        {/* Elegant Progress Track */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                  backgroundColor: primaryColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Local Privacy & Engine Badge */}
        <View
          style={[
            styles.badgeCard,
            {
              backgroundColor: cardBg,
              borderColor: isDark ? '#232B3E' : '#E2E8F0',
            },
          ]}
        >
          <Database size={13} color={colors.success} strokeWidth={2.2} />
          <Text style={[styles.badgeText, { color: subtextColor }]}>
            Offline-First SQLite Engine • 100% Private
          </Text>
        </View>
      </Animated.View>

      {/* Footer Meta */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: subtextColor }]}>
          Version 1.0.0
        </Text>

        {showSkipButton && (
          <Pressable
            onPress={handleSkip}
            style={styles.skipButton}
            hitSlop={12}
          >
            <Text style={[styles.skipButtonText, { color: primaryColor }]}>
              Skip
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  haloContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  rippleRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
  },
  innerGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
  },
  emblemBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  proBadge: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'center',
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 220,
    marginBottom: 24,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  skipButton: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
