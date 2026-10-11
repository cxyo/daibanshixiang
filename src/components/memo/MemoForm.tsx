import { useState } from 'react';
import { X } from 'lucide-react';
import { useMemoStore } from '../../store/useMemoStore';
import { MEMO_STATUS_LABEL } from './MemoCard';
import type { MemoStatus } from '../../types';

const STATUS_ORDER: MemoStatus[] = ['idea', 'doing', 'done', 'archived'];

export default function MemoForm({ onClose }: { onClose: () => void }) {
  const { editingMemo, addMemo, updateMemo } = useMemoStore();
  const isEdit = !!editingMemo;

  const [content, setContent] = useState(editingMemo?.content ?? '');
  const [tagsInput, setTagsInput] = useState((editingMemo?.tags ?? []).join(', '));
  const [status, setStatus] = useState<MemoStatus>(editingMemo?.status ?? 'idea');

  const handleSave = async () => {
    if (!content.trim()) {
      onClose();
      return;
    }
    const tags = tagsInput
      .split(/[,，#\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const data = { content: content.trim(), tags, status };
    if (isEdit && editingMemo) {
      await updateMemo(editingMemo.id, data);
    } else {
      await addMemo(data);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-4 pb-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? '编辑备忘' : '新建备忘'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="突然想到的金点子、好项目、灵感……先记下来"
          className="w-full h-40 p-3 text-sm rounded-xl bg-gray-50 border border-[var(--color-border)] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="标签，用逗号分隔，如：金点子, 好项目"
          className="w-full mt-3 p-2.5 text-sm rounded-xl bg-gray-50 border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <div className="flex gap-2 mt-3">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 text-xs py-1.5 rounded-lg border ${
                status === s
                  ? 'border-primary text-primary bg-blue-50'
                  : 'border-[var(--color-border)] text-gray-500'
              }`}
            >
              {MEMO_STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark active:scale-[0.99] transition-transform"
        >
          {isEdit ? '保存' : '保存备忘'}
        </button>
      </div>
    </div>
  );
}
