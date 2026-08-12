import { useState } from 'react';
import { PersonNode, MemberEntry, LichEvent } from '@/types';
import { getAllLichData } from '@/utils/genealogyUtils';
import { downloadCalendarEvent } from '@/utils/calendarUtils';
import { Icon } from '@/components/ui/Icon';

interface LichViewProps {
  treeData: PersonNode;
  onSelectPerson?: (person: MemberEntry) => void;
}

const MONTH_NAMES = ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12'];
const WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WEEKDAYS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export const LichView = ({ treeData, onSelectPerson }: LichViewProps) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const lichData = getAllLichData(treeData, year);

  const gioThisMonth = lichData.gio
    .filter(e => e.solarMonth === month)
    .sort((a, b) => a.solarDay - b.solarDay);

  const sinhThisMonth = lichData.sinh
    .filter(e => e.solarMonth === month)
    .sort((a, b) => a.solarDay - b.solarDay);

  const getBadge = (e: LichEvent) => {
    if (e.days === 0)        return { cls: 'today',  label: 'Hôm nay' };
    if (e.days > 0 && e.days <= 7) return { cls: 'soon', label: `${e.days} ngày nữa` };
    if (e.days > 0)         return { cls: 'future', label: `${e.days} ngày nữa` };
    return                        { cls: 'past',   label: 'Đã qua' };
  };

  const LichRow = ({ e }: { e: LichEvent }) => {
    const badge = getBadge(e);
    const [downloaded, setDownloaded] = useState(false);

    const solarDate = new Date(year, e.solarMonth - 1, e.solarDay);
    const dayOfWeek = solarDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekdayShort = WEEKDAYS_SHORT[dayOfWeek];
    const weekdayFull = WEEKDAYS_FULL[dayOfWeek];

    return (
      <div
        className="lich-row"
        onClick={() => e.person && onSelectPerson?.(e.person)}
        style={{ cursor: e.person ? 'pointer' : 'default' }}
        title={e.person ? 'Bấm để xem tiểu sử chi tiết' : undefined}
      >
        <div 
          className="lich-day"
          style={isWeekend ? { borderColor: 'rgba(201, 146, 58, 0.4)', background: 'rgba(201, 146, 58, 0.08)' } : undefined}
        >
          <span style={{ fontSize: '10px', fontWeight: 700, color: isWeekend ? 'var(--gold-mid)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
            {weekdayShort}
          </span>
          <span className="lich-day-num">{e.solarDay}</span>
          <span className="lich-day-label">Th.{e.solarMonth}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          <p className="lich-name font-serif">{e.fullName}</p>
          <p className="lich-meta">
            {e.type === 'gio'
              ? <>&#127761; Giỗ âm lịch: <strong style={{ color: 'var(--gold-mid)' }}>{e.lunarDay}/{e.lunarMonth} AL</strong> &middot; Dương: <strong>{weekdayFull}</strong>, {e.solarDay}/{e.solarMonth}/{year}</>
              : <>&#127874; Sinh nhật dương: <strong>{weekdayFull}</strong>, {e.solarDay}/{e.solarMonth}/{year}</>}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', flexShrink: 0 }}>
          <span className={`lich-days-badge ${badge.cls}`}>{badge.label}</span>
          <button 
            onClick={(evt) => {
              evt.stopPropagation();
              downloadCalendarEvent(e, year);
              setDownloaded(true);
              setTimeout(() => setDownloaded(false), 2000);
            }}
            title="Tải tệp lịch (.ics) để thêm vào Google Calendar / Apple Calendar"
            style={{ 
              fontSize: '10px',
              fontWeight: 600,
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              background: downloaded ? 'rgba(61,168,112,0.2)' : 'var(--bg-glass-md)', 
              padding: '3px 8px', 
              borderRadius: '6px', 
              border: '1px solid ' + (downloaded ? '#3da870' : 'var(--border-gold)'), 
              color: downloaded ? '#3da870' : 'var(--gold-mid)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon name={downloaded ? 'check' : 'calendar'} size={11} />
            {downloaded ? 'Đã lưu' : 'Lưu lịch'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="lich-scroll">
      <div className="lich-inner">

        {/* Toolbar */}
        <div className="toolbar">
          <div>
            <p className="section-kicker">Âm lịch · Dương lịch</p>
            <h2 className="section-title font-display">Lịch giỗ &amp; Sinh nhật</h2>
          </div>
        </div>

        {/* Hint */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 2px',
          marginBottom: 10,
        }}>
          <Icon name="info" size={10} style={{ color: 'var(--gold)', opacity: 0.5, flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Bấm vào ngày giỗ hoặc sinh nhật để xem tiểu sử chi tiết
          </span>
        </div>

        {/* Year nav */}
        <div className="lich-year-nav">
          <button className="lich-year-btn" onClick={() => setYear(y => y - 1)} aria-label="Năm trước">
            <Icon name="chevron-left" size={18} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <span className="lich-year-label font-display">Năm {year}</span>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>
              {lichData.gio.length} ngày giỗ · {lichData.sinh.length} sinh nhật
            </p>
          </div>
          <button className="lich-year-btn" onClick={() => setYear(y => y + 1)} aria-label="Năm sau">
            <Icon name="chevron-right" size={18} />
          </button>
        </div>

        {/* Month tabs */}
        <div className="lich-tab-row">
          {Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const hasGio  = lichData.gio.some(e => e.solarMonth === m);
            const hasSinh = lichData.sinh.some(e => e.solarMonth === m);
            return (
              <button
                key={m}
                className={`lich-tab-btn${month === m ? ' active' : ''}`}
                onClick={() => setMonth(m)}
                aria-pressed={month === m}
              >
                {MONTH_NAMES[i]}
                {(hasGio || hasSinh) && <span className="dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {/* Ngày giỗ */}
        <div className="lich-section">
          <div className="lich-section-head gio">
            <Icon name="moon" size={13} />
            Ngày giỗ (Âm lịch) · Tháng {month} · {gioThisMonth.length} ngày
          </div>
          <div className="lich-rows">
            {gioThisMonth.length
              ? gioThisMonth.map((e, i) => <LichRow key={i} e={e} />)
              : <p className="lich-empty">Không có ngày giỗ trong tháng này</p>
            }
          </div>
        </div>

        {/* Sinh nhật */}
        <div className="lich-section">
          <div className="lich-section-head sinh">
            <Icon name="cake" size={13} />
            Sinh nhật (Dương lịch) · Tháng {month} · {sinhThisMonth.length} người
          </div>
          <div className="lich-rows">
            {sinhThisMonth.length
              ? sinhThisMonth.map((e, i) => <LichRow key={i} e={e} />)
              : <p className="lich-empty">Không có sinh nhật trong tháng này</p>
            }
          </div>
        </div>

        </div>
    </div>
  );
};