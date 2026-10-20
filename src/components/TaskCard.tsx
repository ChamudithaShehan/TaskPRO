import React from 'react';
import { TaskItem } from './TaskItem';
import { Task } from '@/types';

interface TaskCardProps {
  task: any;
  onToggleComplete: (id: string) => void;
  onPress?: (task: any) => void;
}

export function TaskCard({ task, onToggleComplete, onPress }: TaskCardProps) {
  // Normalize task for TaskItem
  const normalizedTask: Task = {
    id: task.id,
    title: task.title,
    description: task.description || null,
    status: task.status || (task.completed ? 'completed' : 'todo'),
    priority: task.priority || 'medium',
    project_id: task.project_id || null,
    project_name: task.project_name || null,
    project_color: task.project_color || null,
    due_at: task.due_at || task.dueDate || null,
    due_time: task.due_time || task.time || null,
    sort_order: task.sort_order || 0,
    is_archived: Boolean(task.is_archived),
    created_at: task.created_at || new Date().toISOString(),
    updated_at: task.updated_at || new Date().toISOString(),
    recurrence_rule: task.recurrence_rule || 'none',
    subtask_count: task.subtask_count || 0,
    subtask_completed_count: task.subtask_completed_count || 0,
  };

  return (
    <TaskItem
      task={normalizedTask}
      onToggleComplete={onToggleComplete}
      onPress={onPress}
    />
  );
}
