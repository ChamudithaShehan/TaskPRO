import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ColorPalette, lightColors, darkColors } from './colors';
import { ThemeMode } from '@/types';
import { settingsRepository } from '@/repositories/settingsRepository';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  isDark: false,
  colors: lightColors,
  setMode: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    async function loadTheme() {
      try {
        const settings = await settingsRepository.getSettings();
        if (settings?.theme_mode) {
          setModeState(settings.theme_mode);
        }
      } catch {
        // Fallback to light
      }
    }
    loadTheme();
  }, []);

  const isDark =
    mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await settingsRepository.updateSetting('theme_mode', newMode);
    } catch {
      // Ignored
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
