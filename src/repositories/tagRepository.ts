import { getDatabase } from '@/db/database';
import { Tag } from '@/types';

export const tagRepository = {
  async getTags(): Promise<Tag[]> {
    const db = await getDatabase();
    interface TagRow {
      id: string;
      name: string;
      color: string;
      task_count: number;
    }

    const rows = await db.getAllAsync<TagRow>(`
      SELECT 
        tg.*,
        (SELECT COUNT(*) FROM task_tags tt 
         JOIN tasks t ON tt.task_id = t.id 
         WHERE tt.tag_id = tg.id AND t.is_archived = 0 AND t.status != 'completed') as task_count
      FROM tags tg
      ORDER BY tg.name ASC
    `);

    return rows.map((r) => ({
      ...r,
      task_count: r.task_count || 0,
    }));
  },

  async createTag(tag: Omit<Tag, 'id' | 'task_count'>): Promise<Tag> {
    const db = await getDatabase();
    const id = `tag-${Date.now()}`;
    await db.runAsync(
      'INSERT INTO tags (id, name, color) VALUES (?, ?, ?)',
      [id, tag.name, tag.color]
    );
    return {
      id,
      name: tag.name,
      color: tag.color,
      task_count: 0,
    };
  },

  async deleteTag(id: string): Promise<boolean> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tags WHERE id = ?', [id]);
    return true;
  },
};
