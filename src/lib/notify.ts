import { dayjs } from './date';

let notifiedIds = new Set<string>();

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function checkAndNotify(
  tasks: Array<{ id: string; title: string; reminderDate: string | null }>
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = dayjs();
  for (const task of tasks) {
    if (!task.reminderDate || notifiedIds.has(task.id)) continue;
    const reminder = dayjs(task.reminderDate);
    if (reminder.isSameOrBefore(now, 'minute') && reminder.isAfter(now.subtract(1, 'minute'))) {
      notifiedIds.add(task.id);
      new Notification('待办提醒', {
        body: task.title,
        icon: '/icons/icon-192x192.png',
      });
    }
  }
}

export function resetNotifiedId(id: string) {
  notifiedIds.delete(id);
}
