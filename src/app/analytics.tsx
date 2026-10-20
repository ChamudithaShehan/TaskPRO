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
  CheckCircle2,
  Clock,
  Flame,
  Folder,
  TrendingUp,
} from 'lucide-react-native';

import { useTaskStore } from '@/stores/useTaskStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTheme } from '@/theme/ThemeContext';
import { focusRepository } from '@/repositories/focusRepository';
import { ProgressBar } from '@/components/common/ProgressBar';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { tasks, stats } = useTaskStore();
  const { projects } = useProjectStore();

  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  useEffect(() => {
    async function loadStats() {
      const minutes = await focusRepository.getTotalFocusMinutes();
      setTotalFocusMinutes(minutes);
    }
    loadStats();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
          gap: 10,
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
            fontSize: 18,
            fontWeight: '700',
          }}
        >
          Productivity Analytics
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* Highlight Stats Card */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <TrendingUp size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              Completion Rate
            </Text>
          </View>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 36,
              fontWeight: '800',
              letterSpacing: -1,
              marginBottom: 4,
            }}
          >
            {completionRate}%
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '500' }}>
            {completedTasks} of {totalTasks} total tasks accomplished.
          </Text>
        </View>

        {/* 4 Metrics Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {/* Today Completed */}
          <View
            style={{
              flex: 1,
              minWidth: '47%',
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                Today Done
              </Text>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              {stats.todayCompleted}/{stats.todayTotal}
            </Text>
          </View>

          {/* Overdue */}
          <View
            style={{
              flex: 1,
              minWidth: '47%',
              backgroundColor: colors.surface,
              borderColor: stats.overdueCount > 0 ? colors.urgent : colors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Clock
                size={16}
                color={stats.overdueCount > 0 ? colors.urgent : colors.textMuted}
              />
              <Text
                style={{
                  color: stats.overdueCount > 0 ? colors.urgent : colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                Overdue
              </Text>
            </View>
            <Text
              style={{
                color: stats.overdueCount > 0 ? colors.urgent : colors.textPrimary,
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              {stats.overdueCount}
            </Text>
          </View>

          {/* Focus Time */}
          <View
            style={{
              flex: 1,
              minWidth: '47%',
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Flame size={16} color={colors.high} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                Focus Time
              </Text>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              {totalFocusMinutes}m
            </Text>
          </View>

          {/* Active Projects */}
          <View
            style={{
              flex: 1,
              minWidth: '47%',
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Folder size={16} color={colors.primary} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                Projects
              </Text>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              {projects.length}
            </Text>
          </View>
        </View>

        {/* Project Breakdown Section */}
        {projects.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 12,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 10,
                marginLeft: 2,
              }}
            >
              Project Health
            </Text>

            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 16,
                padding: 16,
                gap: 14,
              }}
            >
              {projects.map((proj) => {
                const total = proj.total_tasks || 0;
                const completed = proj.completed_tasks || 0;
                const pct = total > 0 ? completed / total : 0;

                return (
                  <View key={proj.id}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: proj.color,
                          }}
                        />
                        <Text
                          style={{
                            color: colors.textPrimary,
                            fontSize: 13,
                            fontWeight: '700',
                          }}
                        >
                          {proj.name}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 11,
                          fontWeight: '500',
                        }}
                      >
                        {completed}/{total} ({Math.round(pct * 100)}%)
                      </Text>
                    </View>
                    <ProgressBar progress={pct} color={proj.color} height={6} />
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
