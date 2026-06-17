/**
 * Appointment Reminder Service — Notifee local notifications.
 *
 * All functions are wrapped in try/catch so a missing permission or a Notifee
 * API change never crashes the app. The reminder is considered "best-effort".
 *
 * Flow:
 *  1. When saving a new/updated appointment: call scheduleAppointmentReminder()
 *     → returns a reminderId string (or null on failure).
 *  2. Persist reminderId on the Firestore appointment document.
 *  3. When cancelling/deleting an appointment: call cancelAppointmentReminder(reminderId).
 */

import notifee, {
  AuthorizationStatus,
  TriggerType,
  AndroidImportance,
} from '@notifee/react-native';

const CHANNEL_ID = 'clinic_appointments';
const CHANNEL_NAME = 'مواعيد العيادة';

/**
 * Request notification permission (iOS) and ensure the Android channel exists.
 * Safe to call multiple times.
 */
async function ensurePermissionAndChannel(): Promise<boolean> {
  try {
    const settings = await notifee.requestPermission();

    if (
      settings.authorizationStatus === AuthorizationStatus.DENIED ||
      settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED
    ) {
      return false;
    }

    // Create/update notification channel (Android only; no-op on iOS)
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Schedule a local trigger notification at `reminderAt` (ISO-8601 string).
 * Returns the Notifee notification ID to persist as `reminderId` on the appointment,
 * or null if the reminder could not be scheduled (permissions denied, past date, etc.).
 *
 * @param appointmentId  Firestore appointment document ID (used as the notification ID for idempotency)
 * @param patientName    Displayed in the notification body
 * @param reminderAt     ISO-8601 timestamp when the notification should fire
 */
export async function scheduleAppointmentReminder(
  appointmentId: string,
  patientName: string,
  reminderAt: string,
): Promise<string | null> {
  try {
    const reminderDate = new Date(reminderAt);

    // Do not schedule reminders in the past
    if (reminderDate.getTime() <= Date.now()) {
      return null;
    }

    const hasPermission = await ensurePermissionAndChannel();
    if (!hasPermission) return null;

    const notificationId = await notifee.createTriggerNotification(
      {
        id: appointmentId, // deterministic ID — re-scheduling the same appointment overwrites
        title: $t('APPOINTMENTS.REMINDER_TITLE'),
        body: $t('APPOINTMENTS.REMINDER_BODY').replace('{{patient}}', patientName),
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: reminderDate.getTime(),
      },
    );

    return notificationId;
  } catch (_error) {
    // Defensive: never crash the appointment save flow
    return null;
  }
}

/**
 * Cancel a previously-scheduled appointment reminder.
 * Safe to call with a null/undefined reminderId (no-op).
 */
export async function cancelAppointmentReminder(reminderId?: string | null): Promise<void> {
  if (!reminderId) return;
  try {
    await notifee.cancelNotification(reminderId);
  } catch (_error) {
    // Silently ignore — notification may have already fired or been cleared
  }
}
