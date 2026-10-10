import type { List, RepeatRule, Task } from '../types';

const OWNER = 'cxyo';
const REPO = 'daibanshixiang';
const BRANCH = 'data';
const PATH = 'tasks.json';
const TOKEN_KEY = 'gh_sync_token';

export interface SyncSnapshot {
  version: number;
  updatedAt: string;
  tasks: Task[];
  lists: List[];
  repeatRules: RepeatRule[];
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setToken(token: string): void {
  if (token && token.trim()) {
    localStorage.setItem(TOKEN_KEY, token.trim());
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function hasToken(): boolean {
  return getToken().length > 0;
}

// 远端最新文件的 sha，用于乐观并发控制
let remoteSha: string | null = null;

function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function decodeBase64(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  };
}

/** 拉取云端快照；返回 { snapshot, sha, changed }，404 时 snapshot 为 null */
export async function fetchSnapshot(): Promise<{
  snapshot: SyncSnapshot | null;
  sha: string | null;
  changed: boolean;
}> {
  const token = getToken();
  if (!token) throw new Error('未配置 GitHub Token');

  const oldSha = remoteSha;

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`,
    { headers: headers(token) },
  );

  if (res.status === 404) {
    remoteSha = null;
    return { snapshot: null, sha: null, changed: true };
  }
  if (res.status === 401) {
    throw new Error('GitHub Token 无效或无权限（请检查令牌是否正确、是否仅限本仓库读写）');
  }
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'GitHub API 请求被拒绝（速率限制或权限不足）');
  }
  if (!res.ok) {
    throw new Error(`读取云端失败：${res.status}`);
  }

  const json = await res.json();
  remoteSha = json.sha as string;
  const changed = oldSha === null || oldSha !== (json.sha as string);
  const content = decodeBase64(json.content as string);
  const snapshot = JSON.parse(content) as SyncSnapshot;
  return { snapshot, sha: json.sha as string, changed };
}

/** 保存快照到云端；遇到 409 并发冲突时自动重拉后再保存一次 */
export async function saveSnapshot(snapshot: SyncSnapshot): Promise<void> {
  const token = getToken();
  if (!token) return;

  const content = encodeBase64(JSON.stringify(snapshot, null, 2));

  const doPut = async (sha: string | null) => {
    const body: Record<string, unknown> = {
      message: `sync: ${snapshot.updatedAt}`,
      content,
      branch: BRANCH,
    };
    if (sha) body.sha = sha;

    return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`, {
      method: 'PUT',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  let res = await doPut(remoteSha);

  // 并发写入冲突：拉取最新 sha 后重试一次
  if (res.status === 409) {
    await fetchSnapshot();
    res = await doPut(remoteSha);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `保存云端失败：${res.status}`);
  }

  const json = await res.json();
  remoteSha = json.content.sha as string;
}

/** 首次创建 data 分支与初始文件（仅在仓库中不存在 tasks.json 时由初始化脚本使用） */
export async function ensureRemoteSnapshot(snapshot: SyncSnapshot): Promise<void> {
  const token = getToken();
  if (!token) return;
  const content = encodeBase64(JSON.stringify(snapshot, null, 2));
  const body = {
    message: 'init sync file',
    content,
    branch: BRANCH,
  };
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.message || `初始化云端失败：${res.status}`);
  }
  const json = await res.json();
  remoteSha = json.content.sha as string;
}

export function getRemoteSha(): string | null {
  return remoteSha;
}

export function isRemoteChanged(sha: string | null): boolean {
  return sha !== remoteSha;
}
