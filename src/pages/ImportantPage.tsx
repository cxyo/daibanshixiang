import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useTaskStore } from '../store/useTaskStore';
import TaskList from '../components/task/TaskList';
import TaskForm from '../components/task/TaskForm';
import type { Task } from '../types';

export default function ImportantPage() {
  const { isFormOpen, editingTask, openForm, closeForm, toggleDone } = useTaskStore();

  const tasks = useLiveQuery(
    () =>
      db.tasks
        .where('status')
        .equals('active')
        .and((t) => t.importance === true || t.priority >= 2)
        .toArray(),
    []
  );

  return (
    <div className="h-full flex flex-col">
      <header className="px-4 py-3 md:px-6 md:py-4 bg-[var(--color-bg)]">
        <h1 className="text-xl font-bold text-gray-900">重要</h1>
      </header>

      <div className="flex-1 px-4 pb-24 md:pb-6 md:px-6 overflow-y-auto">
        <TaskList
          tasks={tasks ?? []}
          onToggle={toggleDone}
          onClick={(task: Task) => openForm(task)}
          emptyText="没有重要任务"
        />
      </div>

      {isFormOpen && <TaskForm task={editingTask} onClose={closeForm} />}
    </div>
  );
}
