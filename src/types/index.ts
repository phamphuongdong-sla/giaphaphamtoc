export interface PersonNode {
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
}