import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dayjs } from '../../lib/date';
import type { Task } from '../../types';

interface CalendarViewProps {
  tasks: Task[];
  onSelectDate: (date: string) => void;
}

export default function CalendarView({ tasks, onSelectDate }: CalendarViewProps) {
  const [current, setCurrent] = useState(dayjs());

  const daysInMonth = current.daysInMonth();
  const startOfMonth = current.startOf('month');
  const startDay = startOfMonth.day();

  const taskMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = dayjs(task.dueDate).format('YYYY-MM-DD');
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  const cells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < startDay; i++) {
    cells.push({ date: null, day: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = current.date(d).format('YYYY-MM-DD');
    cells.push({ date, day: d });
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrent(current.subtract(1, 'month'))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold">{current.format('YYYY年M月')}</span>
        <button
          onClick={() => setCurrent(current.add(1, 'month'))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          const isToday = cell.date === dayjs().format('YYYY-MM-DD');
          const count = cell.date ? taskMap.get(cell.date) ?? 0 : 0;
          return (
            <button
              key={idx}
              disabled={!cell.date}
              onClick={() => cell.date && onSelectDate(cell.date)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm ${
                cell.date ? 'hover:bg-blue-50' : ''
              } ${isToday ? 'bg-blue-50 text-primary font-bold' : 'text-gray-700'}`}
            >
              {cell.day}
              {count > 0 && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
