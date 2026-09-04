import { useState } from 'react';
import { MemberEntry } from '@/types';
import { cleanName, getNameRole } from '@/utils/genealogyUtils';
import { Icon } from '@/components/ui/Icon';

interface SearchPanelProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: MemberEntry[];
  total: number;
  onSelect: (person: MemberEntry) => void;
}

export const SearchPanel = ({ query, onQueryChange, results, total, onSelect }: SearchPanelProps) => {
  const [filterType, setFilterType] = useState<'all' | 'living' | 'deceased'>('all');

  const filteredResults = results.filter((item) => {
    if (filterType === 'living') return !item.data.deceased;
    if (filterType === 'deceased') return !!item.data.deceased;
    return true;
  });

  return (
    <section className="search-panel">
      <div className="search-box">
        <span className="s-icon"><Icon name="search" size={16} style={{ color: 'var(--gold)' }} /></span>
        <input
          id="search-input"
          className="search-input"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm theo tên, danh hiệu, ngày sinh, cội nguồn..."
          autoComplete="off"
          spellCheck={false}
        />
        {!query && (
          <span className="search-shortcut-badge">
            ⌘K
          </span>
        )}
        {query && (
          <button
            className="clear-search"
            onClick={() => onQueryChange('')}
            aria-label="Xóa tìm kiếm"
            title="Xóa nội dung tìm kiếm"
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      {query.trim() && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
            <p className="search-summary" style={{ margin: 0 }}>
              Kết quả: <strong style={{ color: 'var(--gold-mid)' }}>{filteredResults.length}</strong> / {total} thành viên
            </p>
            
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setFilterType('all')}
                style={{
                  padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                  background: filterType === 'all' ? 'var(--gold)' : 'var(--bg-glass)',
                  color: filterType === 'all' ? '#0c0c0c' : 'var(--text-muted)',
                  border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType('living')}
                style={{
                  padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                  background: filterType === 'living' ? 'var(--gold)' : 'var(--bg-glass)',
                  color: filterType === 'living' ? '#0c0c0c' : 'var(--text-muted)',
                  border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                Đang sống
              </button>
              <button
                onClick={() => setFilterType('deceased')}
                style={{
                  padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                  background: filterType === 'deceased' ? 'var(--gold)' : 'var(--bg-glass)',
                  color: filterType === 'deceased' ? '#0c0c0c' : 'var(--text-muted)',
                  border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                Đã mất
              </button>
            </div>
          </div>

          {filteredResults.length ? (
            <div className="search-results">
              {filteredResults.slice(0, 15).map((item) => {
                const role = getNameRole(item.data.name);
                return (
                  <button
                    className="search-result"
                    key={item.id}
                    onClick={() => onSelect(item)}
                  >
                    <span style={{ minWidth: 0 }}>
                      <span className="search-result-name font-serif">
                        {cleanName(item.data.name)}
                        {role ? ` (${role})` : ''}
                        {item.data.deceased && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--red-light)', opacity: 0.8 }}>
                            [Đã mất]
                          </span>
                        )}
                      </span>
                      <span className="search-result-path">
                        Đời {item.gen} · {item.pathNames.join(' › ')}
                      </span>
                    </span>
                    <Icon
                      name="chevron-right"
                      size={14}
                      style={{ color: 'var(--gold-mid)', opacity: 0.7, flexShrink: 0 }}
                    />
                  </button>
                );
              })}
              {filteredResults.length > 15 && (
                <p style={{
                  textAlign: 'center', fontSize: '10px',
                  color: 'var(--text-muted)', padding: '8px 0',
                  fontStyle: 'italic',
                }}>
                  ... và {filteredResults.length - 15} kết quả nữa. Hãy nhập cụ thể hơn.
                </p>
              )}
            </div>
          ) : (
            <div className="search-empty">
              <Icon name="search-x" size={24} style={{ display: 'block', margin: '0 auto 8px', color: 'var(--gold)', opacity: 0.4 }} />
              Không tìm thấy thành viên phù hợp với từ khóa
            </div>
          )}
        </div>
      )}
    </section>
  );
};