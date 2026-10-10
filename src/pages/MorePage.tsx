import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Bell,
  Cloud,
  Download,
  Grid2X2,
  ListTodo,
  Upload,
  X,
} from 'lucide-react';
import { db } from '../db/database';
import { useTaskStore } from '../store/useTaskStore';
import { requestNotificationPermission } from '../lib/notify';
import { getToken } from '../lib/sync';

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MorePage() {
  const {
    addList,
    updateList,
    deleteList,
    exportData,
    importData,
    syncEnabled,
    syncing,
    lastSyncAt,
    syncError,
    configureSync,
    disconnectSync,
    manualSync,
  } = useTaskStore();
  const lists = useLiveQuery(() => db.lists.toArray(), []);
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [tokenInput, setTokenInput] = useState(getToken());
  const [savingSync, setSavingSync] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const json = await exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      await importData(text);
      alert('导入成功');
    } catch (err) {
      alert('导入失败：' + (err as Error).message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddList = async () => {
    const name = newListName.trim();
    if (!name) return;
    await addList(name);
    setNewListName('');
  };

  const handleSaveList = async (id: string) => {
    await updateList(id, editingName);
    setEditingListId(null);
  };

  const handleSaveSync = async () => {
    setSavingSync(true);
    try {
      await configureSync(tokenInput);
    } finally {
      setSavingSync(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="px-4 py-3 md:px-6 md:py-4 bg-[var(--color-bg)]">
        <h1 className="text-xl font-bold text-gray-900">更多</h1>
      </header>

      <div className="flex-1 px-4 pb-24 md:pb-6 md:px-6 overflow-y-auto space-y-4">
        <section className="bg-white rounded-2xl border border-[var(--color-border)] p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <Cloud className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">云端同步（多设备共享）</span>
          </div>

          {syncEnabled ? (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">
                {syncing ? (
                  <span>同步中…</span>
                ) : lastSyncAt ? (
                  <span>已同步 {formatTime(lastSyncAt)}</span>
                ) : (
                  <span>已连接</span>
                )}
                {syncError && <span className="text-red-500 ml-2">{syncError}</span>}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => void manualSync()}
                  className="px-3 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark"
                >
                  立即同步
                </button>
                <button
                  onClick={disconnectSync}
                  className="px-3 py-2 text-sm text-gray-600 border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
                >
                  断开连接
                </button>
              </div>
              <p className="text-xs text-gray-400">
                数据已存到 GitHub 仓库（data 分支 tasks.json），每 5 秒自动拉取更新。
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                输入一个仅限本仓库读写权限的 GitHub 令牌，即可在电脑/手机间实时共享待办数据。
              </p>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="粘贴 GitHub 令牌（ghp_ 或 github_pat_ 开头）"
                className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={() => void handleSaveSync()}
                disabled={savingSync}
                className="w-full px-3 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {savingSync ? '连接中…' : '保存并同步'}
              </button>
              {syncError && <p className="text-xs text-red-500">{syncError}</p>}
              <p className="text-xs text-gray-400">
                令牌仅保存在本浏览器本地，不上传除 GitHub 之外的任何地方。
              </p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <button
            onClick={() => requestNotificationPermission()}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">开启浏览器通知</span>
            </div>
            <span className="text-xs text-gray-400">点击授权</span>
          </button>
        </section>

        <section className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <a
            href="#/quadrant"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <Grid2X2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">四象限视图</span>
            </div>
            <span className="text-xs text-gray-400">查看</span>
          </a>
        </section>

        <section className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
          <div className="flex items-center space-x-3 mb-3">
            <ListTodo className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">清单管理</span>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="新建清单"
              className="flex-1 text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
            />
            <button
              onClick={handleAddList}
              className="px-3 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark"
            >
              添加
            </button>
          </div>

          <div className="space-y-1">
            {(lists ?? []).map((list) => (
              <div
                key={list.id}
                className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded-lg"
              >
                {editingListId === list.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 text-sm border border-[var(--color-border)] rounded px-2 py-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveList(list.id);
                        if (e.key === 'Escape') setEditingListId(null);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveList(list.id)}
                      className="text-xs text-primary"
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm">{list.name}</span>
                    {list.id !== 'inbox' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingListId(list.id);
                            setEditingName(list.name);
                          }}
                          className="text-xs text-gray-400 hover:text-primary"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => deleteList(list.id)}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 border-b border-[var(--color-border)]"
          >
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">导出数据</span>
            </div>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <Upload className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">导入数据</span>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
        </section>

        <p className="text-xs text-gray-400 text-center px-4">
          数据同时保存在浏览器本地（IndexedDB）与云端（GitHub）。云端同步开启时，多设备实时共享；关闭后仅本地保存。
        </p>
      </div>
    </div>
  );
}
