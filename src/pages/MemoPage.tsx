import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search as SearchIcon } from 'lucide-react';
import { db } from '../db/database';
import { useMemoStore } from '../store/useMemoStore';
import MemoList from '../components/memo/MemoList';
import MemoForm from '../components/memo/MemoForm';
import type { MemoStatus } from '../types';

const FILTERS: { key: 'all' | MemoStatus; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'idea', label: '想法' },
  { key: 'doing', label: '研究中' },
  { key: 'done', label: '已落地' },
  { key: 'archived', label: '已归档' },
];

export default function MemoPage() {
  const { isFormOpen, openForm, closeForm, togglePin, deleteMemo, convertToTask, setStatus } =
    useMemoStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | MemoStatus>('all');

  const memos = useLiveQuery(() => db.memos.toArray(), []);

  const filtered = useMemo(() => {
    const list = memos ?? [];
    const q = query.trim().toLowerCase();
    return list
      .filter((m) => (filter === 'all' ? true : m.status === filter))
      .filter((m) => {
        if (!q) return true;
        return (
          m.content.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [memos, query, filter]);

  return (
    <div className="h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-[var(--color-bg)] px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">备忘录</h1>
          <button
            onClick={() => openForm()}
            className="md:hidden p-2 text-primary bg-blue-50 rounded-full"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mt-3">
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索备忘内容或标签"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-gray-100 border-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex gap-2 mt-2.5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 text-xs px-3 py-1 rounded-full border ${
                filter === f.key
                  ? 'border-primary text-primary bg-blue-50'
                  : 'border-[var(--color-border)] text-gray-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 px-4 pb-24 md:pb-6 md:px-6 overflow-y-auto">
        <MemoList
          memos={filtered}
          onEdit={openForm}
          onTogglePin={togglePin}
          onConvert={convertToTask}
          onDelete={deleteMemo}
          onSetStatus={setStatus}
          emptyText={query ? '没有匹配的备忘' : '还没有备忘，点右下角记录一个灵感吧'}
        />
      </div>

      <button
        onClick={() => openForm()}
        className="fixed right-4 bottom-20 md:bottom-8 md:right-8 z-30 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {isFormOpen && <MemoForm onClose={closeForm} />}
    </div>
  );
}
