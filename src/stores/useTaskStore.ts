import { create } from 'zustand';
import { Task, Subtask, TaskFilterOptions, TaskSortBy, TaskFilterView } from '@/types';
import { taskRepository } from '@/repositories/taskRepository';
import { hapticService } from '@/services/hapticService';
import { notificationService } from '@/services/notificationService';

interface TaskStats {
  todayTotal: number;
  todayCompleted: number;
  overdueCount: number;
  upcomingCount: number;
  totalCompleted: number;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filterView: TaskFilterView;
  filterOptions: TaskFilterOptions;
  sortBy: TaskSortBy;
  searchQuery: string;
  stats: TaskStats;

  // Actions
  loadTasks: () => Promise<void>;
  createTask: (
    data: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<Task | null>;
  archiveTask: (id: string, archive?: boolean) => Promise<void>;
  rescheduleTasks: (ids: string[], newDueAt: string) => Promise<void>;
  setFilterView: (view: TaskFilterView) => void;
  setFilterOptions: (options: Partial<TaskFilterOptions>) => void;
  setSortBy: (sortBy: TaskSortBy) => void;
  setSearchQuery: (query: string) => void;
  addSubtask: (taskId: string, title: string) => Promise<Subtask>;
  toggleSubtask: (subtaskId: string) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  filterView: 'today',
  filterOptions: {},
  sortBy: 'due_date_asc',
  searchQuery: '',
  stats: {
    todayTotal: 0,
    todayCompleted: 0,
    overdueCount: 0,
    upcomingCount: 0,
    totalCompleted: 0,
  },

  loadTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filterView, filterOptions, sortBy, searchQuery } = get();
      const todayISO = new Date().toISOString().split('T')[0];

      const mergedFilter: TaskFilterOptions = {
        ...filterOptions,
        search: searchQuery || filterOptions.search,
      };

      if (filterView === 'today') {
        mergedFilter.startDate = todayISO;
        mergedFilter.endDate = todayISO;
      } else if (filterView === 'upcoming') {
        mergedFilter.startDate = todayISO;
      } else if (filterView === 'overdue') {
        mergedFilter.endDate = todayISO;
      } else if (filterView === 'completed') {
        mergedFilter.status = 'completed';
      } else if (filterView === 'archived') {
        mergedFilter.includeArchived = true;
      }

      const tasks = await taskRepository.getTasks(mergedFilter, sortBy);
      const stats = await taskRepository.getTaskStats();

      set({ tasks, stats, isLoading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createTask: async (data) => {
    try {
      const newTask = await taskRepository.createTask(data);
      hapticService.light();

      // Schedule notification if due date/time provided
      if (newTask.due_at) {
        notificationService.scheduleTaskReminder(
          newTask.id,
          newTask.title,
          newTask.due_at,
          newTask.due_time || undefined
        );
      }

      await get().loadTasks();
      return newTask;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      set({ error: errorMessage });
      throw err;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const updated = await taskRepository.updateTask(id, updates);
      await get().loadTasks();
      return updated;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      set({ error: errorMessage });
      return null;
    }
  },

  deleteTask: async (id) => {
    try {
      hapticService.medium();
      await taskRepository.deleteTask(id);
      await get().loadTasks();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      set({ error: errorMessage });
    }
  },

  toggleTaskComplete: async (id) => {
    try {
      hapticService.success();
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: t.status === 'completed' ? 'todo' : 'completed',
                completed_at:
                  t.status === 'completed' ? null : new Date().toISOString(),
              }
            : t
        ),
      }));

      await taskRepository.toggleTaskComplete(id);
      const stats = await taskRepository.getTaskStats();
      set({ stats });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle task';
      set({ error: errorMessage });
      await get().loadTasks();
    }
  },

  duplicateTask: async (id) => {
    try {
      hapticService.light();
      const dup = await taskRepository.duplicateTask(id);
      await get().loadTasks();
      return dup;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate task';
      set({ error: errorMessage });
      return null;
    }
  },

  archiveTask: async (id, archive = true) => {
    try {
      await taskRepository.archiveTask(id, archive);
      await get().loadTasks();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive task';
      set({ error: errorMessage });
    }
  },

  rescheduleTasks: async (ids, newDueAt) => {
    try {
      hapticService.light();
      await taskRepository.rescheduleTasks(ids, newDueAt);
      await get().loadTasks();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reschedule tasks';
      set({ error: errorMessage });
    }
  },

  setFilterView: (view) => {
    set({ filterView: view });
    get().loadTasks();
  },

  setFilterOptions: (options) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options },
    }));
    get().loadTasks();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().loadTasks();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().loadTasks();
  },

  addSubtask: async (taskId, title) => {
    const subtask = await taskRepository.createSubtask(taskId, title);
    await get().loadTasks();
    return subtask;
  },

  toggleSubtask: async (subtaskId) => {
    hapticService.light();
    await taskRepository.toggleSubtask(subtaskId);
    await get().loadTasks();
  },

  deleteSubtask: async (subtaskId) => {
    await taskRepository.deleteSubtask(subtaskId);
    await get().loadTasks();
  },
}));
