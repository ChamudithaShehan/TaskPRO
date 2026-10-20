import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Calendar, Flag, Folder, Repeat, Bell } from 'lucide-react-native';

import { useTaskStore } from '@/stores/useTaskStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTheme } from '@/theme/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { hapticService } from '@/services/hapticService';
import { TaskPriority, TaskStatus, RecurrenceRule } from '@/types';

export default function CreateTaskScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const { createTask, deleteTask } = useTaskStore();
  const { projects } = useProjectStore();

  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().split('T')[0];

  const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
  const weekend = new Date(now);
  weekend.setDate(now.getDate() + daysUntilSaturday);
  const weekendISO = weekend.toISOString().split('T')[0];

  const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + daysUntilMonday);
  const nextWeekISO = nextWeek.toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const status: TaskStatus = 'todo';
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string>(todayISO);
  const [dueTime, setDueTime] = useState<string>('');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('none');
  const [hasReminder, setHasReminder] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage('Please enter a task title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createTask({
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        project_id: projectId,
        due_at: dueDate || null,
        due_time: dueTime.trim() || null,
        recurrence_rule: recurrence,
        sort_order: 0,
        is_archived: false,
      });

      const truncated =
        created.title.length > 20
          ? `${created.title.slice(0, 20)}...`
          : created.title;

      showToast({
        message: `Created "${truncated}"`,
        icon: 'check',
        actionLabel: 'Undo',
        onAction: () => deleteTask(created.id),
      });

      router.back();
    } catch {
      setErrorMessage('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Pressable
            hitSlop={10}
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>

          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 16,
              fontWeight: '700',
            }}
          >
            Create Task
          </Text>

          <Pressable
            disabled={!title.trim() || isSubmitting}
            onPress={handleSave}
            style={{
              backgroundColor: title.trim() ? colors.primary : colors.border,
              paddingHorizontal: 16,
              paddingVertical: 7,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
        >
          {errorMessage && (
            <View
              style={{
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
                borderWidth: 1,
                padding: 12,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600' }}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 6,
            }}
          >
            Task Title *
          </Text>
          <TextInput
            placeholder="What needs to be done?"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={(val) => {
              setTitle(val);
              if (errorMessage) setErrorMessage(null);
            }}
            autoFocus
            style={{
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 14,
              fontSize: 15,
              fontWeight: '500',
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 16,
            }}
          />

          {/* Description */}
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 6,
            }}
          >
            Notes & Details
          </Text>
          <TextInput
            placeholder="Add relevant notes, checklist items, or links..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 14,
              fontSize: 13,
              paddingHorizontal: 14,
              paddingVertical: 10,
              minHeight: 90,
              marginBottom: 20,
            }}
          />

          {/* Priority */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Flag size={14} color={colors.textSecondary} />
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
              {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontSize: 12,
                        fontWeight: isSelected ? '700' : '500',
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

          {/* Project Selection */}
          {projects.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Folder size={14} color={colors.textSecondary} />
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
                  onPress={() => setProjectId(null)}
                  style={{
                    backgroundColor:
                      projectId === null ? colors.primary : colors.surface,
                    borderColor:
                      projectId === null ? colors.primary : colors.border,
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: projectId === null ? '#FFFFFF' : colors.textPrimary,
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
                      onPress={() => setProjectId(proj.id)}
                      style={{
                        backgroundColor: isSelected
                          ? proj.color
                          : colors.surface,
                        borderColor: isSelected ? proj.color : colors.border,
                        borderWidth: 1,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
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

          {/* Due Date & Time */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Schedule
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginBottom: 12 }}
            >
              {[
                { label: 'Today', value: todayISO },
                { label: 'Tomorrow', value: tomorrowISO },
                { label: 'This Weekend', value: weekendISO },
                { label: 'Next Week', value: nextWeekISO },
                { label: 'No Date', value: '' },
              ].map((d) => {
                const isSelected = dueDate === d.value;
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
                      borderRadius: 10,
                      borderWidth: 1,
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontSize: 11,
                        fontWeight: '600',
                      }}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                placeholder="Due Date (YYYY-MM-DD)"
                placeholderTextColor={colors.textMuted}
                value={dueDate}
                onChangeText={setDueDate}
                style={{
                  flex: 1,
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  fontSize: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              />

              <TextInput
                placeholder="Time (e.g. 14:00)"
                placeholderTextColor={colors.textMuted}
                value={dueTime}
                onChangeText={setDueTime}
                style={{
                  flex: 1,
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  fontSize: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              />
            </View>
          </View>

          {/* Recurrence */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Repeat size={14} color={colors.textSecondary} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Repeat
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceRule[]).map(
                (r) => {
                  const isSelected = recurrence === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setRecurrence(r)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontSize: 12,
                          fontWeight: isSelected ? '700' : '500',
                          textTransform: 'capitalize',
                        }}
                      >
                        {r}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          </View>

          {/* Reminders Toggle */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Bell size={18} color={colors.primary} />
              <View>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  Send Local Reminder
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                  }}
                >
                  Notify at scheduled due time
                </Text>
              </View>
            </View>
            <Switch
              value={hasReminder}
              onValueChange={setHasReminder}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
