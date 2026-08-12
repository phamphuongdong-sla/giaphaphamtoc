import { PersonNode, MemberEntry } from '@/types';
import {
  parseBirthText,
  parseDeathText,
  formatBirthDisplay,
  formatDeathDisplay,
  lunarToSolar,
  solarToLunar
} from './dateUtils';

// ===== EXPORT CÁC HÀM CẦN THIẾT =====

const SPOUSE_PREFIX_PATTERN = /^(Vợ|Chồng|Rể|Con rể|Chàng rể|Dâu|Con dâu|Nàng dâu|Chính thất|Kế thất|Thứ thất|Bà cả|Bà hai|Bà ba|Bà tư|Bà năm|Bà)(:|\s)/i;
const CLEAN_SPOUSE_PATTERN = /^(Vợ|Chồng|Rể|Con rể|Chàng rể|Dâu|Con dâu|Nàng dâu|Chính thất|Kế thất|Thứ thất|Bà cả|Bà hai|Bà ba|Bà tư|Bà năm|Bà)(:|\s)\s*/i;

export const isSpouse = (name: string): boolean => {
  if (!name) return false;
  return SPOUSE_PREFIX_PATTERN.test(name.trim());
};

export const normalizeGender = (g?: string | null): 'male' | 'female' | 'unknown' => {
  if (!g) return 'unknown';
  const str = g.toString().toLowerCase().trim();
  if (str === 'male' || str === 'nam' || str === 'm' || str === 'trai' || str.startsWith('nam')) return 'male';
  if (str === 'female' || str === 'nữ' || str === 'nu' || str === 'f' || str === 'gái' || str.startsWith('nữ') || str.startsWith('nu')) return 'female';
  return 'unknown';
};

export const checkIsSpouseNode = (data: PersonNode | string): boolean => {
  if (!data) return false;
  if (typeof data === 'object') {
    if (data.isSpouse) return true;
    if (isSpouse(data.name || '')) return true;
    if (data.title && isSpouse(data.title)) return true;
    if (data.role && isSpouse(data.role)) return true;
    return false;
  }
  return isSpouse(data);
};

export const cleanName = (name: string): string => {
  if (!name) return '';
  return name.replace(CLEAN_SPOUSE_PATTERN, '').trim();
};

export const getNameRole = (name: string): string => {
  if (!name) return '';
  const match = name.trim().match(SPOUSE_PREFIX_PATTERN);
  return match ? match[1].trim() : '';
};

