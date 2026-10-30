export interface PersonNode {
  id?: string;
  name: string;
  birth?: string;
  death?: string;
  bio?: string;
  title?: string;
  branch?: string;
  deceased?: boolean;
  children?: PersonNode[];
  // computed
  branchLine?: string;
  branchRoot?: string;
  gender?: 'male' | 'female' | 'unknown';
  role?: string;
  isSpouse?: boolean;
  birthSolar?: DateInfo | null;
  birthNote?: string;
  deathSolar?: DateInfo | null;
  deathNote?: string;
}

export interface DateInfo {
  d?: number;
  m?: number;
  y?: number;
  source?: string;
}

export interface MemberEntry {
  id: string;
  data: PersonNode;
  parentNode: PersonNode | null;
  gen: number;
  branchName: string;
  pathNodes: PersonNode[];
  pathNames: string[];
  fullName: string;
  searchText: string;
}

export interface LichEvent {
  fullName: string;
  solarDay: number;
  solarMonth: number;
  days: number;
  type: 'gio' | 'sinh';
  lunarDay?: number;
  lunarMonth?: number;
  person?: MemberEntry;
  honorificName?: string;
  relationDetail?: string;
  tienThuongSolar?: string;
  chinhKySolar?: string;
}

export interface ReminderItem {
  fullName: string;
  displayName: string;
  honorificName: string;
  relationTitle?: string;
  generationLabel?: string;
  branchLabel?: string;
  date: string;
  days: number;
  person?: MemberEntry;
  solarDateStr?: string;
  weekdayFull?: string;
  weekdayShort?: string;
  solarDay?: number;
  solarMonth?: number;
  solarYear?: number;
  isSpecialDay?: boolean;
  specialDayType?: string;
  specialDayTitle?: string;
  specialDayDesc?: string;
  tienThuongLunar?: string;
  tienThuongSolar?: string;
  tienThuongWeekday?: string;
  chinhKyLunar?: string;
  chinhKySolar?: string;
  chinhKyWeekday?: string;
  ageLabel?: string;
  birthDisplay?: string;
  deathDisplay?: string;
  bio?: string;
  lunarDay?: number;
  lunarMonth?: number;
}