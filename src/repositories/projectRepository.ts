import { getDatabase } from '@/db/database';
import { Project } from '@/types';

export const projectRepository = {
  async getProjects(includeArchived: boolean = false): Promise<Project[]> {
    const db = await getDatabase();
    const where = includeArchived ? '' : 'WHERE p.is_archived = 0';

    interface ProjectRow {
      id: string;
      name: string;
      description: string | null;
      color: string;
      icon: string;
      due_date: string | null;
      is_archived: number;
      sort_order: number;
      created_at: string;
      updated_at: string;
      total_tasks: number;
      completed_tasks: number;
    }

    const rows = await db.getAllAsync<ProjectRow>(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.is_archived = 0) as total_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed' AND t.is_archived = 0) as completed_tasks
      FROM projects p
      ${where}
      ORDER BY p.sort_order ASC, p.created_at ASC
    `);

    return rows.map((r) => ({
      ...r,
      is_archived: Boolean(r.is_archived),
      total_tasks: r.total_tasks || 0,
      completed_tasks: r.completed_tasks || 0,
    }));
  },

  async getProjectById(id: string): Promise<Project | null> {
    const db = await getDatabase();
    interface ProjectRow {
      id: string;
      name: string;
      description: string | null;
      color: string;
      icon: string;
      due_date: string | null;
      is_archived: number;
      sort_order: number;
      created_at: string;
      updated_at: string;
      total_tasks: number;
      completed_tasks: number;
    }

    const row = await db.getFirstAsync<ProjectRow>(
      `SELECT 
        p.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.is_archived = 0) as total_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed' AND t.is_archived = 0) as completed_tasks
      FROM projects p
      WHERE p.id = ?`,
      [id]
    );

    if (!row) return null;

    return {
      ...row,
      is_archived: Boolean(row.is_archived),
      total_tasks: row.total_tasks || 0,
      completed_tasks: row.completed_tasks || 0,
    };
  },

  async createProject(
    data: Omit<Project, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<Project> {
    const db = await getDatabase();
    const id = data.id || `proj-${Date.now()}`;
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO projects (id, name, description, color, icon, due_date, is_archived, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description || null,
        data.color || '#6366F1',
        data.icon || 'folder',
        data.due_date || null,
        data.is_archived ? 1 : 0,
        data.sort_order || 0,
        now,
        now,
      ]
    );

    const created = await this.getProjectById(id);
    if (!created) throw new Error('Failed to create project');
    return created;
  },

  async updateProject(
    id: string,
    updates: Partial<Project>
  ): Promise<Project | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const params: (string | number | null)[] = [now];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      params.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      params.push(updates.description);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      params.push(updates.color);
    }
    if (updates.icon !== undefined) {
      fields.push('icon = ?');
      params.push(updates.icon);
    }
    if (updates.due_date !== undefined) {
      fields.push('due_date = ?');
      params.push(updates.due_date);
    }
    if (updates.is_archived !== undefined) {
      fields.push('is_archived = ?');
      params.push(updates.is_archived ? 1 : 0);
    }

    params.push(id);
    await db.runAsync(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return this.getProjectById(id);
  },

  async deleteProject(id: string): Promise<boolean> {
    const db = await getDatabase();
    // Tasks will have project_id set to NULL due to ON DELETE SET NULL foreign key
    await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
    return true;
  },

  async archiveProject(id: string, archive: boolean = true): Promise<boolean> {
    const db = await getDatabase();
    await db.runAsync('UPDATE projects SET is_archived = ? WHERE id = ?', [
      archive ? 1 : 0,
      id,
    ]);
    return true;
  },
};
