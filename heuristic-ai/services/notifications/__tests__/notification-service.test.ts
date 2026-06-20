/**
 * HeuristicAI — Unit Tests: NotificationService
 * Source of truth: TASK.md § 17
 */

// Mock react-native
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../notification-service';

jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
    },
  };
});

// Mock expo-notifications
jest.mock('expo-notifications', () => {
  const scheduled: any[] = [];
  return {
    setNotificationHandler: jest.fn(),
    getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    setNotificationChannelAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn().mockImplementation(async (request) => {
      const id = `mock-id-${Date.now()}-${Math.random()}`;
      scheduled.push({
        identifier: id,
        content: request.content,
        trigger: request.trigger,
      });
      return id;
    }),
    getAllScheduledNotificationsAsync: jest.fn().mockImplementation(async () => {
      return [...scheduled];
    }),
    cancelScheduledNotificationAsync: jest.fn().mockImplementation(async (id) => {
      const idx = scheduled.findIndex((item) => item.identifier === id);
      if (idx > -1) {
        scheduled.splice(idx, 1);
      }
    }),
    cancelAllScheduledNotificationsAsync: jest.fn().mockImplementation(async () => {
      scheduled.length = 0;
    }),
    AndroidImportance: {
      DEFAULT: 3,
      MAX: 5,
    },
    AndroidNotificationPriority: {
      HIGH: 1,
      MAX: 2,
    },
    SchedulableTriggerInputTypes: {
      DAILY: 'daily',
      TIME_INTERVAL: 'time_interval',
      WEEKLY: 'weekly',
    },
  };
});

describe('NotificationService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await notificationService.cancelAllNotifications();
  });

  it('should request permissions and register channels on setup', async () => {
    Platform.OS = 'android';
    const granted = await notificationService.requestPermissions();
    expect(granted).toBe(true);
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('workout-reminders', expect.any(Object));
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('streak-reminders', expect.any(Object));
  });

  it('should include specific categories in scheduled notifications', async () => {
    Platform.OS = 'ios';
    
    const id1 = await notificationService.scheduleWorkoutReminder();
    expect(id1).toBeDefined();

    const id2 = await notificationService.scheduleStreakReminder();
    expect(id2).toBeDefined();

    const id3 = await notificationService.scheduleRecoveryAlert(60);
    expect(id3).toBeDefined();

    const id4 = await notificationService.scheduleWorkoutRecoveryAlert(24);
    expect(id4).toBeDefined();

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    expect(scheduled.length).toBe(4);

    expect(scheduled[0].content.data?.category).toBe('workout-reminders');
    expect(scheduled[1].content.data?.category).toBe('streak-reminders');
    expect(scheduled[2].content.data?.category).toBe('recovery-alerts');
    expect(scheduled[3].content.data?.category).toBe('recovery-alerts');
  });

  it('should cancel notifications by category specifically', async () => {
    Platform.OS = 'ios';

    await notificationService.scheduleWorkoutReminder();
    await notificationService.scheduleStreakReminder();
    await notificationService.scheduleRecoveryAlert(60);

    let scheduled = await Notifications.getAllScheduledNotificationsAsync();
    expect(scheduled.length).toBe(3);

    // Cancel recovery alerts only
    await notificationService.cancelNotificationsByCategory('recovery-alerts');
    scheduled = await Notifications.getAllScheduledNotificationsAsync();
    expect(scheduled.length).toBe(2);
    
    // Recovery alert should be removed, while workout and streak reminders remain
    const categories = scheduled.map((n) => n.content.data?.category);
    expect(categories).toContain('workout-reminders');
    expect(categories).toContain('streak-reminders');
    expect(categories).not.toContain('recovery-alerts');
  });

  it('should do nothing and return empty string on web', async () => {
    Platform.OS = 'web';

    const granted = await notificationService.requestPermissions();
    expect(granted).toBe(false);

    const id = await notificationService.scheduleWorkoutReminder();
    expect(id).toBe('');

    await notificationService.cancelNotificationsByCategory('workout-reminders');
    expect(Notifications.getAllScheduledNotificationsAsync).not.toHaveBeenCalled();
  });
});
