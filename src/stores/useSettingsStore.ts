import { create } from 'zustand';
import { AppSettings } from '@/types';
import { settingsRepository } from '@/repositories/settingsRepository';
import { authService, UserProfile } from '@/services/authService';

interface SettingsState {
  settings: AppSettings | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  setOnboardingCompleted: () => Promise<void>;
  loginDemo: () => Promise<void>;
  login: (email: string, name?: string) => Promise<UserProfile>;
  continueAsGuest: () => Promise<UserProfile>;
  logout: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  userProfile: null,
  isLoading: true,
  error: null,

  loadSettings: async () => {
    try {
      const settings = await settingsRepository.getSettings();
      const userProfile = await authService.getSession();
      set({ settings, userProfile, isLoading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateSetting: async (key, value) => {
    try {
      await settingsRepository.updateSetting(key, value);
      const settings = await settingsRepository.getSettings();
      set({ settings });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update setting';
      set({ error: errorMessage });
    }
  },

  setOnboardingCompleted: async () => {
    await get().updateSetting('onboarding_completed', true);
  },

  loginDemo: async () => {
    const profile = await authService.startDemoSession('Alex Mercer');
    set({ userProfile: profile });
  },

  login: async (email: string, name?: string) => {
    const profile = await authService.login(email, name);
    set({ userProfile: profile });
    return profile;
  },

  continueAsGuest: async () => {
    const profile = await authService.login('guest@taskpro.local', 'Guest User');
    set({ userProfile: profile });
    return profile;
  },

  logout: async () => {
    await authService.logout();
    set({ userProfile: null });
  },
}));
