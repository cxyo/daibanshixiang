import { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { db } from '../../db/database';
import { useTaskStore } from '../../store/useTaskStore';
import { createRepeatRule } from '../../lib/repeat';
import { dayjs, toInputDateTimeValue } from '../../lib/date';
import type { List, Priority, RepeatType, Task } from '../../types';

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
}

const repeatOptions: { value: RepeatType; label: string }[] = [
  { value: 'none', label: '不重复' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' },
];

export default function TaskForm({ task, onClose }: TaskFormProps) {
  const isEdit = Boolean(task);
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const [lists, setLists] = useState<List[]>([]);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [dueDate, setDueDate] = useState(toInputDateTimeValue(task?.dueDate));
  const [reminderDate, setReminderDate] = useState(toInputDateTimeValue(task?.reminderDate));
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 0);
  const [importance, setImportance] = useState(task?.importance ?? false);
  const [urgency, setUrgency] = useState(task?.urgency ?? false);
  const [pinned, setPinned] = useState(task?.pinned ?? false);
  const [listId, setListId] = useState(task?.listId ?? 'inbox');
  const [tags, setTags] = useState<string[]>(task?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [repeatEndType, setRepeatEndType] = useState<'never' | 'onDate' | 'afterCount'>('never');
  const [repeatEndDate, setRepeatEndDate] = useState('');
  const [repeatCount, setRepeatCount] = useState(5);

  useEffect(() => {
    db.lists.toArray().then(setLists);
    if (task?.repeatRuleId) {
      db.repeatRules.get(task.repeatRuleId).then((rule) => {
        if (rule) {
          setRepeatType(rule.type);
          setRepeatInterval(rule.interval);
          setRepeatEndType(rule.endType);
          setRepeatEndDate(rule.endDate ? dayjs(rule.endDate).format('YYYY-MM-DD') : '');
          setRepeatCount(rule.count ?? 5);
        }
      });
    }
  }, [task]);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    let repeatRuleId = task?.repeatRuleId ?? null;

    if (repeatType !== 'none') {
      const rule = createRepeatRule({
        id: task?.repeatRuleId ?? undefined,
        type: repeatType,
        interval: repeatInterval,
        endType: repeatEndType,
        endDate: repeatEndType === 'onDate' && repeatEndDate ? dayjs(repeatEndDate).toISOString() : null,
        count: repeatEndType === 'afterCount' ? repeatCount : null,
      });
      await db.repeatRules.put(rule);
      repeatRuleId = rule.id;
    } else if (task?.repeatRuleId) {
      await db.repeatRules.delete(task.repeatRuleId);
      repeatRuleId = null;
    }

    const data = {
      title: trimmedTitle,
      description: description.trim(),
      dueDate: dueDate ? dayjs(dueDate).toISOString() : null,
      reminderDate: reminderDate ? dayjs(reminderDate).toISOString() : null,
      priority,
      importance,
      urgency,
      pinned,
      listId,
      tags,
      repeatRuleId,
    };

    if (task) {
      await updateTask(task.id, data);
    } else {
      await addTask(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!task) return;
    if (confirm('确定要删除这个任务吗？')) {
      await deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
      <div
        className="bg-white w-full md:w-[520px] md:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold">{isEdit ? '编辑任务' : '新建任务'}</h2>
          <div className="flex items-center space-x-2">
            {isEdit && (
              <button onClick={handleDelete} className="p-2 text-red-500 hover:text-red-600">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary-dark"
            >
              保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="任务标题"
            className="w-full text-lg font-medium placeholder-gray-300 border-none focus:ring-0 p-0"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="添加描述..."
            rows={3}
            className="w-full text-sm placeholder-gray-300 border-none focus:ring-0 p-0 resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">截止时间</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">提醒时间</label>
              <input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">重复</label>
            <select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
              className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {repeatOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {repeatType !== 'none' && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">每</span>
                  <input
                    type="number"
                    min={1}
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-sm border border-[var(--color-border)] rounded px-2 py-1"
                  />
                  <span className="text-sm text-gray-600">
                    {repeatType === 'daily' && '天'}
                    {repeatType === 'weekly' && '周'}
                    {repeatType === 'monthly' && '月'}
                    {repeatType === 'yearly' && '年'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">结束：</span>
                  <select
                    value={repeatEndType}
                    onChange={(e) => setRepeatEndType(e.target.value as typeof repeatEndType)}
                    className="text-sm border border-[var(--color-border)] rounded px-2 py-1"
                  >
                    <option value="never">永不</option>
                    <option value="onDate">到期日</option>
                    <option value="afterCount">次数</option>
                  </select>
                  {repeatEndType === 'onDate' && (
                    <input
                      type="date"
                      value={repeatEndDate}
                      onChange={(e) => setRepeatEndDate(e.target.value)}
                      className="text-sm border border-[var(--color-border)] rounded px-2 py-1"
                    />
                  )}
                  {repeatEndType === 'afterCount' && (
                    <input
                      type="number"
                      min={1}
                      value={repeatCount}
                      onChange={(e) => setRepeatCount(Math.max(1, Number(e.target.value)))}
                      className="w-16 text-sm border border-[var(--color-border)] rounded px-2 py-1"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">优先级</label>
            <div className="flex space-x-2">
              {[
                { value: 0 as Priority, label: '无', color: 'bg-gray-200' },
                { value: 1 as Priority, label: '低', color: 'bg-blue-400' },
                { value: 2 as Priority, label: '中', color: 'bg-yellow-400' },
                { value: 3 as Priority, label: '高', color: 'bg-red-500' },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                    priority === p.value
                      ? 'border-primary bg-blue-50 text-primary'
                      : 'border-[var(--color-border)] text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${p.color} mr-1`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">重要</span>
              <input
                type="checkbox"
                checked={importance}
                onChange={(e) => setImportance(e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">紧急</span>
              <input
                type="checkbox"
                checked={urgency}
                onChange={(e) => setUrgency(e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
            </label>
          </div>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm">置顶</span>
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-5 h-5 text-primary rounded focus:ring-primary"
            />
          </label>

          <div>
            <label className="block text-xs text-gray-500 mb-1">清单</label>
            <select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">标签</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="输入标签后回车"
                className="flex-1 text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleAddTag}
                className="p-2 text-primary bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-xs px-2 py-1 bg-blue-50 text-primary rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-primary/70 hover:text-primary"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
