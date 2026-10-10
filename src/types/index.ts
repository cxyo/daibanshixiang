export type Priority = 0 | 1 | 2 | 3;

export type RepeatType =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom';

export type EndType = 'never' | 'onDate' | 'afterCount';

export interface RepeatRule {
  id: string;
  type: RepeatType;
  interval: number;
  weekdays?: number[];
  monthday?: number;
  endType: EndType;
  endDate?: string | null;
  count?: number | null;
}

export type TaskStatus = 'active' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  importance: boolean;
  urgency: boolean;
  listId: string;
  dueDate: string | null;
  reminderDate: string | null;
  repeatRuleId: string | null;
  tags: string[];
  pinned: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
}

export interface List {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
}

export type QuadrantKey = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface QuadrantConfig {
  key: QuadrantKey;
  title: string;
  color: string;
  bg: string;
  importance: boolean;
  urgency: boolean;
}
