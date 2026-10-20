import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Sparkles,
  Mail,
  Lock,
  Check,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function LoginScreen() {
  const router = useRouter();
  const { isDark, colors, setMode } = useTheme();
  const { login, loginDemo, continueAsGuest } = useSettingsStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(email.trim());
      router.replace('/(tabs)');
    } catch {
      setErrorMessage('Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setIsDemoLoading(true);
    setErrorMessage(null);
    try {
      await loginDemo();
      router.replace('/(tabs)');
    } catch {
      setErrorMessage('Failed to load demo workspace.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await continueAsGuest();
      router.replace('/(tabs)');
    } catch {
      setErrorMessage('Failed to start guest session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialMock = (provider: string) => {
    // Quick demonstration feedback
    setEmail(provider.toLowerCase() === 'google' ? 'user@gmail.com' : 'user@apple.com');
    setPassword('••••••••••••');
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top App Bar with Back & Theme Toggle */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          {router.canGoBack() ? (
            <Pressable
              hitSlop={12}
              onPress={() => router.back()}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: colors.surfaceElevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={2.4} />
            </Pressable>
          ) : (
            <View style={{ width: 38 }} />
          )}

          {/* Theme Quick Switcher */}
          <Pressable
            onPress={toggleTheme}
            hitSlop={12}
            accessibilityLabel="Toggle Theme"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {isDark ? (
              <>
                <Sun size={15} color="#F59E0B" />
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  Light
                </Text>
              </>
            ) : (
              <>
                <Moon size={15} color={colors.primary} />
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  Dark
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 40,
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Responsive Card Container */}
          <View style={{ width: '100%', maxWidth: 420 }}>
            {/* Brand Hero */}
            <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 4 }}>
              <View
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 22,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <ShieldCheck size={36} color="#FFFFFF" strokeWidth={2.4} />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 26,
                    fontWeight: '900',
                    letterSpacing: -0.6,
                  }}
                >
                  Task
                </Text>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 7,
                    paddingVertical: 2.5,
                    borderRadius: 6,
                    marginLeft: 5,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.6 }}>
                    PRO
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 22,
                  fontWeight: '800',
                  letterSpacing: -0.4,
                  marginBottom: 4,
                  textAlign: 'center',
                }}
              >
                Welcome Back
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  textAlign: 'center',
                  lineHeight: 18,
                  paddingHorizontal: 16,
                }}
              >
                Sign in to manage your high-priority projects, focus blocks, and synced tasks.
              </Text>
            </View>

            {/* Error Message Banner */}
            {errorMessage && (
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : '#FCA5A5',
                  borderWidth: 1,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 9,
                }}
              >
                <AlertCircle size={17} color="#EF4444" />
                <Text
                  style={{
                    color: isDark ? '#FCA5A5' : '#B91C1C',
                    fontSize: 12,
                    fontWeight: '600',
                    flex: 1,
                  }}
                >
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Instant Demo Access Hero Card */}
            <View
              style={{
                backgroundColor: isDark ? '#1A2234' : '#F1F4F9',
                borderColor: isDark ? '#2B3752' : '#E2E8F0',
                borderWidth: 1.2,
                borderRadius: 20,
                padding: 16,
                marginBottom: 20,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ position: 'relative', marginRight: 12 }}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                    }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                  />
                  {/* Active online dot */}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#10B981',
                      borderWidth: 2,
                      borderColor: isDark ? '#1A2234' : '#F1F4F9',
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontWeight: '700',
                      }}
                    >
                      Alex Mercer
                    </Text>
                    <View
                      style={{
                        backgroundColor: isDark ? '#112D27' : '#ECFDF5',
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: '#10B981',
                          fontSize: 10,
                          fontWeight: '800',
                        }}
                      >
                        DEMO LEAD
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 11,
                      marginTop: 2,
                    }}
                  >
                    1-Tap Instant Workspace • Pre-loaded tasks & stats
                  </Text>
                </View>
              </View>

              <Pressable
                disabled={isDemoLoading}
                onPress={handleQuickDemo}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 11,
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {isDemoLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Sparkles size={16} color="#FFFFFF" />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: '700',
                      }}
                    >
                      Continue in Demo Mode
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Subtle Divider */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 14,
                gap: 12,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: colors.border,
                }}
              />
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Or sign in with email
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: colors.border,
                }}
              />
            </View>

            {/* Email Field */}
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Email Address
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1.2,
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  height: 50,
                }}
              >
                <Mail size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: '500',
                    paddingVertical: 0,
                  }}
                />
                {email.length > 0 && (
                  <Pressable
                    hitSlop={8}
                    onPress={() => setEmail('')}
                    style={{ padding: 4 }}
                  >
                    <X size={15} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1.2,
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  height: 50,
                }}
              >
                <Lock size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={{
                    flex: 1,
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: '500',
                    paddingVertical: 0,
                  }}
                />
                <Pressable
                  hitSlop={10}
                  onPress={() => setShowPassword((p) => !p)}
                  style={{ padding: 4 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <Pressable
                onPress={() => setRememberMe((r) => !r)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}
                hitSlop={8}
              >
                <View
                  style={{
                    width: 19,
                    height: 19,
                    borderRadius: 5,
                    borderWidth: 1.5,
                    borderColor: rememberMe ? colors.primary : colors.border,
                    backgroundColor: rememberMe ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {rememberMe && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  Remember this device
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(auth)/forgot-password')}
                hitSlop={8}
                style={{ paddingVertical: 4 }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  Forgot Password?
                </Text>
              </Pressable>
            </View>

            {/* Main Sign In Button */}
            <Pressable
              disabled={isLoading}
              onPress={handleLogin}
              style={{
                backgroundColor: colors.primary,
                height: 52,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 16,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 15,
                      fontWeight: '800',
                      letterSpacing: 0.2,
                    }}
                  >
                    Sign In
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
                </>
              )}
            </Pressable>

            {/* Social Logins */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <Pressable
                onPress={() => handleSocialMock('Google')}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
                  G
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  Google
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSocialMock('Apple')}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
                  
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  Apple
                </Text>
              </Pressable>
            </View>

            {/* Secondary Actions: Sign Up & Guest */}
            <View style={{ alignItems: 'center', gap: 10 }}>
              <Pressable
                onPress={() => router.push('/(auth)/signup')}
                style={{ paddingVertical: 4 }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
                  Don&apos;t have an account?{' '}
                  <Text style={{ color: colors.primary, fontWeight: '800' }}>
                    Create Account
                  </Text>
                </Text>
              </Pressable>

              <Pressable
                onPress={handleGuestAccess}
                style={{ paddingVertical: 4 }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>
                  Continue as Guest (Offline Mode)
                </Text>
              </Pressable>
            </View>

            {/* Bottom Security Note */}
            <View
              style={{
                marginTop: 28,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <ShieldCheck size={14} color={colors.success} strokeWidth={2.2} />
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>
                End-to-End Encrypted • 100% Local SQLite Storage
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
