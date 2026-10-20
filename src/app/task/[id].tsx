import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Calendar,
  Repeat,
  Folder,
  Trash2,
  Copy,
  Archive,
  Check,
  Plus,
  CheckSquare,
} from 'lucide-react-native';

import { useTaskStore } from '@/stores/useTaskStore';
import { useTheme } from '@/theme/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { Task, Subtask } from '@/types';
import { taskRepository } from '@/repositories/taskRepository';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const {
    createTask,
    toggleTaskComplete,
    deleteTask,
    duplicateTask,
    archiveTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useTaskStore();

  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  useEffect(() => {
    async function loadTask() {
      if (!id) return;
      const t = await taskRepository.getTaskById(id);
      if (t) {
        setTask(t);
        const subs = await taskRepository.getSubtasks(id);
        setSubtasks(subs);
      }
    }
    loadTask();
  }, [id]);

  if (!task) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center p-6"
      >
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          Task not found or has been removed.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-indigo-600 rounded-xl"
        >
          <Text className="text-white text-xs font-semibold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isCompleted = task.status === 'completed';

  const handleToggle = async () => {
    await toggleTaskComplete(task.id);
    const updated = await taskRepository.getTaskById(task.id);
    if (updated) setTask(updated);
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    const sub = await addSubtask(task.id, newSubtaskTitle.trim());
    setSubtasks((prev) => [...prev, sub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    await toggleSubtask(subtaskId);
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s
      )
    );
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await deleteSubtask(subtaskId);
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
  };

  const handleDuplicate = async () => {
    const dup = await duplicateTask(task.id);
    if (dup) {
      router.replace(`/task/${dup.id}` as any);
    }
  };

  const handleArchive = async () => {
    const targetState = !task.is_archived;
    await archiveTask(task.id, targetState);
    showToast({
      message: targetState ? 'Task archived' : 'Task restored from archive',
      icon: 'archive',
      actionLabel: 'Undo',
      onAction: () => archiveTask(task.id, !targetState),
    });
    router.back();
  };

  const handleDelete = async () => {
    const backupTask = { ...task };
    await deleteTask(task.id);
    setDeleteConfirmVisible(false);
    showToast({
      message: `Deleted "${task.title.length > 20 ? task.title.slice(0, 20) + '...' : task.title}"`,
      icon: 'trash',
      actionLabel: 'Undo',
      onAction: async () => {
        await createTask({
          id: backupTask.id,
          title: backupTask.title,
          description: backupTask.description,
          status: backupTask.status,
          priority: backupTask.priority,
          project_id: backupTask.project_id,
          due_at: backupTask.due_at,
          due_time: backupTask.due_time,
          recurrence_rule: backupTask.recurrence_rule,
          sort_order: backupTask.sort_order,
          is_archived: backupTask.is_archived,
        });
      },
    });
    router.back();
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      {/* 1. Top Navigation Bar */}
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
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Duplicate button */}
          <Pressable
            hitSlop={8}
            onPress={handleDuplicate}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.surfaceElevated,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Duplicate task"
          >
            <Copy size={15} color={colors.textSecondary} strokeWidth={2.2} />
          </Pressable>

          {/* Archive button */}
          <Pressable
            hitSlop={8}
            onPress={handleArchive}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.surfaceElevated,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Archive task"
          >
            <Archive size={15} color={colors.textSecondary} strokeWidth={2.2} />
          </Pressable>

          {/* Delete button */}
          <Pressable
            hitSlop={8}
            onPress={() => setDeleteConfirmVisible(true)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.surfaceElevated,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Delete task"
          >
            <Trash2 size={15} color={colors.urgent} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 }}
      >
        {/* Checkbox and Title */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <Pressable
            hitSlop={8}
            onPress={handleToggle}
            style={{ marginTop: 2 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isCompleted }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isCompleted ? colors.primary : colors.textMuted,
                backgroundColor: isCompleted ? colors.primary : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isCompleted && (
                <Check size={14} strokeWidth={3} color="#FFFFFF" />
              )}
            </View>
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: isCompleted ? colors.textMuted : colors.textPrimary,
                textDecorationLine: isCompleted ? 'line-through' : 'none',
                fontSize: 20,
                fontWeight: '700',
                lineHeight: 26,
              }}
            >
              {task.title}
            </Text>
          </View>
        </View>

        {/* Status & Priority Badges */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </View>

        {/* Description Section */}
        {task.description && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
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
              Description & Notes
            </Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {task.description}
            </Text>
          </View>
        )}

        {/* Metadata Details Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            gap: 12,
          }}
        >
          {/* Due Date & Time */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                Due Date
              </Text>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {task.due_at || 'No date set'}
              {task.due_time ? ` at ${task.due_time}` : ''}
            </Text>
          </View>

          {/* Project */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Folder size={16} color={colors.textSecondary} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                Project
              </Text>
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {task.project_name || 'Inbox'}
            </Text>
          </View>

          {/* Recurrence */}
          {task.recurrence_rule && task.recurrence_rule !== 'none' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Repeat size={16} color={colors.textSecondary} />
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '500',
                  }}
                >
                  Recurrence
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 12,
                  fontWeight: '700',
                  textTransform: 'capitalize',
                }}
              >
                {task.recurrence_rule}
              </Text>
            </View>
          )}

          {/* Created date */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: colors.borderSubtle,
            }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
              }}
            >
              Created on
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
              }}
            >
              {task.created_at.split('T')[0]}
            </Text>
          </View>
        </View>

        {/* 2. Subtasks / Checklist Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CheckSquare size={16} color={colors.textPrimary} />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 13,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Subtasks ({subtasks.filter((s) => s.is_completed).length}/{subtasks.length})
              </Text>
            </View>
          </View>

          {/* Subtasks list */}
          {subtasks.map((sub) => (
            <View
              key={sub.id}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Pressable
                onPress={() => handleToggleSubtask(sub.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    borderWidth: 1.5,
                    backgroundColor: sub.is_completed ? colors.primary : 'transparent',
                    borderColor: sub.is_completed ? colors.primary : colors.textMuted,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sub.is_completed && (
                    <Check size={11} color="#FFFFFF" strokeWidth={3} />
                  )}
                </View>
                <Text
                  style={{
                    color: sub.is_completed ? colors.textMuted : colors.textPrimary,
                    textDecorationLine: sub.is_completed ? 'line-through' : 'none',
                    fontSize: 13,
                    fontWeight: '500',
                    flex: 1,
                  }}
                >
                  {sub.title}
                </Text>
              </Pressable>

              <Pressable
                hitSlop={8}
                onPress={() => handleDeleteSubtask(sub.id)}
                style={{
                  marginLeft: 8,
                  padding: 4,
                }}
              >
                <Trash2 size={14} color={colors.textMuted} />
              </Pressable>
            </View>
          ))}

          {/* Add Subtask Input */}
          <View
            style={{
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginTop: 4,
            }}
          >
            <TextInput
              placeholder="Add a checklist item..."
              placeholderTextColor={colors.textMuted}
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              onSubmitEditing={handleAddSubtask}
              style={{
                flex: 1,
                fontSize: 13,
                paddingVertical: 8,
                color: colors.textPrimary,
              }}
            />
            {newSubtaskTitle.trim() ? (
              <Pressable
                onPress={handleAddSubtask}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title="Delete Task?"
        message={`Are you sure you want to permanently delete "${task.title}"?`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}
