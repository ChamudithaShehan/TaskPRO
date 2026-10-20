import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const hapticService = {
  light() {
    if (Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available
    }
  },

  medium() {
    if (Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not available
    }
  },

  success() {
    if (Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics not available
    }
  },

  selection() {
    if (Platform.OS === 'web') return;
    try {
      Haptics.selectionAsync();
    } catch {
      // Haptics not available
    }
  },
};
