import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Clock, CheckSquare } from 'lucide-react-native';
import { Task } from '@/types';
import { useTheme } from '@/theme/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { PriorityBadge } from './common/PriorityBadge';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onPress?: (task: Task) => void;
}

export function TaskItem({ task, onToggleComplete, onPress }: TaskItemProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  const isCompleted = task.status === 'completed';

  const handleCardPress = () => {
    if (onPress) {
      onPress(task);
    } else {
      router.push(`/task/${task.id}` as any);
    }
  };

  const handleToggle = () => {
    onToggleComplete(task.id);
    if (!isCompleted) {
      const truncatedTitle =
        task.title.length > 22 ? `${task.title.slice(0, 22)}...` : task.title;
      showToast({
        message: `Completed "${truncatedTitle}"`,
        icon: 'check',
        actionLabel: 'Undo',
        onAction: () => onToggleComplete(task.id),
      });
    }
  };

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderColor: isDark ? '#232B3E' : '#F1F5F9',
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 8,
        opacity: pressed ? 0.85 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0 : 0.02,
        shadowRadius: 3,
        elevation: 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, ${isCompleted ? 'completed' : 'incomplete'}`}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            flex: 1,
            minWidth: 0,
            marginRight: 8,
          }}
        >
          {/* Checkbox (Rounded square outline or filled dark green) */}
          <Pressable
            hitSlop={8}
            onPress={handleToggle}
            style={{ marginTop: 2, flexShrink: 0 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isCompleted }}
            accessibilityLabel={`Mark ${task.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                borderWidth: isCompleted ? 0 : 1.8,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isCompleted
                  ? isDark
                    ? '#059669'
                    : '#047857'
                  : 'transparent',
                borderColor: isCompleted
                  ? isDark
                    ? '#059669'
                    : '#047857'
                  : isDark
                  ? '#374151'
                  : '#CBD5E1',
              }}
            >
              {isCompleted && (
                <Check size={13} strokeWidth={3} color="#FFFFFF" />
              )}
            </View>
          </Pressable>

          {/* Title & Metadata */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={2}
              style={{
                color: isCompleted
                  ? isDark
                    ? '#6B7280'
                    : '#9CA3AF'
                  : colors.textPrimary,
                textDecorationLine: isCompleted ? 'line-through' : 'none',
                fontSize: 14.5,
                fontWeight: '700',
                lineHeight: 19,
              }}
            >
              {task.title}
            </Text>

            {/* Compact Metadata Row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 5,
                marginTop: 4,
              }}
            >
              {/* Project Tag */}
              {Boolean(task.project_name) && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: task.project_color || '#4F46E5',
                    }}
                  />
                  <Text
                    style={{
                      color: task.project_color || (isDark ? '#818CF8' : '#4F46E5'),
                      fontSize: 11.5,
                      fontWeight: '600',
                    }}
                  >
                    {task.project_name}
                  </Text>
                </View>
              )}

              {/* Time Indicator */}
              {Boolean(task.due_time) && (
                <>
                  {Boolean(task.project_name) && (
                    <Text style={{ color: '#94A3B8', fontSize: 10 }}>•</Text>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} color="#64748B" strokeWidth={2} />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11.5,
                        fontWeight: '500',
                      }}
                    >
                      {task.due_time}
                    </Text>
                  </View>
                </>
              )}

              {/* Subtasks Indicator */}
              {Boolean(task.subtask_count && task.subtask_count > 0) && (
                <>
                  <Text style={{ color: '#94A3B8', fontSize: 10 }}>•</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <CheckSquare size={11} color="#64748B" strokeWidth={2} />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11.5,
                        fontWeight: '500',
                      }}
                    >
                      {task.subtask_completed_count}/{task.subtask_count}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Priority Badge (P1, P2, P3, P4) */}
        <PriorityBadge priority={task.priority} variant="short" />
      </View>
    </Pressable>
  );
}
