import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Check,
  Trash2,
  X,
  ArrowUpDown,
  Inbox,
} from 'lucide-react-native';

import { useTaskStore } from '@/stores/useTaskStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTheme } from '@/theme/ThemeContext';
import { TaskFilterView, TaskPriority, TaskSortBy } from '@/types';
import { TaskItem } from '@/components/TaskItem';
import { EmptyState } from '@/components/common/EmptyState';
import { QuickAddTaskModal } from '@/components/QuickAddTaskModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useToast } from '@/context/ToastContext';

const FILTER_VIEWS: { key: TaskFilterView; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'inbox', label: 'Inbox' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'all', label: 'All Tasks' },
  { key: 'completed', label: 'Completed' },
  { key: 'archived', label: 'Archived' },
];

export default function TasksScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const {
    tasks,
    filterView,
    sortBy,
    searchQuery,
    loadTasks,
    setFilterView,
    setSortBy,
    setSearchQuery,
    toggleTaskComplete,
    deleteTask,
    createTask,
  } = useTaskStore();

  const { projects } = useProjectStore();

  const [refreshing, setRefreshing] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  // Multi-select mode
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  // Active filters
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  // Filter tasks in memory for real-time responsiveness
  const filteredTasks = tasks.filter((t) => {
    if (selectedPriority && t.priority !== selectedPriority) return false;
    if (selectedProjectId && t.project_id !== selectedProjectId) return false;
    return true;
  });

  const toggleSelectTask = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((item) => item !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleBulkComplete = async () => {
    const idsToToggle = [...selectedTaskIds];
    for (const id of idsToToggle) {
      await toggleTaskComplete(id);
    }
    setSelectedTaskIds([]);
    setIsMultiSelectMode(false);
    showToast({
      message: `${idsToToggle.length} tasks marked complete`,
      icon: 'check',
      actionLabel: 'Undo',
      onAction: async () => {
        for (const id of idsToToggle) {
          await toggleTaskComplete(id);
        }
      },
    });
  };

  const handleBulkDelete = async () => {
    const tasksToDelete = tasks.filter((t) => selectedTaskIds.includes(t.id));
    for (const id of selectedTaskIds) {
      await deleteTask(id);
    }
    setSelectedTaskIds([]);
    setIsMultiSelectMode(false);
    setConfirmDeleteVisible(false);
    showToast({
      message: `${tasksToDelete.length} tasks deleted`,
      icon: 'trash',
      actionLabel: 'Undo',
      onAction: async () => {
        for (const t of tasksToDelete) {
          await createTask({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            project_id: t.project_id,
            due_at: t.due_at,
            due_time: t.due_time,
            recurrence_rule: t.recurrence_rule,
            sort_order: t.sort_order,
            is_archived: t.is_archived,
          });
        }
      },
    });
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      {/* 1. Header with Title and Search/Actions */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 14,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 24,
              fontWeight: '800',
              letterSpacing: -0.5,
            }}
          >
            Tasks
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {isMultiSelectMode ? (
              <Pressable
                onPress={() => {
                  setIsMultiSelectMode(false);
                  setSelectedTaskIds([]);
                }}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 10,
                  backgroundColor: colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setIsMultiSelectMode(true)}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 10,
                  backgroundColor: colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  Select
                </Text>
              </Pressable>
            )}

            <Pressable
              hitSlop={6}
              onPress={() => setIsSortSheetOpen(true)}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <ArrowUpDown size={15} color={colors.textPrimary} strokeWidth={2.2} />
            </Pressable>

            <Pressable
              hitSlop={6}
              onPress={() => setIsFilterSheetOpen(true)}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor:
                  selectedPriority || selectedProjectId
                    ? colors.primary
                    : colors.surfaceElevated,
                borderWidth: 1,
                borderColor:
                  selectedPriority || selectedProjectId
                    ? colors.primary
                    : colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <SlidersHorizontal
                size={15}
                color={
                  selectedPriority || selectedProjectId
                    ? '#FFFFFF'
                    : colors.textPrimary
                }
                strokeWidth={2.2}
              />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 10,
          }}
        >
          <Search size={16} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            placeholder="Search tasks by title..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 13,
              color: colors.textPrimary,
              padding: 0,
            }}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={14} color={colors.textMuted} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>

        {/* 2. Filter View Pills Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {FILTER_VIEWS.map((item) => {
            const isSelected = filterView === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilterView(item.key)}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  borderWidth: 1,
                  backgroundColor: isSelected
                    ? colors.textPrimary
                    : colors.surfaceElevated,
                  borderColor: isSelected ? colors.textPrimary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    color: isSelected ? colors.surface : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: isSelected ? '700' : '600',
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Bulk Action Bar (when multi-select is active) */}
      {isMultiSelectMode && (
        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            paddingHorizontal: 20,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            {selectedTaskIds.length} selected
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Pressable
              disabled={selectedTaskIds.length === 0}
              onPress={handleBulkComplete}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                opacity: selectedTaskIds.length === 0 ? 0.4 : 1,
              }}
            >
              <Check size={14} color={colors.success} strokeWidth={2.5} />
              <Text
                style={{
                  color: colors.success,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                Complete
              </Text>
            </Pressable>

            <Pressable
              disabled={selectedTaskIds.length === 0}
              onPress={() => setConfirmDeleteVisible(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                opacity: selectedTaskIds.length === 0 ? 0.4 : 1,
              }}
            >
              <Trash2 size={14} color={colors.urgent} strokeWidth={2.5} />
              <Text
                style={{
                  color: colors.urgent,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Task List */}
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
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <View
              key={task.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {isMultiSelectMode && (
                <Pressable
                  onPress={() => toggleSelectTask(task.id)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    backgroundColor: selectedTaskIds.includes(task.id)
                      ? colors.primary
                      : 'transparent',
                    borderColor: selectedTaskIds.includes(task.id)
                      ? colors.primary
                      : colors.border,
                  }}
                >
                  {selectedTaskIds.includes(task.id) && (
                    <Check size={13} color="#FFFFFF" strokeWidth={3} />
                  )}
                </Pressable>
              )}

              <View style={{ flex: 1 }}>
                <TaskItem
                  task={task}
                  onToggleComplete={toggleTaskComplete}
                  onPress={
                    isMultiSelectMode
                      ? () => toggleSelectTask(task.id)
                      : undefined
                  }
                />
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon={<Inbox size={26} color={colors.primary} />}
            title="No tasks found"
            description={
              searchQuery
                ? 'Try a different search query or filter.'
                : 'You have no tasks in this view. Enjoy your peace of mind or add one!'
            }
            actionLabel="+ Create Task"
            onAction={() => setIsQuickAddOpen(true)}
          />
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {!isMultiSelectMode && (
        <Pressable
          onPress={() => setIsQuickAddOpen(true)}
          style={({ pressed }) => ({
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.93 : 1 }],
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          })}
          accessibilityRole="button"
          accessibilityLabel="Add task"
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      )}

      {/* Quick Add Modal */}
      <QuickAddTaskModal
        visible={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      {/* Sort Sheet Modal */}
      <Modal
        visible={isSortSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortSheetOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setIsSortSheetOpen(false)}
        >
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
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 16,
                fontWeight: '700',
                marginBottom: 12,
              }}
            >
              Sort Tasks By
            </Text>

            {[
              { key: 'due_date_asc', label: 'Due Date (Earliest first)' },
              { key: 'due_date_desc', label: 'Due Date (Latest first)' },
              { key: 'priority_desc', label: 'Priority (Highest first)' },
              { key: 'priority_asc', label: 'Priority (Lowest first)' },
              { key: 'title_asc', label: 'Title (A-Z)' },
              { key: 'created_at_desc', label: 'Date Created (Newest)' },
            ].map((option) => (
              <Pressable
                key={option.key}
                onPress={() => {
                  setSortBy(option.key as TaskSortBy);
                  setIsSortSheetOpen(false);
                }}
                style={({ pressed }) => ({
                  paddingVertical: 13,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderSubtle,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color:
                      sortBy === option.key
                        ? colors.primary
                        : colors.textPrimary,
                    fontWeight: sortBy === option.key ? '700' : '500',
                    fontSize: 14,
                  }}
                >
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Check size={16} color={colors.primary} strokeWidth={2.5} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Filter Sheet Modal */}
      <Modal
        visible={isFilterSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterSheetOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setIsFilterSheetOpen(false)}
        >
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
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                Filter By
              </Text>
              {(selectedPriority || selectedProjectId) && (
                <Pressable
                  onPress={() => {
                    setSelectedPriority(null);
                    setSelectedProjectId(null);
                  }}
                  hitSlop={8}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    Reset All
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Priority Filter */}
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
              Priority
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => {
                const isSelected = selectedPriority === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() =>
                      setSelectedPriority(isSelected ? null : p)
                    }
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 12,
                      borderWidth: 1,
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
              })}
            </View>

            {/* Project Filter */}
            {projects.length > 0 && (
              <>
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
                  Project
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {projects.map((proj) => {
                    const isSelected = selectedProjectId === proj.id;
                    return (
                      <Pressable
                        key={proj.id}
                        onPress={() =>
                          setSelectedProjectId(isSelected ? null : proj.id)
                        }
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
                </View>
              </>
            )}

            <Pressable
              onPress={() => setIsFilterSheetOpen(false)}
              style={({ pressed }) => ({
                width: '100%',
                height: 46,
                borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                Apply Filters
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Confirm Bulk Delete Dialog */}
      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Delete Selected Tasks"
        message={`Are you sure you want to permanently delete ${selectedTaskIds.length} tasks? This action cannot be undone.`}
        confirmLabel="Delete All"
        isDestructive
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
    </SafeAreaView>
  );
}
