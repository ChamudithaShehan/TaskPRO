import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Bell,
  Clock,
  ShieldAlert,
} from 'lucide-react-native';

import { useTaskStore } from '@/stores/useTaskStore';
import { useTheme } from '@/theme/ThemeContext';
import { notificationService } from '@/services/notificationService';
import { EmptyState } from '@/components/common/EmptyState';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { tasks } = useTaskStore();

  const [permissionGranted, setPermissionGranted] = useState(true);

  useEffect(() => {
    async function checkReminders() {
      const granted = await notificationService.requestPermissions();
      setPermissionGranted(granted);
    }
    checkReminders();
  }, []);

  const handleClearAll = async () => {
    await notificationService.cancelAll();
  };

  const todayISO = new Date().toISOString().split('T')[0];
  const upcomingReminders = tasks.filter(
    (t) => t.due_at && t.due_at >= todayISO && t.status !== 'completed'
  );

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
          Reminders & Alerts
        </Text>

        {upcomingReminders.length > 0 ? (
          <Pressable onPress={handleClearAll} hitSlop={8}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              Clear
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* Permission Request Prompt */}
        {!permissionGranted && (
          <View
            style={{
              backgroundColor: colors.urgentLight,
              borderColor: colors.urgent,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <ShieldAlert size={20} color={colors.urgent} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.urgent,
                  fontSize: 14,
                  fontWeight: '700',
                  marginBottom: 4,
                }}
              >
                Notifications are disabled
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  lineHeight: 16,
                  marginBottom: 10,
                }}
              >
                Enable device notifications to receive timely alerts for your scheduled tasks and deadlines.
              </Text>
              <Pressable
                onPress={async () => {
                  const res = await notificationService.requestPermissions();
                  setPermissionGranted(res);
                }}
                style={({ pressed }) => ({
                  alignSelf: 'flex-start',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: colors.urgent,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                  Grant Permission
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 12,
            marginLeft: 2,
          }}
        >
          Scheduled Task Alerts ({upcomingReminders.length})
        </Text>

        {upcomingReminders.length > 0 ? (
          upcomingReminders.map((task) => (
            <View
              key={task.id}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.primaryLight,
                  }}
                >
                  <Bell size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.textPrimary,
                      fontSize: 14,
                      fontWeight: '700',
                    }}
                  >
                    {task.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <Clock size={11} color={colors.textMuted} />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                        fontWeight: '500',
                      }}
                    >
                      {task.due_at} {task.due_time ? `at ${task.due_time}` : 'at 09:00'}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => router.push(`/task/${task.id}` as any)}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  View
                </Text>
              </Pressable>
            </View>
          ))
        ) : (
          <EmptyState
            icon={<Bell size={24} color={colors.primary} />}
            title="All notifications clear"
            description="You have no upcoming task alerts right now. Reminders will appear here when scheduled."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