const normalizeText = (text: string): string => {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

export const formatBranchName = (branchStr: string): string => {
  if (!branchStr) return 'Gốc Gia Tộc';
  const clean = branchStr.trim();
  const upper = clean.toUpperCase();
  if (upper.includes('BÀ CẢ') || upper.includes('BÙI THỊ VÍCH')) return 'Chi Bà Cả';
  if (upper.includes('BÀ HAI') || upper.includes('NGUYỄN THỊ YẾN')) return 'Chi Bà Hai';
  if (upper.includes('BÀ BA') || upper.includes('NGUYỄN THỊ HOA')) return 'Chi Bà Ba';
  return clean;
};

export const getBranchLabel = (node: PersonNode, pathNodes: PersonNode[] = []): string => {
  if (node.branchRoot && node.branchRoot.trim()) return formatBranchName(node.branchRoot);
  if (node.branchLine && node.branchLine.trim()) return formatBranchName(node.branchLine);
  if (node.branch && node.branch.trim()) return formatBranchName(node.branch);

  // Tìm từ trên xuống dưới (Root -> các thế hệ sau)
  for (let i = 0; i < pathNodes.length; i++) {
    const ancestor = pathNodes[i];
    if (ancestor.branchRoot && ancestor.branchRoot.trim()) return formatBranchName(ancestor.branchRoot);
    if (ancestor.branchLine && ancestor.branchLine.trim()) return formatBranchName(ancestor.branchLine);
    if (ancestor.branch && ancestor.branch.trim()) return formatBranchName(ancestor.branch);

    // Chỉ gán Chi dựa theo tên đối với 3 bà đầu tiên (tầng 1 ngay dưới Thủy tổ Ông Hương Chử)
    if (i === 1) {
      const nameUpper = (ancestor.name || '').toUpperCase();
      if (nameUpper.includes('BÀ CẢ') || nameUpper.includes('BÙI THỊ VÍCH')) return 'Chi Bà Cả';
      if (nameUpper.includes('BÀ HAI') || nameUpper.includes('NGUYỄN THỊ YẾN')) return 'Chi Bà Hai';
      if (nameUpper.includes('BÀ BA') || nameUpper.includes('NGUYỄN THỊ HOA')) return 'Chi Bà Ba';
    }
  }

  return 'Gốc Gia Tộc';
};

export const normalizeGenealogy = (node: PersonNode, inheritedBranch: string = ''): PersonNode => {
  let ownBranch = node.branch || '';
  const upperName = (node.name || '').toUpperCase();
  
  // Chỉ suy ra ownBranch từ tên khi KHÔNG có inheritedBranch (tức ở tầng 1 ngay dưới Thủy tổ)
  if (!inheritedBranch && !ownBranch) {
    if (upperName.includes('BÀ CẢ') || upperName.includes('BÙI THỊ VÍCH')) ownBranch = 'Chi Bà Cả';
    else if (upperName.includes('BÀ HAI') || upperName.includes('NGUYỄN THỊ YẾN')) ownBranch = 'Chi Bà Hai';
    else if (upperName.includes('BÀ BA') || upperName.includes('NGUYỄN THỊ HOA')) ownBranch = 'Chi Bà Ba';
  }

  const branchLine = ownBranch ? formatBranchName(ownBranch) : (inheritedBranch ? formatBranchName(inheritedBranch) : '');
  const birthResult = parseBirthText(node.birth || '');
  const deathResult = parseDeathText(node.death || '');

  let finalGender = normalizeGender(node.gender);

  if (finalGender === 'unknown') {
    const rawName = (node.name || '').trim();
    const rawRole = (node.title || node.role || '').trim();
    if (/^(Chồng|Rể|Con rể)(:|\s)/i.test(rawName) || /^(Chồng|Rể|Con rể)/i.test(rawRole)) {
      finalGender = 'male';
    } else if (/^(Vợ|Bà cả|Bà hai|Bà ba|Bà|Dâu|Con dâu)(:|\s)/i.test(rawName) || /\bTHỊ\b/i.test(rawName) || /^(Vợ|Dâu|Con dâu)/i.test(rawRole)) {
      finalGender = 'female';
    }
  }

  const isSpouseNode = node.isSpouse ?? checkIsSpouseNode(node);

  const normalized: PersonNode = {
    ...node,
    branchLine,
    branchRoot: ownBranch ? formatBranchName(ownBranch) : '',
    gender: finalGender,
    role: node.title || '',
    isSpouse: isSpouseNode,
    birthSolar: birthResult.solar,
    birthNote: birthResult.note,
    deathSolar: deathResult.solar,
    deathNote: deathResult.note,
  };
  if (node.children) {
    normalized.children = node.children.map(child => normalizeGenealogy(child, branchLine));
  }
  return normalized;
};

export const getSpouseLineageLabel = (pathNodes: PersonNode[] = []): string => {
  if (!pathNodes || pathNodes.length < 3) return '';
  const spouseLabels: string[] = [];
  for (let i = 2; i < pathNodes.length; i++) {
    const ancestor = pathNodes[i];
    if (checkIsSpouseNode(ancestor)) {
      const clean = cleanName(ancestor.name);
      const role = getNameRole(ancestor.name);
      if (clean && (/bà cả|bà hai|bà ba/i.test(ancestor.name) || /bà cả|bà hai|bà ba/i.test(role))) {
        const label = `Chi bà ${clean}`;
        if (!spouseLabels.includes(label)) {
          spouseLabels.push(label);
        }
      }
    }
  }
  return spouseLabels.join(' › ');
};

export const getFullBranchLabel = (node: PersonNode, pathNodes: PersonNode[] = []): string => {
  const mainBranch = getBranchLabel(node, pathNodes);
  const subBranch = getSpouseLineageLabel(pathNodes);
  if (subBranch && mainBranch !== 'Gốc Gia Tộc') {
    return `${mainBranch} › ${subBranch}`;
  }
  return mainBranch;
};

export const buildMemberEntries = (treeData: PersonNode): MemberEntry[] => {
  const entries: MemberEntry[] = [];
  const walk = (node: PersonNode, parent: PersonNode | null, gen: number, _branch: string, path: PersonNode[]) => {
    const currentPath = [...path, node];
    const nodeIsSpouse = checkIsSpouseNode(node);
    const currentGen = parent === null ? 1 : (nodeIsSpouse ? gen : gen + 1);
    const currentBranch = getFullBranchLabel(node, currentPath);
    const displayName = cleanName(node.name);
    const role = getNameRole(node.name) || node.role || '';
    const fullName = `${displayName}${role ? ` (${role})` : ''}`;
    const pathNames = currentPath.map(n => cleanName(n.name));
    const searchText = normalizeText([
      node.name, displayName, node.title, node.role, node.branch, node.bio,
      formatBirthDisplay(node), formatDeathDisplay(node), currentBranch,
      ...pathNames, fullName
    ].filter(Boolean).join(' '));
    entries.push({
      id: pathNames.join(' > '),
      data: node,
      parentNode: parent,
      gen: currentGen,
      branchName: currentBranch,
      pathNodes: currentPath,
      pathNames,
      fullName,
      searchText
    });
    if (node.children) {
      node.children.forEach(child => walk(child, node, currentGen, currentBranch, currentPath));
    }
  };
  walk(treeData, null, 1, '', []);
  return entries;
};

export const getBirthdayEvents = (treeData: PersonNode): { fullName: string; day: number; month: number; person: MemberEntry }[] => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const events: { fullName: string; day: number; month: number; person: MemberEntry }[] = [];
  const walk = (node: PersonNode, parent: PersonNode | null, gen: number, _branch: string, path: PersonNode[]) => {
    const currentPath = [...path, node];
    const nodeIsSpouse = checkIsSpouseNode(node);
    const currentGen = parent === null ? 1 : (nodeIsSpouse ? gen : gen + 1);
    const currentBranch = getFullBranchLabel(node, currentPath);
    const pathNames = currentPath.map(n => cleanName(n.name));
    const role = getNameRole(node.name) || node.role || '';
    const displayName = cleanName(node.name);
    const fullName = `${displayName}${role ? ` (${role})` : ''}`;

    const memberEntry: MemberEntry = {
      id: pathNames.join(' > '),
      data: node,
      parentNode: parent,
      gen: currentGen,
      branchName: currentBranch,
      pathNodes: currentPath,
      pathNames,
      fullName,
      searchText: ''
    };

    if (!node.deceased && node.birthSolar?.d && node.birthSolar?.m) {
      const { d, m } = node.birthSolar;
      if (m === currentMonth && d >= currentDay) {
        events.push({
          fullName,
          day: d,
          month: m,
          person: memberEntry
        });
      }
    }
    if (node.children) {
      node.children.forEach(child => walk(child, node, currentGen, currentBranch, currentPath));
    }
  };
  walk(treeData, null, 1, '', []);
  return events.sort((a, b) => a.day - b.day);
};

