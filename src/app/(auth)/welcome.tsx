import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { loginDemo } = useSettingsStore();

  const handleDemoMode = async () => {
    await loginDemo();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingVertical: 32,
          maxWidth: 440,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <View />

        {/* Brand Hero */}
        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
          <View
            style={{
              backgroundColor: colors.primary,
              width: 92,
              height: 92,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <ShieldCheck size={50} color="#FFFFFF" strokeWidth={2.4} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 34,
                fontWeight: '900',
                letterSpacing: -0.8,
              }}
            >
              Task
            </Text>
            <View
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 8,
                marginLeft: 7,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 0.8 }}>
                PRO
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: 'center',
              lineHeight: 22,
              maxWidth: 320,
              marginBottom: 24,
            }}
          >
            A high-performance personal productivity suite. Offline-first, fast, and crafted for peak focus.
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShieldCheck size={15} color={colors.success} strokeWidth={2.2} />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              Zero Cloud Lock-in • 100% Local SQLite
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          {/* Working Demo Mode Action */}
          <Pressable
            onPress={handleDemoMode}
            style={{
              backgroundColor: colors.primary,
              height: 52,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 4,
            }}
            accessibilityRole="button"
            accessibilityLabel="Continue in Demo / Local Mode"
          >
            <Sparkles size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
              Explore Demo Workspace
            </Text>
          </Pressable>

          {/* Sign In Button */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1.2,
              height: 50,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            accessibilityRole="button"
            accessibilityLabel="Sign in with email"
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              Sign In to Your Account
            </Text>
            <ArrowRight size={16} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>

          {/* Create Account link */}
          <Pressable
            onPress={() => router.push('/(auth)/signup')}
            style={{
              paddingVertical: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontWeight: '500',
              }}
            >
              Don&apos;t have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: '800' }}>
                Create Account
              </Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
