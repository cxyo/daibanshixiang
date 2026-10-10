import { create } from 'zustand';
import { db, seedDefaultData } from '../db/database';
import { createRepeatRule, getNextDueDate } from '../lib/repeat';
import {
  fetchSnapshot,
  getToken,
  hasToken,
  saveSnapshot,
  setToken,
  type SyncSnapshot,
} from '../lib/sync';
import type { List, Task } from '../types';

interface TaskState {
  editingTask: Task | null;
  isFormOpen: boolean;
  searchQuery: string;
  // 同步相关
  syncEnabled: boolean;
  syncing: boolean;
  lastSyncAt: string | null;
  syncError: string | null;

  openForm: (task?: Task | null) => void;
  closeForm: () => void;
  addTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  addList: (name: string) => Promise<List>;
  updateList: (id: string, name: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<void>;
  setSearchQuery: (query: string) => void;

  // 同步方法
  bootstrap: () => Promise<void>;
  initSync: () => Promise<void>;
  pollSync: () => Promise<void>;
  pushRemote: () => Promise<void>;
  manualSync: () => Promise<void>;
  configureSync: (token: string) => Promise<void>;
  disconnectSync: () => void;
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePush() {
  if (!hasToken()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void useTaskStore.getState().pushRemote();
  }, 1500);
}

async function exportLocal(): Promise<SyncSnapshot> {
  const tasks = await db.tasks.toArray();
  const lists = await db.lists.toArray();
  const repeatRules = await db.repeatRules.toArray();
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    tasks,
    lists,
    repeatRules,
  };
}

async function importToLocal(snap: SyncSnapshot) {
  await db.transaction('rw', db.tasks, db.lists, db.repeatRules, async () => {
    await db.tasks.clear();
    await db.lists.clear();
    await db.repeatRules.clear();
    if (snap.tasks?.length) await db.tasks.bulkAdd(snap.tasks);
    if (snap.lists?.length) await db.lists.bulkAdd(snap.lists);
    if (snap.repeatRules?.length) await db.repeatRules.bulkAdd(snap.repeatRules);
    if (!snap.lists?.some((l) => l.id === 'inbox')) {
      await db.lists.add({ id: 'inbox', name: '收集箱', icon: 'inbox', sortOrder: 0 });
    }
  });
}

