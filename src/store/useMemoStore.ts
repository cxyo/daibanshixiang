import { create } from 'zustand';
import { db } from '../db/database';
import { schedulePush } from './useTaskStore';
import { useTaskStore } from './useTaskStore';
import type { Memo, MemoStatus } from '../types';

interface MemoState {
  editingMemo: Memo | null;
  isFormOpen: boolean;

  openForm: (memo?: Memo | null) => void;
  closeForm: () => void;
  addMemo: (data: Partial<Memo>) => Promise<Memo>;
  updateMemo: (id: string, data: Partial<Memo>) => Promise<void>;
  deleteMemo: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  setStatus: (id: string, status: MemoStatus) => Promise<void>;
  convertToTask: (id: string) => Promise<void>;
}

function deriveTitle(content: string): string {
  const firstLine = content.split('\n')[0].trim();
  return firstLine.slice(0, 40) || '未命名备忘';
}

export const useMemoStore = create<MemoState>((set) => ({
  editingMemo: null,
  isFormOpen: false,

  openForm: (memo) => set({ editingMemo: memo ?? null, isFormOpen: true }),

  closeForm: () => set({ editingMemo: null, isFormOpen: false }),

  addMemo: async (data) => {
    const now = new Date().toISOString();
    const memo: Memo = {
      id: crypto.randomUUID(),
      content: data.content?.trim() ?? '',
      tags: data.tags ?? [],
      pinned: data.pinned ?? false,
      status: data.status ?? 'idea',
      createdAt: now,
      updatedAt: now,
    };
    await db.memos.add(memo);
    schedulePush();
    return memo;
  },

  updateMemo: async (id, data) => {
    const existing = await db.memos.get(id);
    if (!existing) return;
    await db.memos.update(id, {
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    });
    schedulePush();
  },

  deleteMemo: async (id) => {
    await db.memos.delete(id);
    schedulePush();
  },

  togglePin: async (id) => {
    const memo = await db.memos.get(id);
    if (!memo) return;
    await db.memos.update(id, { pinned: !memo.pinned, updatedAt: new Date().toISOString() });
    schedulePush();
  },

  setStatus: async (id, status) => {
    await db.memos.update(id, { status, updatedAt: new Date().toISOString() });
    schedulePush();
  },

  convertToTask: async (id) => {
    const memo = await db.memos.get(id);
    if (!memo) return;
    await useTaskStore.getState().addTask({
      title: deriveTitle(memo.content),
      description: memo.content,
      tags: memo.tags,
    });
    await db.memos.update(id, { status: 'done', updatedAt: new Date().toISOString() });
    schedulePush();
  },
}));