export const getAllLichData = (treeData: PersonNode, year: number): { gio: any[]; sinh: any[] } => {
  const gio: any[] = [];
  const sinh: any[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const midYearLunar = solarToLunar(1, 7, year);

  const walk = (node: PersonNode, parent: PersonNode | null, gen: number, _branch: string, path: PersonNode[]) => {
    const currentPath = [...path, node];
    const nodeIsSpouse = checkIsSpouseNode(node);
    const currentGen = parent === null ? 1 : (nodeIsSpouse ? gen : gen + 1);
    const currentBranch = getFullBranchLabel(node, currentPath);
    const pathNames = currentPath.map(n => cleanName(n.name));
    const role = getNameRole(node.name) || node.role || '';
    const displayName = cleanName(node.name);
    const fullName = `${displayName}${role ? ` (${role})` : ''}`;

    const memberEntry: MemberEntry = {
      id: pathNames.join(' > '),
      data: node,
      parentNode: parent,
      gen: currentGen,
      branchName: currentBranch,
      pathNodes: currentPath,
      pathNames,
      fullName,
      searchText: ''
    };

    // ===== NGÀY GIỖ: tính theo ÂM LỊCH =====
    if (node.deceased && node.deathSolar?.d && node.deathSolar?.m) {
      const lunarDay = node.deathSolar.d;
      const lunarMonth = node.deathSolar.m;

      let solarObj: { d: number; m: number; y: number } | null = null;
      for (const tryLunarYear of [midYearLunar.y - 1, midYearLunar.y, midYearLunar.y + 1]) {
        const candidate = lunarToSolar(lunarDay, lunarMonth, tryLunarYear, false);
        if (candidate && candidate.y === year) {
          solarObj = candidate;
          break;
        }
      }

      if (solarObj) {
        const targetDate = new Date(solarObj.y, solarObj.m - 1, solarObj.d);
        targetDate.setHours(0, 0, 0, 0);
        const days = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        gio.push({
          fullName,
          solarDay: solarObj.d,
          solarMonth: solarObj.m,
          lunarDay,
          lunarMonth,
          days,
          type: 'gio',
          person: memberEntry
        });
      }
    }

    // ===== SINH NHẬT: tính theo DƯƠNG LỊCH =====
    if (!node.deceased && node.birthSolar?.d && node.birthSolar?.m) {
      const { d, m } = node.birthSolar;
      const targetDate = new Date(year, m - 1, d);
      targetDate.setHours(0, 0, 0, 0);
      const days = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      sinh.push({ fullName, solarDay: d, solarMonth: m, days, type: 'sinh', person: memberEntry });
    }

    if (node.children) {
      node.children.forEach(child => walk(child, node, currentGen, currentBranch, currentPath));
    }
  };
  walk(treeData, null, 1, '', []);
  return { gio, sinh };
};

export const buildShareText = (
  data: PersonNode,
  displayName: string,
  gen: number,
  titleLabel: string,
  branchLabel: string,
  relation: string,
  pathNodes: PersonNode[],
  children: PersonNode[]
): string => {
  const lines: string[] = [];
  const sep = '─────────────────────';
  lines.push('📜 GIA PHẢ PHẠM TỘC');
  lines.push(sep);
  lines.push(`👤 ${displayName}`);
  if (titleLabel) lines.push(`   Vai vế: ${titleLabel}`);
  lines.push(`   Đời thứ: ${gen}`);
  lines.push(`   Chi nhánh: ${branchLabel || getFullBranchLabel(data, pathNodes)}`);
  if (relation) lines.push(`   Quan hệ: ${relation}`);
  lines.push('');
  const birth = formatBirthDisplay(data);
  const death = formatDeathDisplay(data);
  if (birth) lines.push(`🌅 Ngày sinh: ${birth}`);
  if (data.deceased) lines.push(`🕯 Ngày mất: ${death || 'Chưa rõ'}`);
  else lines.push(`✅ Trạng thái: Còn sống`);
  const ancestors = pathNodes.filter((_, i) => i < pathNodes.length - 1).map(n => cleanName(n.name));
  if (ancestors.length > 0) {
    lines.push('');
    lines.push(`🌳 Ông bà/Bố mẹ:`);
    lines.push(`   ${ancestors.join(' › ')}`);
  }
  const childNames = children.filter(c => !checkIsSpouseNode(c)).map(c => cleanName(c.name));
  const spouseNames = children.filter(c => checkIsSpouseNode(c)).map(c => cleanName(c.name));
  if (spouseNames.length > 0) lines.push(`\n💑 Vợ/Chồng: ${spouseNames.join(', ')}`);
  if (childNames.length > 0) lines.push(`👶 Con cái: ${childNames.join(', ')}`);
  if (data.bio) { lines.push(''); lines.push(`📝 Ghi chú: ${data.bio}`); }
  lines.push('');
  lines.push(sep);
  lines.push('Gia Phả Phạm Tộc 🏮');
  return lines.join('\n');
};

export const buildVietnameseRelation = (
  data: PersonNode,
  parentNode: PersonNode | null,
  pathNodes: PersonNode[] = []
): string => {
  if (!parentNode) return 'Cụ Thủy tổ phả hệ';

  const isSpouseNode = checkIsSpouseNode(data);
  const roleName = getNameRole(data.name);

  // Hàm tính đời (gen) của một node dựa trên vị trí tuyến phả hệ
  const getNodeGen = (targetNode: PersonNode): number => {
    const idx = pathNodes.findIndex(n => cleanName(n.name) === cleanName(targetNode.name));
    if (idx !== -1) {
      let g = 1;
      for (let i = 1; i <= idx; i++) {
        if (!checkIsSpouseNode(pathNodes[i])) {
          g++;
        }
      }
      return g;
    }
    return 2;
  };

  const getHonorific = (node: PersonNode): { prefix: string; name: string } => {
    const name = cleanName(node.name);
    const isFemale = node.gender === 'female' || checkIsSpouseNode(node) || /\bTHỊ\b/i.test(node.name);
    const gen = getNodeGen(node);

    // Kính xưng theo tập quán Gia phả Việt Nam:
    // Đời 1: Cụ Thủy tổ ông / Cụ Thủy tổ bà
    // Đời 2 & 3 (Tổ tiên cao): Cụ ông / Cụ bà
    // Đời 4+: Ông / Bà (thế hệ trên)
    let prefix = 'ông';
    if (gen === 1) {
      prefix = isFemale ? 'Cụ Thủy tổ bà' : 'Cụ Thủy tổ ông';
    } else if (gen <= 3) {
      prefix = isFemale ? 'cụ bà' : 'cụ ông';
    } else {
      prefix = isFemale ? 'bà' : 'ông';
    }

    return { prefix, name };
  };

  if (isSpouseNode) {
    const parentHon = getHonorific(parentNode);
    let roleTitle = roleName;
    if (!roleTitle) {
      roleTitle = data.gender === 'male' ? 'Chồng (Con rể)' : 'Vợ (Nàng dâu)';
    }
    return `${roleTitle} của ${parentHon.prefix} ${parentHon.name}`;
  }

  // Xác định thứ bậc của con (Trưởng nam / Trưởng nữ / Út nam / Út nữ / Con trai / Con gái)
  const getChildTerm = (node: PersonNode): string => {
    const title = node.title || node.role || '';
    const upperName = (node.name || '').toUpperCase();
    const upperBio = (node.bio || '').toUpperCase();

    if (title.includes('Trưởng họ') || title.includes('Trưởng tộc') || title.includes('Trưởng nam')) {
      return 'Trưởng nam';
    }
    if (title.includes('Trưởng nữ')) {
      return 'Trưởng nữ';
    }

    const isFemale = node.gender === 'female' || /\bTHỊ\b/i.test(upperName);

    if (upperName.includes('(ÚT)') || upperBio.includes('CON ÚT') || upperBio.includes('CON THỨ ÚT')) {
      return isFemale ? 'Út nữ' : 'Út nam';
    }

    return isFemale ? 'Con gái' : 'Con trai';
  };

  const childTerm = getChildTerm(data);

  // Nếu là con cái: tìm xem trong tuyến phả hệ có đủ thông tin Bố & Mẹ không
  const currentIndex = pathNodes.findIndex(n => cleanName(n.name) === cleanName(data.name));
  const ancestorList = currentIndex > 0 ? pathNodes.slice(0, currentIndex) : pathNodes;
  
  if (ancestorList.length >= 2) {
    const lastParent = ancestorList[ancestorList.length - 1];
    const prevParent = ancestorList[ancestorList.length - 2];
    
    if (checkIsSpouseNode(lastParent) || checkIsSpouseNode(prevParent)) {
      const father = checkIsSpouseNode(lastParent) ? prevParent : lastParent;
      const mother = checkIsSpouseNode(lastParent) ? lastParent : prevParent;
      
      const fatherHon = getHonorific(father);
      const motherHon = getHonorific(mother);
      const motherRole = getNameRole(mother.name);
      const roleStr = motherRole ? ` (${motherRole})` : '';

      return `${childTerm} của ${fatherHon.prefix} ${fatherHon.name} & ${motherHon.prefix} ${motherHon.name}${roleStr}`;
    }
  }

  const parentHon = getHonorific(parentNode);
  return `${childTerm} của ${parentHon.prefix} ${parentHon.name}`;
};