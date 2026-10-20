import React, { useEffect } from 'react';
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
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Target,
} from 'lucide-react-native';

import { useFocusStore } from '@/stores/useFocusStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTheme } from '@/theme/ThemeContext';

export default function FocusTimerScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    sessionType,
    timeLeft,
    isRunning,
    linkedTaskId,
    completedSessionsCount,
    history,
    start,
    pause,
    reset,
    tick,
    setSessionType,
    linkTask,
    loadHistory,
  } = useFocusStore();

  const { tasks } = useTaskStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const availableTasks = tasks.filter(
    (t) => t.status !== 'completed' && !t.is_archived
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
          Focus Timer
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: colors.surfaceElevated,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <CheckCircle2 size={12} color={colors.primary} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            {completedSessionsCount}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 }}
      >
        {/* Session Type Switcher */}
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            backgroundColor: colors.surfaceElevated,
            padding: 4,
            borderRadius: 14,
            marginBottom: 28,
          }}
        >
          {[
            { type: 'work', label: 'Focus (25m)' },
            { type: 'short_break', label: 'Short Break (5m)' },
            { type: 'long_break', label: 'Long Break (15m)' },
          ].map((tab) => {
            const isSelected = sessionType === tab.type;
            return (
              <Pressable
                key={tab.type}
                onPress={() => setSessionType(tab.type as any)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? colors.surface : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: isSelected ? colors.primary : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                    fontSize: 11,
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Big Timer Circle Display */}
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          <View
            style={{
              width: 220,
              height: 220,
              borderRadius: 110,
              borderWidth: 4,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 48,
                fontWeight: '800',
                letterSpacing: -1,
                fontFamily: 'monospace',
              }}
            >
              {formattedTime}
            </Text>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginTop: 6,
              }}
            >
              {sessionType === 'work' ? 'Deep Work Session' : 'Rest & Recharge'}
            </Text>
          </View>
        </View>

        {/* Timer Controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 28 }}>
          <Pressable
            hitSlop={8}
            onPress={reset}
            style={({ pressed }) => ({
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityLabel="Reset timer"
          >
            <RotateCcw size={18} color={colors.textSecondary} strokeWidth={2.2} />
          </Pressable>

          <Pressable
            onPress={isRunning ? pause : start}
            style={({ pressed }) => ({
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.94 : 1 }],
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
              elevation: 5,
            })}
            accessibilityLabel={isRunning ? 'Pause timer' : 'Start timer'}
          >
            {isRunning ? (
              <Pause size={28} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <Play size={28} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 3 }} />
            )}
          </Pressable>
        </View>

        {/* Link Task Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Target size={15} color={colors.textPrimary} />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              Linked Task
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <Pressable
              onPress={() => linkTask(null, null)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 12,
                borderWidth: 1,
                backgroundColor:
                  linkedTaskId === null ? colors.primary : colors.surface,
                borderColor:
                  linkedTaskId === null ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  color: linkedTaskId === null ? '#FFFFFF' : colors.textPrimary,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                No Task
              </Text>
            </Pressable>

            {availableTasks.slice(0, 6).map((t) => {
              const isSelected = linkedTaskId === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => linkTask(t.id, t.title)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 12,
                    borderWidth: 1,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {t.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Session History */}
        {history.length > 0 && (
          <View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 10,
                marginLeft: 2,
              }}
            >
              Recent Focus History
            </Text>
            {history.slice(0, 4).map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Clock size={14} color={colors.primary} />
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    {item.task_title || 'General Focus'}
                  </Text>
                </View>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {item.duration_minutes} min
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
