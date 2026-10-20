import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login } = useSettingsStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), name.trim());
      router.replace('/(tabs)');
    } catch {
      setErrorMessage('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="px-4 py-3 flex-row items-center">
          <Pressable
            hitSlop={10}
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full items-center justify-center -ml-1 active:opacity-70"
          >
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 10,
            paddingBottom: 40,
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', maxWidth: 420 }}>
            <Text
              style={{ color: colors.textPrimary }}
              className="text-2xl font-black tracking-tight mb-1"
            >
              Create Your Account
            </Text>
            <Text
              style={{ color: colors.textSecondary }}
              className="text-xs mb-6"
            >
              Start your high-performance productivity journey with TaskPRO.
            </Text>

          {errorMessage && (
            <View className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4">
              <Text className="text-xs text-red-600 font-medium">
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Full Name */}
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-semibold uppercase tracking-wider mb-1.5"
          >
            Full Name
          </Text>
          <TextInput
            placeholder="Alex Mercer"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (errorMessage) setErrorMessage(null);
            }}
            style={{
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="text-sm px-4 py-3 rounded-xl border mb-4 font-medium"
          />

          {/* Email */}
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
            onChangeText={(v) => {
              setEmail(v);
              if (errorMessage) setErrorMessage(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="text-sm px-4 py-3 rounded-xl border mb-4 font-medium"
          />

          {/* Password */}
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-semibold uppercase tracking-wider mb-1.5"
          >
            Password
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="flex-row items-center px-4 py-3 rounded-xl border mb-4"
          >
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errorMessage) setErrorMessage(null);
              }}
              secureTextEntry={!showPassword}
              style={{ color: colors.textPrimary }}
              className="flex-1 text-sm py-0 font-medium"
            />
            <Pressable
              hitSlop={8}
              onPress={() => setShowPassword((p) => !p)}
            >
              {showPassword ? (
                <EyeOff size={18} color={colors.textMuted} />
              ) : (
                <Eye size={18} color={colors.textMuted} />
              )}
            </Pressable>
          </View>

          {/* Confirm Password */}
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-semibold uppercase tracking-wider mb-1.5"
          >
            Confirm Password
          </Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              if (errorMessage) setErrorMessage(null);
            }}
            secureTextEntry={!showPassword}
            style={{
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="text-sm px-4 py-3 rounded-xl border mb-6 font-medium"
          />

          {/* Submit */}
          <Pressable
            disabled={isLoading}
            onPress={handleSignup}
            style={{ backgroundColor: colors.primary }}
            className="w-full py-4 rounded-2xl items-center justify-center mb-4 shadow-md active:opacity-90"
          >
            <Text className="text-white text-sm font-bold">
              {isLoading ? 'Creating Account...' : 'Continue'}
            </Text>
          </Pressable>

          {/* Back to sign in */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="items-center py-2"
          >
            <Text
              style={{ color: colors.textSecondary }}
              className="text-xs font-medium"
            >
              Already have an account?{' '}
              <Text style={{ color: colors.primary }} className="font-bold">
                Sign In
              </Text>
            </Text>
          </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
