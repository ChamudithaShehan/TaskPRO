import { getDatabase } from '@/db/database';
import { Category } from '@/types';

export const categoryRepository = {
  async getCategories(): Promise<Category[]> {
    const db = await getDatabase();
    interface CategoryRow {
      id: string;
      name: string;
      color: string;
      icon: string | null;
      task_count: number;
    }

    const rows = await db.getAllAsync<CategoryRow>(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.category = c.name AND t.is_archived = 0 AND t.status != 'completed') as task_count
      FROM categories c
      ORDER BY c.name ASC
    `);

    return rows.map((r) => ({
      ...r,
      icon: r.icon || undefined,
      task_count: r.task_count || 0,
    }));
  },

  async createCategory(category: Omit<Category, 'id' | 'task_count'>): Promise<Category> {
    const db = await getDatabase();
    const id = `cat-${Date.now()}`;
    await db.runAsync(
      'INSERT OR REPLACE INTO categories (id, name, color, icon) VALUES (?, ?, ?, ?)',
      [id, category.name, category.color, category.icon || null]
    );
    return {
      id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      task_count: 0,
    };
  },

  async deleteCategory(id: string): Promise<boolean> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  },
};
