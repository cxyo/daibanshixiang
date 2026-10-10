import { Calendar, Repeat, Tag } from 'lucide-react';
import type { Task } from '../../types';
import { formatDateTime, isOverdue } from '../../lib/date';
import { getQuadrant, quadrants } from '../../lib/quadrant';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onClick: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onClick }: TaskItemProps) {
  const done = task.status === 'done';
  const overdue = !done && isOverdue(task.dueDate);
  const quadrant = getQuadrant(task);
  const qConfig = quadrants.find((q) => q.key === quadrant);

  const priorityColors = [
    'bg-gray-200',
    'bg-blue-400',
    'bg-yellow-400',
    'bg-red-500',
  ];

  return (
    <div
      className={`group flex items-start p-3 bg-white rounded-xl border border-[var(--color-border)] shadow-sm active:scale-[0.99] transition-transform ${
        done ? 'opacity-60' : ''
      }`}
      onClick={() => onClick(task)}
    >
      <button
        className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center ${
          done
            ? 'bg-primary border-primary text-white'
            : 'border-gray-300 hover:border-primary'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
      >
        {done && (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0 ml-3">
        <div className="flex items-center space-x-2">
          <span
            className={`text-[15px] font-medium truncate ${
              done ? 'line-through text-gray-400' : 'text-gray-800'
            }`}
          >
            {task.title}
          </span>
          {task.pinned && <span className="text-xs text-amber-500">📌</span>}
        </div>

        {task.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {task.dueDate && (
            <span
              className={`inline-flex items-center text-xs ${
                overdue ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <Calendar className="w-3 h-3 mr-0.5" />
              {formatDateTime(task.dueDate)}
            </span>
          )}

          {task.repeatRuleId && (
            <span className="inline-flex items-center text-xs text-gray-500">
              <Repeat className="w-3 h-3 mr-0.5" />
              重复
            </span>
          )}

          {task.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded"
            >
              <Tag className="w-2.5 h-2.5 mr-0.5" />
              {tag}
            </span>
          ))}

          <span
            className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}
            title={`优先级 ${task.priority}`}
          />

          {qConfig && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${qConfig.color} ${qConfig.bg}`}>
              {qConfig.title}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
