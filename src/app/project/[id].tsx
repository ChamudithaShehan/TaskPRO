import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Folder,
  Calendar,
  CheckCircle2,
} from 'lucide-react-native';

import { useProjectStore } from '@/stores/useProjectStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTheme } from '@/theme/ThemeContext';
import { projectRepository } from '@/repositories/projectRepository';
import { Project } from '@/types';
import { TaskItem } from '@/components/TaskItem';
import { ProgressBar } from '@/components/common/ProgressBar';
import { QuickAddTaskModal } from '@/components/QuickAddTaskModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const { deleteProject } = useProjectStore();
  const { tasks, toggleTaskComplete } = useTaskStore();

  const [project, setProject] = useState<Project | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const p = await projectRepository.getProjectById(id);
      if (p) setProject(p);
    }
    load();
  }, [id, tasks]);

  if (!project) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center p-6"
      >
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          Project not found.
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

  const projectTasks = tasks.filter(
    (t) => t.project_id === project.id && !t.is_archived
  );
  const completedTasks = projectTasks.filter((t) => t.status === 'completed');
  const progress =
    projectTasks.length > 0 ? completedTasks.length / projectTasks.length : 0;

  const handleDelete = async () => {
    await deleteProject(project.id);
    setDeleteConfirmVisible(false);
    router.back();
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      {/* 1. Header */}
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
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
        </Pressable>

        <Pressable
          hitSlop={8}
          onPress={() => setDeleteConfirmVisible(true)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surfaceElevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trash2 size={16} color={colors.urgent} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 110 }}
      >
        {/* Project Header Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: `${project.color}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Folder size={24} color={project.color} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 22,
                fontWeight: '700',
              }}
            >
              {project.name}
            </Text>
            {project.due_date && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Calendar size={12} color={colors.textMuted} />
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  Deadline: {project.due_date}
                </Text>
              </View>
            )}
          </View>
        </View>

        {project.description && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              lineHeight: 20,
              marginBottom: 16,
              marginTop: 4,
            }}
          >
            {project.description}
          </Text>
        )}

        {/* Progress Summary Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              Overall Progress
            </Text>
            <Text
              style={{
                color: project.color,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {Math.round(progress * 100)}% ({completedTasks.length}/{projectTasks.length})
            </Text>
          </View>
          <ProgressBar progress={progress} color={project.color} height={8} />
        </View>

        {/* Tasks in Project */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 13,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Tasks ({projectTasks.length})
          </Text>

          <Pressable
            onPress={() => setIsQuickAddOpen(true)}
            style={{
              backgroundColor: colors.primaryLight,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}
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

        {projectTasks.length > 0 ? (
          projectTasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onToggleComplete={toggleTaskComplete}
            />
          ))
        ) : (
          <EmptyState
            icon={<CheckCircle2 size={24} color={project.color} />}
            title="No tasks in this project"
            description="Add tasks to this project to start tracking your milestones and progress."
            actionLabel="+ Add Project Task"
            onAction={() => setIsQuickAddOpen(true)}
          />
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => setIsQuickAddOpen(true)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: project.color,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: project.color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>

      {/* Quick Add Modal */}
      <QuickAddTaskModal
        visible={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultProjectId={project.id}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title="Delete Project?"
        message={`Are you sure you want to delete "${project.name}"? Tasks associated with this project will be preserved in Inbox.`}
        confirmLabel="Delete Project"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}
