import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check, LogOut } from 'lucide-react-native';

import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTheme } from '@/theme/ThemeContext';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { settings, userProfile, updateSetting, logout } = useSettingsStore();
  const { stats, tasks } = useTaskStore();

  const [name, setName] = useState(userProfile?.name || settings?.user_name || 'Alex Mercer');
  const [email, setEmail] = useState(userProfile?.email || settings?.user_email || 'alex@taskflow.app');
  const [isSaved, setIsSaved] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateSetting('user_name', name.trim());
    await updateSetting('user_email', email.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleLogout = async () => {
    await logout();
    setLogoutConfirmVisible(false);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          hitSlop={10}
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
        </Pressable>

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: '700',
          }}
        >
          Profile
        </Text>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 10,
            backgroundColor: colors.primary,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 60 }}
      >
        {/* Avatar Display */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image
            source={{
              uri:
                userProfile?.avatarUrl ||
                settings?.user_avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            }}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              borderWidth: 2,
              borderColor: colors.primary,
              marginBottom: 12,
            }}
          />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 20,
              fontWeight: '800',
            }}
          >
            {name}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {email}
          </Text>
        </View>

        {isSaved && (
          <View
            style={{
              backgroundColor: colors.successLight,
              borderColor: colors.success,
              borderWidth: 1,
              padding: 12,
              borderRadius: 14,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Check size={16} color={colors.success} strokeWidth={2.5} />
            <Text style={{ fontSize: 12, color: colors.success, fontWeight: '600' }}>
              Profile updated successfully!
            </Text>
          </View>
        )}

        {/* Edit Profile Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 12,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 12,
            }}
          >
            Account Details
          </Text>

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '600',
              marginBottom: 6,
            }}
          >
            Display Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={{
              color: colors.textPrimary,
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 14,
            }}
          />

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '600',
              marginBottom: 6,
            }}
          >
            Email Address
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              color: colors.textPrimary,
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 14,
              fontWeight: '600',
            }}
          />
        </View>

        {/* Stats Summary */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              {tasks.length}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '500',
                marginTop: 2,
              }}
            >
              Total Tasks
            </Text>
          </View>

          <View style={{ width: 1, height: 32, backgroundColor: colors.border }} />

          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: colors.primary,
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              {stats.totalCompleted}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '500',
                marginTop: 2,
              }}
            >
              Completed
            </Text>
          </View>
        </View>

        {/* Log Out Button */}
        <Pressable
          onPress={() => setLogoutConfirmVisible(true)}
          style={({ pressed }) => ({
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <LogOut size={16} color={colors.urgent} />
          <Text
            style={{
              color: colors.urgent,
              fontSize: 14,
              fontWeight: '700',
            }}
          >
            Log Out
          </Text>
        </Pressable>
      </ScrollView>

      {/* Confirm Logout Dialog */}
      <ConfirmDialog
        visible={logoutConfirmVisible}
        title="Log Out?"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        isDestructive
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}
