import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { QuadrantConfig, Task } from '../../types';
import { formatDateTime } from '../../lib/date';

interface QuadrantCellProps {
  quadrant: QuadrantConfig;
  tasks: Task[];
  onToggle: (id: string) => void;
  onClick: (task: Task) => void;
}

function SortableTaskItem({
  task,
  onToggle,
  onClick,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onClick: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const done = task.status === 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-start p-2 mb-2 bg-white rounded-lg border border-[var(--color-border)] shadow-sm cursor-grab active:cursor-grabbing"
      onClick={() => onClick(task)}
    >
      <button
        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center ${
          done ? 'bg-primary border-primary text-white' : 'border-gray-300'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
      >
        {done && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="ml-2 flex-1 min-w-0">
        <p className={`text-sm truncate ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(task.dueDate)}</p>
        )}
      </div>
    </div>
  );
}

export default function QuadrantCell({ quadrant, tasks, onToggle, onClick }: QuadrantCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: quadrant.key });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full rounded-2xl p-3 ${quadrant.bg} ${
        isOver ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <span
            className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white ${
              quadrant.key === 'Q1'
                ? 'bg-red-500'
                : quadrant.key === 'Q2'
                ? 'bg-amber-500'
                : quadrant.key === 'Q3'
                ? 'bg-blue-500'
                : 'bg-emerald-500'
            }`}
          >
            {quadrant.key === 'Q1' ? 'I' : quadrant.key === 'Q2' ? 'II' : quadrant.key === 'Q3' ? 'III' : 'IV'}
          </span>
          <span className={`text-sm font-semibold ${quadrant.color}`}>{quadrant.title}</span>
        </div>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[120px]">
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">没有任务</p>
        ) : (
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <SortableTaskItem key={task.id} task={task} onToggle={onToggle} onClick={onClick} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
