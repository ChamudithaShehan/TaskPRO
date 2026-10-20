import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  X,
  Calendar,
  Flag,
  Folder,
  Sun,
  Sunrise,
  Coffee,
  CalendarDays,
  XCircle,
  Plus,
} from 'lucide-react-native';
import { useTaskStore } from '@/stores/useTaskStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTheme } from '@/theme/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { TaskPriority } from '@/types';
import { hapticService } from '@/services/hapticService';

interface QuickAddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultDate?: string;
}

export function QuickAddTaskModal({
  visible,
  onClose,
  defaultProjectId,
  defaultDate,
}: QuickAddTaskModalProps) {
  const { colors } = useTheme();
  const { createTask, deleteTask } = useTaskStore();
  const { projects } = useProjectStore();
  const { showToast } = useToast();

  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().split('T')[0];

  // Upcoming Saturday
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
  const weekend = new Date(now);
  weekend.setDate(now.getDate() + daysUntilSaturday);
  const weekendISO = weekend.toISOString().split('T')[0];

  // Upcoming Monday
  const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + daysUntilMonday);
  const nextWeekISO = nextWeek.toISOString().split('T')[0];

  const dateShortcuts = useMemo(
    () => [
      { label: 'Today', value: todayISO, icon: Sun },
      { label: 'Tomorrow', value: tomorrowISO, icon: Sunrise },
      { label: 'Weekend', value: weekendISO, icon: Coffee },
      { label: 'Next Week', value: nextWeekISO, icon: CalendarDays },
      { label: 'No Date', value: '', icon: XCircle },
    ],
    [todayISO, tomorrowISO, weekendISO, nextWeekISO]
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>(defaultDate || todayISO);
  const [dueTime, setDueTime] = useState<string>('');
  const [projectId, setProjectId] = useState<string | null>(
    defaultProjectId || null
  );
  const [keepOpen, setKeepOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await createTask({
        title: title.trim(),
        description: description.trim() || null,
        status: 'todo',
        priority,
        project_id: projectId,
        due_at: dueDate || null,
        due_time: dueTime.trim() || null,
        recurrence_rule: 'none',
        sort_order: 0,
        is_archived: false,
      });

      const truncated =
        created.title.length > 20
          ? `${created.title.slice(0, 20)}...`
          : created.title;

      showToast({
        message: `Added "${truncated}"`,
        icon: 'check',
        actionLabel: 'Undo',
        onAction: () => deleteTask(created.id),
      });

      if (keepOpen) {
        setTitle('');
        setDescription('');
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate(todayISO);
        setDueTime('');
        setProjectId(null);
        onClose();
      }
    } catch {
      // Ignored
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <View
          style={{
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            maxHeight: '85%',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 17,
                fontWeight: '700',
              }}
            >
              Quick Task Entry
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {/* Rapid entry toggle */}
              <Pressable
                onPress={() => {
                  hapticService.selection();
                  setKeepOpen(!keepOpen);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: keepOpen
                    ? colors.primaryLight
                    : colors.surfaceElevated,
                }}
              >
                <Plus
                  size={13}
                  color={keepOpen ? colors.primary : colors.textSecondary}
                  strokeWidth={2.5}
                />
                <Text
                  style={{
                    color: keepOpen ? colors.primary : colors.textSecondary,
                    fontSize: 11,
                    fontWeight: '600',
                  }}
                >
                  Add Another
                </Text>
              </Pressable>

              <Pressable
                hitSlop={10}
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} color={colors.textSecondary} strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>

          {/* Title Input */}
          <TextInput
            placeholder="What needs to be done?"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={handleSubmit}
            returnKeyType={keepOpen ? 'next' : 'done'}
            autoFocus
            style={{
              color: colors.textPrimary,
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              fontWeight: '600',
              marginBottom: 10,
            }}
          />

          {/* Description Input (Optional) */}
          <TextInput
            placeholder="Add quick notes or links (optional)"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            style={{
              color: colors.textPrimary,
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 9,
              fontSize: 13,
              marginBottom: 14,
            }}
          />

          {/* Smart Date Shortcuts */}
          <View style={{ marginBottom: 14 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
              }}
            >
              <Calendar size={13} color={colors.textSecondary} strokeWidth={2} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Due Date
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {dateShortcuts.map((d) => {
                const isSelected = dueDate === d.value;
                const IconComponent = d.icon;
                return (
                  <Pressable
                    key={d.label}
                    onPress={() => {
                      hapticService.selection();
                      setDueDate(d.value);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 12,
                      borderWidth: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surfaceElevated,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }}
                  >
                    <IconComponent
                      size={13}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Priority Row */}
          <View style={{ marginBottom: 14 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
              }}
            >
              <Flag size={13} color={colors.textSecondary} strokeWidth={2} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Priority
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(
                (p) => {
                  const isSelected = priority === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => {
                        hapticService.selection();
                        setPriority(p);
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.surfaceElevated,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontSize: 12,
                          fontWeight: '600',
                          textTransform: 'capitalize',
                        }}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          </View>

          {/* Project Row */}
          {projects.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <Folder size={13} color={colors.textSecondary} strokeWidth={2} />
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  Project
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                <Pressable
                  onPress={() => {
                    hapticService.selection();
                    setProjectId(null);
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 12,
                    borderWidth: 1,
                    backgroundColor:
                      projectId === null
                        ? colors.primary
                        : colors.surfaceElevated,
                    borderColor:
                      projectId === null ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color:
                        projectId === null ? '#FFFFFF' : colors.textPrimary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    Inbox
                  </Text>
                </Pressable>

                {projects.map((proj) => {
                  const isSelected = projectId === proj.id;
                  return (
                    <Pressable
                      key={proj.id}
                      onPress={() => {
                        hapticService.selection();
                        setProjectId(proj.id);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderRadius: 12,
                        borderWidth: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: isSelected
                          ? proj.color
                          : colors.surfaceElevated,
                        borderColor: isSelected ? proj.color : colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: isSelected ? '#FFFFFF' : proj.color,
                        }}
                      />
                      <Text
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontSize: 12,
                          fontWeight: '600',
                        }}
                      >
                        {proj.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            disabled={!title.trim() || isSubmitting}
            onPress={handleSubmit}
            style={({ pressed }) => ({
              width: '100%',
              height: 48,
              borderRadius: 14,
              backgroundColor: title.trim() ? colors.primary : colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 4,
              opacity: pressed ? 0.85 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Create task"
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
              {isSubmitting
                ? 'Adding...'
                : keepOpen
                ? 'Add & Next Task'
                : 'Create Task'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
