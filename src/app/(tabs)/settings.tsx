import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Moon,
  Sun,
  Globe,
  Bell,
  Download,
  Trash2,
  Info,
  LogOut,
  ChevronRight,
  Shield,
  Clock,
  Flag,
} from 'lucide-react-native';

import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTheme } from '@/theme/ThemeContext';
import { exportImportService } from '@/services/exportImportService';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ThemeMode, LanguageMode, TaskPriority } from '@/types';

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, setMode, colors, isDark } = useTheme();
  const { settings, userProfile, updateSetting, logout } = useSettingsStore();
  const { loadTasks } = useTaskStore();

  const [clearConfirmVisible, setClearConfirmVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      await exportImportService.exportData();
      setExportSuccessMessage('Backup generated successfully!');
      setTimeout(() => setExportSuccessMessage(null), 3000);
    } catch {
      Alert.alert('Error', 'Failed to generate backup.');
    }
  };

  const handleClearData = async () => {
    try {
      await exportImportService.clearAllUserData();
      await loadTasks();
      setClearConfirmVisible(false);
      Alert.alert('Cleared', 'All user data has been cleared.');
    } catch {
      Alert.alert('Error', 'Failed to clear data.');
    }
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
      {/* 1. Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 14,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 24,
            fontWeight: '800',
            letterSpacing: -0.5,
          }}
        >
          Settings
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
      >
        {/* Profile Card */}
        <Pressable
          onPress={() => router.push('/profile')}
          style={({ pressed }) => ({
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Image
              source={{
                uri:
                  userProfile?.avatarUrl ||
                  settings?.user_avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
            <View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                {userProfile?.name || settings?.user_name || 'Alex Mercer'}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {userProfile?.email || settings?.user_email || 'alex@taskflow.app'}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>

        {/* SECTION: Appearance & Theme */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Appearance
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: colors.borderSubtle,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {isDark ? (
                  <Moon size={18} color={colors.primary} />
                ) : (
                  <Sun size={18} color={colors.primary} />
                )}
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Theme Mode
                </Text>
              </View>

              {/* Theme Selector Pills */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 3,
                  backgroundColor: colors.surfaceElevated,
                  padding: 4,
                  borderRadius: 10,
                }}
              >
                {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => {
                  const isSelected = mode === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setMode(m)}
                      style={{
                        backgroundColor: isSelected ? colors.surface : 'transparent',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 7,
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.primary : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: 11,
                          textTransform: 'capitalize',
                        }}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Language Selector */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Globe size={18} color={colors.primary} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Language
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  gap: 3,
                  backgroundColor: colors.surfaceElevated,
                  padding: 4,
                  borderRadius: 10,
                }}
              >
                {[
                  { code: 'en', label: 'English' },
                  { code: 'si', label: 'සිංහල' },
                ].map((lang) => {
                  const isSelected = (settings?.language || 'en') === lang.code;
                  return (
                    <Pressable
                      key={lang.code}
                      onPress={() =>
                        updateSetting('language', lang.code as LanguageMode)
                      }
                      style={{
                        backgroundColor: isSelected ? colors.surface : 'transparent',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 7,
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.primary : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: 11,
                        }}
                      >
                        {lang.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* SECTION: Preferences */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Task Preferences
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {/* Notifications Toggle */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: colors.borderSubtle,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Bell size={18} color={colors.primary} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Task Reminders
                </Text>
              </View>
              <Switch
                value={settings?.notifications_enabled ?? true}
                onValueChange={(val) =>
                  updateSetting('notifications_enabled', val)
                }
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
              />
            </View>

            {/* Default Priority */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: colors.borderSubtle,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Flag size={18} color={colors.primary} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Default Priority
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 3,
                  backgroundColor: colors.surfaceElevated,
                  padding: 4,
                  borderRadius: 10,
                }}
              >
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                  const isSelected =
                    (settings?.default_priority || 'medium') === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => updateSetting('default_priority', p)}
                      style={{
                        backgroundColor: isSelected ? colors.surface : 'transparent',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 7,
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.primary : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: 11,
                          textTransform: 'capitalize',
                        }}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Time Format */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Clock size={18} color={colors.primary} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Time Format
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 3,
                  backgroundColor: colors.surfaceElevated,
                  padding: 4,
                  borderRadius: 10,
                }}
              >
                {['12h', '24h'].map((fmt) => {
                  const isSelected = (settings?.time_format || '12h') === fmt;
                  return (
                    <Pressable
                      key={fmt}
                      onPress={() => updateSetting('time_format', fmt as any)}
                      style={{
                        backgroundColor: isSelected ? colors.surface : 'transparent',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 7,
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.primary : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: 11,
                        }}
                      >
                        {fmt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* SECTION: Backup & Data */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            Data & Backup
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {/* Export Backup */}
            <Pressable
              onPress={handleExport}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: colors.borderSubtle,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Download size={18} color={colors.primary} />
                <View>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 14,
                      fontWeight: '600',
                    }}
                  >
                    Export Backup (JSON)
                  </Text>
                  {exportSuccessMessage ? (
                    <Text style={{ fontSize: 11, color: colors.success, fontWeight: '600', marginTop: 2 }}>
                      {exportSuccessMessage}
                    </Text>
                  ) : null}
                </View>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>

            {/* Clear All Data */}
            <Pressable
              onPress={() => setClearConfirmVisible(true)}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Trash2 size={18} color={colors.urgent} />
                <Text
                  style={{
                    color: colors.urgent,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Clear All User Data
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* SECTION: About & App Info */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            About
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Info size={18} color={colors.textSecondary} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  TaskPRO Version
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                1.0.0 (Production)
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Shield size={18} color={colors.textSecondary} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Offline & Privacy
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                Local SQLite Encrypted
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Action */}
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
            Log Out / Switch Account
          </Text>
        </Pressable>
      </ScrollView>

      {/* Confirm Clear Data Dialog */}
      <ConfirmDialog
        visible={clearConfirmVisible}
        title="Clear All TaskPRO Data?"
        message="This will permanently delete all your tasks, subtasks, projects, and focus logs from local storage. This action cannot be undone."
        confirmLabel="Clear Everything"
        isDestructive
        onConfirm={handleClearData}
        onCancel={() => setClearConfirmVisible(false)}
      />

      {/* Confirm Logout Dialog */}
      <ConfirmDialog
        visible={logoutConfirmVisible}
        title="Log Out?"
        message="Are you sure you want to log out? Your local data will be safely kept on this device."
        confirmLabel="Log Out"
        isDestructive
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}
