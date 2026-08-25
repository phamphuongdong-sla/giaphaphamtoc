import { useState, useEffect, useMemo } from 'react';
import { SheetRow, fetchRawSheetRows, addMemberToSheet, updateMemberInSheet, deleteMemberFromSheet } from '@/services/googleSheets';
import { 
  fetchRawCloudflareRows, 
  addMemberToCloudflare, 
  updateMemberInCloudflare, 
  deleteMemberFromCloudflare, 
  fetchAuditLogs,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  CLOUDFLARE_API_URL,
  AuthUser,
  UserRow,
  AuditLogRow
} from '@/services/cloudflareApi';
import { Icon } from '@/components/ui/Icon';
import { solarToLunar, getCanChiYear } from '@/utils/dateUtils';
import { formatBranchName } from '@/utils/genealogyUtils';

const formatSolarDateInput = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
};

interface ManageViewProps {
  authUser?: AuthUser | null;
  onRefreshData?: () => Promise<void>;
  onLogout?: () => void;
}

export const ManageView = ({ authUser, onRefreshData, onLogout }: ManageViewProps) => {
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'nam' | 'nu'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'alive' | 'dead'>('all');
  const [genFilter, setGenFilter] = useState<string>('all');

  // Sub-tabs: 'members' | 'logs' | 'users'
  const [activeTab, setActiveTab] = useState<'members' | 'logs' | 'users'>('members');

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [logSearch, setLogSearch] = useState<string>('');
  const [logActionFilter, setLogActionFilter] = useState<string>('all');

  // Users & RBAC state
  const [usersList, setUsersList] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<Partial<UserRow> & { password?: string } | null>(null);
  const [userSaving, setUserSaving] = useState<boolean>(false);
  const [userFormError, setUserFormError] = useState<string>('');

  // Mobile detection & Layout mode (cards vs table)
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [layoutMode, setLayoutMode] = useState<'cards' | 'table'>(() => (typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table'));

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modal states
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false); // false = Add, true = Edit
  const [currentMember, setCurrentMember] = useState<SheetRow>({
    id: '',
    parentId: '',
    name: '',
    gender: 'Nam',
    birth: '',
    death: '',
    isDead: '',
    bio: '',
    title: '',
    branch: '',
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [memberToDelete, setMemberToDelete] = useState<SheetRow | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Export / Backup modal state
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Solar to Lunar Converter helper state inside form
  const [_solarDateInput, setSolarDateInput] = useState<string>('');
  const [solarBirthInput, setSolarBirthInput] = useState<string>('');

  const loadSheetRows = async () => {
    setLoading(true);
    try {
      let data = await fetchRawCloudflareRows();
      if (!data || data.length === 0) {
        data = await fetchRawSheetRows();
      }
      setRows(data);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const logs = await fetchAuditLogs(300);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await fetchUsers();
      setUsersList(users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadSheetRows();
  }, []);

  // Map ID -> Member object for fast lookup
  const memberMap = useMemo(() => {
    const map: Record<string, SheetRow> = {};
    rows.forEach(r => {
      map[r.id] = r;
    });
    return map;
  }, [rows]);

  // Compute effective branch (Chi nhánh) for each member by walking up ancestors
  const memberBranchMap = useMemo(() => {
    const branchMap: Record<string, string> = {};

    const findBranch = (id: string, visited = new Set<string>()): string => {
      if (!id || visited.has(id)) return 'Gốc Gia Tộc';
      if (branchMap[id]) return branchMap[id];
      visited.add(id);

      const member = memberMap[id];
      if (!member) return 'Gốc Gia Tộc';

      if (member.branch && member.branch.trim()) {
        const formatted = formatBranchName(member.branch);
        branchMap[id] = formatted;
        return formatted;
      }

      const nameUpper = (member.name || '').toUpperCase();
      if (nameUpper.includes('BÀ CẢ') || nameUpper.includes('BÙI THỊ VÍCH')) {
        branchMap[id] = 'Chi Bà Cả';
        return 'Chi Bà Cả';
      }
      if (nameUpper.includes('BÀ HAI') || nameUpper.includes('NGUYỄN THỊ YẾN')) {
        branchMap[id] = 'Chi Bà Hai';
        return 'Chi Bà Hai';
      }
      if (nameUpper.includes('BÀ BA') || nameUpper.includes('NGUYỄN THỊ HOA')) {
        branchMap[id] = 'Chi Bà Ba';
        return 'Chi Bà Ba';
      }

      if (member.parentId && memberMap[member.parentId]) {
        const parentBranch = findBranch(member.parentId, visited);
        branchMap[id] = parentBranch;
        return parentBranch;
      }

      branchMap[id] = 'Gốc Gia Tộc';
      return 'Gốc Gia Tộc';
    };

    rows.forEach(r => findBranch(r.id));
    return branchMap;
  }, [rows, memberMap]);

  // Compute generation (Đời thứ) for each member
  const memberGenMap = useMemo(() => {
    const genMap: Record<string, number> = {};
    const computeGen = (id: string, visited = new Set<string>()): number => {
      if (!id || visited.has(id)) return 1;
      if (genMap[id]) return genMap[id];
      visited.add(id);
      const member = memberMap[id];
      if (!member || !member.parentId || !memberMap[member.parentId]) {
        genMap[id] = 1;
        return 1;
      }
      const parentGen = computeGen(member.parentId, visited);
      // If member is a spouse (starts with Vợ, Chồng, Bà...), keep same generation as spouse
      const isSpouse = /^(Vợ|Chồng|Rể|Dâu|Bà cả|Bà hai|Bà ba|Bà)(:|\s)/i.test(member.name);
      const gen = isSpouse ? parentGen : parentGen + 1;
      genMap[id] = gen;
      return gen;
    };

    rows.forEach(r => computeGen(r.id));
    return genMap;
  }, [rows, memberMap]);

  // List of available generations for filtering
  const availableGens = useMemo(() => {
    const setGens = new Set<number>();
    Object.values(memberGenMap).forEach(g => setGens.add(g));
    return Array.from(setGens).sort((a, b) => a - b);
  }, [memberGenMap]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = rows.length;
    let male = 0;
    let female = 0;
    let dead = 0;
    let alive = 0;

    rows.forEach(r => {
      const g = r.gender?.toLowerCase()?.trim() || '';
      if (g === 'nam' || g === 'male' || g === 'm' || g === 'trai' || g.startsWith('nam')) male++;
      else if (g === 'nữ' || g === 'nu' || g === 'female' || g === 'f' || g === 'gái' || g.startsWith('nữ') || g.startsWith('nu')) female++;

      if (r.isDead && r.isDead.trim() !== '') dead++;
      else alive++;
    });

    return { total, male, female, dead, alive };
  }, [rows]);

  // Sorting mode state ('gen' = Generation default, 'id', 'name', 'sheet')
  const [sortBy, setSortBy] = useState<'gen' | 'id' | 'name' | 'sheet'>('gen');

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      // Search text
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const parentObj = r.parentId ? memberMap[r.parentId] : undefined;
        const parentName = parentObj ? (parentObj.name || '') : '';
        const match =
          (r.id || '').toLowerCase().includes(query) ||
          (r.name || '').toLowerCase().includes(query) ||
          (r.title || '').toLowerCase().includes(query) ||
          (r.branch || '').toLowerCase().includes(query) ||
          (r.parentId || '').toLowerCase().includes(query) ||
          parentName.toLowerCase().includes(query) ||
          (r.bio || '').toLowerCase().includes(query);

        if (!match) return false;
      }

      // Gender filter
      if (genderFilter !== 'all') {
        const g = r.gender?.toLowerCase()?.trim() || '';
        if (genderFilter === 'nam' && !(g === 'nam' || g === 'male' || g === 'm' || g === 'trai' || g.startsWith('nam'))) return false;
        if (genderFilter === 'nu' && !(g === 'nữ' || g === 'nu' || g === 'female' || g === 'f' || g === 'gái' || g.startsWith('nữ') || g.startsWith('nu'))) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const isDead = r.isDead && r.isDead.trim() !== '';
        if (statusFilter === 'alive' && isDead) return false;
        if (statusFilter === 'dead' && !isDead) return false;
      }

      // Generation filter
      if (genFilter !== 'all') {
        const gen = memberGenMap[r.id];
        if (String(gen) !== genFilter) return false;
      }

      return true;
    });
  }, [rows, searchTerm, genderFilter, statusFilter, genFilter, memberMap, memberGenMap]);

  // Sorted rows according to selected sort mode
  const sortedRows = useMemo(() => {
    const list = [...filteredRows];

    if (sortBy === 'gen') {
      list.sort((a, b) => {
        const genA = memberGenMap[a.id] || 1;
        const genB = memberGenMap[b.id] || 1;
        if (genA !== genB) return genA - genB;

        const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });
    } else if (sortBy === 'id') {
      list.sort((a, b) => {
        const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    return list;
  }, [filteredRows, sortBy, memberGenMap]);

  // Generate recommended next ID for new member (numeric for children, 'P' for spouses)
  const generateNextId = (isSpouse: boolean = false): string => {
    if (rows.length === 0) return isSpouse ? 'P1' : '1';

    let maxNum = 0;
    let maxPNum = 0;

    rows.forEach(r => {
      const idStr = r.id.trim();
      if (/^\d+$/.test(idStr)) {
        const num = parseInt(idStr, 10);
        if (num > maxNum) maxNum = num;
      } else if (/^P\d+$/i.test(idStr)) {
        const num = parseInt(idStr.substring(1), 10);
        if (num > maxPNum) maxPNum = num;
      }
    });

    if (isSpouse) {
      return `P${maxPNum + 1}`;
    }
    return `${maxNum + 1}`;
  };

  // Helper to build lineage chain string for preview
  const getLineageChain = (parentId: string): { chain: string; gen: number } => {
    if (!parentId || !memberMap[parentId]) return { chain: 'Cụ Thủy Tổ (Gốc Gia Tộc)', gen: 1 };

    const path: string[] = [];
    let curr: SheetRow | undefined = memberMap[parentId];
    const visited = new Set<string>();

    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      path.unshift(curr.name);
      curr = curr.parentId ? memberMap[curr.parentId] : undefined;
    }

    const parentGen = memberGenMap[parentId] || 1;
    return {
      chain: path.join(' › '),
      gen: parentGen + 1
    };
  };

  // Smart Action: Handle Parent Change with Auto Inheritance (Generation + Branch)
  const handleParentSelectChange = (newParentId: string) => {
    const parent = memberMap[newParentId];

    if (!parent) {
      setCurrentMember(prev => ({
        ...prev,
        parentId: '',
        branch: 'Gốc Gia Tộc',
        title: (!prev.title || /^Đời \d+$/i.test(prev.title.trim()) || prev.title.startsWith('Đời')) ? 'Đời 1' : prev.title
      }));
      return;
    }

    const parentGen = memberGenMap[newParentId] || 1;
    const inheritedBranch = memberBranchMap[newParentId] || parent.branch || 'Gốc Gia Tộc';
    const isSpouseName = /^(Vợ|Chồng|Rể|Dâu|Bà cả|Bà hai|Bà ba|Bà)(:|\s)/i.test(currentMember.name);
    const nextGen = isSpouseName ? parentGen : parentGen + 1;

    setCurrentMember(prev => ({
      ...prev,
      parentId: newParentId,
      branch: inheritedBranch,
      title: (!prev.title || /^Đời \d+$/i.test(prev.title.trim()) || prev.title.startsWith('Đời'))
        ? `Đời ${nextGen}`
        : prev.title
    }));
  };

  // Smart action: Open Add Modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setStatusMessage(null);
    setSolarDateInput('');
    setSolarBirthInput('');
    const defaultParentId = rows.length > 0 ? rows[0].id : '';
    const defaultGen = defaultParentId ? (memberGenMap[defaultParentId] || 1) + 1 : 1;
    const defaultBranch = defaultParentId ? (memberBranchMap[defaultParentId] || 'Gốc Gia Tộc') : 'Gốc Gia Tộc';

    setCurrentMember({
      id: generateNextId(false),
      parentId: defaultParentId,
      name: '',
      gender: 'Nam',
      birth: '',
      death: '',
      isDead: '',
      bio: '',
      title: `Đời ${defaultGen}`,
      branch: defaultBranch,
    });
    setShowEditModal(true);
  };

  // Smart action: Add Child of specific parent
  const handleAddChildOf = (parent: SheetRow) => {
    setIsEditing(false);
    setStatusMessage(null);
    setSolarDateInput('');
    setSolarBirthInput('');
    const parentGen = memberGenMap[parent.id] || 1;
    const inheritedBranch = memberBranchMap[parent.id] || parent.branch || 'Gốc Gia Tộc';

    setCurrentMember({
      id: generateNextId(false),
      parentId: parent.id,
      name: '',
      gender: 'Nam',
      birth: '',
      death: '',
      isDead: '',
      bio: '',
      title: `Đời ${parentGen + 1}`,
      branch: inheritedBranch,
    });
    setShowEditModal(true);
  };

  // Smart action: Add Spouse of specific person
  const handleAddSpouseOf = (person: SheetRow) => {
    setIsEditing(false);
    setStatusMessage(null);
    setSolarDateInput('');
    setSolarBirthInput('');
    const isMale = person.gender?.toLowerCase() === 'nam' || person.gender?.toLowerCase() === 'male' || person.gender?.toLowerCase() === 'm';
    const prefix = isMale ? 'Vợ: ' : 'Chồng: ';
    const spouseGender = isMale ? 'Nữ' : 'Nam';
    const inheritedBranch = memberBranchMap[person.id] || person.branch || 'Gốc Gia Tộc';

    setCurrentMember({
      id: generateNextId(true),
      parentId: person.id,
      name: prefix,
      gender: spouseGender,
      birth: '',
      death: '',
      isDead: '',
      bio: '',
      title: `Vợ/Chồng của ${person.name}`,
      branch: inheritedBranch,
    });
    setShowEditModal(true);
  };

  // Smart action: Duplicate member info for quick sibling creation
  const handleDuplicateMember = (member: SheetRow) => {
    setIsEditing(false);
    setStatusMessage(null);
    setSolarDateInput('');
    setSolarBirthInput('');
    const inheritedBranch = memberBranchMap[member.id] || member.branch || 'Gốc Gia Tộc';

    setCurrentMember({
      id: generateNextId(false),
      parentId: member.parentId,
      name: `${member.name} (Bản sao)`,
      gender: member.gender,
      birth: '',
      death: '',
      isDead: '',
      bio: member.bio,
      title: member.title,
      branch: inheritedBranch,
    });
    setShowEditModal(true);
  };

  const handleOpenEditModal = (member: SheetRow) => {
    setIsEditing(true);
    setStatusMessage(null);
    setSolarDateInput('');
    setSolarBirthInput('');

    // Normalize gender to 'Nam' or 'Nữ'
    const gStr = (member.gender || '').toString().toLowerCase().trim();
    const normalizedGender = (gStr === 'nữ' || gStr === 'nu' || gStr === 'female' || gStr === 'f') ? 'Nữ' : 'Nam';

    // Normalize inherited branch if branch cell is empty
    const inheritedBranch = member.branch && member.branch.trim() !== '' 
      ? member.branch.trim() 
      : (memberBranchMap[member.id] || 'Gốc Gia Tộc');

    // Normalize title / generation
    const gen = memberGenMap[member.id] || 1;
    const rawTitle = (member.title || '').toString().trim();
    const normalizedTitle = rawTitle !== '' ? rawTitle : `Đời ${gen}`;

    // Normalize isDead
    const isDeadStr = (member.isDead || '').toString().trim() !== '' || (member.death || '').toString().trim() !== '' ? 'x' : '';

    setCurrentMember({
      id: (member.id || '').toString().trim(),
      parentId: (member.parentId || '').toString().trim(),
      name: (member.name || '').toString().trim(),
      gender: normalizedGender,
      birth: (member.birth || '').toString().trim(),
      death: (member.death || '').toString().trim(),
      isDead: isDeadStr,
      bio: (member.bio || '').toString().trim(),
      title: normalizedTitle,
      branch: inheritedBranch,
    });
    setShowEditModal(true);
  };

  // Convert solar birth date input to lunar format with Can Chi year and update birth field
  const handleConvertSolarToLunarBirth = () => {
    if (!solarBirthInput.trim()) return;

    const match = solarBirthInput.trim().match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (!match) {
      alert('Vui lòng nhập đủ 8 chữ số ngày tháng năm sinh (VD: 17021982 hoặc 17-02-1982)');
      return;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    const lunar = solarToLunar(day, month, year);
    if (lunar) {
      const canChiYear = getCanChiYear(lunar.y || year);
      const lunarDayStr = String(lunar.d).padStart(2, '0');
      const lunarMonthStr = String(lunar.m).padStart(2, '0');
      const solarStr = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
      const birthStr = `${solarStr} (${lunarDayStr}-${lunarMonthStr} ${canChiYear})`;

      setCurrentMember(prev => ({
        ...prev,
        birth: birthStr
      }));
    } else {
      alert('Không thể chuyển đổi ngày âm lịch. Vui lòng kiểm tra lại ngày nhập.');
    }
  };

  // Auto detect 4-digit year yyyy in death input field and attach/update Can Chi year
  const handleDeathInputChange = (rawValue: string) => {
    let val = rawValue;

    // Case 1: User typed 8 digits directly (e.g. 17021982 or 02082022)
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length === 8 && /^\d{8}$/.test(val.trim())) {
      const d = digitsOnly.substring(0, 2);
      const m = digitsOnly.substring(2, 4);
      const y = digitsOnly.substring(4, 8);
      const yNum = parseInt(y, 10);
      if (yNum > 1800 && yNum < 2100) {
        const canChi = getCanChiYear(yNum);
        val = `${d}-${m}-${y} ${canChi}`;
      }
    } else {
      // Case 2: Detect DD-MM-YYYY format and auto-attach Can Chi if missing
      const match = val.match(/^(\d{1,2}[-/]\d{1,2}[-/](\d{4}))\s*(.*)$/);
      if (match) {
        const dateStr = match[1].replace(/\//g, '-');
        const yearNum = parseInt(match[2], 10);
        const existingExtra = match[3].trim();

        if (yearNum > 1800 && yearNum < 2100) {
          const canChi = getCanChiYear(yearNum);
          if (!existingExtra || existingExtra === canChi) {
            val = `${dateStr} ${canChi}`;
          }
        }
      }
    }

    setCurrentMember(prev => ({ ...prev, death: val }));
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember.name.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập Họ và tên thành viên.' });
      return;
    }
    if (!currentMember.id.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập mã ID thành viên.' });
      return;
    }
    if (currentMember.id === currentMember.parentId) {
      setStatusMessage({ type: 'error', text: 'ID thành viên không thể trùng với ID Bố/Mẹ!' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    let result;
    if (CLOUDFLARE_API_URL) {
      result = isEditing
        ? await updateMemberInCloudflare(currentMember, authUser)
        : await addMemberToCloudflare(currentMember, authUser);
    } else {
      result = isEditing
        ? await updateMemberInSheet(currentMember)
        : await addMemberToSheet(currentMember);
    }

    setSaving(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message || (isEditing ? 'Cập nhật thành công!' : 'Thêm thành viên thành công!') });

      setTimeout(async () => {
        await loadSheetRows();
        if (onRefreshData) await onRefreshData();
        setShowEditModal(false);
      }, 1000);
    } else {
      setStatusMessage({ type: 'error', text: result.message || 'Có lỗi xảy ra khi lưu dữ liệu.' });
    }
  };

  const handleOpenDeleteModal = (member: SheetRow) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const childrenOfMemberToDelete = useMemo(() => {
    if (!memberToDelete) return [];
    return rows.filter(r => r.parentId === memberToDelete.id);
  }, [memberToDelete, rows]);

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;

    setDeleting(true);
    const result = CLOUDFLARE_API_URL
      ? await deleteMemberFromCloudflare(memberToDelete.id, authUser)
      : await deleteMemberFromSheet(memberToDelete.id);
    setDeleting(false);

    if (result.success) {
      setShowDeleteModal(false);
      setMemberToDelete(null);
      await loadSheetRows();
      if (onRefreshData) await onRefreshData();
    } else {
      alert(`Xóa thất bại: ${result.message}`);
    }
  };

  // User Management Actions
  const handleOpenAddUser = () => {
    setEditingUser({
      username: '',
      full_name: '',
      role: 'editor',
      branch: '',
      phone: '',
      status: 'active',
      password: '',
    });
    setUserFormError('');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: UserRow) => {
    setEditingUser({
      ...u,
      password: '',
    });
    setUserFormError('');
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editingUser.username?.trim()) {
      setUserFormError('Vui lòng nhập Tên đăng nhập.');
      return;
    }
    if (!editingUser.full_name?.trim()) {
      setUserFormError('Vui lòng nhập Họ và tên.');
      return;
    }

    const isCreating = !editingUser.id;
    if (isCreating && (!editingUser.password || editingUser.password.length < 4)) {
      setUserFormError('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }

    setUserSaving(true);
    setUserFormError('');

    let res;
    if (isCreating) {
      res = await createUser(editingUser, authUser);
    } else {
      res = await updateUser(editingUser.id!, editingUser, authUser);
    }

    setUserSaving(false);

    if (res.success) {
      setShowUserModal(false);
      setEditingUser(null);
      await loadUsers();
    } else {
      setUserFormError(res.message || 'Lỗi khi lưu tài khoản.');
    }
  };

  const handleToggleLockUser = async (u: UserRow) => {
    if (u.id === authUser?.id) {
      alert('Bạn không thể tự khóa tài khoản của chính mình!');
      return;
    }
    const newStatus = u.status === 'active' ? 'locked' : 'active';
    const actionText = newStatus === 'locked' ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${u.full_name}" không?`)) return;

    await updateUser(u.id, { ...u, status: newStatus }, authUser);
    await loadUsers();
  };

  const handleDeleteUser = async (u: UserRow) => {
    if (u.id === authUser?.id) {
      alert('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${u.full_name}" (${u.username}) không?`)) return;

    await deleteUser(u.id, authUser);
    await loadUsers();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rows, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GiaPha_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportSQL = () => {
    const escapeSql = (str: any) => {
      if (str === null || str === undefined || str === '') return 'NULL';
      return `'${String(str).replace(/'/g, "''")}'`;
    };

    let sql = `-- Backup Cloudflare D1 Database - Gia Phả Phạm Tộc\n`;
    sql += `-- Ngày xuất: ${new Date().toLocaleString('vi-VN')}\n`;
    sql += `-- Tổng số thành viên: ${rows.length}\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS members (\n  id TEXT PRIMARY KEY,\n  parentId TEXT,\n  name TEXT NOT NULL,\n  gender TEXT DEFAULT 'male',\n  birth TEXT,\n  death TEXT,\n  isDead INTEGER DEFAULT 0,\n  bio TEXT,\n  title TEXT,\n  branch TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\n`;
    sql += `DELETE FROM members;\n\n`;

    rows.forEach(r => {
      const isDeadVal = r.isDead && r.isDead.trim() !== '' ? 1 : 0;
      sql += `INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch) VALUES (${escapeSql(r.id)}, ${escapeSql(r.parentId)}, ${escapeSql(r.name)}, ${escapeSql(r.gender)}, ${escapeSql(r.birth)}, ${escapeSql(r.death)}, ${isDeadVal}, ${escapeSql(r.bio)}, ${escapeSql(r.title)}, ${escapeSql(r.branch)});\n`;
    });

    const dataStr = "data:text/sql;charset=utf-8," + encodeURIComponent(sql);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GiaPha_CloudflareD1_${new Date().toISOString().split('T')[0]}.sql`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Mã ID', 'ID Bố/Mẹ', 'Họ và tên', 'Giới tính', 'Ngày sinh', 'Ngày mất', 'Đã mất', 'Tiểu sử / Ghi chú', 'Vai vế / Danh xưng', 'Chi nhánh'];
    const escapeCsv = (val: string) => {
      const str = String(val || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [headers.join(',')];
    rows.forEach(r => {
      csvRows.push([
        escapeCsv(r.id),
        escapeCsv(r.parentId),
        escapeCsv(r.name),
        escapeCsv(r.gender),
        escapeCsv(r.birth),
        escapeCsv(r.death),
        escapeCsv(r.isDead),
        escapeCsv(r.bio),
        escapeCsv(r.title),
        escapeCsv(r.branch || '')
      ].join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `GiaPha_Excel_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (logActionFilter !== 'all') {
        if (logActionFilter === 'USER' && !log.action.includes('USER')) return false;
        if (logActionFilter !== 'USER' && log.action !== logActionFilter) return false;
      }
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase();
        const text = `${log.user_name} ${log.target_name} ${log.details} ${log.action}`.toLowerCase();
        return text.includes(q);
      }
      return true;
    });
  }, [auditLogs, logActionFilter, logSearch]);

  const currentLineage = useMemo(() => {
    return getLineageChain(currentMember.parentId);
  }, [currentMember.parentId, memberMap]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      padding: isMobile ? '12px 10px 100px' : '20px 24px 80px'
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      {/* Header section */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid var(--border-gold)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 className="font-display" style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: 'var(--gold-light)', margin: 0 }}>
              Quản Trị Gia Phả
            </h1>
            <span style={{
              background: authUser?.role === 'super_admin' ? 'rgba(201,146,58,0.2)' : 'rgba(59,130,246,0.2)',
              color: authUser?.role === 'super_admin' ? 'var(--gold-light)' : '#93c5fd',
              border: `1px solid ${authUser?.role === 'super_admin' ? 'var(--border-gold)' : 'rgba(59,130,246,0.3)'}`,
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Icon name={authUser?.role === 'super_admin' ? 'shield-check' : 'user'} size={12} />
              {authUser?.full_name || 'Quản trị viên'} ({authUser?.role === 'super_admin' ? 'Quản trị viên' : 'Biên tập viên'})
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Hệ thống quản lý phả hệ, nhật ký thay đổi và phân quyền tài khoản trên Cloudflare D1.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {activeTab === 'members' && (
            <button
              onClick={handleOpenAddModal}
              className="action-button primary"
              style={{
                flex: isMobile ? '1 1 100%' : 'initial',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
                color: '#000',
                fontWeight: 700,
                padding: '10px 16px',
                borderRadius: 'var(--r-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: 'var(--shadow-gold-glow)'
              }}
            >
              <Icon name="plus" size={16} /> Thêm Thành Viên Mới
            </button>
          )}

          {activeTab === 'users' && authUser?.role === 'super_admin' && (
            <button
              onClick={handleOpenAddUser}
              className="action-button primary"
              style={{
                flex: isMobile ? '1 1 100%' : 'initial',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
                color: '#000',
                fontWeight: 700,
                padding: '10px 16px',
                borderRadius: 'var(--r-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: 'var(--shadow-gold-glow)'
              }}
            >
              <Icon name="user-plus" size={16} /> Thêm Tài Khoản Mới
            </button>
          )}

          <button
            onClick={async () => {
              if (activeTab === 'members') {
                await loadSheetRows();
                if (onRefreshData) await onRefreshData();
              } else if (activeTab === 'logs') {
                await loadAuditLogs();
              } else if (activeTab === 'users') {
                await loadUsers();
              }
            }}
            disabled={loading || logsLoading || usersLoading}
            className="action-button"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-gold)',
              padding: '8px 12px',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12
            }}
            title="Tải lại dữ liệu"
          >
            <Icon name="refresh-cw" size={14} style={{ animation: (loading || logsLoading || usersLoading) ? 'spin 1s linear infinite' : 'none' }} />
            Tải Lại
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="action-button"
            style={{
              background: 'rgba(201,146,58,0.15)',
              color: 'var(--gold-light)',
              border: '1px solid var(--border-gold)',
              padding: '8px 12px',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600
            }}
            title="Xuất dữ liệu / Sao lưu Database (SQL, Excel CSV, JSON)"
          >
            <Icon name="download" size={14} /> Xuất Database
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="action-button"
              style={{
                background: 'rgba(239,68,68,0.15)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.3)',
                padding: '8px 10px',
                borderRadius: 'var(--r-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12
              }}
              title="Thoát quyền quản trị"
            >
              <Icon name="log-out" size={14} /> Đăng xuất
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginBottom: 16,
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: 8,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <button
          onClick={() => setActiveTab('members')}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--r-sm)',
            background: activeTab === 'members' ? 'var(--gold)' : 'var(--bg-glass)',
            color: activeTab === 'members' ? '#000' : 'var(--text-secondary)',
            fontWeight: activeTab === 'members' ? 700 : 500,
            fontSize: 13,
            border: activeTab === 'members' ? '1px solid var(--gold)' : '1px solid var(--border-glass)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap'
          }}
        >
          <Icon name="users" size={15} /> Danh Sách Thành Viên ({rows.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('logs');
            loadAuditLogs();
          }}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--r-sm)',
            background: activeTab === 'logs' ? 'var(--gold)' : 'var(--bg-glass)',
            color: activeTab === 'logs' ? '#000' : 'var(--text-secondary)',
            fontWeight: activeTab === 'logs' ? 700 : 500,
            fontSize: 13,
            border: activeTab === 'logs' ? '1px solid var(--gold)' : '1px solid var(--border-glass)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap'
          }}
        >
          <Icon name="clock" size={15} /> Nhật Ký Thay Đổi
        </button>

        {authUser?.role === 'super_admin' && (
          <button
            onClick={() => {
              setActiveTab('users');
              loadUsers();
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--r-sm)',
              background: activeTab === 'users' ? 'var(--gold)' : 'var(--bg-glass)',
              color: activeTab === 'users' ? '#000' : 'var(--text-secondary)',
              fontWeight: activeTab === 'users' ? 700 : 500,
              fontSize: 13,
              border: activeTab === 'users' ? '1px solid var(--gold)' : '1px solid var(--border-glass)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap'
            }}
          >
            <Icon name="shield-check" size={15} /> Tài Khoản & Phân Quyền
          </button>
        )}
      </div>

      {/* 1. TAB: DANH SÁCH THÀNH VIÊN */}
      {activeTab === 'members' && (
        <>
          {/* Stats Counter Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 10,
            marginBottom: 16
          }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--r-md)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(201,146,58,0.15)', color: 'var(--gold-mid)',
                display: 'grid', placeItems: 'center'
              }}>
                <Icon name="users" size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tổng số</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-light)' }}>{stats.total}</div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--r-md)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                display: 'grid', placeItems: 'center'
              }}>
                <Icon name="user" size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nam giới</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#93c5fd' }}>{stats.male}</div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--r-md)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(236,72,153,0.15)', color: '#f472b6',
                display: 'grid', placeItems: 'center'
              }}>
                <Icon name="heart" size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nữ giới</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fbcfe8' }}>{stats.female}</div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--r-md)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(34,197,94,0.15)', color: '#4ade80',
                display: 'grid', placeItems: 'center'
              }}>
                <Icon name="user-check" size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Còn sống</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#86efac' }}>{stats.alive}</div>
              </div>
            </div>
          </div>

      {/* Toolbar / Search & Filter */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginBottom: 16,
        background: 'var(--bg-card)',
        padding: '12px 14px',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--border-glass)'
      }}>
        {/* Search input & View Mode Toggle */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Icon name="search" size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm theo Tên, ID, Vai vế, Chi nhánh, Bố Mẹ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>

          {/* Desktop/Mobile Layout Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', borderRadius: 'var(--r-sm)', padding: 2 }}>
            <button
              onClick={() => setLayoutMode('cards')}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: 4,
                background: layoutMode === 'cards' ? 'var(--gold)' : 'transparent',
                color: layoutMode === 'cards' ? '#000' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Xem dạng Thẻ (Tối ưu điện thoại)"
            >
              <Icon name="layers" size={12} /> Thẻ
            </button>
            <button
              onClick={() => setLayoutMode('table')}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: 4,
                background: layoutMode === 'table' ? 'var(--gold)' : 'transparent',
                color: layoutMode === 'table' ? '#000' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Xem dạng Bảng (Máy tính)"
            >
              <Icon name="list" size={12} /> Bảng
            </button>
          </div>
        </div>

        {/* Filters & Sorting bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 12 }}>
          {/* Sorting Control */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              flex: '1 1 140px',
              padding: '6px 8px',
              borderRadius: 'var(--r-sm)',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-gold)',
              color: 'var(--gold-light)',
              fontSize: 12,
              fontWeight: 600
            }}
          >
            <option value="gen">Sắp xếp: Theo Đời (Đời 1 ➔ N)</option>
            <option value="id">Sắp xếp: Theo ID (1 ➔ N)</option>
            <option value="name">Sắp xếp: Theo Tên (A ➔ Z)</option>
            <option value="sheet">Sắp xếp: Sheet gốc</option>
          </select>

          {/* Generation filter */}
          <select
            value={genFilter}
            onChange={(e) => setGenFilter(e.target.value)}
            style={{
              flex: '1 1 110px',
              padding: '6px 8px',
              borderRadius: 'var(--r-sm)',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: 12
            }}
          >
            <option value="all">Tất cả thế hệ</option>
            {availableGens.map(g => (
              <option key={g} value={String(g)}>Đời thứ {g}</option>
            ))}
          </select>

          {/* Gender filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            style={{
              flex: '1 1 85px',
              padding: '6px 8px',
              borderRadius: 'var(--r-sm)',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: 12
            }}
          >
            <option value="all">Giới tính</option>
            <option value="nam">♂ Nam</option>
            <option value="nu">♀ Nữ</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              flex: '1 1 95px',
              padding: '6px 8px',
              borderRadius: 'var(--r-sm)',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: 12
            }}
          >
            <option value="all">Trạng thái</option>
            <option value="alive">Còn sống</option>
            <option value="dead">Đã mất</option>
          </select>

          <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 11 }}>
            {sortedRows.length} / {rows.length} người
          </div>
        </div>
      </div>

      {/* Main Content Area: Cards vs Table */}
      {loading ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-card)', borderRadius: 'var(--r-md)',
          border: '1px solid var(--border-glass)', color: 'var(--gold-mid)'
        }}>
          <Icon name="sparkles" size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: 8 }} />
          <div>Đang tải dữ liệu gia phả...</div>
        </div>
      ) : sortedRows.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px',
          background: 'var(--bg-card)', borderRadius: 'var(--r-md)',
          border: '1px solid var(--border-glass)', color: 'var(--text-muted)'
        }}>
          <Icon name="search-x" size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: 14 }}>Không tìm thấy thành viên nào phù hợp.</p>
        </div>
      ) : layoutMode === 'cards' ? (
        /* Mobile Card View Layout */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 12
        }}>
          {sortedRows.map((row, idx) => {
            const isDead = row.isDead && row.isDead.trim() !== '';
            const genderStr = row.gender?.toLowerCase()?.trim() || '';
            const isMale = genderStr === 'nam' || genderStr === 'male' || genderStr === 'm';
            const parentObj = row.parentId ? memberMap[row.parentId] : null;
            const gen = memberGenMap[row.id] || 1;
            const effectiveBranch = row.branch || memberBranchMap[row.id] || 'Gốc Gia Tộc';

            return (
              <div
                key={row.id || idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  position: 'relative',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Card Top Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 14,
                      background: isMale ? 'rgba(59,130,246,0.15)' : 'rgba(236,72,153,0.15)',
                      color: isMale ? '#60a5fa' : '#f472b6',
                      display: 'inline-grid', placeItems: 'center', fontSize: 13, fontWeight: 'bold'
                    }}>
                      {isMale ? '♂' : '♀'}
                    </span>
                    <div>
                      <span className="font-serif" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {row.name}
                      </span>
                      {row.title && (
                        <div style={{ fontSize: 11, color: 'var(--gold-mid)' }}>{row.title}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{
                      background: 'rgba(201,146,58,0.15)',
                      color: 'var(--gold-light)',
                      border: '1px solid var(--border-gold)',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 8
                    }}>
                      ID: {row.id}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      Đời {gen}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  padding: '8px 10px',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 12,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                  border: '1px solid var(--border-glass)'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>Bố / Mẹ:</span>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {parentObj ? `[${row.parentId}] ${parentObj.name}` : '(Thủy Tổ)'}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>Chi nhánh:</span>
                    <span style={{ color: 'var(--gold-mid)', fontWeight: 500 }}>
                      {effectiveBranch}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>Ngày sinh:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{row.birth || '-'}</span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>Trạng thái:</span>
                    <span style={{ color: isDead ? 'var(--text-muted)' : '#4ade80', fontWeight: 500 }}>
                      {isDead ? (row.death || '🕯 Đã mất') : 'Còn sống'}
                    </span>
                  </div>
                </div>

                {/* Card Footer Touch Buttons */}
                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleAddChildOf(row)}
                    style={{
                      flex: 1,
                      minHeight: 34,
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      color: '#4ade80',
                      borderRadius: 'var(--r-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    <Icon name="user-plus" size={13} /> +Con
                  </button>

                  <button
                    onClick={() => handleAddSpouseOf(row)}
                    style={{
                      flex: 1,
                      minHeight: 34,
                      background: 'rgba(236,72,153,0.15)',
                      border: '1px solid rgba(236,72,153,0.3)',
                      color: '#f472b6',
                      borderRadius: 'var(--r-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    <Icon name="heart" size={12} /> +Vợ/Chồng
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(row)}
                    style={{
                      minHeight: 34,
                      padding: '0 12px',
                      background: 'rgba(201,146,58,0.15)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--gold-light)',
                      borderRadius: 'var(--r-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    <Icon name="edit" size={13} /> Sửa
                  </button>

                  {authUser?.role === 'super_admin' && (
                    <button
                      onClick={() => handleOpenDeleteModal(row)}
                      style={{
                        minHeight: 34,
                        padding: '0 10px',
                        background: 'rgba(224,80,80,0.15)',
                        border: '1px solid rgba(224,80,80,0.3)',
                        color: '#f87171',
                        borderRadius: 'var(--r-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Xóa thành viên"
                    >
                      <Icon name="trash-2" size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table View */
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border-glass)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderBottom: '1px solid var(--border-gold)',
                  color: 'var(--gold-mid)',
                  fontWeight: 600
                }}>
                  <th style={{ padding: '12px 14px', width: 65 }}>ID</th>
                  <th style={{ padding: '12px 14px' }}>Họ và Tên</th>
                  <th style={{ padding: '12px 14px', width: 75 }}>Thế hệ</th>
                  <th style={{ padding: '12px 14px' }}>Bố / Mẹ (Parent)</th>
                  <th style={{ padding: '12px 14px' }}>Ngày Sinh</th>
                  <th style={{ padding: '12px 14px' }}>Ngày Mất / Trạng thái</th>
                  <th style={{ padding: '12px 14px' }}>Chi Nhánh</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', width: 220 }}>Tương tác thông minh</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, idx) => {
                  const isDead = row.isDead && row.isDead.trim() !== '';
                  const genderStr = row.gender?.toLowerCase()?.trim() || '';
                  const isMale = genderStr === 'nam' || genderStr === 'male' || genderStr === 'm';
                  const parentObj = row.parentId ? memberMap[row.parentId] : null;
                  const gen = memberGenMap[row.id] || 1;
                  const effectiveBranch = row.branch || memberBranchMap[row.id] || 'Gốc Gia Tộc';

                  return (
                    <tr
                      key={row.id || idx}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.15s ease',
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--gold-light)' }}>
                        {row.id}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: 12,
                            background: isMale ? 'rgba(59,130,246,0.15)' : 'rgba(236,72,153,0.15)',
                            color: isMale ? '#60a5fa' : '#f472b6',
                            display: 'inline-grid', placeItems: 'center', fontSize: 11, fontWeight: 'bold'
                          }}>
                            {isMale ? '♂' : '♀'}
                          </span>
                          <div>
                            <span className="font-serif" style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                              {row.name}
                            </span>
                            {row.title && (
                              <span style={{ fontSize: 11, color: 'var(--gold-mid)', marginLeft: 6 }}>
                                ({row.title})
                              </span>
                            )}
                          </div>
                          {isDead && (
                            <span style={{
                              fontSize: 10, background: 'rgba(255,255,255,0.08)',
                              color: 'var(--text-muted)', padding: '1px 6px', borderRadius: 4
                            }}>
                              🕯
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: 'rgba(201,146,58,0.12)',
                          color: 'var(--gold-light)',
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 600
                        }}>
                          Đời {gen}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {row.parentId ? (
                          <span>
                            <strong style={{ color: 'var(--gold-light)' }}>{row.parentId}</strong>
                            {parentObj && <span style={{ opacity: 0.8, marginLeft: 4 }}>({parentObj.name})</span>}
                          </span>
                        ) : (
                          <span style={{ opacity: 0.4 }}>- (Thủy Tổ)</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {row.birth || '-'}
                      </td>

                      <td style={{ padding: '12px 14px', color: isDead ? 'var(--text-muted)' : '#4ade80' }}>
                        {isDead ? (row.death || 'Đã mất') : 'Còn sống'}
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--gold-mid)', fontWeight: 500 }}>
                        {effectiveBranch}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleAddChildOf(row)}
                            style={{
                              background: 'rgba(34,197,94,0.15)',
                              border: '1px solid rgba(34,197,94,0.3)',
                              color: '#4ade80',
                              padding: '4px 8px',
                              borderRadius: 'var(--r-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: 11,
                              fontWeight: 600
                            }}
                            title="Thêm con trực tiếp cho người này"
                          >
                            <Icon name="user-plus" size={12} /> +Con
                          </button>

                          <button
                            onClick={() => handleAddSpouseOf(row)}
                            style={{
                              background: 'rgba(236,72,153,0.15)',
                              border: '1px solid rgba(236,72,153,0.3)',
                              color: '#f472b6',
                              padding: '4px 8px',
                              borderRadius: 'var(--r-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: 11,
                              fontWeight: 600
                            }}
                            title="Thêm Vợ/Chồng cho người này"
                          >
                            <Icon name="heart" size={11} /> +Vợ/Chồng
                          </button>

                          <button
                            onClick={() => handleDuplicateMember(row)}
                            style={{
                              background: 'var(--bg-base)',
                              border: '1px solid var(--border-glass)',
                              color: 'var(--text-muted)',
                              padding: '4px 6px',
                              borderRadius: 'var(--r-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: 11
                            }}
                            title="Nhân bản mẫu người này (để tạo anh/chị/em nhanh)"
                          >
                            <Icon name="copy" size={12} />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(row)}
                            style={{
                              background: 'rgba(201,146,58,0.15)',
                              border: '1px solid var(--border-gold)',
                              color: 'var(--gold-light)',
                              padding: '4px 8px',
                              borderRadius: 'var(--r-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: 11
                            }}
                            title="Sửa thông tin"
                          >
                            <Icon name="edit" size={12} /> Sửa
                          </button>

                          {authUser?.role === 'super_admin' && (
                            <button
                              onClick={() => handleOpenDeleteModal(row)}
                              style={{
                                background: 'rgba(224,80,80,0.15)',
                                border: '1px solid rgba(224,80,80,0.3)',
                                color: '#f87171',
                                padding: '4px 6px',
                                borderRadius: 'var(--r-sm)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: 11
                              }}
                              title="Xóa thành viên"
                            >
                              <Icon name="trash-2" size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
    )}

      {/* 2. TAB: NHẬT KÝ THAY ĐỔI (AUDIT LOGS) */}
      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filters & Search for Logs */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--r-md)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 10,
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Icon name="search" size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                placeholder="Tìm theo tên người thực hiện, thành viên, nội dung..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'CREATE_MEMBER', label: 'Thêm người' },
                { id: 'UPDATE_MEMBER', label: 'Sửa thông tin' },
                { id: 'DELETE_MEMBER', label: 'Xóa' },
                { id: 'USER', label: 'Tài khoản' },
                { id: 'LOGIN', label: 'Đăng nhập' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setLogActionFilter(f.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--r-sm)',
                    background: logActionFilter === f.id ? 'rgba(201,146,58,0.25)' : 'var(--bg-base)',
                    border: `1px solid ${logActionFilter === f.id ? 'var(--border-gold)' : 'var(--border-glass)'}`,
                    color: logActionFilter === f.id ? 'var(--gold-light)' : 'var(--text-muted)',
                    fontSize: 11,
                    fontWeight: logActionFilter === f.id ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Log Timeline List */}
          {logsLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--r-md)', color: 'var(--gold-mid)' }}>
              <Icon name="sparkles" size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: 8 }} />
              <div>Đang tải nhật ký thay đổi...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-card)', borderRadius: 'var(--r-md)', color: 'var(--text-muted)' }}>
              <Icon name="clock" size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: 14 }}>Chưa có bản ghi nhật ký nào phù hợp.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredLogs.map(log => {
                let badgeColor = 'rgba(201,146,58,0.15)';
                let badgeText = 'var(--gold-light)';
                let badgeBorder = 'var(--border-gold)';
                let iconName = 'edit';
                let actionTitle = 'Cập nhật';

                if (log.action === 'CREATE_MEMBER') {
                  badgeColor = 'rgba(34,197,94,0.15)';
                  badgeText = '#4ade80';
                  badgeBorder = 'rgba(34,197,94,0.3)';
                  iconName = 'user-plus';
                  actionTitle = 'Thêm thành viên';
                } else if (log.action === 'DELETE_MEMBER') {
                  badgeColor = 'rgba(239,68,68,0.15)';
                  badgeText = '#f87171';
                  badgeBorder = 'rgba(239,68,68,0.3)';
                  iconName = 'trash-2';
                  actionTitle = 'Xóa thành viên';
                } else if (log.action.includes('USER')) {
                  badgeColor = 'rgba(59,130,246,0.15)';
                  badgeText = '#60a5fa';
                  badgeBorder = 'rgba(59,130,246,0.3)';
                  iconName = 'shield-check';
                  actionTitle = 'Tài khoản';
                } else if (log.action === 'LOGIN') {
                  badgeColor = 'rgba(168,85,247,0.15)';
                  badgeText = '#c084fc';
                  badgeBorder = 'rgba(168,85,247,0.3)';
                  iconName = 'key';
                  actionTitle = 'Đăng nhập';
                } else if (log.action === 'SYSTEM') {
                  badgeColor = 'rgba(201,146,58,0.2)';
                  badgeText = 'var(--gold-light)';
                  badgeBorder = 'var(--border-gold)';
                  iconName = 'sparkles';
                  actionTitle = 'Hệ thống';
                }

                return (
                  <div
                    key={log.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--r-md)',
                      padding: '12px 16px',
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start'
                    }}
                  >
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: badgeColor,
                      border: `1px solid ${badgeBorder}`,
                      color: badgeText,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}>
                      <Icon name={iconName} size={18} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: badgeColor,
                            color: badgeText,
                            border: `1px solid ${badgeBorder}`,
                            textTransform: 'uppercase'
                          }}>
                            {actionTitle}
                          </span>
                          <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                            {log.user_name || 'Quản trị viên'}
                          </strong>
                        </div>

                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          🕒 {log.created_at ? new Date(log.created_at.replace(' ', 'T') + 'Z').toLocaleString('vi-VN', { hour12: false }) : ''}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {log.details}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: TÀI KHOẢN & PHÂN QUYỀN (RBAC - SUPER ADMIN ONLY) */}
      {activeTab === 'users' && authUser?.role === 'super_admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: 'var(--gold-light)' }}>
                Danh Sách Tài Khoản & Phân Quyền
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Cấp tài khoản cho các biên tập viên để cùng cập nhật dữ liệu gia phả mà không lo bị xóa mất dữ liệu chung.
              </p>
            </div>

            <button
              onClick={handleOpenAddUser}
              className="action-button primary"
              style={{
                background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
                color: '#000',
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13
              }}
            >
              <Icon name="user-plus" size={15} /> Tạo Tài Khoản Mới
            </button>
          </div>

          {usersLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--r-md)', color: 'var(--gold-mid)' }}>
              <Icon name="sparkles" size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: 8 }} />
              <div>Đang tải danh sách tài khoản...</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
              {usersList.map(u => {
                const isSuper = u.role === 'super_admin';
                const isLocked = u.status === 'locked';

                return (
                  <div
                    key={u.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${isSuper ? 'var(--border-gold)' : 'var(--border-glass)'}`,
                      borderRadius: 'var(--r-md)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      opacity: isLocked ? 0.6 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: isSuper ? 'rgba(201,146,58,0.2)' : 'rgba(59,130,246,0.15)',
                          border: `1px solid ${isSuper ? 'var(--border-gold)' : 'rgba(59,130,246,0.3)'}`,
                          color: isSuper ? 'var(--gold-light)' : '#60a5fa',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 18,
                          fontWeight: 700
                        }}>
                          {isSuper ? '🛡️' : '✍️'}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {u.full_name}
                          </h4>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            @{u.username}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: isLocked ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                        color: isLocked ? '#f87171' : '#4ade80',
                        border: `1px solid ${isLocked ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                        textTransform: 'uppercase'
                      }}>
                        {isLocked ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--r-sm)',
                      padding: '8px 10px',
                      fontSize: 12,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 6
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>Vai trò:</span>
                        <span style={{ color: isSuper ? 'var(--gold-mid)' : '#93c5fd', fontWeight: 600 }}>
                          {isSuper ? 'Quản trị viên (Admin)' : 'Biên tập viên (Editor)'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>Chi nhánh:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {u.branch || 'Tất cả các chi'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>Điện thoại:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {u.phone || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>Mã ID:</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {u.id}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                      <button
                        onClick={() => handleOpenEditUser(u)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 'var(--r-sm)',
                          background: 'rgba(201,146,58,0.15)',
                          border: '1px solid var(--border-gold)',
                          color: 'var(--gold-light)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}
                      >
                        <Icon name="edit" size={13} /> Sửa / Đổi mật khẩu
                      </button>

                      {u.id !== authUser?.id && (
                        <>
                          <button
                            onClick={() => handleToggleLockUser(u)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 'var(--r-sm)',
                              background: isLocked ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                              border: `1px solid ${isLocked ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`,
                              color: isLocked ? '#4ade80' : '#facc15',
                              fontSize: 12,
                              cursor: 'pointer'
                            }}
                            title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            <Icon name={isLocked ? 'unlock' : 'lock'} size={13} />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 'var(--r-sm)',
                              background: 'rgba(239,68,68,0.15)',
                              border: '1px solid rgba(239,68,68,0.3)',
                              color: '#f87171',
                              fontSize: 12,
                              cursor: 'pointer'
                            }}
                            title="Xóa tài khoản"
                          >
                            <Icon name="trash-2" size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Smart Add / Edit Member Modal Form (Mobile Optimized) */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => !saving && setShowEditModal(false)}>
          <div
            className="modal"
            style={{
              maxWidth: 680,
              width: isMobile ? '100%' : '92%',
              maxHeight: isMobile ? '95vh' : '90vh',
              borderRadius: isMobile ? 'var(--r-lg) var(--r-lg) 0 0' : 'var(--r-lg)',
              margin: isMobile ? 'auto 0 0 0' : 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head" style={{ borderBottom: '1px solid var(--border-gold)', paddingBottom: 12, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 className="font-display" style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: 'var(--gold-light)', margin: 0 }}>
                    {isEditing ? `Chỉnh sửa: ${currentMember.name}` : 'Thêm Thành Viên Mới'}
                  </h2>
                  <div style={{ fontSize: 11, color: 'var(--gold-mid)', marginTop: 2 }}>
                    Dự kiến: Đời thứ {currentLineage.gen}
                  </div>
                </div>
                <button
                  disabled={saving}
                  onClick={() => setShowEditModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8 }}
                >
                  <Icon name="x" size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveMember} style={{ padding: isMobile ? '12px 14px 16px' : '16px 20px 20px', overflowY: 'auto', flex: 1 }}>
              {statusMessage && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--r-sm)',
                  marginBottom: 14,
                  fontSize: 13,
                  background: statusMessage.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  border: `1px solid ${statusMessage.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: statusMessage.type === 'success' ? '#4ade80' : '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Icon name={statusMessage.type === 'success' ? 'check-circle' : 'alert-triangle'} size={16} />
                  {statusMessage.text}
                </div>
              )}

              {/* Lineage Path Dynamic Preview */}
              <div style={{
                background: 'rgba(201,146,58,0.08)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--r-sm)',
                padding: '8px 12px',
                marginBottom: 14,
                fontSize: 12,
                color: 'var(--gold-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Icon name="git-fork" size={15} style={{ color: 'var(--gold-mid)', flexShrink: 0 }} />
                <div style={{ wordBreak: 'break-word' }}>
                  <strong style={{ color: 'var(--gold-mid)' }}>Tuyến Phả Hệ: </strong>
                  {currentLineage.chain}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                {/* ID Field */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                    Mã ID <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditing || saving}
                    value={currentMember.id}
                    onChange={(e) => setCurrentMember({ ...currentMember, id: e.target.value })}
                    placeholder="VD: 1, P1, P2..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 14
                    }}
                  />
                </div>

                {/* Parent ID Select with Auto-Inheritance */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                    Bố / Mẹ (Parent ID)
                  </label>
                  <select
                    disabled={saving}
                    value={currentMember.parentId}
                    onChange={(e) => handleParentSelectChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 14
                    }}
                  >
                    <option value="">-- Để trống (Thủy Tổ / Đời 1) --</option>
                    {rows.filter(r => r.id !== currentMember.id).map(r => (
                      <option key={r.id} value={r.id}>
                        [{r.id}] {r.name} {r.title ? `(${r.title})` : ''}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: 11, color: '#4ade80', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="sparkles" size={11} /> Thừa kế Đời {currentLineage.gen} {currentMember.branch ? `· ${currentMember.branch}` : ''}
                  </div>
                </div>

                {/* Name & Quick Prefix Chips */}
                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)' }}>
                      Họ và Tên đầy đủ <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const clean = currentMember.name.replace(/^(Vợ|Chồng)(:|\s)\s*/i, '');
                          setCurrentMember({ ...currentMember, name: `Vợ: ${clean}`, gender: 'Nữ' });
                        }}
                        style={{
                          background: 'rgba(236,72,153,0.15)',
                          border: '1px solid rgba(236,72,153,0.3)',
                          color: '#f472b6',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: 'pointer'
                        }}
                      >
                        + Vợ:
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const clean = currentMember.name.replace(/^(Vợ|Chồng)(:|\s)\s*/i, '');
                          setCurrentMember({ ...currentMember, name: `Chồng: ${clean}`, gender: 'Nam' });
                        }}
                        style={{
                          background: 'rgba(59,130,246,0.15)',
                          border: '1px solid rgba(59,130,246,0.3)',
                          color: '#60a5fa',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: 'pointer'
                        }}
                      >
                        + Chồng:
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    disabled={saving}
                    value={currentMember.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      let newGender = currentMember.gender;
                      if (/^(Vợ|Bà cả|Bà hai|Bà ba|Bà|Dâu|Nàng dâu)(:|\s)/i.test(val)) {
                        newGender = 'Nữ';
                      } else if (/^(Chồng|Rể|Chàng rể|Ông)(:|\s)/i.test(val)) {
                        newGender = 'Nam';
                      }
                      setCurrentMember({ ...currentMember, name: val, gender: newGender });
                    }}
                    placeholder="VD: Phạm Phương Đông, Vợ: Nguyễn Thị A..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 15,
                      fontWeight: 600
                    }}
                  />
                </div>

                {/* Grouped Lineage Section: Gender, Title, Branch */}
                <div style={{
                  gridColumn: isMobile ? 'span 1' : 'span 2',
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                  gap: 10,
                  background: 'rgba(255,255,255,0.02)',
                  padding: 10,
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border-glass)'
                }}>
                  {/* Gender */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                      Giới tính
                    </label>
                    <select
                      disabled={saving}
                      value={currentMember.gender}
                      onChange={(e) => setCurrentMember({ ...currentMember, gender: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--r-sm)',
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                        fontSize: 13
                      }}
                    >
                      <option value="Nam">♂ Nam</option>
                      <option value="Nữ">♀ Nữ</option>
                    </select>
                  </div>

                  {/* Title / Role */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                      Vai vế / Danh xưng (Title)
                    </label>
                    <input
                      type="text"
                      disabled={saving}
                      value={currentMember.title}
                      onChange={(e) => setCurrentMember({ ...currentMember, title: e.target.value })}
                      placeholder={`VD: Đời ${currentLineage.gen}...`}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--r-sm)',
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                        fontSize: 13
                      }}
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                      Chi / Nhánh gia tộc
                    </label>
                    <input
                      type="text"
                      disabled={saving}
                      value={currentMember.branch || ''}
                      onChange={(e) => setCurrentMember({ ...currentMember, branch: e.target.value })}
                      placeholder="VD: Chi Bà Cả..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--r-sm)',
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                        fontSize: 13
                      }}
                    />
                  </div>

                  {/* Branch Quick Preset Chips */}
                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 3', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gợi ý Chi:</span>
                    {['Chi Bà Cả', 'Chi Bà Hai', 'Chi Bà Ba', 'Gốc Gia Tộc'].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setCurrentMember({ ...currentMember, branch: b })}
                        style={{
                          background: currentMember.branch === b ? 'rgba(201,146,58,0.25)' : 'var(--bg-base)',
                          border: `1px solid ${currentMember.branch === b ? 'var(--gold)' : 'var(--border-glass)'}`,
                          color: currentMember.branch === b ? 'var(--gold-light)' : 'var(--text-muted)',
                          padding: '3px 8px',
                          borderRadius: 12,
                          fontSize: 11,
                          cursor: 'pointer'
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Birth Date Section with Smart Solar -> Lunar Converter */}
                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 'var(--r-sm)', border: '1px solid var(--border-glass)' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                    Ngày sinh (Dương lịch)
                  </label>
                  <input
                    type="text"
                    disabled={saving}
                    value={currentMember.birth}
                    onChange={(e) => setCurrentMember({ ...currentMember, birth: e.target.value })}
                    placeholder="VD: 29-12-1981 hoặc 29-12-1981 (17-11 Nhâm Tuất)"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      marginBottom: 8
                    }}
                  />

                  {/* Smart Solar -> Lunar Birth Date Assistant */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>💡 Đổi từ ngày Dương lịch sang Âm lịch:</span>
                    <input
                      type="text"
                      placeholder="Chỉ nhập 8 số (VD: 17021982)"
                      maxLength={10}
                      value={solarBirthInput}
                      onChange={(e) => setSolarBirthInput(formatSolarDateInput(e.target.value))}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--r-sm)',
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-gold)',
                        color: 'var(--gold-light)',
                        fontSize: 13,
                        fontWeight: 600,
                        width: 155
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleConvertSolarToLunarBirth}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--r-sm)',
                        background: 'rgba(201,146,58,0.15)',
                        border: '1px solid var(--border-gold)',
                        color: 'var(--gold-light)',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      Tính Âm Lịch
                    </button>
                  </div>
                </div>

                {/* Deceased Checkbox */}
                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      disabled={saving}
                      checked={!!(currentMember.isDead && currentMember.isDead.trim() !== '')}
                      onChange={(e) => setCurrentMember({ ...currentMember, isDead: e.target.checked ? 'x' : '' })}
                      style={{ width: 18, height: 18, accentColor: 'var(--gold)' }}
                    />
                    <span>Thành viên đã mất 🕯</span>
                  </label>
                </div>

                {/* Death Date & Auto Can Chi Recognition */}
                {!!(currentMember.isDead && currentMember.isDead.trim() !== '') && (
                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 'var(--r-sm)', border: '1px solid var(--border-glass)' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                      Ngày mất (Âm lịch - VD: 02-08-2022 Nhâm Dần hoặc nhập 8 số 17021982)
                    </label>
                    <input
                      type="text"
                      disabled={saving}
                      value={currentMember.death}
                      onChange={(e) => handleDeathInputChange(e.target.value)}
                      placeholder="VD: 02-08-2022 hoặc 17021982"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--r-sm)',
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                        fontSize: 14
                      }}
                    />
                  </div>
                )}

                {/* Bio / Notes */}
                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                    Tiểu sử / Ghi chú
                  </label>
                  <textarea
                    rows={3}
                    disabled={saving}
                    value={currentMember.bio}
                    onChange={(e) => setCurrentMember({ ...currentMember, bio: e.target.value })}
                    placeholder="Ghi chú quá trình công tác, chức vụ, sự nghiệp..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* Sticky Form Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 20,
                paddingTop: 14,
                borderTop: '1px solid var(--border-glass)',
                position: 'sticky',
                bottom: 0,
                background: 'var(--bg-card)',
                zIndex: 5
              }}>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: isMobile ? 1 : 'initial',
                    padding: '10px 20px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    minHeight: 44
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: isMobile ? 2 : 'initial',
                    padding: '10px 24px',
                    borderRadius: 'var(--r-sm)',
                    background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
                    border: 'none',
                    color: '#000',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    minHeight: 44
                  }}
                >
                  {saving ? (
                    <>
                      <Icon name="sparkles" size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      Đang lưu lên Sheet...
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={15} />
                      {isEditing ? 'Cập Nhật' : 'Lưu Thành Viên'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && memberToDelete && (
        <div className="modal-backdrop" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: 460, width: isMobile ? '94%' : '100%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head" style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 24,
                background: 'rgba(239,68,68,0.15)', color: '#f87171',
                margin: '0 auto 12px', display: 'grid', placeItems: 'center'
              }}>
                <Icon name="alert-triangle" size={24} />
              </div>
              <h2 className="font-display" style={{ fontSize: 18, color: '#f87171', margin: 0 }}>
                Xác nhận xóa thành viên
              </h2>
            </div>

            <div style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
              Bạn có chắc chắn muốn xóa thành viên <strong style={{ color: 'var(--gold-light)' }}>{memberToDelete.name}</strong> (ID: <code style={{ color: 'var(--gold)' }}>{memberToDelete.id}</code>) khỏi Google Sheets không?

              {childrenOfMemberToDelete.length > 0 && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 12,
                  color: '#fca5a5',
                  textAlign: 'left'
                }}>
                  <strong style={{ color: '#f87171' }}>⚠️ Cảnh báo con cái trực thuộc ({childrenOfMemberToDelete.length} người):</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {childrenOfMemberToDelete.map(c => (
                      <li key={c.id}>[{c.id}] {c.name}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 4, opacity: 0.8 }}>
                    Lưu ý: Nếu xóa người này, bạn hãy cập nhật lại Bố/Mẹ cho các con của người này sau đó.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, padding: '12px 20px 20px', justifyContent: 'center' }}>
              <button
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  minHeight: 40
                }}
              >
                Hủy bỏ
              </button>
              <button
                disabled={deleting}
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  borderRadius: 'var(--r-sm)',
                  background: 'linear-gradient(135deg, var(--red), var(--red-deep))',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  minHeight: 40
                }}
              >
                {deleting ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xuất & Sao Lưu Database */}
      {showExportModal && (
        <div className="modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(201,146,58,0.15)',
                  border: '1px solid var(--border-gold)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Icon name="download" size={26} style={{ color: 'var(--gold-mid)' }} />
                </div>
              </div>
              <h2 className="font-display" style={{
                fontSize: 22, fontWeight: 700,
                color: 'var(--gold-light)', textAlign: 'center',
                letterSpacing: '0.02em',
              }}>
                Xuất & Sao Lưu Database
              </h2>
              <p style={{
                marginTop: 6, fontSize: 12,
                color: 'var(--text-muted)', textAlign: 'center',
              }}>
                Đang có tổng cộng <strong>{rows.length}</strong> thành viên trong Database
              </p>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Option 1: SQL File */}
              <div 
                onClick={() => {
                  handleExportSQL();
                  setShowExportModal(false);
                }}
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                className="hover-card"
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(201,146,58,0.2)',
                  display: 'grid', placeItems: 'center', flexShrink: 0
                }}>
                  <Icon name="database" size={22} style={{ color: 'var(--gold-light)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold-light)', marginBottom: 2 }}>
                    Xuất file SQL (.sql) - Cloudflare D1
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Bản sao lưu chuẩn SQL chứa lệnh tạo bảng và 100% dữ liệu để nạp lại vào Cloudflare D1.
                  </p>
                </div>
                <Icon name="download" size={16} style={{ color: 'var(--gold-mid)' }} />
              </div>

              {/* Option 2: Excel / CSV */}
              <div 
                onClick={() => {
                  handleExportCSV();
                  setShowExportModal(false);
                }}
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                className="hover-card"
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(34,197,94,0.15)',
                  display: 'grid', placeItems: 'center', flexShrink: 0
                }}>
                  <Icon name="file-text" size={22} style={{ color: '#4ade80' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#4ade80', marginBottom: 2 }}>
                    Xuất file Excel (.csv)
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Định dạng bảng tính Excel tiếng Việt UTF-8 chuẩn, dễ dàng mở xem và in ấn.
                  </p>
                </div>
                <Icon name="download" size={16} style={{ color: '#4ade80' }} />
              </div>

              {/* Option 3: JSON */}
              <div 
                onClick={() => {
                  handleExportJSON();
                  setShowExportModal(false);
                }}
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                className="hover-card"
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(59,130,246,0.15)',
                  display: 'grid', placeItems: 'center', flexShrink: 0
                }}>
                  <Icon name="file-code" size={22} style={{ color: '#60a5fa' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#60a5fa', marginBottom: 2 }}>
                    Xuất file JSON (.json)
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Dữ liệu đối tượng JSON đầy đủ các trường thông tin.
                  </p>
                </div>
                <Icon name="download" size={16} style={{ color: '#60a5fa' }} />
              </div>
            </div>

            <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--border-glass)', textAlign: 'right' }}>
              <button
                onClick={() => setShowExportModal(false)}
                className="action-button"
                style={{ padding: '6px 18px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal Form (Mobile & Desktop Optimized) */}
      {showUserModal && editingUser && (
        <div className="modal-backdrop" onClick={() => !userSaving && setShowUserModal(false)}>
          <div
            className="modal"
            style={{
              maxWidth: 520,
              width: isMobile ? '100%' : '92%',
              maxHeight: isMobile ? '92vh' : '88vh',
              borderRadius: isMobile ? 'var(--r-lg) var(--r-lg) 0 0' : 'var(--r-lg)',
              margin: isMobile ? 'auto 0 0 0' : 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-head" style={{ borderBottom: '1px solid var(--border-gold)', padding: '14px 20px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(201,146,58,0.2)', color: 'var(--gold-light)',
                    display: 'grid', placeItems: 'center',
                    border: '1px solid var(--border-gold)'
                  }}>
                    <Icon name="shield-check" size={20} />
                  </div>
                  <div>
                    <h2 className="font-display" style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: 'var(--gold-light)', margin: 0 }}>
                      {editingUser.id ? `Sửa Tài Khoản: @${editingUser.username}` : 'Thêm Tài Khoản Mới'}
                    </h2>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Phân quyền quản trị & biên tập gia phả
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={userSaving}
                  onClick={() => setShowUserModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 6,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Đóng"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Form Content */}
            <form
              onSubmit={handleSaveUser}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              <div style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}>
                {userFormError && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--r-sm)',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <Icon name="alert-triangle" size={15} style={{ flexShrink: 0 }} />
                    <div>{userFormError}</div>
                  </div>
                )}

                {/* Username */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 5 }}>
                    Tên đăng nhập (Username) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser.id || userSaving}
                    value={editingUser.username || ''}
                    onChange={e => setEditingUser(prev => ({ ...prev!, username: e.target.value.trim() }))}
                    placeholder="VD: truongchi_1, phamhai..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                  {editingUser.id && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                      (Tên đăng nhập không thể thay đổi sau khi tạo)
                    </span>
                  )}
                </div>

                {/* Full name */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 5 }}>
                    Họ và tên người dùng <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={userSaving}
                    value={editingUser.full_name || ''}
                    onChange={e => setEditingUser(prev => ({ ...prev!, full_name: e.target.value }))}
                    placeholder="VD: Phạm Văn Hải"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Role */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 5 }}>
                    Vai trò & Quyền hạn <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={editingUser.role || 'editor'}
                    disabled={userSaving || editingUser.id === authUser?.id}
                    onChange={e => setEditingUser(prev => ({ ...prev!, role: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  >
                    <option value="editor">✍️ Biên tập viên (Editor) - Thêm & Sửa thành viên, không được Xóa</option>
                    <option value="super_admin">🛡️ Quản trị viên (Admin) - Toàn quyền Thêm, Sửa, Xóa & Quản lý User</option>
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 5 }}>
                    Chi nhánh phụ trách
                  </label>
                  <input
                    type="text"
                    disabled={userSaving}
                    value={editingUser.branch || ''}
                    onChange={e => setEditingUser(prev => ({ ...prev!, branch: e.target.value }))}
                    placeholder="VD: Chi 2, Nhánh Giáp (để trống nếu quản lý toàn họ)..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 5 }}>
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="tel"
                    disabled={userSaving}
                    value={editingUser.phone || ''}
                    onChange={e => setEditingUser(prev => ({ ...prev!, phone: e.target.value }))}
                    placeholder="VD: 0912345678"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 5 }}>
                    {editingUser.id ? 'Đổi mật khẩu mới (để trống nếu giữ nguyên)' : 'Mật khẩu đăng nhập *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser.id}
                    disabled={userSaving}
                    value={editingUser.password || ''}
                    onChange={e => setEditingUser(prev => ({ ...prev!, password: e.target.value }))}
                    placeholder={editingUser.id ? 'Nhập mật khẩu mới nếu muốn đổi...' : 'Nhập mật khẩu (tối thiểu 4 ký tự)...'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 5 }}>
                    Trạng thái tài khoản
                  </label>
                  <select
                    value={editingUser.status || 'active'}
                    disabled={userSaving || editingUser.id === authUser?.id}
                    onChange={e => setEditingUser(prev => ({ ...prev!, status: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  >
                    <option value="active">🟢 Đang hoạt động (Cho phép đăng nhập)</option>
                    <option value="locked">🔴 Đã khóa (Chặn đăng nhập)</option>
                  </select>
                </div>
              </div>

              {/* Pinned Sticky Footer Actions */}
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border-gold)',
                background: 'var(--bg-card)',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexShrink: 0
              }}>
                <button
                  type="button"
                  disabled={userSaving}
                  onClick={() => setShowUserModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={userSaving}
                  style={{
                    flex: 1.8,
                    padding: '11px',
                    borderRadius: 'var(--r-sm)',
                    background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
                    border: 'none',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: 'var(--shadow-gold-glow)'
                  }}
                >
                  {userSaving ? (
                    <Icon name="sparkles" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <>
                      <Icon name="save" size={16} /> Lưu Tài Khoản
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
