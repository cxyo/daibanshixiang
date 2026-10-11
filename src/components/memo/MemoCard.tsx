import { Pin, ArrowRightLeft, Trash2, Check } from 'lucide-react';
import { dayjs } from '../../lib/date';
import type { Memo, MemoStatus } from '../../types';

export const MEMO_STATUS_LABEL: Record<MemoStatus, string> = {
  idea: '想法',
  doing: '研究中',
  done: '已落地',
  archived: '已归档',
};

const STATUS_STYLE: Record<MemoStatus, string> = {
  idea: 'bg-amber-50 text-amber-600',
  doing: 'bg-blue-50 text-blue-600',
  done: 'bg-green-50 text-green-600',
  archived: 'bg-gray-100 text-gray-400',
};

interface Props {
  memo: Memo;
  onClick: (memo: Memo) => void;
  onTogglePin: (id: string) => void;
  onConvert: (id: string) => void;
  onDelete: (id: string) => void;
  onSetStatus: (id: string, status: MemoStatus) => void;
}

export default function MemoCard({
  memo,
  onClick,
  onTogglePin,
  onConvert,
  onDelete,
  onSetStatus,
}: Props) {
  return (
    <div
      className="bg-white rounded-xl border border-[var(--color-border)] p-3 shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
      onClick={() => onClick(memo)}
    >
      <div className="flex items-start gap-2">
        <p className="flex-1 text-sm text-gray-800 whitespace-pre-wrap break-words line-clamp-4">
          {memo.content || '（空备忘）'}
        </p>
        {memo.pinned && <Pin className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="currentColor" />}
      </div>

      {memo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {memo.tags.map((t) => (
            <span
              key={t}
              className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] px-1.5 py-0.5 rounded ${STATUS_STYLE[memo.status]}`}>
            {MEMO_STATUS_LABEL[memo.status]}
          </span>
          <span className="text-[11px] text-gray-400">
            {dayjs(memo.updatedAt).fromNow()}
          </span>
        </div>

        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            title="转为待办"
            onClick={() => onConvert(memo.id)}
            className="p-1.5 text-gray-400 hover:text-primary rounded"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <button
            title="置顶"
            onClick={() => onTogglePin(memo.id)}
            className={`p-1.5 rounded ${memo.pinned ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            title="删除"
            onClick={() => onDelete(memo.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {memo.status === 'idea' && (
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetStatus(memo.id, 'doing');
            }}
            className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1 rounded bg-blue-50 text-blue-600"
          >
            <Check className="w-3 h-3" /> 开始研究
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetStatus(memo.id, 'archived');
            }}
            className="flex-1 text-[11px] py-1 rounded bg-gray-100 text-gray-500"
          >
            归档
          </button>
        </div>
      )}
    </div>
  );
}
