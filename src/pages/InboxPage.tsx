import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';
import { db } from '../db/database';
import { useTaskStore } from '../store/useTaskStore';
import TaskList from '../components/task/TaskList';
import TaskForm from '../components/task/TaskForm';
import type { Task } from '../types';

export default function InboxPage() {
  const { isFormOpen, editingTask, openForm, closeForm, toggleDone } = useTaskStore();

  const tasks = useLiveQuery(
    () =>
      db.tasks
        .where('status')
        .equals('active')
        .and((t) => t.listId === 'inbox')
        .sortBy('sortOrder'),
    []
  );

  const sortedTasks = (tasks ?? []).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.sortOrder - a.sortOrder;
  });

  const pinnedTasks = sortedTasks.filter((t) => t.pinned);
  const normalTasks = sortedTasks.filter((t) => !t.pinned);

  const handleTaskClick = (task: Task) => {
    openForm(task);
  };

  return (
    <div className="h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-[var(--color-bg)] px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">收集箱</h1>
          <button
            onClick={() => openForm()}
            className="md:hidden p-2 text-primary bg-blue-50 rounded-full"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 pb-24 md:pb-6 md:px-6 overflow-y-auto">
        {pinnedTasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">已置顶</h2>
              <span className="text-xs text-gray-400">{pinnedTasks.length}</span>
            </div>
            <TaskList tasks={pinnedTasks} onToggle={toggleDone} onClick={handleTaskClick} />
          </div>
        )}

        <div>
          {pinnedTasks.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">未分组</h2>
              <span className="text-xs text-gray-400">{normalTasks.length}</span>
            </div>
          )}
          <TaskList
            tasks={normalTasks}
            onToggle={toggleDone}
            onClick={handleTaskClick}
            emptyText="收集箱为空，点击右下角添加任务"
          />
        </div>
      </div>

      <button
        onClick={() => openForm()}
        className="fixed right-4 bottom-20 md:bottom-8 md:right-8 z-30 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {isFormOpen && <TaskForm task={editingTask} onClose={closeForm} />}
    </div>
  );
}
