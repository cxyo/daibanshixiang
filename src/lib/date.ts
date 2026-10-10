import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isYesterday from 'dayjs/plugin/isYesterday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrBefore);

export { dayjs };

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = dayjs(iso);
  if (d.isToday()) return d.format('今天 HH:mm');
  if (d.isTomorrow()) return d.format('明天 HH:mm');
  if (d.isYesterday()) return d.format('昨天 HH:mm');
  return d.format('M月D日 HH:mm');
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = dayjs(iso);
  if (d.isToday()) return '今天';
  if (d.isTomorrow()) return '明天';
  if (d.isYesterday()) return '昨天';
  return d.format('M月D日');
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  return dayjs(iso).format('HH:mm');
}

export function toInputDateTimeValue(iso: string | null | undefined): string {
  if (!iso) return '';
  return dayjs(iso).format('YYYY-MM-DDTHH:mm');
}

export function isOverdue(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return dayjs(iso).isBefore(dayjs(), 'minute');
}
