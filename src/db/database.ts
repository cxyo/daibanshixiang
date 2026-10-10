import Dexie, { type EntityTable } from 'dexie';
import type { List, RepeatRule, Task } from '../types';

const db = new Dexie('TickTickLikeTodo') as Dexie & {
  tasks: EntityTable<Task, 'id'>;
  lists: EntityTable<List, 'id'>;
  repeatRules: EntityTable<RepeatRule, 'id'>;
};

db.version(1).stores({
  tasks: 'id, status, listId, dueDate, importance, urgency, pinned, priority, sortOrder',
  lists: 'id, sortOrder',
  repeatRules: 'id',
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
