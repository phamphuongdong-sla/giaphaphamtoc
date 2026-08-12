import { useMemo } from 'react';
import { MemberEntry } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { formatBranchName, checkIsSpouseNode } from '@/utils/genealogyUtils';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface DashboardViewProps {
  memberEntries: MemberEntry[];
  onSelectPerson?: (person: MemberEntry) => void;
}

const GENDER_COLORS = ['#60a5fa', '#f472b6', '#94a3b8'];
const BRANCH_COLORS = ['#D4AF37', '#8B1A1A', '#3da870', '#3b82f6', '#ec4899', '#8b5cf6'];

// Smart helper to parse full birth date (DD/MM/YYYY or YYYY) into Date object
const parseFullBirthDate = (node: any): Date | null => {
  if (node.birthSolar?.y) {
    const y = node.birthSolar.y;
    const m = node.birthSolar.m || 7;
    const d = node.birthSolar.d || 1;
    return new Date(y, m - 1, d);
  }

  const text = (node.birth || '').toString().trim();
  if (!text) return null;

  // Format DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y > 1400) {
      return new Date(y, m - 1, d);
    }
  }

  // Format YYYY
  const yearMatch = text.match(/\b(15|16|17|18|19|20)\d{2}\b/);
  if (yearMatch) {
    const y = parseInt(yearMatch[0], 10);
    return new Date(y, 6, 1); // Mid year default
  }

  return null;
};

// Smart helper to parse death date into Date object
const parseFullDeathDate = (node: any): Date | null => {
  if (node.deathSolar?.y) {
    const y = node.deathSolar.y;
    const m = node.deathSolar.m || 7;
    const d = node.deathSolar.d || 1;
    return new Date(y, m - 1, d);
  }

  const text = (node.death || '').toString().trim();
  if (!text) return null;

  const dmyMatch = text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y > 1400) {
      return new Date(y, m - 1, d);
    }
  }

  const yearMatch = text.match(/\b(15|16|17|18|19|20)\d{2}\b/);
  if (yearMatch) {
    const y = parseInt(yearMatch[0], 10);
    return new Date(y, 6, 1);
  }

  return null;
};

