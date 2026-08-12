import { useState, useEffect, useRef } from 'react';
import { PersonNode, MemberEntry } from '@/types';
import { cleanName, getNameRole, checkIsSpouseNode } from '@/utils/genealogyUtils';
import { formatBirthDisplay, formatDeathDisplay } from '@/utils/dateUtils';
import { Icon } from '@/components/ui/Icon';

interface MemberItemProps {
  data: PersonNode;
  level?: number;
  openTrigger?: { isOpen: boolean; version: number };
  onSelect: (person: MemberEntry) => void;
  parentNode?: PersonNode | null;
  gen?: number;
  branchName?: string;
  pathNodes?: PersonNode[];
  index?: number;
}

export const MemberItem = ({
  data,
  level = 0,
  openTrigger,
  onSelect,
  parentNode = null,
  gen = 1,
  branchName = '',
  pathNodes = [],
  index = 0,
}: MemberItemProps) => {
  const currentGen = (data as any).generation || gen;
  const [open, setOpen] = useState(level === 0);
  const lastVersionRef = useRef(openTrigger?.version || 0);

  if (!data || !data.name) return null;

  const hasChildren = data.children && data.children.length > 0;

  const isSpouseMember = checkIsSpouseNode(data);
  const currentBranch = data.branchLine || branchName;
  const currentPath = [...pathNodes, data];

  const person: MemberEntry = {
    id: currentPath.map(n => cleanName(n.name)).join(' > '),
    data,
    parentNode,
    gen: currentGen,
    branchName: currentBranch,
    pathNodes: currentPath,
    pathNames: currentPath.map(n => cleanName(n.name)),
    fullName: cleanName(data.name),
    searchText: data.name.toLowerCase(),
  };

  useEffect(() => {
    if (openTrigger && openTrigger.version !== lastVersionRef.current) {
      lastVersionRef.current = openTrigger.version;
      if (currentGen > 1 || level > 0) {
        setOpen(openTrigger.isOpen);
      }
    }
  }, [openTrigger, currentGen, level]);

  const nameRole = getNameRole(data.name);
  const badge = nameRole || (data.role && !getNameRole(data.name) ? data.role : '');

  // Đầy đủ ngày/tháng/năm theo đúng định dạng đã parse từ giapha.ts
  const birthText = formatBirthDisplay(data);
  const deathText = formatDeathDisplay(data);
  const hasBirth = !!(data.birthSolar || data.birthNote);
  const hasDeath = !!(data.deceased && (data.deathSolar || data.deathNote));

  // Màu chỉ dùng cho thanh nhỏ phân biệt đời (gen indicator), đổi sang tông vàng/đất/xanh lá để không nhầm với hồng/xanh của giới tính
  const genColors: Record<number, string> = {
    1: '#e05a47', // Red/Gold
    2: '#d4943a', // Orange/Brown
    3: '#3da870', // Green
    4: '#20b2aa', // Light Sea Green
    5: '#9060b8', // Purple
    6: '#ec4899', // Pink
    7: '#3b82f6', // Blue
    8: '#8b5cf6', // Indigo
  };
  const genColor = genColors[currentGen] || '#8b5cf6';

  return (
    <div style={{ position: 'relative', width: '100%', display: 'block' }}>
      {/* Connector dot - căn theo chiều cao dòng tên, không phụ thuộc số dòng ngày tháng */}
      {level > 0 && (
        <div className="member-connector-line" />
      )}

      {/* Row */}
      <div className={`member-row member-row-stacked micro-card-hover ${currentGen === 1 ? 'royal-ancestor-glow' : ''}`}>
        {/* Left: index + name + dates */}
        <div
          className="member-row-left"
          onClick={() => onSelect(person)}
        >
          {/* Index/spouse indicator */}
          <span className="member-index">
            {isSpouseMember ? (
              <span className="member-spouse-icon">⚭</span>
            ) : (
              <span style={{ fontSize: '9px', color: 'var(--text-faint)', fontFamily: 'monospace' }}>
                {index + 1}
              </span>
            )}
          </span>

          {/* Generation color indicator — co dãn theo toàn bộ chiều cao khối thông tin */}
          <div className="member-gen-bar" style={{ background: genColor }} />

          {/* Tên + vai vế + 2 dòng ngày sinh/ngày mất, xếp dọc để mở rộng nhánh con không ảnh hưởng layout dòng này */}
          <div className="member-info-col">
            <div className="member-name-row">
               <span className={`member-name ${data.gender === 'male' ? 'male' : (data.gender === 'female' ? 'female' : '')}`}>
                 {cleanName(data.name)}
                 </span>
                  {data.deceased && (
                    <Icon
                    name="cross"
                      size={11}
                          aria-label="Đã mất"
                        className="member-deceased-icon"
                        />
                      )}
                      {badge && <span className="member-role-badge">{badge}</span>}
            </div>

            {hasBirth && (
              <span className="member-dates-line">
                <Icon name="sun" size={10} style={{ marginRight: 4, verticalAlign: -1, opacity: 0.65 }} />
                {birthText}
              </span>
            )}
            {hasDeath && (
              <span className="member-dates-line">
                <Icon name="moon" size={10} style={{ marginRight: 4, verticalAlign: -1, opacity: 0.65 }} />
                {deathText}
              </span>
            )}
          </div>
        </div>

        {/* Toggle button */}
        {hasChildren && (
          <button
            className={`member-toggle${open ? ' open' : ''}`}
            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            aria-label={open ? 'Thu gọn' : 'Mở rộng'}
            aria-expanded={open}
          >
            <Icon name={open ? 'chevron-up' : 'chevron-down'} size={11} />
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div className="member-children">
          {data.children!.map((child, i) => {
            const nextGen = currentGen + (checkIsSpouseNode(child) ? 0 : 1);
            return (
              <MemberItem
                key={`${child.name}-${i}`}
                data={child}
                level={level + 1}
                openTrigger={openTrigger}
                onSelect={onSelect}
                parentNode={data}
                gen={nextGen}
                branchName={currentBranch}
                pathNodes={currentPath}
                index={i}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
