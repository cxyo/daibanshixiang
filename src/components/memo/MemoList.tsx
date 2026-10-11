import MemoCard from './MemoCard';
import type { Memo, MemoStatus } from '../../types';

interface Props {
  memos: Memo[];
  onEdit: (memo: Memo) => void;
  onTogglePin: (id: string) => void;
  onConvert: (id: string) => void;
  onDelete: (id: string) => void;
  onSetStatus: (id: string, status: MemoStatus) => void;
  emptyText?: string;
}

export default function MemoList({
  memos,
  onEdit,
  onTogglePin,
  onConvert,
  onDelete,
  onSetStatus,
  emptyText = '还没有备忘，点右下角记录一个灵感吧',
}: Props) {
  if (memos.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-16">{emptyText}</div>
    );
  }

  return (
    <div className="space-y-2.5">
      {memos.map((memo) => (
        <MemoCard
          key={memo.id}
          memo={memo}
          onClick={onEdit}
          onTogglePin={onTogglePin}
          onConvert={onConvert}
          onDelete={onDelete}
          onSetStatus={onSetStatus}
        />
      ))}
    </div>
  );
}
