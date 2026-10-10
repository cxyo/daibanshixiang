import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { db } from '../db/database';
import { useTaskStore } from '../store/useTaskStore';
import { quadrants } from '../lib/quadrant';
import QuadrantCell from '../components/quadrant/QuadrantCell';
import TaskForm from '../components/task/TaskForm';
import type { Task } from '../types';

export default function QuadrantPage() {
  const { isFormOpen, editingTask, openForm, closeForm, toggleDone, updateTask } = useTaskStore();

  const tasks = useLiveQuery(() => db.tasks.where('status').equals('active').toArray(), []);

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = { Q1: [], Q2: [], Q3: [], Q4: [] };
    for (const task of tasks ?? []) {
      if (task.importance && task.urgency) map.Q1.push(task);
      else if (task.importance && !task.urgency) map.Q2.push(task);
      else if (!task.importance && task.urgency) map.Q3.push(task);
      else map.Q4.push(task);
    }
    return map;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const quadrantKey = over.id as string;
    const config = quadrants.find((q) => q.key === quadrantKey);
    if (!config) return;

    updateTask(taskId, {
      importance: config.importance,
      urgency: config.urgency,
    });
  };

  const handleTaskClick = (task: Task) => {
    openForm(task);
  };

  return (
    <div className="h-full flex flex-col">
      <header className="px-4 py-3 md:px-6 md:py-4 bg-[var(--color-bg)]">
        <h1 className="text-xl font-bold text-gray-900">四象限</h1>
        <p className="text-xs text-gray-500 mt-1">拖拽任务到不同象限进行分类</p>
      </header>

      <div className="flex-1 px-4 pb-4 md:px-6 overflow-y-auto">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-auto md:h-full">
            {quadrants.map((q) => (
              <QuadrantCell
                key={q.key}
                quadrant={q}
                tasks={grouped[q.key]}
                onToggle={toggleDone}
                onClick={handleTaskClick}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {isFormOpen && <TaskForm task={editingTask} onClose={closeForm} />}
    </div>
  );
}
