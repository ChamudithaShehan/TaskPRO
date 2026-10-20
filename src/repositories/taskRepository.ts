import { getDatabase } from '@/db/database';
import { Task, Subtask, TaskFilterOptions, TaskSortBy } from '@/types';

export const taskRepository = {
  async getTasks(
    filter?: TaskFilterOptions,
    sortBy: TaskSortBy = 'due_date_asc'
  ): Promise<Task[]> {
    const db = await getDatabase();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (!filter?.includeArchived) {
      conditions.push('t.is_archived = 0');
    }

    if (filter?.status) {
      conditions.push('t.status = ?');
      params.push(filter.status);
    }

    if (filter?.priority) {
      conditions.push('t.priority = ?');
      params.push(filter.priority);
    }

    if (filter?.project_id) {
      conditions.push('t.project_id = ?');
      params.push(filter.project_id);
    }

    if (filter?.category) {
      conditions.push('t.category = ?');
      params.push(filter.category);
    }

    if (filter?.search) {
      conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
      params.push(`%${filter.search}%`, `%${filter.search}%`);
    }

    if (filter?.startDate) {
      conditions.push('t.due_at >= ?');
      params.push(filter.startDate);
    }

    if (filter?.endDate) {
      conditions.push('t.due_at <= ?');
      params.push(filter.endDate);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY t.sort_order ASC, t.due_at ASC';
    switch (sortBy) {
      case 'due_date_desc':
        orderClause = 'ORDER BY t.due_at DESC, t.due_time DESC';
        break;
      case 'due_date_asc':
        orderClause = 'ORDER BY t.due_at ASC, t.due_time ASC';
        break;
      case 'priority_desc':
        orderClause = `ORDER BY CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
          ELSE 5 END ASC`;
        break;
      case 'priority_asc':
        orderClause = `ORDER BY CASE t.priority 
          WHEN 'low' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'high' THEN 3 
          WHEN 'urgent' THEN 4 
          ELSE 5 END ASC`;
        break;
      case 'title_asc':
        orderClause = 'ORDER BY t.title COLLATE NOCASE ASC';
        break;
      case 'created_at_desc':
        orderClause = 'ORDER BY t.created_at DESC';
        break;
    }

    const query = `
      SELECT 
        t.*,
        p.name as project_name,
        p.color as project_color,
        (SELECT COUNT(*) FROM subtasks s WHERE s.task_id = t.id) as subtask_count,
        (SELECT COUNT(*) FROM subtasks s WHERE s.task_id = t.id AND s.is_completed = 1) as subtask_completed_count
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      ${whereClause}
      ${orderClause}
    `;

    interface TaskRow {
      id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      project_id: string | null;
      project_name: string | null;
      project_color: string | null;
      parent_id: string | null;
      category: string | null;
      start_at: string | null;
      due_at: string | null;
      due_time: string | null;
      completed_at: string | null;
      recurrence_rule: string | null;
      estimated_duration: number | null;
      notes: string | null;
      sort_order: number;
      is_archived: number;
      created_at: string;
      updated_at: string;
      subtask_count: number;
      subtask_completed_count: number;
    }

    const rows = await db.getAllAsync<TaskRow>(query, params);

    // Fetch tags for these tasks
    const taskIds = rows.map((r) => r.id);
    const tagsMap: Record<string, string[]> = {};

    if (taskIds.length > 0) {
      const placeholders = taskIds.map(() => '?').join(',');
      const tagRows = await db.getAllAsync<{ task_id: string; tag_name: string }>(
        `SELECT tt.task_id, tg.name as tag_name 
         FROM task_tags tt 
         JOIN tags tg ON tt.tag_id = tg.id 
         WHERE tt.task_id IN (${placeholders})`,
        taskIds
      );

      for (const tr of tagRows) {
        if (!tagsMap[tr.task_id]) {
          tagsMap[tr.task_id] = [];
        }
        tagsMap[tr.task_id].push(tr.tag_name);
      }
    }

    return rows.map((row) => ({
      ...row,
      status: row.status as Task['status'],
      priority: row.priority as Task['priority'],
      recurrence_rule: (row.recurrence_rule as Task['recurrence_rule']) || 'none',
      is_archived: Boolean(row.is_archived),
      tags: tagsMap[row.id] || [],
    }));
  },

  async getTaskById(id: string): Promise<Task | null> {
    const db = await getDatabase();
    interface TaskRow {
      id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      project_id: string | null;
      project_name: string | null;
      project_color: string | null;
      parent_id: string | null;
      category: string | null;
      start_at: string | null;
      due_at: string | null;
      due_time: string | null;
      completed_at: string | null;
      recurrence_rule: string | null;
      estimated_duration: number | null;
      notes: string | null;
      sort_order: number;
      is_archived: number;
      created_at: string;
      updated_at: string;
      subtask_count: number;
      subtask_completed_count: number;
    }

    const row = await db.getFirstAsync<TaskRow>(
      `SELECT 
        t.*,
        p.name as project_name,
        p.color as project_color,
        (SELECT COUNT(*) FROM subtasks s WHERE s.task_id = t.id) as subtask_count,
        (SELECT COUNT(*) FROM subtasks s WHERE s.task_id = t.id AND s.is_completed = 1) as subtask_completed_count
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?`,
      [id]
    );

    if (!row) return null;

    const subtasks = await this.getSubtasks(id);
    const tagRows = await db.getAllAsync<{ name: string }>(
      `SELECT tg.name 
       FROM task_tags tt 
       JOIN tags tg ON tt.tag_id = tg.id 
       WHERE tt.task_id = ?`,
      [id]
    );

    return {
      ...row,
      status: row.status as Task['status'],
      priority: row.priority as Task['priority'],
      recurrence_rule: (row.recurrence_rule as Task['recurrence_rule']) || 'none',
      is_archived: Boolean(row.is_archived),
      tags: tagRows.map((t) => t.name),
      subtasks,
    };
  },

  async createTask(
    data: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<Task> {
    const db = await getDatabase();
    const id = data.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO tasks (
        id, title, description, status, priority, project_id, parent_id,
        category, start_at, due_at, due_time, completed_at, recurrence_rule,
        estimated_duration, notes, sort_order, is_archived, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.description || null,
        data.status || 'todo',
        data.priority || 'medium',
        data.project_id || null,
        data.parent_id || null,
        data.category || null,
        data.start_at || null,
        data.due_at || null,
        data.due_time || null,
        data.completed_at || null,
        data.recurrence_rule || 'none',
        data.estimated_duration || null,
        data.notes || null,
        data.sort_order || 0,
        data.is_archived ? 1 : 0,
        now,
        now,
      ]
    );

    // Insert tags
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        // Ensure tag exists
        const tag = await db.getFirstAsync<{ id: string }>(
          'SELECT id FROM tags WHERE name = ?',
          [tagName]
        );
        let tagId = tag?.id;
        if (!tagId) {
          tagId = `tag-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          await db.runAsync('INSERT INTO tags (id, name, color) VALUES (?, ?, ?)', [
            tagId,
            tagName,
            '#6366F1',
          ]);
        }
        await db.runAsync(
          'INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)',
          [id, tagId]
        );
      }
    }

    // Insert subtasks if provided
    if (data.subtasks && data.subtasks.length > 0) {
      for (let i = 0; i < data.subtasks.length; i++) {
        const sub = data.subtasks[i];
        const subId = `sub-${Date.now()}-${i}`;
        await db.runAsync(
          'INSERT INTO subtasks (id, task_id, title, is_completed, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [subId, id, sub.title, sub.is_completed ? 1 : 0, i + 1, now]
        );
      }
    }

    const created = await this.getTaskById(id);
    if (!created) throw new Error('Failed to create task');
    return created;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const params: (string | number | null)[] = [now];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      params.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      params.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      params.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      params.push(updates.priority);
    }
    if (updates.project_id !== undefined) {
      fields.push('project_id = ?');
      params.push(updates.project_id);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      params.push(updates.category);
    }
    if (updates.due_at !== undefined) {
      fields.push('due_at = ?');
      params.push(updates.due_at);
    }
    if (updates.due_time !== undefined) {
      fields.push('due_time = ?');
      params.push(updates.due_time);
    }
    if (updates.completed_at !== undefined) {
      fields.push('completed_at = ?');
      params.push(updates.completed_at);
    }
    if (updates.recurrence_rule !== undefined) {
      fields.push('recurrence_rule = ?');
      params.push(updates.recurrence_rule);
    }
    if (updates.estimated_duration !== undefined) {
      fields.push('estimated_duration = ?');
      params.push(updates.estimated_duration);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      params.push(updates.notes);
    }
    if (updates.is_archived !== undefined) {
      fields.push('is_archived = ?');
      params.push(updates.is_archived ? 1 : 0);
    }

    params.push(id);
    await db.runAsync(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return this.getTaskById(id);
  },

  async rescheduleTasks(ids: string[], newDueAt: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    for (const id of ids) {
      await db.runAsync(
        'UPDATE tasks SET due_at = ?, updated_at = ? WHERE id = ?',
        [newDueAt, now, id]
      );
    }
  },

  async toggleTaskComplete(id: string): Promise<Task | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;

    const isNowCompleted = task.status !== 'completed';
    const newStatus = isNowCompleted ? 'completed' : 'todo';
    const completedAt = isNowCompleted ? new Date().toISOString() : null;

    return this.updateTask(id, {
      status: newStatus,
      completed_at: completedAt,
    });
  },

  async deleteTask(id: string): Promise<boolean> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
    return true;
  },

  async duplicateTask(id: string): Promise<Task | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;

    return this.createTask({
      ...task,
      title: `${task.title} (Copy)`,
      status: 'todo',
      completed_at: null,
      is_archived: false,
    });
  },

  async archiveTask(id: string, archive: boolean = true): Promise<boolean> {
    const db = await getDatabase();
    await db.runAsync('UPDATE tasks SET is_archived = ? WHERE id = ?', [
      archive ? 1 : 0,
      id,
    ]);
    return true;
  },

  async getSubtasks(taskId: string): Promise<Subtask[]> {
    const db = await getDatabase();
    interface SubtaskRow {
      id: string;
      task_id: string;
      title: string;
      is_completed: number;
      sort_order: number;
      created_at: string;
    }
    const rows = await db.getAllAsync<SubtaskRow>(
      'SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC, created_at ASC',
      [taskId]
    );

    return rows.map((r) => ({
      ...r,
      is_completed: Boolean(r.is_completed),
    }));
  },

  async createSubtask(taskId: string, title: string): Promise<Subtask> {
    const db = await getDatabase();
    const id = `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const maxOrder = await db.getFirstAsync<{ max_order: number }>(
      'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM subtasks WHERE task_id = ?',
      [taskId]
    );
    const sortOrder = (maxOrder?.max_order || 0) + 1;

    await db.runAsync(
      'INSERT INTO subtasks (id, task_id, title, is_completed, sort_order, created_at) VALUES (?, ?, ?, 0, ?, ?)',
      [id, taskId, title, sortOrder, now]
    );

    return {
      id,
      task_id: taskId,
      title,
      is_completed: false,
      sort_order: sortOrder,
      created_at: now,
    };
  },

  async toggleSubtask(subtaskId: string): Promise<Subtask | null> {
    const db = await getDatabase();
    const current = await db.getFirstAsync<{ is_completed: number; task_id: string; title: string; sort_order: number; created_at: string }>(
      'SELECT * FROM subtasks WHERE id = ?',
      [subtaskId]
    );
    if (!current) return null;

    const newCompleted = current.is_completed === 1 ? 0 : 1;
    await db.runAsync('UPDATE subtasks SET is_completed = ? WHERE id = ?', [
      newCompleted,
      subtaskId,
    ]);

    return {
      id: subtaskId,
      task_id: current.task_id,
      title: current.title,
      is_completed: Boolean(newCompleted),
      sort_order: current.sort_order,
      created_at: current.created_at,
    };
  },

  async deleteSubtask(subtaskId: string): Promise<boolean> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM subtasks WHERE id = ?', [subtaskId]);
    return true;
  },

  async getTaskStats(): Promise<{
    todayTotal: number;
    todayCompleted: number;
    overdueCount: number;
    upcomingCount: number;
    totalCompleted: number;
  }> {
    const db = await getDatabase();
    const todayISO = new Date().toISOString().split('T')[0];

    const todayStats = await db.getFirstAsync<{ total: number; completed: number }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM tasks 
       WHERE due_at = ? AND is_archived = 0`,
      [todayISO]
    );

    const overdueStats = await db.getFirstAsync<{ overdue: number }>(
      `SELECT COUNT(*) as overdue 
       FROM tasks 
       WHERE due_at < ? AND status != 'completed' AND is_archived = 0`,
      [todayISO]
    );

    const upcomingStats = await db.getFirstAsync<{ upcoming: number }>(
      `SELECT COUNT(*) as upcoming 
       FROM tasks 
       WHERE due_at > ? AND status != 'completed' AND is_archived = 0`,
      [todayISO]
    );

    const totalCompletedStats = await db.getFirstAsync<{ total_completed: number }>(
      `SELECT COUNT(*) as total_completed 
       FROM tasks 
       WHERE status = 'completed' AND is_archived = 0`
    );

    return {
      todayTotal: todayStats?.total || 0,
      todayCompleted: todayStats?.completed || 0,
      overdueCount: overdueStats?.overdue || 0,
      upcomingCount: upcomingStats?.upcoming || 0,
      totalCompleted: totalCompletedStats?.total_completed || 0,
    };
  },
};
