export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RecurrenceRule = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project_id?: string | null;
  project_name?: string | null;
  project_color?: string | null;
  parent_id?: string | null;
  category?: string | null;
  start_at?: string | null;
  due_at?: string | null;
  due_time?: string | null;
  completed_at?: string | null;
  recurrence_rule?: RecurrenceRule;
  estimated_duration?: number | null; // minutes
  notes?: string | null;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
  subtasks?: Subtask[];
  subtask_count?: number;
  subtask_completed_count?: number;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  icon: string;
  due_date?: string | null;
  is_archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  total_tasks?: number;
  completed_tasks?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  task_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  task_count?: number;
}

export interface FocusSession {
  id: string;
  task_id?: string | null;
  task_title?: string | null;
  duration_minutes: number;
  completed_at: string;
  session_type: 'work' | 'short_break' | 'long_break';
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type LanguageMode = 'en' | 'si';
export type DateFormatMode = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
export type TimeFormatMode = '12h' | '24h';
export type DayOfWeek = 'sunday' | 'monday';

export interface AppSettings {
  theme_mode: ThemeMode;
  language: LanguageMode;
  notifications_enabled: boolean;
  daily_reminder_time: string;
  default_priority: TaskPriority;
  date_format: DateFormatMode;
  time_format: TimeFormatMode;
  first_day_of_week: DayOfWeek;
  onboarding_completed: boolean;
  user_name: string;
  user_email: string;
  user_avatar: string;
}

export type TaskFilterView =
  | 'all'
  | 'inbox'
  | 'today'
  | 'upcoming'
  | 'overdue'
  | 'completed'
  | 'archived';

export interface TaskFilterOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  project_id?: string;
  category?: string;
  tag?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  includeArchived?: boolean;
}

export type TaskSortBy =
  | 'due_date_asc'
  | 'due_date_desc'
  | 'priority_desc'
  | 'priority_asc'
  | 'title_asc'
  | 'created_at_desc';