// Calculate exact age in years between two dates
const getAgeFromBirthDate = (birthDate: Date, deathDate?: Date | null): number => {
  const refDate = deathDate || new Date();
  let age = refDate.getFullYear() - birthDate.getFullYear();
  const mDiff = refDate.getMonth() - birthDate.getMonth();
  if (mDiff < 0 || (mDiff === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
};

const extractMonthFromText = (text?: string): number | null => {
  if (!text) return null;
  const match = text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (match) {
    const m = parseInt(match[2], 10);
    if (m >= 1 && m <= 12) return m;
  }
  return null;
};

const safePercent = (val: number, total: number): number => {
  if (!total || total === 0) return 0;
  const p = Math.round((val / total) * 100);
  return isNaN(p) ? 0 : p;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const dataKey = item.dataKey;
    const isLifespan = dataKey === 'lifespan';

    return (
      <div style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-gold-md)',
        borderRadius: 8,
        padding: '8px 14px',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--text-primary)'
      }}>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{label || item.name}</strong>
        </p>
        {isLifespan ? (
          <>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-primary)' }}>
              Tuổi thọ TB: <strong style={{ color: 'var(--gold)', fontSize: 15 }}>{item.value} tuổi</strong>
            </p>
            {item.payload?.count !== undefined && (
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                Số lượng: {item.payload.count} người
              </p>
            )}
          </>
        ) : (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-primary)' }}>
            Số lượng: <strong style={{ color: 'var(--gold)', fontSize: 15 }}>{item.value} người</strong>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const DashboardView = ({ memberEntries = [], onSelectPerson }: DashboardViewProps) => {
  const stats = useMemo(() => {
    const total = memberEntries ? memberEntries.length : 0;
    let deceasedCount = 0;
    let maleCount = 0;
    let femaleCount = 0;
    let maxGen = 0;

    let spouseCount = 0;
    let mainLineCount = 0;

    let totalLifespan = 0;
    let deceasedWithAgeCount = 0;
    
    let maleLifespanTotal = 0;
    let maleDeceasedWithAgeCount = 0;
    
    let femaleLifespanTotal = 0;
    let femaleDeceasedWithAgeCount = 0;

    let oldestDeceased: { name: string; age: number; person: MemberEntry } | null = null;
    let oldestLiving: { name: string; age: number; birthTime: number; person: MemberEntry } | null = null;
    let youngestLiving: { name: string; age: number; birthTime: number; person: MemberEntry } | null = null;

    const branchCounts: Record<string, number> = {};
    const genCounts: Record<number, { total: number; alive: number; dead: number }> = {};
    const genLifespanCounts: Record<number, { totalAge: number; count: number }> = {};
    const monthCounts: Record<number, number> = {};

    const ageDistribution = [
      { name: '0-10', count: 0 },
      { name: '11-20', count: 0 },
      { name: '21-30', count: 0 },
      { name: '31-40', count: 0 },
      { name: '41-50', count: 0 },
      { name: '51-60', count: 0 },
      { name: '61-70', count: 0 },
      { name: '71-80', count: 0 },
      { name: '81+', count: 0 },
    ];

    const today = new Date();

    if (memberEntries && memberEntries.length > 0) {
      memberEntries.forEach(entry => {
        const node = entry.data || (entry as any);
        
        // 1. Deceased Check
        const rawIsDead = (node.deceased || (node as any).isDead || '').toString().trim();
        const rawDeath = (node.death || '').toString().trim();
        const isDeceased = rawIsDead !== '' || rawDeath !== '' || !!node.deathSolar || !!node.deceased;

        if (isDeceased) deceasedCount++;

        // 2. Spouse / Vợ / Chồng / Dâu / Rể Check
        const isSpouseNode = checkIsSpouseNode(node);
        if (isSpouseNode) spouseCount++;
        else mainLineCount++;

        // 3. Gender Check (Nam/Nữ, Male/Female, M/F)
        const genderStr = (node.gender || '').toString().toLowerCase().trim();
        const isMale = genderStr === 'male' || genderStr === 'nam' || genderStr === 'm' || genderStr.startsWith('nam');
        const isFemale = genderStr === 'female' || genderStr === 'nữ' || genderStr === 'nu' || genderStr === 'f' || genderStr.startsWith('nữ') || genderStr.startsWith('nu');

        if (isMale) maleCount++;
        else if (isFemale) femaleCount++;

        // 4. Generation Breakdown
        const genNum = entry.gen || 1;
        if (genNum > maxGen) maxGen = genNum;

        if (!genCounts[genNum]) genCounts[genNum] = { total: 0, alive: 0, dead: 0 };
        genCounts[genNum].total++;
        if (isDeceased) genCounts[genNum].dead++;
        else genCounts[genNum].alive++;

        // 5. Branch Counts
        const rawBranch = entry.branchName || node.branch || '';
        const branchName = formatBranchName(rawBranch);
        branchCounts[branchName] = (branchCounts[branchName] || 0) + 1;

        // 6. Birth Month Tracking
        const birthMonth = extractMonthFromText(node.birth);
        if (birthMonth) {
          monthCounts[birthMonth] = (monthCounts[birthMonth] || 0) + 1;
        }

        // 7. LIFESPAN CALCULATION (FOR ALL DECEASED MEMBERS INCL. DÂU/RỂ)
        const birthDate = parseFullBirthDate(node);
        const deathDate = parseFullDeathDate(node);

        if (isDeceased) {
          if (birthDate && deathDate && birthDate.getFullYear() > 1400 && deathDate >= birthDate) {
            const lifespan = getAgeFromBirthDate(birthDate, deathDate);
            if (lifespan >= 0 && lifespan <= 120) {
              totalLifespan += lifespan;
              deceasedWithAgeCount++;

              if (isMale) {
                maleLifespanTotal += lifespan;
                maleDeceasedWithAgeCount++;
              } else if (isFemale) {
                femaleLifespanTotal += lifespan;
                femaleDeceasedWithAgeCount++;
              }

              if (!oldestDeceased || lifespan > oldestDeceased.age) {
                oldestDeceased = { name: entry.fullName || node.name, age: lifespan, person: entry };
              }

              // Gen Lifespan Tracking
              if (!genLifespanCounts[genNum]) {
                genLifespanCounts[genNum] = { totalAge: 0, count: 0 };
              }
              genLifespanCounts[genNum].totalAge += lifespan;
              genLifespanCounts[genNum].count += 1;
            }
          }
        } else {
          // Living Member
          if (birthDate && birthDate.getFullYear() > 1400 && birthDate <= today) {
            const birthTime = birthDate.getTime();
            const livingAge = getAgeFromBirthDate(birthDate, today);
            if (livingAge >= 0 && livingAge <= 120) {
              // Age Distribution
              if (livingAge <= 10) ageDistribution[0].count++;
              else if (livingAge <= 20) ageDistribution[1].count++;
              else if (livingAge <= 30) ageDistribution[2].count++;
              else if (livingAge <= 40) ageDistribution[3].count++;
              else if (livingAge <= 50) ageDistribution[4].count++;
              else if (livingAge <= 60) ageDistribution[5].count++;
              else if (livingAge <= 70) ageDistribution[6].count++;
              else if (livingAge <= 80) ageDistribution[7].count++;
              else ageDistribution[8].count++;

              // Oldest Living -> Smallest birthTime (Earliest Birth Date)
              if (!oldestLiving || birthTime < oldestLiving.birthTime) {
                oldestLiving = { name: entry.fullName || node.name, age: livingAge, birthTime, person: entry };
              }

              // Youngest Living -> Largest birthTime (Most Recent Birth Date)
              if (!youngestLiving || birthTime > youngestLiving.birthTime) {
                youngestLiving = { name: entry.fullName || node.name, age: livingAge, birthTime, person: entry };
              }
            }
          }
        }
      });
    }

    const averageLifespan = deceasedWithAgeCount > 0 ? Math.round(totalLifespan / deceasedWithAgeCount) : 0;
    const avgMaleLifespan = maleDeceasedWithAgeCount > 0 ? Math.round(maleLifespanTotal / maleDeceasedWithAgeCount) : 0;
    const avgFemaleLifespan = femaleDeceasedWithAgeCount > 0 ? Math.round(femaleLifespanTotal / femaleDeceasedWithAgeCount) : 0;

    const unknownGenderCount = total > (maleCount + femaleCount) ? total - maleCount - femaleCount : 0;

    const genderData = [
      { name: 'Nam (♂)', value: maleCount },
      { name: 'Nữ (♀)', value: femaleCount },
      { name: 'Chưa rõ', value: unknownGenderCount }
    ].filter(d => d.value > 0);

    const lifespanGenderData = [
      { name: 'Nam giới (♂)', lifespan: avgMaleLifespan, count: maleDeceasedWithAgeCount },
      { name: 'Nữ giới (♀)', lifespan: avgFemaleLifespan, count: femaleDeceasedWithAgeCount },
      { name: 'Toàn Tộc', lifespan: averageLifespan, count: deceasedWithAgeCount }
    ];

    const branchData = Object.entries(branchCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const genData = Object.entries(genCounts)
      .map(([gen, val]) => ({ name: `Đời ${gen}`, ...val }))
      .sort((a, b) => parseInt(a.name.replace('Đời ', ''), 10) - parseInt(b.name.replace('Đời ', ''), 10));

    const genLifespanData = [];
    for (let g = 1; g <= maxGen; g++) {
      const val = genLifespanCounts[g] || { totalAge: 0, count: 0 };
      const totalDeadInGen = genCounts[g]?.dead || 0;
      genLifespanData.push({
        gen: g,
        name: `Đời ${g}`,
        lifespan: val.count > 0 ? Math.round(val.totalAge / val.count) : 0,
        count: val.count,
        totalDead: totalDeadInGen
      });
    }

    let peakMonth = 0;
    let maxMonthCount = 0;
    Object.entries(monthCounts).forEach(([m, count]) => {
      if (count > maxMonthCount) {
        maxMonthCount = count;
        peakMonth = parseInt(m, 10);
      }
    });

    let peakGenName = 'Đời 1';
    let peakGenCount = 0;
    genData.forEach(g => {
      if (g.total > peakGenCount) {
        peakGenCount = g.total;
        peakGenName = g.name;
      }
    });

    return {
      total,
      deceasedCount,
      aliveCount: total - deceasedCount,
      alivePercentage: safePercent(total - deceasedCount, total),
      maxGen,
      maleCount,
      femaleCount,
      unknownGenderCount,
      spouseCount,
      mainLineCount,
      genderData,
      lifespanGenderData,
      genLifespanData,
      ageDistribution,
      branchData,
      genData,
      peakGenName,
      peakGenCount,
      avgMaleLifespan,
      avgFemaleLifespan,
      averageLifespan,
      maleDeceasedWithAgeCount,
      femaleDeceasedWithAgeCount,
      oldestDeceased: oldestDeceased as { name: string; age: number; person: MemberEntry } | null,
      oldestLiving: oldestLiving as { name: string; age: number; person: MemberEntry } | null,
      youngestLiving: youngestLiving as { name: string; age: number; person: MemberEntry } | null,
      peakMonth,
      maxMonthCount
    };
  }, [memberEntries]);

  // Loading Fallback
  if (!memberEntries || memberEntries.length === 0) {
    return (
      <div className="list-scroll" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--gold-mid)' }}>
        <Icon name="sparkles" size={32} style={{ animation: 'spin 1.5s linear infinite', marginBottom: 12 }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold-light)' }}>Đang tải & Tổng hợp Dữ liệu Thống Kê...</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Vui lòng đợi trong giây lát</div>
      </div>
    );
  }

  return (
    <div className="list-scroll">
      <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: 60 }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', paddingTop: 10 }}>
          <p className="section-kicker">Phân tích & Thống kê Chuyên sâu</p>
          <h2 className="font-display" style={{ color: 'var(--gold-light)', fontSize: 'clamp(22px, 3.5vw, 32px)', margin: '4px 0 0' }}>
            Tổng Quan Gia Tộc Phạm Tộc
          </h2>
        </div>

        {/* 1. Stat Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12 }}>
          <div className="stat-card">
            <Icon name="users" size={22} style={{ color: 'var(--gold)' }} />
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng số thành viên</div>
          </div>
          <div className="stat-card">
            <Icon name="user-check" size={22} style={{ color: '#3da870' }} />
            <div className="stat-value" style={{ color: '#3da870' }}>{stats.aliveCount}</div>
            <div className="stat-label">Đang còn sống ({stats.alivePercentage}%)</div>
          </div>
          <div className="stat-card">
            <Icon name="user-x" size={22} style={{ color: 'var(--red-light)' }} />
            <div className="stat-value" style={{ color: 'var(--red-light)' }}>{stats.deceasedCount}</div>
            <div className="stat-label">Đã mất</div>
          </div>
          <div className="stat-card">
            <Icon name="git-commit" size={22} style={{ color: 'var(--gold-mid)' }} />
            <div className="stat-value">{stats.maxGen}</div>
            <div className="stat-label">Số đời (Thế hệ)</div>
          </div>
          <div className="stat-card">
            <Icon name="heart" size={22} style={{ color: '#f472b6' }} />
            <div className="stat-value" style={{ color: '#f472b6' }}>{stats.spouseCount}</div>
            <div className="stat-label">Dâu, Rể</div>
          </div>
        </div>

        {/* 2. TUỔI THỌ NAM GIỚI & NỮ GIỚI */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--r-md)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Icon name="award" size={22} style={{ color: 'var(--gold)' }} />
            <h3 className="font-display" style={{ margin: 0, fontSize: 18, color: 'var(--gold-light)' }}>
              Phân Tích Tuổi Thọ Trung Bình
            </h3>
          </div>

          {/* Cards Lifespan Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14, marginBottom: 20 }}>
            {/* Nam */}
            <div style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.35)',
              borderRadius: 'var(--r-md)',
              padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
                  ♂ Tuổi Thọ TB Nam Giới
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stats.maleDeceasedWithAgeCount} thành viên Nam</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#93c5fd', marginTop: 4 }}>
                {stats.avgMaleLifespan > 0 ? `${stats.avgMaleLifespan} tuổi` : 'Chưa rõ'}
              </div>
              {/* Visual Progress Bar */}
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(stats.avgMaleLifespan, 100)}%`, height: '100%', background: '#60a5fa', borderRadius: 3 }} />
              </div>
            </div>

            {/* Nữ */}
            <div style={{
              background: 'rgba(236,72,153,0.1)',
              border: '1px solid rgba(236,72,153,0.35)',
              borderRadius: 'var(--r-md)',
              padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#f472b6', fontWeight: 700, textTransform: 'uppercase' }}>
                  ♀ Tuổi Thọ TB Nữ Giới
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stats.femaleDeceasedWithAgeCount} thành viên Nữ</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fbcfe8', marginTop: 4 }}>
                {stats.avgFemaleLifespan > 0 ? `${stats.avgFemaleLifespan} tuổi` : 'Chưa rõ'}
              </div>
              {/* Visual Progress Bar */}
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(stats.avgFemaleLifespan, 100)}%`, height: '100%', background: '#f472b6', borderRadius: 3 }} />
              </div>
            </div>

            {/* Toàn tộc */}
            <div style={{
              background: 'rgba(201,146,58,0.1)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--r-md)',
              padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--gold-mid)', fontWeight: 700, textTransform: 'uppercase' }}>
                  🌳 Tuổi Thọ TB Toàn Tộc
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stats.maleDeceasedWithAgeCount + stats.femaleDeceasedWithAgeCount} thành viên</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold-light)', marginTop: 4 }}>
                {stats.averageLifespan > 0 ? `${stats.averageLifespan} tuổi` : 'Chưa rõ'}
              </div>
              {/* Visual Progress Bar */}
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(stats.averageLifespan, 100)}%`, height: '100%', background: 'var(--gold)', borderRadius: 3 }} />
              </div>
            </div>
          </div>

          {/* Recharts BarChart Lifespan */}
          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.lifespanGenderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <RechartsTooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} content={<CustomTooltip />} />
                <Bar dataKey="lifespan" fill="var(--gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, marginBottom: 0, textAlign: 'center', fontStyle: 'italic' }}>
            * Chú thích: Tuổi thọ trung bình được tính cho tất cả thành viên đã mất có đầy đủ thông tin năm sinh & năm mất (bao gồm cả Dâu/Rể).
          </p>
        </div>

        {/* 2b. TUỔI THỌ TRUNG BÌNH THEO ĐỜI (THẾ HỆ) */}
        {stats.genLifespanData.length > 0 && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--r-md)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon name="trending-up" size={22} style={{ color: '#38bdf8' }} />
              <div>
                <h3 className="font-display" style={{ margin: 0, fontSize: 18, color: 'var(--gold-light)' }}>
                  Tuổi Thọ Trung Bình Theo Từng Đời (Thế Hệ)
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Biến đổi tuổi thọ qua các thế hệ gia tộc (Bao gồm cả Dâu/Rể)
                </span>
              </div>
            </div>

            {/* Recharts BarChart Lifespan by Generation */}
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.genLifespanData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="lifespan" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Badges Breakdown */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
              {stats.genLifespanData.map((g) => {
                const hasDeceasedWithAge = g.count > 0;
                const hasDeceasedWithoutAge = !hasDeceasedWithAge && g.totalDead > 0;
                return (
                  <div key={g.name} style={{
                    background: hasDeceasedWithAge
                      ? 'rgba(56,189,248,0.1)'
                      : (hasDeceasedWithoutAge ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.03)'),
                    border: `1px solid ${
                      hasDeceasedWithAge
                        ? 'rgba(56,189,248,0.3)'
                        : (hasDeceasedWithoutAge ? 'rgba(234,179,8,0.35)' : 'rgba(255,255,255,0.1)')
                    }`,
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <strong style={{
                      color: hasDeceasedWithAge
                        ? '#38bdf8'
                        : (hasDeceasedWithoutAge ? '#eab308' : 'var(--text-muted)')
                    }}>
                      {g.name}:
                    </strong>
                    {hasDeceasedWithAge ? (
                      <>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{g.lifespan} tuổi</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({g.count} người đã mất)</span>
                      </>
                    ) : hasDeceasedWithoutAge ? (
                      <span style={{ color: '#fef08a', fontSize: 11 }}>
                        {g.totalDead} người đã mất (Chưa ghi năm sinh/năm mất)
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic' }}>
                        Tất cả đang còn sống (0 người mất)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Featured People Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {stats.oldestDeceased && (
            <div 
              className="stat-card"
              onClick={() => onSelectPerson?.(stats.oldestDeceased!.person)}
              style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center', flexDirection: 'row' }}
              title="Bấm để xem tiểu sử chi tiết"
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(139,26,26,0.2)', border: '1px solid rgba(139,26,26,0.4)',
                display: 'grid', placeItems: 'center', flexShrink: 0
              }}>
                <Icon name="award" size={22} style={{ color: 'var(--gold-light)' }} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-mid)', letterSpacing: '0.06em' }}>
                  Thành Viên Hưởng Thọ Cao Nhất
                </span>
                <h4 className="font-serif" style={{ fontSize: 15, margin: '2px 0 0', color: 'var(--text-primary)' }}>
                  {stats.oldestDeceased.name}
                </h4>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Hưởng thọ <strong style={{ color: 'var(--gold)' }}>{stats.oldestDeceased.age}</strong> tuổi
                </span>
              </div>
            </div>
          )}

          {stats.oldestLiving && (
            <div 
              className="stat-card"
              onClick={() => onSelectPerson?.(stats.oldestLiving!.person)}
              style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center', flexDirection: 'row' }}
              title="Bấm để xem thông tin chi tiết"
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(201,146,58,0.15)', border: '1px solid var(--border-gold)',
                display: 'grid', placeItems: 'center', flexShrink: 0
              }}>
                <Icon name="user-check" size={22} style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.06em' }}>
                  Cao Tuổi Nhất (Đang sống)
                </span>
                <h4 className="font-serif" style={{ fontSize: 15, margin: '2px 0 0', color: 'var(--text-primary)' }}>
                  {stats.oldestLiving.name}
                </h4>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Mừng thọ <strong style={{ color: 'var(--gold-mid)' }}>{stats.oldestLiving.age}</strong> tuổi
                </span>
              </div>
            </div>
          )}

          {stats.youngestLiving && (
            <div 
              className="stat-card"
              onClick={() => onSelectPerson?.(stats.youngestLiving!.person)}
              style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center', flexDirection: 'row' }}
              title="Bấm để xem thông tin chi tiết"
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(61,168,112,0.15)', border: '1px solid rgba(61,168,112,0.3)',
                display: 'grid', placeItems: 'center', flexShrink: 0
              }}>
                <Icon name="sparkles" size={22} style={{ color: '#3da870' }} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#3da870', letterSpacing: '0.06em' }}>
                  Nhỏ Tuổi Nhất (Đang sống)
                </span>
                <h4 className="font-serif" style={{ fontSize: 15, margin: '2px 0 0', color: 'var(--text-primary)' }}>
                  {stats.youngestLiving.name}
                </h4>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <strong style={{ color: '#3da870' }}>
                    {stats.youngestLiving.age > 0 ? `${stats.youngestLiving.age} tuổi` : 'Dưới 1 tuổi (Mới sinh)'}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Gender & Age Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {/* Gender */}
          <div className="chart-container">
            <h3 className="chart-title font-display">Cơ Cấu Giới Tính Gia Tộc</h3>
            <div style={{ width: '100%', height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.genderData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.genderData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
              {stats.genderData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: GENDER_COLORS[index % GENDER_COLORS.length] }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {entry.name}: <strong>{entry.value} người</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Age Distribution */}
          <div className="chart-container">
            <h3 className="chart-title font-display">Phân Bố Độ Tuổi Thành Viên Đang Sống</h3>
            <div style={{ width: '100%', height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="var(--gold-mid)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 5. Branch & Generation Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {/* Branch List Bars */}
          <div className="chart-container">
            <h3 className="chart-title font-display">Số Lượng Thành Viên Theo Chi Nhánh</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {stats.branchData.map((branch, idx) => (
                <div key={branch.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--gold-light)' }}>{branch.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{branch.count} người ({safePercent(branch.count, stats.total)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${safePercent(branch.count, stats.branchData[0]?.count || 1)}%`,
                      height: '100%',
                      background: BRANCH_COLORS[idx % BRANCH_COLORS.length],
                      borderRadius: 4
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generations Bar Chart */}
          <div className="chart-container">
            <h3 className="chart-title font-display">Phân Bố Thành Viên Theo Thế Hệ (Đời)</h3>
            <div style={{ width: '100%', height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.genData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 6. Highlighted Facts */}
        <div className="interesting-facts">
          <h3 className="chart-title" style={{ marginBottom: 16 }}>Chỉ Số Nổi Bật Tộc Phả</h3>
          
          <div className="fact-row">
            <div className="fact-icon"><Icon name="git-branch" size={16} /></div>
            <div className="fact-content">
              <div className="fact-label">Chi nhánh gia tộc lớn nhất</div>
              <div className="fact-value">
                {stats.branchData[0]?.name || 'Gốc Gia Tộc'} ({stats.branchData[0]?.count || 0} thành viên - chiếm {safePercent(stats.branchData[0]?.count || 0, stats.total)}% toàn tộc)
              </div>
            </div>
          </div>

          <div className="fact-row">
            <div className="fact-icon"><Icon name="heart" size={16} /></div>
            <div className="fact-content">
              <div className="fact-label">Thành viên Chính tộc vs Dâu, Rể</div>
              <div className="fact-value">
                {stats.mainLineCount} người chính tộc ({safePercent(stats.mainLineCount, stats.total)}%) · {stats.spouseCount} dâu, rể ({safePercent(stats.spouseCount, stats.total)}%)
              </div>
            </div>
          </div>

          {stats.peakMonth > 0 && (
            <div className="fact-row">
              <div className="fact-icon"><Icon name="calendar" size={16} /></div>
              <div className="fact-content">
                <div className="fact-label">Tháng sinh đông nhất trong năm</div>
                <div className="fact-value">
                  Tháng {stats.peakMonth} ({stats.maxMonthCount} thành viên sinh tháng này)
                </div>
              </div>
            </div>
          )}

          <div className="fact-row">
            <div className="fact-icon"><Icon name="user-check" size={16} /></div>
            <div className="fact-content">
              <div className="fact-label">Thành viên thế hệ đông nhất</div>
              <div className="fact-value">
                {stats.peakGenName} (với {stats.peakGenCount} thành viên)
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
