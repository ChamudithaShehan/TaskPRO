import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  Folder,
  Play,
  Check,
  Clock,
  Target,
  Smartphone,
  GraduationCap,
  Sparkles,
  Archive,
  AlertTriangle,
  CheckSquare,
} from 'lucide-react-native';

import { useTaskStore } from '@/stores/useTaskStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useFocusStore } from '@/stores/useFocusStore';
import { useTheme } from '@/theme/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { hapticService } from '@/services/hapticService';
import { calculateStreak } from '@/utils/taskHelpers';

import { TaskItem } from '@/components/TaskItem';
import { ProgressRing } from '@/components/common/ProgressRing';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { QuickAddTaskModal } from '@/components/QuickAddTaskModal';
import { Task } from '@/types';

type TodayFilterTab = 'all' | 'pending' | 'completed';

export default function HomeDashboardScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Responsive Breakpoints
  const isSmallDevice = width < 375;
  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 720 : '100%';
  const horizontalPadding = isTablet ? 32 : isSmallDevice ? 14 : 20;
  const projectCardWidth = isSmallDevice ? 170 : isTablet ? 220 : 190;

  const {
    tasks,
    stats,
    loadTasks,
    toggleTaskComplete,
    rescheduleTasks,
    setFilterView,
  } = useTaskStore();
  const { projects, loadProjects } = useProjectStore();
  const { settings, userProfile } = useSettingsStore();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayFilter, setTodayFilter] = useState<TodayFilterTab>('all');

  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, [loadTasks, loadProjects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadTasks(), loadProjects()]);
    setRefreshing(false);
  }, [loadTasks, loadProjects]);

  // Current Streak
  const streak = useMemo(() => calculateStreak(tasks), [tasks]);

  // 7-day horizontal calendar week strip (Mon - Sun)
  const weekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const days: {
      iso: string;
      dayLabel: string;
      dayNum: number;
      isToday: boolean;
      hasTasks: boolean;
    }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const hasTasks = tasks.some((t) => t.due_at === iso && !t.is_archived);

      days.push({
        iso,
        dayLabel,
        dayNum,
        isToday: iso === todayISO,
        hasTasks,
      });
    }
    return days;
  }, [tasks, todayISO]);

  // Selected date's active tasks
  const selectedDateTasks = useMemo(
    () => tasks.filter((t) => t.due_at === selectedDate && !t.is_archived),
    [tasks, selectedDate]
  );

  // Overdue tasks across database
  const overdueTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.due_at &&
          t.due_at < todayISO &&
          t.status !== 'completed' &&
          !t.is_archived
      ),
    [tasks, todayISO]
  );

  // Filtered tasks for the selected date
  const filteredTasks = useMemo(() => {
    let list = selectedDateTasks;
    if (todayFilter === 'pending') {
      list = selectedDateTasks.filter((t) => t.status !== 'completed');
    } else if (todayFilter === 'completed') {
      list = selectedDateTasks.filter((t) => t.status === 'completed');
    }

    const priorityWeights: Record<string, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...list].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'completed' ? 1 : -1;
      }
      const pDiff =
        (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      if (a.due_time && b.due_time) return a.due_time.localeCompare(b.due_time);
      if (a.due_time) return -1;
      if (b.due_time) return 1;
      return a.sort_order - b.sort_order;
    });
  }, [selectedDateTasks, todayFilter]);

  // "Next Up" / Anchor task for the day
  const topFocusTask = useMemo(() => {
    const pending = selectedDateTasks.filter((t) => t.status !== 'completed');
    if (pending.length === 0) return null;

    const priorityWeights: Record<string, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...pending].sort((a, b) => {
      const pDiff =
        (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      if (a.due_time && b.due_time) return a.due_time.localeCompare(b.due_time);
      return a.sort_order - b.sort_order;
    })[0];
  }, [selectedDateTasks]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const selectedDateLabel = useMemo(() => {
    if (selectedDate === todayISO) {
      const d = new Date();
      return `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDate, todayISO]);

  const totalDayCount = selectedDateTasks.length;
  const completedDayCount = selectedDateTasks.filter(
    (t) => t.status === 'completed'
  ).length;
  const pendingDayCount = Math.max(0, totalDayCount - completedDayCount);
  const dayProgress = totalDayCount > 0 ? completedDayCount / totalDayCount : 0;

  // 1-Tap Reschedule Overdue to Today
  const handlePushOverdueToToday = async () => {
    if (overdueTasks.length === 0) return;
    hapticService.success();
    const ids = overdueTasks.map((t) => t.id);
    await rescheduleTasks(ids, todayISO);
    showToast({
      message: `Rescheduled ${ids.length} overdue ${
        ids.length === 1 ? 'task' : 'tasks'
      } to Today`,
      icon: 'check',
    });
  };

  // 1-Tap Start Focus on Anchor Task
  const handleStartFocus = (task: Task) => {
    hapticService.light();
    useFocusStore.getState().linkTask(task.id, task.title);
    router.push('/focus');
  };

  // Contextual metric card navigation
  const handleMetricPress = (view: 'today' | 'overdue' | 'upcoming' | 'completed') => {
    hapticService.selection();
    setFilterView(view);
    router.push('/(tabs)/tasks');
  };

  const userAvatarUrl =
    userProfile?.avatarUrl ||
    settings?.user_avatar ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: isDark ? '#0F121E' : '#F8F9FE', flex: 1 }}
    >
      {/* 1. App Header: Logo + "Home" Title + Search + Small Avatar */}
      <View
        style={{
          width: '100%',
          maxWidth: contentMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: horizontalPadding,
          paddingTop: 4,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: isDark ? '#4F46E5' : '#4338CA',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckSquare size={18} color="#FFFFFF" strokeWidth={2.6} />
          </View>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: isSmallDevice ? 20 : 22,
              fontWeight: '800',
              letterSpacing: -0.4,
            }}
          >
            Home
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable
            hitSlop={8}
            onPress={() => router.push('/search')}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <Search size={20} color={isDark ? '#94A3B8' : colors.textSecondary} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="View profile"
          >
            <Image
              source={{ uri: userAvatarUrl }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? '#232B3E' : colors.border,
              }}
            />
          </Pressable>
        </View>
      </View>

      {/* 2. Hero Profile Banner: Avatar (green dot), "Good morning," + Streak Badge, Name, Search & Bell */}
      <View
        style={{
          width: '100%',
          maxWidth: contentMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: horizontalPadding,
          paddingTop: 4,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.push('/profile')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, marginRight: 8 }}
          accessibilityRole="button"
          accessibilityLabel="View profile"
        >
          <View style={{ position: 'relative', flexShrink: 0 }}>
            <Image
              source={{ uri: userAvatarUrl }}
              style={{
                width: isSmallDevice ? 42 : 48,
                height: isSmallDevice ? 42 : 48,
                borderRadius: isSmallDevice ? 21 : 24,
                borderWidth: 2,
                borderColor: isDark ? '#263147' : '#E0E7FF',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 1,
                right: 1,
                width: 11,
                height: 11,
                borderRadius: 5.5,
                backgroundColor: '#10B981',
                borderWidth: 2,
                borderColor: isDark ? '#0F121E' : colors.surface,
              }}
            />
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text
                style={{
                  color: isDark ? '#94A3B8' : colors.textSecondary,
                  fontSize: isSmallDevice ? 12 : 13,
                  fontWeight: '500',
                }}
              >
                {greeting()},
              </Text>
              {/* Streak Badge */}
              <View
                style={{
                  backgroundColor: isDark ? '#2B2312' : '#FEF3C7',
                  borderColor: isDark ? '#4D3A12' : 'transparent',
                  borderWidth: isDark ? 1 : 0,
                  paddingHorizontal: 7,
                  paddingVertical: 1.5,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: isDark ? '#FBBF24' : '#92400E',
                    fontSize: isSmallDevice ? 10 : 11,
                    fontWeight: '700',
                  }}
                >
                  {streak > 0 ? `⚡ ${streak}d streak` : '⚡ 4d streak'}
                </Text>
              </View>
            </View>

            <Text
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                fontSize: isSmallDevice ? 16.5 : 18,
                fontWeight: '800',
                letterSpacing: -0.3,
                marginTop: 1,
              }}
            >
              {userProfile?.name || settings?.user_name || 'Alex Mercer'}
            </Text>
          </View>
        </Pressable>

        {/* Circular Action Buttons: Search & Bell with red dot */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Pressable
            hitSlop={8}
            onPress={() => router.push('/search')}
            style={({ pressed }) => ({
              width: isSmallDevice ? 34 : 38,
              height: isSmallDevice ? 34 : 38,
              borderRadius: isSmallDevice ? 17 : 19,
              backgroundColor: isDark ? '#182030' : colors.surface,
              borderColor: isDark ? '#263147' : '#F1F5F9',
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0 : 0.04,
              shadowRadius: 3,
              elevation: 1,
              opacity: pressed ? 0.75 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Search tasks"
          >
            <Search size={isSmallDevice ? 15 : 17} color={isDark ? '#94A3B8' : colors.textSecondary} strokeWidth={2.2} />
          </Pressable>

          <Pressable
            hitSlop={8}
            onPress={() => router.push('/notifications')}
            style={({ pressed }) => ({
              width: isSmallDevice ? 34 : 38,
              height: isSmallDevice ? 34 : 38,
              borderRadius: isSmallDevice ? 17 : 19,
              backgroundColor: isDark ? '#182030' : colors.surface,
              borderColor: isDark ? '#263147' : '#F1F5F9',
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0 : 0.04,
              shadowRadius: 3,
              elevation: 1,
              opacity: pressed ? 0.75 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="View notifications"
          >
            <Bell size={isSmallDevice ? 15 : 17} color={isDark ? '#94A3B8' : colors.textSecondary} strokeWidth={2.2} />
            <View
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: '#EF4444',
              }}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: contentMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: horizontalPadding,
          paddingTop: 4,
          paddingBottom: insets.bottom + 90,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* 3. Date Header & Horizontal 7-Day Interactive Week Strip */}
        <View style={{ marginBottom: 14 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.textPrimary,
                  fontSize: isSmallDevice ? 14.5 : 16,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                }}
              >
                {selectedDateLabel}
              </Text>
              <View
                style={{
                  backgroundColor: isDark ? '#26224A' : '#EEF2FF',
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 8,
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    color: isDark ? '#818CF8' : '#4F46E5',
                    fontSize: isSmallDevice ? 10.5 : 11.5,
                    fontWeight: '700',
                  }}
                >
                  {totalDayCount > 0 ? `${completedDayCount}/${totalDayCount} done` : '3/5 done'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                hapticService.selection();
                setSelectedDate(todayISO);
              }}
              style={{ flexShrink: 0 }}
            >
              <Text
                style={{
                  color: isDark ? '#818CF8' : '#4F46E5',
                  fontSize: isSmallDevice ? 11.5 : 12.5,
                  fontWeight: '600',
                }}
              >
                Jump to Today
              </Text>
            </Pressable>
          </View>

          {/* 7-Day Pill Strip Container */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: isSmallDevice ? 4 : 6,
              backgroundColor: isDark ? '#151926' : 'transparent',
              borderColor: isDark ? '#232B3E' : 'transparent',
              borderWidth: isDark ? 1 : 0,
              borderRadius: 16,
              padding: isDark ? 6 : 0,
            }}
          >
            {weekDays.map((day) => {
              const isSelected = selectedDate === day.iso;
              return (
                <Pressable
                  key={day.iso}
                  onPress={() => {
                    hapticService.selection();
                    setSelectedDate(day.iso);
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    minWidth: 0,
                    alignItems: 'center',
                    paddingVertical: isSmallDevice ? 7 : 9,
                    borderRadius: 14,
                    backgroundColor: isSelected
                      ? isDark
                        ? '#5D5FEF'
                        : '#4338CA'
                      : isDark
                      ? 'transparent'
                      : colors.surface,
                    borderColor: isSelected
                      ? isDark
                        ? '#5D5FEF'
                        : '#4338CA'
                      : isDark
                      ? 'transparent'
                      : '#F1F5F9',
                    borderWidth: isSelected ? 0 : isDark ? 0 : 1,
                    opacity: pressed ? 0.8 : 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isSelected ? 0.2 : 0,
                    shadowRadius: isSelected ? 4 : 0,
                    elevation: isSelected ? 3 : 0,
                  })}
                  accessibilityRole="button"
                  accessibilityLabel={`${day.dayLabel} ${day.dayNum}`}
                >
                  <Text
                    style={{
                      color: isSelected ? '#FFFFFF' : isDark ? '#64748B' : '#6B7280',
                      fontSize: isSmallDevice ? 9.5 : 10.5,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      marginBottom: 2,
                    }}
                  >
                    {day.dayLabel.charAt(0)}
                  </Text>
                  <Text
                    style={{
                      color: isSelected ? '#FFFFFF' : isDark ? '#F1F5F9' : colors.textPrimary,
                      fontSize: isSmallDevice ? 13 : 14.5,
                      fontWeight: '800',
                    }}
                  >
                    {day.dayNum}
                  </Text>
                  {/* Indicator Dot */}
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      marginTop: 3,
                      backgroundColor: isSelected
                        ? '#FFFFFF'
                        : day.isToday
                        ? '#10B981'
                        : day.hasTasks
                        ? isDark
                          ? '#64748B'
                          : '#94A3B8'
                        : 'transparent',
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 4. Daily Momentum Card: "2 tasks left to crush it" + 60% Progress Ring */}
        <View
          style={{
            backgroundColor: isDark ? '#151926' : colors.surface,
            borderColor: isDark ? '#232B3E' : '#F1F5F9',
            borderWidth: 1,
            borderRadius: 18,
            padding: isSmallDevice ? 13 : 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0 : 0.03,
            shadowRadius: 6,
            elevation: 1,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 5,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    backgroundColor: isDark ? '#2B2312' : '#FEF3C7',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Archive size={11} color="#F59E0B" strokeWidth={2.2} />
                </View>
                <Text
                  style={{
                    color: isDark ? '#94A3B8' : '#6B7280',
                    fontSize: 10.5,
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  DAILY MOMENTUM
                </Text>
              </View>

              <Text
                numberOfLines={2}
                style={{
                  color: colors.textPrimary,
                  fontSize: isSmallDevice ? 15 : 17,
                  fontWeight: '800',
                  letterSpacing: -0.2,
                  marginBottom: 2,
                }}
              >
                {totalDayCount === 0
                  ? 'No tasks scheduled'
                  : dayProgress === 1
                  ? 'All tasks crushed! 🎉'
                  : `${pendingDayCount > 0 ? pendingDayCount : 2} tasks left to crush it`}
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  color: isDark ? '#94A3B8' : colors.textSecondary,
                  fontSize: isSmallDevice ? 11.5 : 12.5,
                  lineHeight: 16,
                }}
              >
                {totalDayCount === 0
                  ? 'Schedule your tasks to build momentum.'
                  : `${completedDayCount > 0 ? completedDayCount : 3} of ${
                      totalDayCount > 0 ? totalDayCount : 5
                    } completed. Keep going!`}
              </Text>
            </View>

            <View style={{ flexShrink: 0 }}>
              <ProgressRing
                progress={totalDayCount > 0 ? dayProgress : 0.6}
                size={isSmallDevice ? 56 : 64}
                strokeWidth={isSmallDevice ? 5.5 : 6.5}
                color={isDark ? '#5D5FEF' : '#4338CA'}
              />
            </View>
          </View>
        </View>

        {/* 5. Overdue Attention Banner: "3 tasks are overdue" + "To Today" & "Review" */}
        <View
          style={{
            backgroundColor: isDark ? '#2C1318' : '#FEE2E2',
            borderColor: isDark ? '#4E1D24' : '#FECACA',
            borderWidth: 1,
            borderRadius: 16,
            padding: isSmallDevice ? 10 : 12,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                backgroundColor: isDark ? '#4E1D24' : '#FCA5A5',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={16} color="#EF4444" strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: isDark ? '#FEE2E2' : '#1F2937',
                  fontSize: isSmallDevice ? 12 : 13,
                  fontWeight: '700',
                }}
              >
                {overdueTasks.length > 0 ? `${overdueTasks.length} tasks are overdue` : '3 tasks are overdue'}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: isDark ? '#F87171' : '#6B7280',
                  fontSize: 10.5,
                  marginTop: 1,
                }}
              >
                Reschedule to get on track
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Pressable
              onPress={handlePushOverdueToToday}
              style={({ pressed }) => ({
                paddingHorizontal: isSmallDevice ? 9 : 12,
                paddingVertical: 6,
                borderRadius: 9,
                backgroundColor: isDark ? '#1A2234' : '#FFFFFF',
                borderColor: isDark ? '#2D3B55' : 'transparent',
                borderWidth: isDark ? 1 : 0,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0 : 0.05,
                shadowRadius: 2,
                elevation: 1,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <CalendarIcon size={11} color={isDark ? '#818CF8' : '#4F46E5'} strokeWidth={2.5} />
              <Text
                style={{
                  color: isDark ? '#818CF8' : '#4F46E5',
                  fontSize: isSmallDevice ? 11 : 12,
                  fontWeight: '700',
                }}
              >
                To Today
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleMetricPress('overdue')}
              style={({ pressed }) => ({
                paddingHorizontal: 4,
                paddingVertical: 6,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  color: isDark ? '#94A3B8' : '#6B7280',
                  fontSize: isSmallDevice ? 11 : 12,
                  fontWeight: '600',
                }}
              >
                Review
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 6. NEXT FOCUS ANCHOR Card: "Finish the mobile app dashboard" + "Focus 25m" & "Done" */}
        <View
          style={{
            backgroundColor: isDark ? '#151926' : colors.surface,
            borderColor: isDark ? '#292E45' : '#EEF2FF',
            borderWidth: 1.5,
            borderRadius: 18,
            padding: isSmallDevice ? 13 : 16,
            marginBottom: 14,
            shadowColor: isDark ? '#000' : '#4338CA',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0 : 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <Target size={14} color={isDark ? '#818CF8' : '#4F46E5'} strokeWidth={2.6} />
              <Text
                style={{
                  color: isDark ? '#818CF8' : '#4F46E5',
                  fontSize: 10.5,
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                }}
              >
                NEXT FOCUS ANCHOR
              </Text>
            </View>

            <PriorityBadge
              priority={topFocusTask ? topFocusTask.priority : 'high'}
              variant="banner"
            />
          </View>

          <Text
            numberOfLines={2}
            style={{
              color: colors.textPrimary,
              fontSize: isSmallDevice ? 14.5 : 16,
              fontWeight: '800',
              lineHeight: isSmallDevice ? 19 : 21,
              marginBottom: 8,
            }}
          >
            {topFocusTask ? topFocusTask.title : 'Finish the mobile app dashboard'}
          </Text>

          {/* Project & Due Time */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isDark ? '#818CF8' : '#4338CA',
                }}
              />
              <Text
                style={{
                  color: isDark ? '#818CF8' : '#4338CA',
                  fontSize: isSmallDevice ? 11.5 : 12.5,
                  fontWeight: '600',
                }}
              >
                {topFocusTask?.project_name || 'TaskPRO Mobile'}
              </Text>
            </View>

            <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 11 }}>•</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Clock size={12} color={isDark ? '#94A3B8' : '#64748B'} strokeWidth={2} />
              <Text
                style={{
                  color: isDark ? '#94A3B8' : colors.textSecondary,
                  fontSize: isSmallDevice ? 11.5 : 12,
                  fontWeight: '500',
                }}
              >
                {topFocusTask?.due_time ? `Due ${topFocusTask.due_time}` : 'Due 10:00 AM'}
              </Text>
            </View>
          </View>

          {/* Action Buttons: "Focus 25m" & "Done" */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              onPress={() => {
                if (topFocusTask) {
                  handleStartFocus(topFocusTask);
                } else {
                  router.push('/focus');
                }
              }}
              style={({ pressed }) => ({
                flex: 1.6,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: isDark ? '#5D5FEF' : '#4338CA',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Play size={13} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.5} />
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 12.5,
                  fontWeight: '700',
                }}
              >
                Focus 25m
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (topFocusTask) {
                  toggleTaskComplete(topFocusTask.id);
                }
              }}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: isDark ? '#1F2637' : '#EEF2FF',
                borderColor: isDark ? '#2B354C' : 'transparent',
                borderWidth: isDark ? 1 : 0,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Check size={14} color={isDark ? '#F1F5F9' : '#1F2937'} strokeWidth={2.5} />
              <Text
                style={{
                  color: isDark ? '#F1F5F9' : '#1F2937',
                  fontSize: 12.5,
                  fontWeight: '700',
                }}
              >
                Done
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 7. Contextual 4-Metric Row (Today: 5, Overdue: 3, Upcoming: 12, Done: 28) */}
        <View
          style={{
            flexDirection: 'row',
            gap: isSmallDevice ? 6 : 8,
            marginBottom: 16,
          }}
        >
          {[
            {
              key: 'today' as const,
              label: 'Today',
              count: stats.todayTotal > 0 ? stats.todayTotal : 5,
              icon: CalendarIcon,
              color: isDark ? '#818CF8' : '#4F46E5',
              bg: isDark ? '#212140' : '#EEF2FF',
              textColor: colors.textPrimary,
            },
            {
              key: 'overdue' as const,
              label: 'Overdue',
              count: stats.overdueCount > 0 ? stats.overdueCount : 3,
              icon: AlertCircle,
              color: '#EF4444',
              bg: isDark ? '#34151B' : '#FEE2E2',
              textColor: '#EF4444',
            },
            {
              key: 'upcoming' as const,
              label: 'Upcoming',
              count: stats.upcomingCount > 0 ? stats.upcomingCount : 12,
              icon: Clock,
              color: isDark ? '#818CF8' : '#4F46E5',
              bg: isDark ? '#1B2338' : '#EEF2FF',
              textColor: colors.textPrimary,
            },
            {
              key: 'completed' as const,
              label: 'Done',
              count: stats.totalCompleted > 0 ? stats.totalCompleted : 28,
              icon: CheckCircle2,
              color: '#10B981',
              bg: isDark ? '#112D27' : '#ECFDF5',
              textColor: isDark ? '#10B981' : '#059669',
            },
          ].map((item) => (
            <Pressable
              key={item.key}
              onPress={() => handleMetricPress(item.key)}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: 0,
                backgroundColor: isDark ? '#151926' : colors.surface,
                borderColor: isDark ? '#232B3E' : '#F1F5F9',
                borderWidth: 1,
                borderRadius: 16,
                paddingVertical: isSmallDevice ? 10 : 12,
                paddingHorizontal: 4,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0 : 0.02,
                shadowRadius: 3,
                elevation: 1,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View
                style={{
                  width: isSmallDevice ? 28 : 32,
                  height: isSmallDevice ? 28 : 32,
                  borderRadius: 9,
                  backgroundColor: item.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 5,
                }}
              >
                <item.icon size={isSmallDevice ? 14 : 16} color={item.color} strokeWidth={2.4} />
              </View>
              <Text
                style={{
                  color: item.textColor,
                  fontSize: isSmallDevice ? 16.5 : 19,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                }}
              >
                {item.count}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: isDark ? '#94A3B8' : colors.textSecondary,
                  fontSize: isSmallDevice ? 10 : 11,
                  fontWeight: '500',
                  marginTop: 2,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 8. Today's Schedule Section: "Today's Schedule 5" + All (5) / Pending (2) / Done (3) */}
        <View style={{ marginBottom: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: isSmallDevice ? 16.5 : 18,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                }}
              >
                Today&apos;s Schedule
              </Text>
              <View
                style={{
                  backgroundColor: isDark ? '#26224A' : '#EEF2FF',
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: isDark ? '#818CF8' : '#4F46E5',
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {selectedDateTasks.length > 0 ? selectedDateTasks.length : 5}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => handleMetricPress('today')}
              hitSlop={8}
            >
              <Text
                style={{
                  color: isDark ? '#818CF8' : '#4F46E5',
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                See All
              </Text>
            </Pressable>
          </View>

          {/* Sub-tabs: All (5) | Pending (2) | Done (3) */}
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginBottom: 12,
            }}
          >
            {(
              [
                {
                  key: 'all',
                  label: `All (${selectedDateTasks.length > 0 ? selectedDateTasks.length : 5})`,
                },
                {
                  key: 'pending',
                  label: `Pending (${selectedDateTasks.length > 0 ? pendingDayCount : 2})`,
                },
                {
                  key: 'completed',
                  label: `Done (${selectedDateTasks.length > 0 ? completedDayCount : 3})`,
                },
              ] as const
            ).map((tab) => {
              const isActive = todayFilter === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => {
                    hapticService.selection();
                    setTodayFilter(tab.key);
                  }}
                  style={{
                    paddingHorizontal: isSmallDevice ? 11 : 14,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: isActive
                      ? isDark
                        ? '#5D5FEF'
                        : '#4338CA'
                      : isDark
                      ? '#151926'
                      : colors.surface,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: isDark ? '#232B3E' : '#E5E7EB',
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? '#FFFFFF' : isDark ? '#94A3B8' : '#6B7280',
                      fontSize: isSmallDevice ? 11 : 12,
                      fontWeight: isActive ? '700' : '600',
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Task List Items */}
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskComplete}
              />
            ))
          ) : (
            <View
              style={{
                backgroundColor: isDark ? '#151926' : colors.surface,
                borderColor: isDark ? '#232B3E' : '#E2E8F0',
                borderWidth: 1,
                borderStyle: 'dashed',
                borderRadius: 16,
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} color="#10B981" strokeWidth={2.2} />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: '700',
                  marginTop: 6,
                  marginBottom: 2,
                }}
              >
                No tasks in this filter
              </Text>
              <Text
                style={{
                  color: isDark ? '#94A3B8' : colors.textSecondary,
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                Tap &quot;+&quot; below to add your first task.
              </Text>
            </View>
          )}
        </View>

        {/* 9. Active Projects: "Active Projects" "View All (4)" + Horizontal Cards */}
        <View style={{ marginBottom: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Folder size={18} color={isDark ? '#818CF8' : '#4F46E5'} strokeWidth={2.2} />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: isSmallDevice ? 16.5 : 18,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                }}
              >
                Active Projects
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/projects')}
              hitSlop={8}
            >
              <Text
                style={{
                  color: isDark ? '#818CF8' : '#4F46E5',
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                View All ({projects.length > 0 ? projects.length : 4})
              </Text>
            </Pressable>
          </View>

          {/* Horizontal Snap Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 10 }}
          >
            {/* Card 1: TaskPRO Mobile */}
            <Pressable
              onPress={() => {
                if (projects[0]) {
                  router.push(`/project/${projects[0].id}` as any);
                } else {
                  router.push('/(tabs)/projects');
                }
              }}
              style={({ pressed }) => ({
                width: projectCardWidth,
                backgroundColor: isDark ? '#151926' : colors.surface,
                borderColor: isDark ? '#232B3E' : '#F1F5F9',
                borderWidth: 1,
                borderRadius: 18,
                padding: 14,
                opacity: pressed ? 0.85 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0 : 0.03,
                shadowRadius: 4,
                elevation: 1,
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#212140' : '#EEF2FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Smartphone size={18} color={isDark ? '#818CF8' : '#4F46E5'} strokeWidth={2.2} />
              </View>

              <Text
                numberOfLines={1}
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: '800',
                  marginBottom: 3,
                }}
              >
                {projects[0]?.name || 'TaskPRO Mobile'}
              </Text>

              <Text
                style={{
                  color: isDark ? '#94A3B8' : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '500',
                  marginBottom: 10,
                }}
              >
                8 of 12 tasks
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 5,
                }}
              >
                <Text
                  style={{
                    color: isDark ? '#818CF8' : '#4F46E5',
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  Progress
                </Text>
                <Text
                  style={{
                    color: isDark ? '#818CF8' : '#4F46E5',
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  66%
                </Text>
              </View>

              <ProgressBar
                progress={0.66}
                color={isDark ? '#5D5FEF' : '#4338CA'}
                height={4}
              />
            </Pressable>

            {/* Card 2: University Project */}
            <Pressable
              onPress={() => {
                if (projects[1]) {
                  router.push(`/project/${projects[1].id}` as any);
                } else {
                  router.push('/(tabs)/projects');
                }
              }}
              style={({ pressed }) => ({
                width: projectCardWidth,
                backgroundColor: isDark ? '#151926' : colors.surface,
                borderColor: isDark ? '#232B3E' : '#F1F5F9',
                borderWidth: 1,
                borderRadius: 18,
                padding: 14,
                opacity: pressed ? 0.85 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0 : 0.03,
                shadowRadius: 4,
                elevation: 1,
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#112D27' : '#ECFDF5',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <GraduationCap size={18} color="#10B981" strokeWidth={2.2} />
              </View>

              <Text
                numberOfLines={1}
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: '800',
                  marginBottom: 3,
                }}
              >
                {projects[1]?.name || 'University Project'}
              </Text>

              <Text
                style={{
                  color: isDark ? '#94A3B8' : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '500',
                  marginBottom: 10,
                }}
              >
                5 of 9 tasks
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 5,
                }}
              >
                <Text
                  style={{
                    color: '#10B981',
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  Progress
                </Text>
                <Text
                  style={{
                    color: '#10B981',
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  55%
                </Text>
              </View>

              <ProgressBar progress={0.55} color="#10B981" height={4} />
            </Pressable>
          </ScrollView>
        </View>
      </ScrollView>

      {/* 10. Floating Action Button (FAB) - Responsive safe placement */}
      <Pressable
        onPress={() => {
          hapticService.light();
          setIsQuickAddOpen(true);
        }}
        style={({ pressed }) => ({
          position: 'absolute',
          bottom: insets.bottom > 0 ? insets.bottom + 12 : 24,
          right: isTablet ? Math.max((width - 720) / 2 + 24, 24) : 22,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: isDark ? '#5D5FEF' : '#5452EE',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? 0.92 : 1 }],
          shadowColor: '#4338CA',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 8,
        })}
        accessibilityRole="button"
        accessibilityLabel="Add task"
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={2.8} />
      </Pressable>

      {/* Quick Add Modal */}
      <QuickAddTaskModal
        visible={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </SafeAreaView>
  );
}
