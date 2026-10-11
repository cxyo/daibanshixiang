import Dexie, { type EntityTable } from 'dexie';
import type { List, Memo, RepeatRule, Task } from '../types';

const db = new Dexie('TickTickLikeTodo') as Dexie & {
  tasks: EntityTable<Task, 'id'>;
  lists: EntityTable<List, 'id'>;
  repeatRules: EntityTable<RepeatRule, 'id'>;
  memos: EntityTable<Memo, 'id'>;
};

db.version(1).stores({
  tasks: 'id, status, listId, dueDate, importance, urgency, pinned, priority, sortOrder',
  lists: 'id, sortOrder',
  repeatRules: 'id',
});

db.version(2).stores({
  memos: 'id, pinned, status, updatedAt',
});

export async function seedDefaultData() {
  const count = await db.lists.count();
  if (count === 0) {
    await db.lists.add({
      id: 'inbox',
      name: '收集箱',
      icon: 'inbox',
      sortOrder: 0,
    });
  }
}

export { db };
