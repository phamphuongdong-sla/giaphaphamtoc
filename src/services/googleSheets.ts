import Papa from 'papaparse';
import { PersonNode } from '../types';

export const SHEET_ID = import.meta.env.VITE_SHEET_ID || '1Bh79JvnQs1wZ-b-XxipaQE9ooqEWBm2-SDr6tqh_kgY';
export const APPS_SCRIPT_ID = import.meta.env.VITE_APPS_SCRIPT_ID || 'AKfycbzNHsow9vCjaYlBGbcZgDOtmK77Ha8qNqXifhpuSjRrahiiLuPwud5_roKKqNf7G4k';
export const APPS_SCRIPT_URL = `https://script.google.com/macros/s/${APPS_SCRIPT_ID}/exec`;

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Data`;

export interface SheetRow {
  id: string;
  parentId: string;
  name: string;
  gender: string;
  birth: string;
  death: string;
  isDead: string;
  bio: string;
  title: string;
  branch?: string;
}

const getRowVal = (r: any, keys: string[]): string => {
  if (!r) return '';
  for (const k of keys) {
    if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') {
      return String(r[k]).trim();
    }
  }
  return '';
};

export async function fetchRawSheetRows(): Promise<SheetRow[]> {
  try {
    const urlWithCacheBust = `${CSV_URL}&_t=${Date.now()}`;
    const response = await fetch(urlWithCacheBust);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<any>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          const rows = (results.data || []).map((r: any) => ({
            id: getRowVal(r, ['id', 'ID', 'Id', 'Mã ID', 'Ma ID']),
            parentId: getRowVal(r, ['parentId', 'ParentId', 'parent_id', 'Bố/Mẹ', 'Bo/Me', 'Parent']),
            name: getRowVal(r, ['name', 'Name', 'Họ và tên', 'Ho va ten', 'Họ tên', 'Ho ten']),
            gender: getRowVal(r, ['gender', 'Gender', 'Giới tính', 'Gioi tinh']),
            birth: getRowVal(r, ['birth', 'Birth', 'Ngày sinh', 'Ngay sinh', 'Năm sinh', 'Nam sinh']),
            death: getRowVal(r, ['death', 'Death', 'Ngày mất', 'Ngay mat', 'Năm mất', 'Nam mat']),
            isDead: getRowVal(r, ['isDead', 'IsDead', 'is_dead', 'Đã mất', 'Da mat']),
            bio: getRowVal(r, ['bio', 'Bio', 'Tiểu sử', 'Tieu su', 'Ghi chú', 'Ghi chu']),
            title: getRowVal(r, ['title', 'Title', 'Vai vế', 'Vai ve', 'Danh xưng', 'Danh xung', 'Chức danh', 'Thế hệ', 'The he']),
            branch: getRowVal(r, ['branch', 'Branch', 'Chi', 'Nhánh', 'Chi nhánh', 'Chi nhanh']),
          }));
          resolve(rows.filter(r => r.id !== ''));
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (err) {
    console.error("Error fetching raw sheet rows:", err);
    return [];
  }
}

export async function fetchFamilyTreeFromSheet(): Promise<PersonNode | null> {
  try {
    const rows = await fetchRawSheetRows();
    if (!rows || rows.length === 0) {
      return null;
    }

    // Build a map of id -> PersonNode (both exact and normalized)
    const nodeMap: Record<string, PersonNode> = {};
    const normIdMap: Record<string, PersonNode> = {};
    const normKey = (s: string) => String(s || '').trim().toLowerCase();
    
    rows.forEach((row) => {
      if (!row.id) return;
      
      const isDead = row.isDead && row.isDead.trim() !== '' ? true : false;
      let gender: 'male' | 'female' | 'unknown' = 'unknown';
      const genderStr = row.gender?.toLowerCase()?.trim() || '';
      if (genderStr === 'nam' || genderStr === 'male' || genderStr === 'm' || genderStr === 'trai' || genderStr.startsWith('nam')) gender = 'male';
      else if (genderStr === 'nữ' || genderStr === 'nu' || genderStr === 'female' || genderStr === 'f' || genderStr === 'gái' || genderStr.startsWith('nữ') || genderStr.startsWith('nu')) gender = 'female';
      
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
    
    // Second pass: attach children to parents
    for (const row of rows) {
      if (!row.id) continue;
      const currentId = row.id;
      const rawParentId = row.parentId;
      const currentNode = nodeMap[currentId];
      
      const parentNode = rawParentId ? (nodeMap[rawParentId] || normIdMap[normKey(rawParentId)]) : null;
      
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(currentNode);
      } else {
        if (!rootNode) {
          rootNode = currentNode;
        } else if (currentNode !== rootNode) {
          orphanedNodes.push(currentNode);
        }
      }
    }
    
    // If there are orphaned nodes (e.g. parent ID mismatch in sheet), attach them to rootNode so no later generation is lost
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
    console.error("Error fetching or parsing Google Sheets data:", err);
    return null;
  }
}

/**
 * Call Google Apps Script Web App to Add Member
 */
export async function addMemberToSheet(row: SheetRow): Promise<{ success: boolean; message: string }> {
  return sendAppsScriptRequest({
    action: 'create',
    data: row
  });
}

/**
 * Call Google Apps Script Web App to Update Member
 */
export async function updateMemberInSheet(row: SheetRow): Promise<{ success: boolean; message: string }> {
  return sendAppsScriptRequest({
    action: 'update',
    data: row
  });
}

/**
 * Call Google Apps Script Web App to Delete Member
 */
export async function deleteMemberFromSheet(id: string): Promise<{ success: boolean; message: string }> {
  return sendAppsScriptRequest({
    action: 'delete',
    id: id
  });
}

/**
 * Call Google Apps Script Web App to Send Password Reset Code to Email
 */
export async function sendResetCodeToEmail(email: string): Promise<{ success: boolean; message: string; code?: string }> {
  return sendAppsScriptRequest({
    action: 'send_reset_code',
    email: email
  });
}

async function sendAppsScriptRequest(payload: any): Promise<any> {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const text = await response.text();
    try {
      const json = JSON.parse(text);
      if (json.error || json.success === false) {
        return { success: false, message: json.message || json.error || 'Có lỗi xảy ra' };
      }
      return { success: true, message: json.message || 'Thao tác thành công!' };
    } catch {
      // If response is not JSON (e.g. redirected or text response)
      return { success: true, message: 'Đã gửi yêu cầu tới Google Sheets thành công!' };
    }
  } catch (err: any) {
    console.error("Apps Script Request Error:", err);
    return {
      success: false,
      message: err?.message || 'Không thể kết nối đến Google Apps Script. Vui lòng kiểm tra quyền Web App.'
    };
  }
}

