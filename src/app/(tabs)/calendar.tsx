import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react-native';

import { useTaskStore } from '@/stores/useTaskStore';
import { useTheme } from '@/theme/ThemeContext';
import { TaskItem } from '@/components/TaskItem';
import { EmptyState } from '@/components/common/EmptyState';
import { QuickAddTaskModal } from '@/components/QuickAddTaskModal';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const { colors } = useTheme();
  const { tasks, toggleTaskComplete } = useTaskStore();

  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayISO);
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      days.push({ dateStr, dayNumber: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const m = currentMonth + 1;
      const dateStr = `${currentYear}-${m.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      days.push({ dateStr, dayNumber: i, isCurrentMonth: true });
    }

    // Next month padding to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const m = currentMonth + 2 > 12 ? 1 : currentMonth + 2;
      const y = currentMonth + 2 > 12 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${m.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      days.push({ dateStr, dayNumber: i, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Tasks mapped by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tasks) {
      if (t.due_at && !t.is_archived) {
        map[t.due_at] = (map[t.due_at] || 0) + 1;
      }
    }
    return map;
  }, [tasks]);

  // Selected date tasks
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => t.due_at === selectedDate && !t.is_archived);
  }, [tasks, selectedDate]);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const formattedSelectedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      {/* 1. Month Navigation Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 22,
              fontWeight: '800',
              letterSpacing: -0.5,
            }}
          >
            {monthName}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={handleJumpToToday}
            style={({ pressed }) => ({
              paddingHorizontal: 10,
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
              Today
            </Text>
          </Pressable>

          <Pressable
            onPress={handlePrevMonth}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ChevronLeft size={18} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>

          <Pressable
            onPress={handleNextMonth}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ChevronRight size={18} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* 2. Days of week header */}
        <View
          style={{
            backgroundColor: colors.surface,
            flexDirection: 'row',
            paddingHorizontal: 12,
            paddingTop: 12,
            paddingBottom: 6,
          }}
        >
          {DAYS_OF_WEEK.map((day) => (
            <View key={day} style={{ flex: 1, alignItems: 'center' }}>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* 3. Monthly Calendar Grid */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            paddingHorizontal: 12,
            paddingBottom: 14,
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}
        >
          {calendarDays.map((d, index) => {
            const isSelected = selectedDate === d.dateStr;
            const isToday = todayISO === d.dateStr;
            const taskCount = tasksByDate[d.dateStr] || 0;

            return (
              <Pressable
                key={`${d.dateStr}-${index}`}
                onPress={() => setSelectedDate(d.dateStr)}
                style={{
                  width: '14.28%',
                  alignItems: 'center',
                  paddingVertical: 4,
                  position: 'relative',
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected
                      ? colors.primary
                      : isToday
                      ? colors.primaryLight
                      : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      color: isSelected
                        ? '#FFFFFF'
                        : isToday
                        ? colors.primary
                        : d.isCurrentMonth
                        ? colors.textPrimary
                        : colors.textMuted,
                      fontWeight: isSelected || isToday ? '700' : '500',
                      fontSize: 13,
                    }}
                  >
                    {d.dayNumber}
                  </Text>
                </View>

                {/* Task Dot Indicator */}
                {taskCount > 0 && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.primary,
                      marginTop: 3,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* 4. Selected Day Agenda Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 2,
              }}
            >
              Agenda
            </Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 18,
                fontWeight: '800',
              }}
            >
              {formattedSelectedDate}
            </Text>
          </View>

          <Pressable
            onPress={() => setIsQuickAddOpen(true)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10,
              backgroundColor: colors.primaryLight,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Plus size={14} color={colors.primary} strokeWidth={2.5} />
            <Text
              style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              Add Task
            </Text>
          </Pressable>
        </View>

        {/* 5. Tasks for selected date */}
        <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
          {selectedDateTasks.length > 0 ? (
            selectedDateTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskComplete}
              />
            ))
          ) : (
            <EmptyState
              icon={<CalendarIcon size={24} color={colors.primary} />}
              title="No tasks scheduled"
              description={`There are no tasks set for ${formattedSelectedDate}. Add one to stay organized!`}
              actionLabel="+ Schedule Task"
              onAction={() => setIsQuickAddOpen(true)}
            />
          )}
        </View>
      </ScrollView>

      {/* Quick Add Modal with selected date preset */}
      <QuickAddTaskModal
        visible={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultDate={selectedDate}
      />
    </SafeAreaView>
  );
}
