import { DateInfo } from '@/types';

export const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
export const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export const getCanChiYear = (year: number): string => {
  const can = CAN[(year + 6) % 10];
  const chi = CHI[(year + 8) % 12];
  return `${can} ${chi}`;
};
const VN_TIMEZONE = 7;
const INT = Math.floor;
const PI = Math.PI;

// ===== JULIAN DATE FUNCTIONS =====
export const jdFromDate = (dd: number, mm: number, yy: number): number => {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
};

export const jdToDate = (jd: number): { d: number; m: number; y: number } => {
  let a, b, c;
  if (jd > 2299160) {
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  return { d: day, m: month, y: year };
};

// ===== PUBLIC LUNAR FUNCTIONS =====
export const solarToLunar = (dd: number, mm: number, yy: number, timeZone: number = VN_TIMEZONE): {
  d: number;
  m: number;
  y: number;
  leap: boolean;
} => {
  const lunar = getLunarDate(dd, mm, yy);
  return { d: lunar.day, m: lunar.month, y: lunar.year, leap: lunar.leap };
};

export const lunarToSolar = (
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  lunarLeap: boolean = false,
  timeZone: number = VN_TIMEZONE
): { d: number; m: number; y: number } | null => {
  try {
    const solar = getSolarDate(lunarDay, lunarMonth, lunarYear, lunarLeap);
    if (!solar || !solar.day) return null;
    return { d: solar.day, m: solar.month, y: solar.year };
  } catch (err) {
    return null;
  }
};

// ===== GET TODAY LUNAR =====
export const getLunarToday = (): { d: number; m: number; y: number; leap: boolean; label: string } => {
  const current = new Date();
  const lunar = solarToLunar(current.getDate(), current.getMonth() + 1, current.getFullYear(), VN_TIMEZONE);
  return {
    ...lunar,
    label: `${lunar.d}/${lunar.m}${lunar.leap ? ' nhuận' : ''}/${lunar.y} Âm lịch`
  };
};

// ===== FORMAT FUNCTIONS =====
export const parseBirthText = (text: string): { solar: DateInfo | null; note: string } => {
  if (!text) return { solar: null, note: '' };
  const dateMatch = text.match(/(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?/);
  if (dateMatch) {
    const d = parseInt(dateMatch[1]);
    const m = parseInt(dateMatch[2]);
    const y = dateMatch[3] ? parseInt(dateMatch[3].length === 2 ? `19${dateMatch[3]}` : dateMatch[3]) : undefined;
    return { solar: { d, m, y }, note: text.replace(dateMatch[0], '').trim() };
  }
  const yearMatch = text.match(/\b(18|19|20)\d{2}\b/);
  if (yearMatch) {
    return { solar: { y: parseInt(yearMatch[0]) }, note: text.replace(yearMatch[0], '').trim() };
  }
  return { solar: null, note: text };
};

export const parseDeathText = (text: string): { solar: DateInfo | null; note: string } => {
  if (!text) return { solar: null, note: '' };
  const str = text.trim();
  // 1. Try YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    return { solar: { d, m, y }, note: str.replace(isoMatch[0], '').trim() };
  }
  // 2. Try DD-MM-YYYY or DD/MM/YYYY or DD-MM or DD/MM
  const dmyMatch = str.match(/\b(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?\b/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = dmyMatch[3] ? parseInt(dmyMatch[3].length === 2 ? `19${dmyMatch[3]}` : dmyMatch[3], 10) : undefined;
    return { solar: { d, m, y }, note: str.replace(dmyMatch[0], '').trim() };
  }
  // 3. Try Year only
  const yearMatch = str.match(/\b(18|19|20)\d{2}\b/);
  if (yearMatch) {
    return { solar: { y: parseInt(yearMatch[0], 10) }, note: str.replace(yearMatch[0], '').trim() };
  }
  return { solar: null, note: str };
};

export const formatBirthDisplay = (data: { birthSolar?: DateInfo | null; birthNote?: string }): string => {
  const parts: string[] = [];
  if (data.birthSolar) {
    const { d, m, y } = data.birthSolar;
    if (d && m && y) parts.push(`${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`);
    else if (d && m) parts.push(`${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`);
    else if (y) parts.push(`${y}`);
  }
  if (data.birthNote) parts.push(data.birthNote);
  return parts.length ? parts.join(' · ') : 'Chưa rõ';
};

export const formatDeathDisplay = (data: { deathSolar?: DateInfo | null; deathNote?: string }): string => {
  const parts: string[] = [];
  if (data.deathSolar) {
    const { d, m, y } = data.deathSolar;
    if (d && m && y) parts.push(`${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`);
    else if (d && m) parts.push(`${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`);
    else if (y) parts.push(`${y}`);
  }
  if (data.deathNote) parts.push(data.deathNote);
  return parts.length ? parts.join(' · ') : 'Chưa rõ';
};

export const getTodayLunar = (): string => {
  const today = getLunarToday();
  return today.label;
};

export const getDaysUntil = (targetDate: Date): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diff = targetDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ===== HÀM MỚI: TÍNH CHÍNH XÁC SỐ NGÀY ĐẾN NGÀY GIỖ ÂM LỊCH =====
export const getDaysUntilLunarAnniversary = (lunarDay: number, lunarMonth: number): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Chuyển đổi ngày Dương lịch hôm nay sang Âm lịch để lấy năm Âm lịch hiện hành
  const currentLunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear(), VN_TIMEZONE);
  let targetLunarYear = currentLunar.y;

  // 2. Thử tìm ngày Dương lịch tương ứng của ngày giỗ trong năm Âm lịch này
  let targetSolarObj = lunarToSolar(lunarDay, lunarMonth, targetLunarYear, false, VN_TIMEZONE);
  if (!targetSolarObj) return -1;

  let targetSolarDate = new Date(targetSolarObj.y, targetSolarObj.m - 1, targetSolarObj.d);
  targetSolarDate.setHours(0, 0, 0, 0);

  // 3. Nếu ngày giỗ Âm lịch của năm nay đã qua mất rồi, ta phải lấy ngày giỗ của năm Âm lịch kế tiếp (năm sau)
  if (targetSolarDate < today) {
    targetLunarYear += 1;
    targetSolarObj = lunarToSolar(lunarDay, lunarMonth, targetLunarYear, false, VN_TIMEZONE);
    if (targetSolarObj) {
      targetSolarDate = new Date(targetSolarObj.y, targetSolarObj.m - 1, targetSolarObj.d);
      targetSolarDate.setHours(0, 0, 0, 0);
    }
  }

  // 4. Tính khoảng cách số ngày thực tế giữa ngày Dương lịch đó với hôm nay
  const diffTime = targetSolarDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24)); 
};