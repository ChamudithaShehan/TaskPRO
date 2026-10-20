import { getDatabase } from '@/db/database';
import { FocusSession } from '@/types';

export const focusRepository = {
  async getSessions(limit: number = 50): Promise<FocusSession[]> {
    const db = await getDatabase();
    interface SessionRow {
      id: string;
      task_id: string | null;
      task_title: string | null;
      duration_minutes: number;
      completed_at: string;
      session_type: string;
    }

    const rows = await db.getAllAsync<SessionRow>(
      `SELECT fs.*, t.title as task_title 
       FROM focus_sessions fs 
       LEFT JOIN tasks t ON fs.task_id = t.id 
       ORDER BY fs.completed_at DESC 
       LIMIT ?`,
      [limit]
    );

    return rows.map((r) => ({
      ...r,
      session_type: r.session_type as FocusSession['session_type'],
    }));
  },

  async recordSession(
    session: Omit<FocusSession, 'id'>
  ): Promise<FocusSession> {
    const db = await getDatabase();
    const id = `focus-${Date.now()}`;
    await db.runAsync(
      `INSERT INTO focus_sessions (id, task_id, duration_minutes, completed_at, session_type)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        session.task_id || null,
        session.duration_minutes,
        session.completed_at,
        session.session_type,
      ]
    );

    return {
      id,
      ...session,
    };
  },

  async getTotalFocusMinutes(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total 
       FROM focus_sessions 
       WHERE session_type = 'work'`
    );
    return result?.total || 0;
  },
};
