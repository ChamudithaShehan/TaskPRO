import { getDatabase } from '@/db/database';
import { AppSettings } from '@/types';

const DEFAULT_SETTINGS: AppSettings = {
  theme_mode: 'light',
  language: 'en',
  notifications_enabled: true,
  daily_reminder_time: '09:00',
  default_priority: 'medium',
  date_format: 'YYYY-MM-DD',
  time_format: '12h',
  first_day_of_week: 'monday',
  onboarding_completed: true,
  user_name: 'Alex Mercer',
  user_email: 'alex.mercer@taskflow.app',
  user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const settingsRepository = {
  async getSettings(): Promise<AppSettings> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM app_settings'
    );

    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }

    return {
      theme_mode: (map.theme_mode as AppSettings['theme_mode']) || DEFAULT_SETTINGS.theme_mode,
      language: (map.language as AppSettings['language']) || DEFAULT_SETTINGS.language,
      notifications_enabled: map.notifications_enabled !== undefined ? map.notifications_enabled === '1' : DEFAULT_SETTINGS.notifications_enabled,
      daily_reminder_time: map.daily_reminder_time || DEFAULT_SETTINGS.daily_reminder_time,
      default_priority: (map.default_priority as AppSettings['default_priority']) || DEFAULT_SETTINGS.default_priority,
      date_format: (map.date_format as AppSettings['date_format']) || DEFAULT_SETTINGS.date_format,
      time_format: (map.time_format as AppSettings['time_format']) || DEFAULT_SETTINGS.time_format,
      first_day_of_week: (map.first_day_of_week as AppSettings['first_day_of_week']) || DEFAULT_SETTINGS.first_day_of_week,
      onboarding_completed: map.onboarding_completed !== undefined ? map.onboarding_completed === '1' : DEFAULT_SETTINGS.onboarding_completed,
      user_name: map.user_name || DEFAULT_SETTINGS.user_name,
      user_email: map.user_email || DEFAULT_SETTINGS.user_email,
      user_avatar: map.user_avatar || DEFAULT_SETTINGS.user_avatar,
    };
  },

  async updateSetting(key: keyof AppSettings, value: string | boolean): Promise<void> {
    const db = await getDatabase();
    const strValue = typeof value === 'boolean' ? (value ? '1' : '0') : value;
    await db.runAsync(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
      [key, strValue]
    );
  },

  async clearAllData(): Promise<void> {
    const db = await getDatabase();
    await db.execAsync(`
      DELETE FROM subtasks;
      DELETE FROM task_tags;
      DELETE FROM tasks;
      DELETE FROM projects;
      DELETE FROM focus_sessions;
      DELETE FROM reminders;
    `);
  },
};
