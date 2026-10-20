import { Task, RecurrenceRule, TaskFilterOptions, TaskSortBy } from '@/types';

export function calculateProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  const ratio = completed / total;
  return Math.min(Math.max(ratio, 0), 1);
}

export function isTaskOverdue(
  dueDate: string | null | undefined,
  isCompleted: boolean,
  referenceDate: string = new Date().toISOString().split('T')[0]
): boolean {
  if (!dueDate || isCompleted) return false;
  return dueDate < referenceDate;
}

export function getNextRecurringDate(
  currentDateStr: string,
  rule: RecurrenceRule
): string {
  if (!currentDateStr || rule === 'none') return currentDateStr;

  const parts = currentDateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return currentDateStr;
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  switch (rule) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }

  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTaskDueDate(
  dateStr: string | null | undefined,
  timeStr?: string | null,
  todayStr: string = new Date().toISOString().split('T')[0]
): string {
  if (!dateStr) return 'No due date';

  let dateLabel = dateStr;
  if (dateStr === todayStr) {
    dateLabel = 'Today';
  }

  if (timeStr) {
    return `${dateLabel} · ${timeStr}`;
  }
  return dateLabel;
}

export function filterAndSortTasks(
  tasks: Task[],
  filter?: TaskFilterOptions,
  sortBy: TaskSortBy = 'due_date_asc'
): Task[] {
  let result = tasks.filter((t) => {
    if (!filter?.includeArchived && t.is_archived) return false;
    if (filter?.status && t.status !== filter.status) return false;
    if (filter?.priority && t.priority !== filter.priority) return false;
    if (filter?.project_id && t.project_id !== filter.project_id) return false;
    if (filter?.category && t.category !== filter.category) return false;
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = Boolean(t.description && t.description.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc) return false;
    }
    if (filter?.startDate && t.due_at && t.due_at < filter.startDate) return false;
    if (filter?.endDate && t.due_at && t.due_at > filter.endDate) return false;
    return true;
  });

  return result.sort((a, b) => {
    switch (sortBy) {
      case 'due_date_asc':
        return (a.due_at || '9999-99-99').localeCompare(b.due_at || '9999-99-99');
      case 'due_date_desc':
        return (b.due_at || '').localeCompare(a.due_at || '');
      case 'priority_desc': {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      case 'priority_asc': {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[a.priority] || 0) - (pOrder[b.priority] || 0);
      }
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'created_at_desc':
        return b.created_at.localeCompare(a.created_at);
      default:
        return 0;
    }
  });
}

export function calculateStreak(tasks: Task[]): number {
  const completedDates = new Set<string>();
  for (const t of tasks) {
    if (t.status === 'completed' && t.completed_at) {
      completedDates.add(t.completed_at.split('T')[0]);
    }
  }

  const today = new Date();
  let checkDate = new Date(today);
  let checkISO = checkDate.toISOString().split('T')[0];

  let streak = 0;
  if (completedDates.has(checkISO)) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If no completions today yet, check if yesterday had completions
    checkDate.setDate(checkDate.getDate() - 1);
    checkISO = checkDate.toISOString().split('T')[0];
    if (!completedDates.has(checkISO)) {
      return 0;
    }
  }

  while (true) {
    checkISO = checkDate.toISOString().split('T')[0];
    if (completedDates.has(checkISO)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
