import { Icon } from '@/components/ui/Icon';
import { MemberEntry } from '@/types';

interface NoticeBarProps {
  birthdays: { fullName: string; day: number; month: number; person?: MemberEntry }[];
  onSelectPerson?: (person: MemberEntry) => void;
}

export const NoticeBar = ({ birthdays, onSelectPerson }: NoticeBarProps) => {
  if (birthdays.length === 0) return null;

  const currentMonth = new Date().getMonth() + 1;

  // Duplicate items for seamless loop
  const items = [...birthdays, ...birthdays];

  return (
    <section className="notice" aria-label={`Sinh nhật tháng ${currentMonth}`}>
      <span className="notice-badge">
        <Icon name="cake" size={11} />
        Sinh nhật T.{currentMonth}
      </span>
      <div className="notice-ticker soft-edge-h">
        <div className="notice-ticker-track" aria-hidden="true">
          {items.map((m, i) => (
            <span
              key={i}
              onClick={() => m.person && onSelectPerson?.(m.person)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: m.person ? 'pointer' : 'default' }}
              title={m.person ? 'Bấm để xem tiểu sử chi tiết' : undefined}
            >
              <Icon name="sparkles" size={10} style={{ color: 'var(--gold)', opacity: 0.6 }} />
              {m.fullName}
              <span style={{ opacity: 0.5, fontSize: '10px' }}>
                ({String(m.day).padStart(2, '0')}/{String(m.month).padStart(2, '0')})
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};