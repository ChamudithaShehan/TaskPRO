import { Platform } from 'react-native';

type NotificationsType = typeof import('expo-notifications');

let notificationsModule: NotificationsType | null = null;
let isModuleChecked = false;

function getNotifications(): NotificationsType | null {
  if (isModuleChecked) {
    return notificationsModule;
  }
  isModuleChecked = true;

  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // Dynamically require to safely handle Expo Go where ExpoTopicSubscriptionModule is absent
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-notifications') as NotificationsType;
    if (mod && typeof mod.setNotificationHandler === 'function') {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      notificationsModule = mod;
    }
  } catch {
    // In Expo Go on Android SDK 53+, remote/topic native modules are unavailable.
    // Gracefully fallback so the app runs without crashing.
    notificationsModule = null;
  }

  return notificationsModule;
}

export const notificationService = {
  isSupported(): boolean {
    return getNotifications() !== null;
  },

  async requestPermissions(): Promise<boolean> {
    const Notifications = getNotifications();
    if (!Notifications) return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch {
      return false;
    }
  },

  async scheduleTaskReminder(
    taskId: string,
    title: string,
    dueDate: string,
    dueTime?: string
  ): Promise<string | null> {
    const Notifications = getNotifications();
    if (!Notifications) {
      // Graceful simulated ID in Expo Go
      return `local-reminder-${Date.now()}`;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const timePart = dueTime ? dueTime : '09:00';
      const [hours, minutes] = timePart.split(':').map(Number);

      const triggerDate = new Date(
        `${dueDate}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
      );

      if (triggerDate.getTime() <= Date.now()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'TaskPRO Reminder',
          body: title,
          data: { taskId },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      return notificationId;
    } catch {
      return null;
    }
  },

  async cancelReminder(notificationId: string): Promise<void> {
    const Notifications = getNotifications();
    if (!Notifications) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
      // Ignored
    }
  },

  async getAllScheduled(): Promise<any[]> {
    const Notifications = getNotifications();
    if (!Notifications) return [];
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch {
      return [];
    }
  },

  async cancelAll(): Promise<void> {
    const Notifications = getNotifications();
    if (!Notifications) return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // Ignored
    }
  },
};
