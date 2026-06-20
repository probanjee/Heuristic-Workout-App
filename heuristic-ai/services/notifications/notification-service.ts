/**
 * HeuristicAI — Local Notification Service
 * Manages notification permissions and schedules workout, streak, and recovery notifications.
 * Source of truth: TASK.md § 9, APP_FLOW.md
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior for when the app is in the foreground
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

class NotificationService {
  /**
   * Request user permission for local notifications.
   * @returns Boolean indicating whether permission was granted
   */
  public async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        await this.setupAndroidChannels();
      }

      return finalStatus === 'granted';
    } catch (e) {
      console.error('[NotificationService] Permission request failed:', e);
      return false;
    }
  }

  /**
   * Creates custom notification channels for Android.
   */
  private async setupAndroidChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      await Notifications.setNotificationChannelAsync('workout-reminders', {
        name: 'Workout Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
      await Notifications.setNotificationChannelAsync('recovery-alerts', {
        name: 'Recovery Alerts',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
      await Notifications.setNotificationChannelAsync('streak-reminders', {
        name: 'Streak Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
      await Notifications.setNotificationChannelAsync('weekly-summary', {
        name: 'Weekly Summary',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    } catch (e) {
      console.error('[NotificationService] Failed to set Android notification channels:', e);
    }
  }

  /**
   * Schedules a daily/weekly workout reminder.
   */
  public async scheduleWorkoutReminder(
    title: string = 'Time to Train',
    body: string = 'Your personalized workout is ready. Let’s log a session!',
    hour: number = 9,
    minute: number = 0
  ): Promise<string> {
    if (Platform.OS === 'web') return '';
    await this.requestPermissions();

    try {
      const trigger: Notifications.NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'workout-reminders',
      };

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { category: 'workout-reminders' },
        },
        trigger,
      });

      return identifier;
    } catch (e) {
      console.error('[NotificationService] Failed to schedule workout reminder:', e);
      return '';
    }
  }

  /**
   * Schedules a recovery rest alert (e.g. at the end of a set's rest timer).
   */
  public async scheduleRecoveryAlert(delaySeconds: number): Promise<string> {
    if (Platform.OS === 'web') return '';
    await this.requestPermissions();

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rest Period Over',
          body: 'Your recovery timer finished. Ready for the next set!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { category: 'recovery-alerts' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, delaySeconds),
          channelId: 'recovery-alerts',
        },
      });

      return identifier;
    } catch (e) {
      console.error('[NotificationService] Failed to schedule recovery alert:', e);
      return '';
    }
  }

  /**
   * Schedules a workout recovery alert (e.g. after session completion).
   */
  public async scheduleWorkoutRecoveryAlert(hoursDelay: number): Promise<string> {
    if (Platform.OS === 'web') return '';
    await this.requestPermissions();

    try {
      const secondsDelay = hoursDelay * 60 * 60;
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Muscle Recovery Active',
          body: 'Your recovery window is complete. How are your muscles feeling today?',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { category: 'recovery-alerts' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, secondsDelay),
          channelId: 'recovery-alerts',
        },
      });

      return identifier;
    } catch (e) {
      console.error('[NotificationService] Failed to schedule workout recovery alert:', e);
      return '';
    }
  }

  /**
   * Schedules a streak reminder (e.g. 48 hours after last logged workout).
   */
  public async scheduleStreakReminder(daysDelay: number = 2): Promise<string> {
    if (Platform.OS === 'web') return '';
    await this.requestPermissions();

    try {
      const secondsDelay = daysDelay * 24 * 60 * 60;
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Keep the Streak Alive!',
          body: 'Log a session today to maintain your workout consistency streak.',
          sound: true,
          data: { category: 'streak-reminders' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsDelay,
          channelId: 'streak-reminders',
        },
      });

      return identifier;
    } catch (e) {
      console.error('[NotificationService] Failed to schedule streak reminder:', e);
      return '';
    }
  }

  /**
   * Schedules a weekly progress summary reminder.
   */
  public async scheduleWeeklyProgressSummary(dayOfWeek: number = 1, hour: number = 18): Promise<string> {
    if (Platform.OS === 'web') return '';
    await this.requestPermissions();

    try {
      const trigger: Notifications.NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dayOfWeek, // 1 = Sunday, 2 = Monday, etc.
        hour,
        minute: 0,
        channelId: 'weekly-summary',
      };

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Weekly Progress is Ready',
          body: 'Check out your training volume and RPE averages for the week!',
          sound: true,
          data: { category: 'weekly-summary' },
        },
        trigger,
      });

      return identifier;
    } catch (e) {
      console.error('[NotificationService] Failed to schedule weekly progress:', e);
      return '';
    }
  }

  /**
   * Cancels a specific scheduled local notification.
   */
  public async cancelNotification(identifier: string): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (e) {
      console.error('[NotificationService] Failed to cancel notification:', identifier, e);
    }
  }

  /**
   * Cancels all scheduled local notifications of a specific category.
   */
  public async cancelNotificationsByCategory(category: string): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.content?.data?.category === category) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    } catch (e) {
      console.error('[NotificationService] Failed to cancel notifications by category:', category, e);
    }
  }

  /**
   * Cancels all scheduled local notifications.
   */
  public async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.error('[NotificationService] Failed to cancel notifications:', e);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