export const useTaskStore = create<TaskState>((set, get) => ({
  editingTask: null,
  isFormOpen: false,
  searchQuery: '',
  syncEnabled: false,
  syncing: false,
  lastSyncAt: null,
  syncError: null,

  openForm: (task) => {
    set({ editingTask: task ?? null, isFormOpen: true });
  },

  closeForm: () => {
    set({ editingTask: null, isFormOpen: false });
  },

  addTask: async (data) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: data.title?.trim() ?? '无标题',
      description: data.description?.trim() ?? '',
      status: 'active',
      priority: data.priority ?? 0,
      importance: data.importance ?? false,
      urgency: data.urgency ?? false,
      listId: data.listId ?? 'inbox',
      dueDate: data.dueDate ?? null,
      reminderDate: data.reminderDate ?? null,
      repeatRuleId: data.repeatRuleId ?? null,
      tags: data.tags ?? [],
      pinned: data.pinned ?? false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      sortOrder: Date.now(),
    };
    await db.tasks.add(task);
    schedulePush();
    return task;
  },

  updateTask: async (id, data) => {
    const existing = await db.tasks.get(id);
    if (!existing) return;
    const updated: Task = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    await db.tasks.put(updated);
    schedulePush();
  },

  deleteTask: async (id) => {
    const task = await db.tasks.get(id);
    if (task?.repeatRuleId) {
      await db.repeatRules.delete(task.repeatRuleId);
    }
    await db.tasks.delete(id);
    schedulePush();
  },

  toggleDone: async (id) => {
    const task = await db.tasks.get(id);
    if (!task) return;

    const now = new Date().toISOString();
    const isDone = task.status === 'done';

    if (isDone) {
      await db.tasks.update(id, {
        status: 'active',
        completedAt: null,
        updatedAt: now,
      });
      schedulePush();
      return;
    }

    if (task.repeatRuleId) {
      const rule = await db.repeatRules.get(task.repeatRuleId);
      const nextDue = rule ? getNextDueDate(task, rule) : null;

      if (nextDue) {
        const nextTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          status: 'active',
          dueDate: nextDue,
          completedAt: null,
          createdAt: now,
          updatedAt: now,
          sortOrder: Date.now(),
        };
        await db.tasks.add(nextTask);
      }

      if (
        rule &&
        rule.endType === 'afterCount' &&
        typeof rule.count === 'number' &&
        rule.count > 0
      ) {
        await db.repeatRules.update(rule.id, { count: rule.count - 1 });
      }
    }

    await db.tasks.update(id, {
      status: 'done',
      completedAt: now,
      updatedAt: now,
    });
    schedulePush();
  },

  addList: async (name) => {
    const count = await db.lists.count();
    const list: List = {
      id: crypto.randomUUID(),
      name: name.trim() || '新清单',
      icon: 'list',
      sortOrder: count,
    };
    await db.lists.add(list);
    schedulePush();
    return list;
  },

  updateList: async (id, name) => {
    await db.lists.update(id, { name: name.trim() || '未命名' });
    schedulePush();
  },

  deleteList: async (id) => {
    if (id === 'inbox') return;
    await db.tasks.where('listId').equals(id).modify({ listId: 'inbox' });
    await db.lists.delete(id);
    schedulePush();
  },

  exportData: async () => {
    const tasks = await db.tasks.toArray();
    const lists = await db.lists.toArray();
    const repeatRules = await db.repeatRules.toArray();
    return JSON.stringify({ tasks, lists, repeatRules, version: 1 }, null, 2);
  },

  importData: async (json) => {
    const data = JSON.parse(json);
    await db.transaction('rw', db.tasks, db.lists, db.repeatRules, async () => {
      await db.tasks.clear();
      await db.lists.clear();
      await db.repeatRules.clear();
      if (data.tasks?.length) await db.tasks.bulkAdd(data.tasks);
      if (data.lists?.length) await db.lists.bulkAdd(data.lists);
      if (data.repeatRules?.length) await db.repeatRules.bulkAdd(data.repeatRules);
    });
    schedulePush();
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  bootstrap: async () => {
    await seedDefaultData();
  },

  initSync: async () => {
    if (!getToken()) {
      set({ syncEnabled: false });
      return;
    }
    set({ syncEnabled: true, syncing: true });
    try {
      const { snapshot } = await fetchSnapshot();
      if (snapshot) {
        await importToLocal(snapshot);
      } else {
        // 远端还没有文件，把本地数据推上去创建
        await get().pushRemote();
      }
      set({ syncing: false, lastSyncAt: new Date().toISOString(), syncError: null });
    } catch (e) {
      set({
        syncing: false,
        syncError: e instanceof Error ? e.message : String(e),
      });
    }
  },

  pollSync: async () => {
    if (!get().syncEnabled || !getToken()) return;
    try {
      const { snapshot, changed } = await fetchSnapshot();
      if (changed && snapshot) {
        await importToLocal(snapshot);
      }
      set({ lastSyncAt: new Date().toISOString(), syncError: null });
    } catch (e) {
      set({ syncError: e instanceof Error ? e.message : String(e) });
    }
  },

  pushRemote: async () => {
    if (!getToken()) return;
    set({ syncing: true });
    try {
      const snap = await exportLocal();
      await saveSnapshot(snap);
      set({ syncing: false, lastSyncAt: new Date().toISOString(), syncError: null });
    } catch (e) {
      set({ syncing: false, syncError: e instanceof Error ? e.message : String(e) });
    }
  },

  manualSync: async () => {
    if (!getToken()) return;
    set({ syncing: true });
    try {
      const { snapshot, changed } = await fetchSnapshot();
      if (changed && snapshot) {
        await importToLocal(snapshot);
      }
      const snap = await exportLocal();
      await saveSnapshot(snap);
      set({ syncing: false, lastSyncAt: new Date().toISOString(), syncError: null });
    } catch (e) {
      set({ syncing: false, syncError: e instanceof Error ? e.message : String(e) });
    }
  },

  configureSync: async (token: string) => {
    setToken(token);
    if (!token.trim()) {
      set({ syncEnabled: false, syncError: null });
      return;
    }
    await get().initSync();
  },

  disconnectSync: () => {
    setToken('');
    set({ syncEnabled: false, syncError: null, lastSyncAt: null });
  },
}));

export { createRepeatRule };
