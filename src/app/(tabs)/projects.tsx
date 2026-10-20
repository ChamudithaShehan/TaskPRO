import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, Folder } from 'lucide-react-native';

import { useProjectStore } from '@/stores/useProjectStore';
import { useTheme } from '@/theme/ThemeContext';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState } from '@/components/common/EmptyState';

const PROJECT_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#64748B', // Slate
];

export default function ProjectsScreen() {
  const { colors } = useTheme();
  const { projects, loadProjects, createProject } = useProjectStore();

  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleCreateProject = async () => {
    if (!name.trim()) return;

    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || null,
        color: selectedColor,
        icon: 'folder',
        due_date: dueDate.trim() || null,
        is_archived: false,
        sort_order: projects.length + 1,
      });

      setName('');
      setDescription('');
      setDueDate('');
      setIsCreateModalOpen(false);
    } catch {
      // Ignored
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      {/* 1. Header */}
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
              fontSize: 24,
              fontWeight: '800',
              letterSpacing: -0.5,
            }}
          >
            Projects
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: '500',
              marginTop: 2,
            }}
          >
            {projects.length} active {projects.length === 1 ? 'project' : 'projects'}
          </Text>
        </View>

        <Pressable
          onPress={() => setIsCreateModalOpen(true)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: colors.primary,
            opacity: pressed ? 0.85 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Create new project"
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
            New Project
          </Text>
        </Pressable>
      </View>

      {/* 2. Projects List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 110,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <EmptyState
            icon={<Folder size={26} color={colors.primary} />}
            title="No projects yet"
            description="Organize your work, personal goals, and milestones into clean focused projects."
            actionLabel="+ Create Project"
            onAction={() => setIsCreateModalOpen(true)}
          />
        )}
      </ScrollView>

      {/* Create Project Modal */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setIsCreateModalOpen(false)}
          />

          <View
            style={{
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
            }}
          >
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
                Create Project
              </Text>
              <Pressable
                hitSlop={10}
                onPress={() => setIsCreateModalOpen(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: colors.surfaceElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} color={colors.textSecondary} strokeWidth={2.2} />
              </Pressable>
            </View>

            {/* Project Name */}
            <TextInput
              placeholder="Project Name (e.g., Mobile App Launch)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
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

            {/* Description */}
            <TextInput
              placeholder="Description or key goals (optional)"
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
                paddingVertical: 10,
                fontSize: 13,
                marginBottom: 14,
              }}
            />

            {/* Color Palette Selector */}
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  marginBottom: 8,
                }}
              >
                Project Color
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {PROJECT_COLORS.map((col) => {
                  const isSelected = selectedColor === col;
                  return (
                    <Pressable
                      key={col}
                      onPress={() => setSelectedColor(col)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: col,
                        borderColor: isSelected ? colors.textPrimary : 'transparent',
                        borderWidth: isSelected ? 3 : 0,
                      }}
                    />
                  );
                })}
              </View>
            </View>

            {/* Target Deadline */}
            <View style={{ marginBottom: 16 }}>
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
                Target Deadline (optional, YYYY-MM-DD)
              </Text>
              <TextInput
                placeholder="e.g., 2026-11-15"
                placeholderTextColor={colors.textMuted}
                value={dueDate}
                onChangeText={setDueDate}
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 13,
                }}
              />
            </View>

            {/* Submit */}
            <Pressable
              disabled={!name.trim()}
              onPress={handleCreateProject}
              style={({ pressed }) => ({
                width: '100%',
                height: 48,
                borderRadius: 14,
                backgroundColor: name.trim() ? colors.primary : colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                Create Project
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
