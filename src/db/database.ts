import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DB_NAME = 'taskflow.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  if (Platform.OS === 'web') {
    // Web mock / local storage can be used if ever run in browser
    return;
  }

  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL DEFAULT '#6366F1',
      icon TEXT NOT NULL DEFAULT 'folder',
      due_date TEXT,
      is_archived INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#64748B',
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#6366F1'
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      project_id TEXT,
      parent_id TEXT,
      category TEXT,
      start_at TEXT,
      due_at TEXT,
      due_time TEXT,
      completed_at TEXT,
      recurrence_rule TEXT DEFAULT 'none',
      estimated_duration INTEGER,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      remind_at TEXT NOT NULL,
      notification_id TEXT,
      is_sent INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      duration_minutes INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      session_type TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
  `);

  await seedInitialData(db);
}

async function seedInitialData(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    const isSeeded = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_settings WHERE key = 'database_seeded'"
    );

    if (isSeeded && isSeeded.value === '1') {
      return; // Already seeded
    }

    const existingTask = await db.getFirstAsync<{ count: number }>(
      'SELECT count(*) as count FROM tasks'
    );

    if (existingTask && existingTask.count > 0) {
      await db.runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('database_seeded', '1')"
      );
      return; // Already seeded
    }

    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];

    const inThreeDays = new Date(now);
    inThreeDays.setDate(now.getDate() + 3);
    const inThreeDaysISO = inThreeDays.toISOString().split('T')[0];

    // Seed Projects (Idempotent)
    await db.runAsync(
      `INSERT OR IGNORE INTO projects (id, name, description, color, icon, due_date, sort_order, created_at, updated_at) VALUES 
       ('proj-1', 'Product Launch', 'Q4 Product release and user testing', '#6366F1', 'rocket', ?, 1, ?, ?),
       ('proj-2', 'Personal Growth', 'Fitness, reading, and learning', '#10B981', 'heart', ?, 2, ?, ?),
       ('proj-3', 'Home & Life', 'Household errands and maintenance', '#F59E0B', 'home', ?, 3, ?, ?)`,
      [inThreeDaysISO, now.toISOString(), now.toISOString(), inThreeDaysISO, now.toISOString(), now.toISOString(), inThreeDaysISO, now.toISOString(), now.toISOString()]
    );

    // Seed Categories (Idempotent)
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (id, name, color, icon) VALUES 
       ('cat-1', 'Work', '#6366F1', 'briefcase'),
       ('cat-2', 'Personal', '#10B981', 'user'),
       ('cat-3', 'Health', '#EC4899', 'activity'),
       ('cat-4', 'Finance', '#14B8A6', 'dollar-sign')`
    );

    // Seed Tags (Idempotent)
    await db.runAsync(
      `INSERT OR IGNORE INTO tags (id, name, color) VALUES 
       ('tag-1', 'Urgent', '#EF4444'),
       ('tag-2', 'Review', '#8B5CF6'),
       ('tag-3', 'Follow-up', '#F59E0B'),
       ('tag-4', 'Quick', '#10B981')`
    );

    // Seed Tasks (Idempotent)
    await db.runAsync(
      `INSERT OR IGNORE INTO tasks (id, title, description, status, priority, project_id, category, due_at, due_time, sort_order, created_at, updated_at)
       VALUES ('task-1', 'Finalize quarterly revenue forecast', 'Review numbers with accounting lead', 'todo', 'high', 'proj-1', 'Work', ?, '17:00', 1, ?, ?)`,
      [yesterdayISO, now.toISOString(), now.toISOString()]
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO tasks (id, title, description, status, priority, project_id, category, due_at, due_time, recurrence_rule, sort_order, created_at, updated_at)
       VALUES ('task-2', 'Team design sprint retrospective', 'Gather feedback on new onboarding flow', 'todo', 'urgent', 'proj-1', 'Work', ?, '10:30', 'weekly', 2, ?, ?)`,
      [todayISO, now.toISOString(), now.toISOString()]
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO tasks (id, title, description, status, priority, project_id, category, due_at, due_time, sort_order, created_at, updated_at)
       VALUES ('task-3', 'Pick up medication prescription', 'Corner pharmacy on 4th Ave', 'todo', 'high', 'proj-3', 'Personal', ?, '15:30', 3, ?, ?)`,
      [todayISO, now.toISOString(), now.toISOString()]
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO tasks (id, title, description, status, priority, project_id, category, due_at, due_time, sort_order, created_at, updated_at)
       VALUES ('task-4', 'Order birthday surprise for Mom', 'Check floral arrangements', 'todo', 'medium', 'proj-2', 'Personal', ?, '18:00', 4, ?, ?)`,
      [todayISO, now.toISOString(), now.toISOString()]
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO tasks (id, title, description, status, priority, project_id, category, due_at, due_time, sort_order, created_at, updated_at)
       VALUES ('task-5', 'Draft marketing release notes', 'Summarize key features for app store submission', 'todo', 'medium', 'proj-1', 'Work', ?, '14:00', 5, ?, ?)`,
      [tomorrowISO, now.toISOString(), now.toISOString()]
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO tasks (id, title, description, status, priority, project_id, category, due_at, due_time, sort_order, created_at, updated_at)
       VALUES ('task-6', 'Schedule annual dental checkup', 'Call Dr. Martinez office', 'todo', 'low', 'proj-2', 'Health', ?, '11:00', 6, ?, ?)`,
      [inThreeDaysISO, now.toISOString(), now.toISOString()]
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO tasks (id, title, description, status, priority, project_id, category, due_at, due_time, completed_at, sort_order, created_at, updated_at)
       VALUES ('task-7', 'Morning 5km tempo run & stretching', 'Keep heart rate in zone 2', 'completed', 'low', 'proj-2', 'Health', ?, '07:00', ?, 7, ?, ?)`,
      [todayISO, now.toISOString(), now.toISOString(), now.toISOString()]
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO tasks (id, title, description, status, priority, project_id, category, due_at, due_time, completed_at, sort_order, created_at, updated_at)
       VALUES ('task-8', 'Review pull requests on GitHub', 'Check NativeWind integration PR', 'completed', 'medium', 'proj-1', 'Work', ?, '08:45', ?, 8, ?, ?)`,
      [todayISO, now.toISOString(), now.toISOString(), now.toISOString()]
    );

    // Seed Subtasks (Idempotent)
    await db.runAsync(
      `INSERT OR IGNORE INTO subtasks (id, task_id, title, is_completed, sort_order, created_at) VALUES
       ('sub-1', 'task-2', 'Prepare Figma presentation deck', 1, 1, ?),
       ('sub-2', 'task-2', 'Send agenda to attendees', 1, 2, ?),
       ('sub-3', 'task-2', 'Capture action items in Notion', 0, 3, ?)`,
      [now.toISOString(), now.toISOString(), now.toISOString()]
    );

    // Seed Task Tags (Idempotent)
    await db.runAsync(
      `INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES
       ('task-1', 'tag-1'),
       ('task-2', 'tag-1'),
       ('task-2', 'tag-2'),
       ('task-5', 'tag-2'),
       ('task-8', 'tag-4')`
    );

    // Seed Default Settings (Idempotent)
    const defaultSettings: [string, string][] = [
      ['theme_mode', 'light'],
      ['language', 'en'],
      ['notifications_enabled', '1'],
      ['daily_reminder_time', '09:00'],
      ['default_priority', 'medium'],
      ['date_format', 'YYYY-MM-DD'],
      ['time_format', '12h'],
      ['first_day_of_week', 'monday'],
      ['onboarding_completed', '1'],
      ['user_name', 'Alex Mercer'],
      ['user_email', 'alex.mercer@taskflow.app'],
      ['user_avatar', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'],
      ['database_seeded', '1'],
    ];

    for (const [key, value] of defaultSettings) {
      await db.runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    }

    // Seed a sample focus session (Idempotent)
    await db.runAsync(
      `INSERT OR IGNORE INTO focus_sessions (id, task_id, duration_minutes, completed_at, session_type)
       VALUES ('focus-1', 'task-2', 25, ?, 'work')`,
      [now.toISOString()]
    );
  } catch (err) {
    console.warn('seedInitialData warning (ignored):', err);
  }
}
