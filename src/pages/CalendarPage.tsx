import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useTaskStore } from '../store/useTaskStore';
import CalendarView from '../components/calendar/CalendarView';
import TaskList from '../components/task/TaskList';
import TaskForm from '../components/task/TaskForm';
import { dayjs } from '../lib/date';
import type { Task } from '../types';

export default function CalendarPage() {
  const { isFormOpen, editingTask, openForm, closeForm, toggleDone } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  const tasks = useLiveQuery(() => db.tasks.where('status').equals('active').toArray(), []);

  const selectedTasks = (tasks ?? []).filter((t) => {
    if (!t.dueDate) return false;
    return dayjs(t.dueDate).format('YYYY-MM-DD') === selectedDate;
  });

  return (
    <div className="h-full flex flex-col">
      <header className="px-4 py-3 md:px-6 md:py-4 bg-[var(--color-bg)]">
        <h1 className="text-xl font-bold text-gray-900">日历</h1>
      </header>

      <div className="flex-1 px-4 pb-24 md:pb-6 md:px-6 overflow-y-auto space-y-4">
        <CalendarView tasks={tasks ?? []} onSelectDate={setSelectedDate} />

        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            {dayjs(selectedDate).format('M月D日')} 任务
          </h2>
          <TaskList
            tasks={selectedTasks}
            onToggle={toggleDone}
            onClick={(task: Task) => openForm(task)}
            emptyText="当天没有任务"
          />
        </div>
      </div>

      {isFormOpen && <TaskForm task={editingTask} onClose={closeForm} />}
    </div>
  );
}
