import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search } from 'lucide-react';
import { db } from '../db/database';
import { useTaskStore } from '../store/useTaskStore';
import TaskList from '../components/task/TaskList';
import TaskForm from '../components/task/TaskForm';
import type { Task } from '../types';

export default function SearchPage() {
  const { isFormOpen, editingTask, openForm, closeForm, toggleDone } = useTaskStore();
  const [query, setQuery] = useState('');

  const tasks = useLiveQuery(() => db.tasks.toArray(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (tasks ?? []).filter((t) => {
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [tasks, query]);

  return (
    <div className="h-full flex flex-col">
      <header className="px-4 py-3 md:px-6 md:py-4 bg-[var(--color-bg)]">
        <h1 className="text-xl font-bold text-gray-900 mb-3">搜索</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索任务、描述或标签"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </header>

      <div className="flex-1 px-4 pb-24 md:pb-6 md:px-6 overflow-y-auto">
        <TaskList
          tasks={filtered}
          onToggle={toggleDone}
          onClick={(task: Task) => openForm(task)}
          emptyText={query.trim() ? '未找到匹配任务' : '输入关键词开始搜索'}
        />
      </div>

      {isFormOpen && <TaskForm task={editingTask} onClose={closeForm} />}
    </div>
  );
}
