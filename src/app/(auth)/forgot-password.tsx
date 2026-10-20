import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setIsSent(true);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background }}
      className="flex-1 p-6"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-between"
      >
        <View>
          <Pressable
            hitSlop={10}
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full items-center justify-center -ml-2 mb-4 active:opacity-70"
          >
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>

          <Text
            style={{ color: colors.textPrimary }}
            className="text-2xl font-black tracking-tight mb-1"
          >
            Reset Password
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs leading-5 mb-6"
          >
            Enter your email and we&apos;ll send you instructions to reset your password.
          </Text>

          {isSent ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="border rounded-2xl p-6 items-center"
            >
              <CheckCircle2 size={36} color={colors.success} />
              <Text
                style={{ color: colors.textPrimary }}
                className="text-base font-bold mt-3 mb-1"
              >
                Reset Link Sent
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs text-center leading-4"
              >
                We have sent instructions to {email}. Check your inbox!
              </Text>
            </View>
          ) : (
            <View>
              {error && (
                <View className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4">
                  <Text className="text-xs text-red-600 font-medium">{error}</Text>
                </View>
              )}

              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs font-semibold uppercase tracking-wider mb-1.5"
              >
                Email Address
              </Text>
              <TextInput
                placeholder="alex@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="text-sm px-4 py-3 rounded-xl border mb-6 font-medium"
              />

              <Pressable
                onPress={handleSubmit}
                style={{ backgroundColor: colors.primary }}
                className="w-full py-4 rounded-2xl items-center justify-center shadow-md active:opacity-90"
              >
                <Text className="text-white text-sm font-bold">
                  Send Reset Link
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          className="items-center py-2"
        >
          <Text style={{ color: colors.primary }} className="text-xs font-bold">
            Back to Sign In
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
