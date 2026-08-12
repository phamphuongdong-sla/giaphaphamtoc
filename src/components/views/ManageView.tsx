import { useState, useEffect, useMemo } from 'react';
import { SheetRow, fetchRawSheetRows, addMemberToSheet, updateMemberInSheet, deleteMemberFromSheet, APPS_SCRIPT_ID, SHEET_ID } from '@/services/googleSheets';
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
  onRefreshData?: () => Promise<void>;
  onLogout?: () => void;
}

export const ManageView = ({ onRefreshData, onLogout }: ManageViewProps) => {
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'nam' | 'nu'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'alive' | 'dead'>('all');
  const [genFilter, setGenFilter] = useState<string>('all');

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

  // Apps Script modal state
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Solar to Lunar Converter helper state inside form
  const [_solarDateInput, setSolarDateInput] = useState<string>('');
  const [solarBirthInput, setSolarBirthInput] = useState<string>('');

  const loadSheetRows = async () => {
    setLoading(true);
    try {
      const data = await fetchRawSheetRows();
      setRows(data);
    } catch (err) {
      console.error('Failed to load sheet rows:', err);
    } finally {
      setLoading(false);
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

    const result = isEditing
      ? await updateMemberInSheet(currentMember)
      : await addMemberToSheet(currentMember);

    setSaving(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message || (isEditing ? 'Cập nhật thành công!' : 'Thêm thành viên thành công!') });

      setTimeout(async () => {
        await loadSheetRows();
        if (onRefreshData) await onRefreshData();
        setShowEditModal(false);
      }, 1000);
    } else {
      setStatusMessage({ type: 'error', text: result.message || 'Có lỗi xảy ra khi lưu lên Google Sheets.' });
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
    const result = await deleteMemberFromSheet(memberToDelete.id);
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

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rows, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GiaPha_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const appsScriptCode = `/**
 * GIA PHẢ PHẠM TỘC - GOOGLE APPS SCRIPT BACKEND
 * Mã Web App Deployment ID: ${APPS_SCRIPT_ID}
 */

function doGet(e) {
  try {
    var sheet = getTargetSheet();
    var action = e && e.parameter ? e.parameter.action : "";
    if (action === "delete" && e.parameter.id) {
      return deleteMemberRow(sheet, e.parameter.id);
    }
    var data = readSheetData(sheet);
    return responseJSON({ success: true, count: data.length, data: data });
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    var sheet = getTargetSheet();
    var contents = {};
    if (e && e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    }
    
    var action = contents.action || (e.parameter ? e.parameter.action : "");
    var payload = contents.data || contents.payload || contents;
    
    if (action === "send_reset_code") {
      var targetEmail = contents.email || "phamphuongdong@gmail.com";
      var code = Math.floor(100000 + Math.random() * 900000).toString();
      var subject = "🔑 [Gia Phả Phạm Tộc] Mã khôi phục mật khẩu quản trị";
      var body = "Xin chào Quản trị viên,\n\n" +
                 "Mã xác minh khôi phục mật khẩu trang Quản lý Gia Phả của bạn là: " + code + "\n\n" +
                 "Mã này có hiệu lực để bạn đặt lại mật khẩu mới.\n" +
                 "Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.\n\n" +
                 "Trân trọng,\nGia Phả Phạm Tộc System";
      try {
        MailApp.sendEmail(targetEmail, subject, body);
      } catch(mErr) {
        console.warn("MailApp error:", mErr);
      }
      return responseJSON({ success: true, message: "Đã gửi mã xác minh 6 chữ số tới " + targetEmail, code: code });
    } else if (action === "create" || action === "add") {
      return addMemberRow(sheet, payload);
    } else if (action === "update" || action === "edit") {
      return updateMemberRow(sheet, payload);
    } else if (action === "delete") {
      return deleteMemberRow(sheet, contents.id || payload.id);
    } else if (action === "read") {
      var data = readSheetData(sheet);
      return responseJSON({ success: true, count: data.length, data: data });
    } else {
      return responseJSON({ success: false, message: "Hành động không hợp lệ: " + action });
    }
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

function getTargetSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    ss = SpreadsheetApp.openById("${SHEET_ID}");
  }
  var sheet = ss.getSheetByName("Data");
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  return sheet;
}

function readSheetData(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function(h) { return String(h).trim(); });
  var result = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j] !== undefined && row[j] !== null ? String(row[j]) : "";
    }
    result.push(obj);
  }
  return result;
}

function addMemberRow(sheet, data) {
  var newId = String(data.id || "").trim();
  if (!newId) {
    return responseJSON({ success: false, message: "ID thành viên không được để trống" });
  }
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === newId) {
      return responseJSON({ success: false, message: "Mã ID '" + newId + "' đã tồn tại!" });
    }
  }
  var newRow = [
    newId,
    String(data.parentId || "").trim(),
    String(data.name || "").trim(),
    String(data.gender || "").trim(),
    String(data.birth || "").trim(),
    String(data.death || "").trim(),
    String(data.isDead || "").trim(),
    String(data.bio || "").trim(),
    String(data.title || "").trim(),
    String(data.branch || "").trim()
  ];
  sheet.appendRow(newRow);
  return responseJSON({ success: true, message: "Thêm thành viên '" + data.name + "' thành công!", id: newId });
}

function updateMemberRow(sheet, data) {
  var targetId = String(data.id || "").trim();
  if (!targetId) {
    return responseJSON({ success: false, message: "ID thành viên không được để trống" });
  }
  var values = sheet.getDataRange().getValues();
  var foundRowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === targetId) {
      foundRowIndex = i + 1;
      break;
    }
  }
  if (foundRowIndex === -1) {
    return responseJSON({ success: false, message: "Không tìm thấy thành viên có ID: " + targetId });
  }
  var updatedRow = [
    targetId,
    String(data.parentId || "").trim(),
    String(data.name || "").trim(),
    String(data.gender || "").trim(),
    String(data.birth || "").trim(),
    String(data.death || "").trim(),
    String(data.isDead || "").trim(),
    String(data.bio || "").trim(),
    String(data.title || "").trim(),
    String(data.branch || "").trim()
  ];
  sheet.getRange(foundRowIndex, 1, 1, 10).setValues([updatedRow]);
  return responseJSON({ success: true, message: "Cập nhật thông tin '" + data.name + "' thành công!" });
}

function deleteMemberRow(sheet, targetId) {
  var idStr = String(targetId || "").trim();
  if (!idStr) {
    return responseJSON({ success: false, message: "ID thành viên không được để trống" });
  }
  var values = sheet.getDataRange().getValues();
  var foundRowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === idStr) {
      foundRowIndex = i + 1;
      break;
    }
  }
  if (foundRowIndex === -1) {
    return responseJSON({ success: false, message: "Không tìm thấy thành viên có ID: " + idStr });
  }
  sheet.deleteRow(foundRowIndex);
  return responseJSON({ success: true, message: "Xóa thành viên ID " + idStr + " thành công!" });
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const copyAppsScriptCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

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
              Quản Lý Thành Viên
            </h1>
            <span style={{
              background: 'rgba(201,146,58,0.15)',
              color: 'var(--gold-mid)',
              border: '1px solid var(--border-gold)',
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Icon name="database" size={11} /> Sheets Sync
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Quản lý Thêm, Sửa, Xóa và tự động thừa kế phả hệ gia tộc.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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

          <button
            onClick={async () => {
              await loadSheetRows();
              if (onRefreshData) await onRefreshData();
            }}
            disabled={loading}
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
            title="Đồng bộ lại từ Google Sheets"
          >
            <Icon name="refresh-cw" size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Tải Lại
          </button>

          <button
            onClick={handleExportBackup}
            className="action-button"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-glass)',
              padding: '8px 10px',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12
            }}
            title="Tải về bản sao lưu dữ liệu JSON"
          >
            <Icon name="download" size={14} /> Backup
          </button>

          <button
            onClick={() => setShowScriptModal(true)}
            className="action-button"
            style={{
              background: 'rgba(139,26,26,0.2)',
              color: 'var(--gold-mid)',
              border: '1px solid rgba(201,146,58,0.3)',
              padding: '8px 10px',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12
            }}
          >
            <Icon name="code" size={14} /> Script
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

      {/* Apps Script Setup Instructions Modal */}
      {showScriptModal && (
        <div className="modal-backdrop" onClick={() => setShowScriptModal(false)}>
          <div className="modal" style={{ maxWidth: 720, width: isMobile ? '95%' : '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head" style={{ borderBottom: '1px solid var(--border-gold)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 className="font-display" style={{ fontSize: 18, color: 'var(--gold-light)', margin: 0 }}>
                  Cấu Hình Google Apps Script
                </h2>
                <button onClick={() => setShowScriptModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <Icon name="x" size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: '16px 20px', maxHeight: '70vh', overflowY: 'auto', fontSize: 13, color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 12px' }}>
                Để ứng dụng web có thể tự động <strong>Thêm / Sửa / Xóa</strong> thành viên trực tiếp vào file Google Sheets, bạn hãy làm theo các bước:
              </p>

              <ol style={{ paddingLeft: 20, margin: '0 0 16px', lineHeight: 1.6 }}>
                <li>Mở file Google Sheet gia tộc của bạn (`ID: {SHEET_ID}`).</li>
                <li>Vào menu <strong>Tiện ích mở rộng (Extensions)</strong> &gt; chọn <strong>Apps Script</strong>.</li>
                <li>Dán toàn bộ đoạn mã bên dưới vào file <code style={{ color: 'var(--gold)' }}>Code.gs</code> rồi bấm <strong>Lưu (Save)</strong>.</li>
                <li>
                  Bấm <strong>Triển khai (Deploy)</strong> &gt; <strong>Triển khai dưới dạng ứng dụng web (New Deployment)</strong>:
                  <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                    <li><strong>Thực thi dưới danh nghĩa (Execute as):</strong> Chọn <i>Tôi (Me)</i>.</li>
                    <li><strong>Ai có quyền truy cập (Who has access):</strong> Chọn <i>Bất kỳ ai (Anyone)</i>.</li>
                  </ul>
                </li>
              </ol>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--gold-mid)' }}>Mã Nguồn Code.gs:</span>
                <button
                  onClick={copyAppsScriptCode}
                  style={{
                    background: copiedScript ? 'rgba(34,197,94,0.2)' : 'rgba(201,146,58,0.2)',
                    border: '1px solid var(--border-gold)',
                    color: copiedScript ? '#4ade80' : 'var(--gold-light)',
                    padding: '4px 12px',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Icon name={copiedScript ? 'check' : 'copy'} size={13} />
                  {copiedScript ? 'Đã sao chép!' : 'Sao chép mã Code.gs'}
                </button>
              </div>

              <pre style={{
                background: '#090909',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--r-sm)',
                padding: 12,
                fontSize: 11,
                fontFamily: 'Consolas, Monaco, monospace',
                color: '#e2e8f0',
                overflowX: 'auto',
                maxHeight: 280
              }}>
                {appsScriptCode}
              </pre>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-glass)', textAlign: 'right' }}>
              <button
                onClick={() => setShowScriptModal(false)}
                className="action-button"
                style={{ padding: '6px 16px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
