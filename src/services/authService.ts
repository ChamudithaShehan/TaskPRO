import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_TOKEN_KEY = 'taskflow_session_token';
const USER_PROFILE_KEY = 'taskflow_user_profile';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  isDemoMode: boolean;
}

export const authService = {
  async getSession(): Promise<UserProfile | null> {
    try {
      if (Platform.OS === 'web') {
        const raw = localStorage.getItem(USER_PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
      }
      const raw = await SecureStore.getItemAsync(USER_PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async startDemoSession(name: string = 'Alex Mercer'): Promise<UserProfile> {
    const profile: UserProfile = {
      id: 'demo-user-1',
      name,
      email: 'alex.mercer@taskflow.app',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isDemoMode: true,
    };

    if (Platform.OS === 'web') {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
      localStorage.setItem(SESSION_TOKEN_KEY, 'demo-token-12345');
    } else {
      await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(profile));
      await SecureStore.setItemAsync(SESSION_TOKEN_KEY, 'demo-token-12345');
    }

    return profile;
  },

  async login(email: string, name?: string): Promise<UserProfile> {
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isDemoMode: false,
    };

    const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (Platform.OS === 'web') {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(profile));
      await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
    }

    return profile;
  },

  async logout(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(USER_PROFILE_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
        await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
      }
    } catch {
      // Ignored
    }
  },
};
