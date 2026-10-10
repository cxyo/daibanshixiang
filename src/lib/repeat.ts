import { dayjs } from './date';
import type { RepeatRule, RepeatType, Task } from '../types';

export function createRepeatRule(partial: Partial<RepeatRule> = {}): RepeatRule {
  return {
    id: partial.id ?? crypto.randomUUID(),
    type: partial.type ?? 'daily',
    interval: partial.interval ?? 1,
    weekdays: partial.weekdays,
    monthday: partial.monthday,
    endType: partial.endType ?? 'never',
    endDate: partial.endDate ?? null,
    count: partial.count ?? null,
  };
}

export function getNextDueDate(
  task: Pick<Task, 'dueDate' | 'repeatRuleId'>,
  repeatRule: RepeatRule | undefined,
  fromDate: Date | string = new Date()
): string | null {
  if (!repeatRule || !task.dueDate || task.repeatRuleId !== repeatRule.id) {
    return null;
  }

  const base = dayjs(task.dueDate);
  const from = dayjs(fromDate);
  let next = base;

  switch (repeatRule.type) {
    case 'daily': {
      next = base.add(repeatRule.interval, 'day');
      break;
    }
    case 'weekly': {
      const weekdays = repeatRule.weekdays?.length
        ? repeatRule.weekdays
        : [base.day()];
      let candidate = base.add(1, 'day');
      let found = false;
      for (let i = 0; i < 14; i++) {
        if (weekdays.includes(candidate.day()) && candidate.isAfter(base, 'day')) {
          found = true;
          break;
        }
        candidate = candidate.add(1, 'day');
      }
      if (!found) return null;
      next = candidate;
      break;
    }
    case 'monthly': {
      const monthday = repeatRule.monthday ?? base.date();
      next = base.add(repeatRule.interval, 'month').date(monthday);
      break;
    }
    case 'yearly': {
      next = base.add(repeatRule.interval, 'year');
      break;
    }
    case 'custom': {
      next = base.add(repeatRule.interval, 'day');
      break;
    }
    default:
      return null;
  }

  if (repeatRule.endType === 'onDate' && repeatRule.endDate) {
    if (next.isAfter(dayjs(repeatRule.endDate), 'day')) return null;
  }

  if (repeatRule.endType === 'afterCount' && (repeatRule.count === null || repeatRule.count === undefined || repeatRule.count <= 0)) {
    return null;
  }

  if (next.isSameOrBefore(from, 'minute')) {
    return next.toISOString();
  }

  return next.toISOString();
}

export function repeatTypeLabel(type: RepeatType): string {
  const map: Record<RepeatType, string> = {
    none: '不重复',
    daily: '每天',
    weekly: '每周',
    monthly: '每月',
    yearly: '每年',
    custom: '自定义',
  };
  return map[type];
}
