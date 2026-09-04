import { useState } from 'react';
import { PersonNode, MemberEntry } from '@/types';
import { MemberItem } from '@/components/members/MemberItem';
import { SearchPanel } from '@/components/members/SearchPanel';
import { Icon } from '@/components/ui/Icon';
import { GIA_PHA_LAST_UPDATED } from '@/utils/dateUtils';

interface ListViewProps {
  treeData: PersonNode;
  memberEntries: MemberEntry[];
  onSelectPerson: (person: MemberEntry) => void;
}

const removeAccents = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .toLowerCase().trim();
};

export const ListView = ({ treeData, memberEntries, onSelectPerson }: ListViewProps) => {
  const [openTrigger, setOpenTrigger] = useState<{ isOpen: boolean; version: number }>({
    isOpen: true, version: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = memberEntries.filter((item) => {
    const cleanQuery = removeAccents(searchQuery);
    if (!cleanQuery) return false;
    const node = item.data;
    const searchContent = `${node.name} ${node.title || ''} ${node.bio || ''} ${node.birth || ''} ${node.death || ''}`;
    const cleanContent = removeAccents(searchContent);
    const terms = cleanQuery.split(/\s+/).filter(Boolean);
    return terms.every((term) => cleanContent.includes(term));
  });

  return (
    <div className="list-scroll">
      <div className="list-inner">

        {/* Header toolbar */}
        <div className="toolbar">
          <div>
            <p className="section-kicker">Cội Nguồn · Phả Hệ</p>
            <h2 className="section-title font-display">Danh Sách Thành Viên</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: '11px', fontWeight: 600,
              color: 'var(--gold-mid)',
              background: 'var(--bg-glass-md)',
              border: '1px solid var(--border-gold)',
              padding: '2px 8px', borderRadius: '12px'
            }}>
              {memberEntries.length} người
            </span>
            <button
              className="action-button"
              onClick={() => setOpenTrigger(prev => ({
                isOpen: !prev.isOpen,
                version: prev.version + 1,
              }))}
              title={openTrigger.isOpen ? "Thu gọn tất cả các nhánh phả hệ" : "Mở rộng tất cả các nhánh phả hệ"}
            >
              <Icon name={openTrigger.isOpen ? 'folder-minus' : 'folder-plus'} size={13} />
              {openTrigger.isOpen ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
            </button>
          </div>
        </div>

        {/* Search */}
        <SearchPanel
          query={searchQuery}
          onQueryChange={setSearchQuery}
          results={searchResults}
          total={memberEntries.length}
          onSelect={onSelectPerson}
        />

        {/* Hint */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 2px',
          marginBottom: 10,
        }}>
          <Icon name="info" size={10} style={{ color: 'var(--gold)', opacity: 0.5, flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Bấm vào tên thành viên để xem tiểu sử chi tiết
          </span>
        </div>

        {/* Tree container */}
        <div className="member-tree-container">
          <MemberItem
            data={treeData}
            level={0}
            openTrigger={openTrigger}
            onSelect={onSelectPerson}
            parentNode={null}
            gen={1}
            branchName=""
            pathNodes={[]}
            index={0}
          />
        </div>

        {/* Footer ghi nhận cập nhật gia phả */}
        <div style={{
          marginTop: 36,
          padding: '16px 12px 24px',
          borderTop: '1px dashed var(--border-gold-md)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '11.5px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4
        }}>
          <div style={{ color: 'var(--gold-mid)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="calendar" size={12} />
            <span>Lần cập nhật gia phả gần nhất: <strong>{GIA_PHA_LAST_UPDATED}</strong></span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gold-light)', fontStyle: 'italic', fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}>
            « Mộc xuất thiên chi do hữu bản · Thủy lưu vạn phái tổng đồng nguyên »
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7, fontStyle: 'italic' }}>
            (Cây muôn nhánh bởi do có gốc · Nước vạn dòng chung một nguồn khơi)
          </div>
        </div>

      </div>
    </div>
  );
};