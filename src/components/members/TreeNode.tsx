import React, { useState } from 'react';
import { PersonNode, MemberEntry } from '@/types';
import { cleanName, getNameRole, checkIsSpouseNode } from '@/utils/genealogyUtils';
import { formatBirthDisplay, formatDeathDisplay } from '@/utils/dateUtils';
import { Icon } from '@/components/ui/Icon';

interface TreeNodeProps {
  data: PersonNode;
  level?: number;
  onSelect: (person: MemberEntry) => void;
  parentNode?: PersonNode | null;
  gen?: number;
  branchName?: string;
  pathNodes?: PersonNode[];
}

export const TreeNode = ({
  data,
  level = 0,
  onSelect,
  parentNode = null,
  gen = 1,
  branchName = '',
  pathNodes = []
}: TreeNodeProps) => {
  const [open, setOpen] = useState(level < 1);
  const hasChildren = data.children && data.children.length > 0;
  const bDate = data.birthSolar;
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  const isBirthday = !data.deceased && bDate?.d && bDate?.m && bDate.m === currentMonth && bDate.d >= currentDay;
  const dark = level === 0;
  const branch = !!data.branchRoot;

  // Tính toán số đời chuẩn xác: Giữ nguyên đời cho vợ/chồng (gen + 0) và tăng đời cho con cái (gen + 1)
  const currentGen = parentNode === null ? 1 : gen + (checkIsSpouseNode(data) ? 0 : 1);
  
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
    fullName: '',
    searchText: ''
  };

  const nameRole = getNameRole(data.name);
  const badge = nameRole || (data.role && !getNameRole(data.name) ? data.role : '');

  const handleCardClick = () => {
    onSelect(person);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <div className={`tree-item ${level === 0 ? 'root-node' : ''}`}>
      <article
        className={`tree-card ${dark ? 'dark' : ''} ${branch ? 'branch' : ''} ${data.isSpouse ? 'spouse' : ''} ${isBirthday ? 'birthday' : ''} gen-${Math.min(currentGen, 5)}`}
        onClick={handleCardClick}
        style={{
          width: '300px',
          minWidth: '300px',
          maxWidth: '300px',
          height: '240px',
          minHeight: '240px',
          maxHeight: '240px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          margin: '0 auto'
        }}
      >
        {data.deceased && <div className="deceased-mark" />}
        {isBirthday && (
          <div className="birthday-ribbon">
            <Icon name="cake" size={10} /> Sinh nhật
          </div>
        )}
        <div 
          className="tree-card-content" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1, 
            height: '100%',
            overflow: 'hidden'
          }}
        >
          {/* Khu vực thông tin tự cuộn nếu dài */}
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <span className="gen-badge">Đời {currentGen}</span>
            {badge && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                <span className="title-pill">{badge}</span>
              </div>
            )}
            <h3 className="name font-display">{cleanName(data.name)}</h3>
            <div className="meta">
              {(data.birthSolar || data.birthNote) && (
                <span className="meta-item">
                  <Icon name="sun" size={12} />
                  Sinh: <b>{formatBirthDisplay(data)}</b>
                </span>
              )}
              {data.deceased && (data.deathSolar || data.deathNote) && (
                <span className="meta-item death">
                  <Icon name="moon" size={12} />
                  Mất: <b>{formatDeathDisplay(data)}</b>
                </span>
              )}
            </div>
            {data.bio && <div className="info">{data.bio}</div>}
          </div>

          {/* Nút toggle mở rộng/thu gọn đã được chỉnh rộng ra bằng khung thành viên */}
          {hasChildren && (
            <div style={{ marginTop: 'auto', flexShrink: 0, paddingTop: 8 }}>
              <button
                className="toggle-btn-tree"
                style={{
                  display: 'flex',
                  width: '100%',            // Đổi từ cố định sang 100% để tràn hết chiều ngang
                  height: 38,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,          // Bo góc nhẹ cho hài hòa khi nút kéo dài ra
                  background: 'rgba(184,137,60,0.12)',
                  border: '2px solid rgba(184,137,60,0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: 16
                }}
                onClick={handleToggle}
                aria-label={open ? 'Thu gọn' : 'Mở rộng'}
              >
                <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} />
              </button>
            </div>
          )}
        </div>
        {hasChildren && open && <div className="parent-line" />}
      </article>
      {hasChildren && open && (
        <div className="tree-branch">
          {data.children!.map((child, i) => (
            <TreeNode
              key={`${child.name}-${i}`}
              data={child}
              level={level + 1}
              onSelect={onSelect}
              parentNode={data}
              gen={currentGen}
              branchName={currentBranch}
              pathNodes={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};