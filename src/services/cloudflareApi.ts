import { PersonNode } from '../types';
import { SheetRow } from './googleSheets';

export const CLOUDFLARE_API_URL = import.meta.env.VITE_CLOUDFLARE_API_URL || 'https://giapha-api.mrdong-sothuchi.workers.dev';

export interface CloudflareMemberRow {
  id: string;
  parentId: string | null;
  name: string;
  gender: string;
  birth: string | null;
  death: string | null;
  isDead: number;
  bio: string | null;
  title: string | null;
  branch: string | null;
}

export async function fetchRawCloudflareRows(): Promise<SheetRow[]> {
  if (!CLOUDFLARE_API_URL) return [];
  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/api/members`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return [];
    return json.data.map((r: CloudflareMemberRow) => ({
      id: r.id,
      parentId: r.parentId || '',
      name: r.name || '',
      gender: r.gender || 'Nam',
      birth: r.birth || '',
      death: r.death || '',
      isDead: r.isDead === 1 ? 'TRUE' : '',
      bio: r.bio || '',
      title: r.title || '',
      branch: r.branch || '',
    }));
  } catch (e) {
    console.warn('Error fetching raw Cloudflare rows:', e);
    return [];
  }
}

export async function fetchFamilyTreeFromCloudflare(): Promise<PersonNode | null> {
  if (!CLOUDFLARE_API_URL) return null;

  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/api/members`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return null;

    const rows: CloudflareMemberRow[] = json.data;
    const nodeMap: Record<string, PersonNode> = {};
    const normIdMap: Record<string, PersonNode> = {};
    const normKey = (s: string) => String(s || '').trim().toLowerCase();

    rows.forEach((row) => {
      if (!row.id) return;
      const isDead = row.isDead === 1;
      let gender: 'male' | 'female' | 'unknown' = 'unknown';
      const genderStr = (row.gender || '').toLowerCase().trim();
      if (genderStr === 'nam' || genderStr === 'male' || genderStr === 'm') gender = 'male';
      else if (genderStr === 'nữ' || genderStr === 'nu' || genderStr === 'female' || genderStr === 'f') gender = 'female';

      const node: PersonNode = {
        name: row.name || 'Chưa rõ tên',
        gender: gender,
        birth: row.birth || undefined,
        death: row.death || undefined,
        deceased: isDead,
        bio: row.bio || undefined,
        title: row.title || undefined,
        branch: row.branch || undefined,
        children: [],
      };

      nodeMap[row.id] = node;
      normIdMap[normKey(row.id)] = node;
    });

    let rootNode: PersonNode | null = null;
    const orphanedNodes: PersonNode[] = [];

    for (const row of rows) {
      if (!row.id) continue;
      const currentId = row.id;
      const rawParentId = row.parentId;
      const currentNode = nodeMap[currentId];
      const parentNode = rawParentId ? (nodeMap[rawParentId] || normIdMap[normKey(rawParentId)]) : null;

      if (parentNode) {
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(currentNode);
      } else {
        if (!rootNode) {
          rootNode = currentNode;
        } else if (currentNode !== rootNode) {
          orphanedNodes.push(currentNode);
        }
      }
    }

    if (rootNode && orphanedNodes.length > 0) {
      if (!rootNode.children) rootNode.children = [];
      orphanedNodes.forEach(orphan => {
        if (!rootNode!.children!.includes(orphan)) {
          rootNode!.children!.push(orphan);
        }
      });
    }

    return rootNode;
  } catch (err) {
    console.warn("Cloudflare API unavailable, fallback to standard source:", err);
    return null;
  }
}

export async function addMemberToCloudflare(row: SheetRow): Promise<{ success: boolean; message: string }> {
  if (!CLOUDFLARE_API_URL) return { success: false, message: 'Chưa cấu hình VITE_CLOUDFLARE_API_URL' };
  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi kết nối Cloudflare' };
  }
}

export async function updateMemberInCloudflare(row: SheetRow): Promise<{ success: boolean; message: string }> {
  if (!CLOUDFLARE_API_URL) return { success: false, message: 'Chưa cấu hình VITE_CLOUDFLARE_API_URL' };
  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/api/members/${encodeURIComponent(row.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi kết nối Cloudflare' };
  }
}

export async function deleteMemberFromCloudflare(id: string): Promise<{ success: boolean; message: string }> {
  if (!CLOUDFLARE_API_URL) return { success: false, message: 'Chưa cấu hình VITE_CLOUDFLARE_API_URL' };
  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/api/members/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi kết nối Cloudflare' };
  }
}

export async function registerPushToCloudflare(subscription: PushSubscription): Promise<boolean> {
  if (!CLOUDFLARE_API_URL) return false;
  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}
