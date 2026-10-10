import type { QuadrantConfig, QuadrantKey, Task } from '../types';

export function getQuadrant(task: Pick<Task, 'importance' | 'urgency'>): QuadrantKey {
  if (task.importance && task.urgency) return 'Q1';
  if (task.importance && !task.urgency) return 'Q2';
  if (!task.importance && task.urgency) return 'Q3';
  return 'Q4';
}

export const quadrants: QuadrantConfig[] = [
  {
    key: 'Q1',
    title: '重要且紧急',
    color: 'text-red-500',
    bg: 'bg-red-50',
    importance: true,
    urgency: true,
  },
  {
    key: 'Q2',
    title: '重要不紧急',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    importance: true,
    urgency: false,
  },
  {
    key: 'Q3',
    title: '不重要但紧急',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    importance: false,
    urgency: true,
  },
  {
    key: 'Q4',
    title: '不重要不紧急',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    importance: false,
    urgency: false,
  },
];
