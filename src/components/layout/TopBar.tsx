import { Icon } from '@/components/ui/Icon';

interface TopBarProps {
  viewMode: 'list' | 'tree' | 'lich' | 'stats' | 'manage';
  onViewChange: (mode: 'list' | 'tree' | 'lich' | 'stats' | 'manage') => void;
  lunarLabel: string;
  solarLabel?: string;
  theme: 'dark' | 'light';
  onThemeChange: (t: 'dark' | 'light') => void;
  remindersCount: number;
  onOpenReminders: () => void;
  onOpenSettings: () => void;
  onOpenManage: () => void;
  onOpenRules?: () => void;
  onOpenVanKhan?: () => void;
  onOpenExport?: () => void;
}

export const TopBar = ({ viewMode, onViewChange, lunarLabel, solarLabel, theme, onThemeChange, remindersCount, onOpenReminders, onOpenSettings, onOpenManage, onOpenRules, onOpenVanKhan, onOpenExport: _onOpenExport }: TopBarProps) => {
  const solarDate = solarLabel || new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const logoFile = theme === 'light' ? 'logoden.png' : 'logotrang.png';

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="crest">
          <img
            src={`${import.meta.env.BASE_URL}${logoFile}`}
            alt="Gia Phả Phạm Tộc"
            className="crest-img"
            // @ts-ignore
            fetchPriority="high"
          />
        </div>
        <div className="brand-text">
          <p className="brand-kicker font-serif" style={theme === 'light' ? { color: '#1C1917', opacity: 1 } : undefined}>Lưu trữ thế hệ gia tộc</p>
          <h1
            className="brand-title font-royal"
            style={{
              color: theme === 'light' ? '#1C1917' : 'var(--gold-light)',
              textShadow: theme === 'light' ? 'none' : '0 2px 12px rgba(201,146,58,0.35)',
            }}
          >
            Gia Phả Phạm Tộc
          </h1>
          <p className="brand-sub" style={theme === 'light' ? { color: '#44403C' } : undefined}>
            <span style={{ color: theme === 'light' ? '#44403C' : 'var(--gold)', opacity: theme === 'light' ? 1 : 0.8 }}>
              <Icon name="calendar" size={10} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
            </span>
            {solarDate}
            <span style={{ margin: '0 6px', opacity: 0.3 }}>·</span>
            {lunarLabel}
          </p>
        </div>
      </div>

      <nav className="segmented" aria-label="Chế độ xem">
        <button
          className={viewMode === 'list' ? 'active' : ''}
          onClick={() => onViewChange('list')}
          title="Xem danh sách thành viên dạng cây thu gọn (⌘K)"
        >
          <Icon name="list" size={13} style={{ marginRight: 5, verticalAlign: -1 }} />
          Danh sách
        </button>
        <button
          className={viewMode === 'lich' ? 'active' : ''}
          onClick={() => onViewChange('lich')}
          title="Xem lịch giỗ âm lịch & sinh nhật"
        >
          <Icon name="moon" size={13} style={{ marginRight: 5, verticalAlign: -1 }} />
          Lịch giỗ
        </button>
        <button
          className={viewMode === 'stats' ? 'active' : ''}
          onClick={() => onViewChange('stats')}
          title="Xem biểu đồ & thống kê gia tộc"
        >
          <Icon name="pie-chart" size={13} style={{ marginRight: 5, verticalAlign: -1 }} />
          Thống kê
        </button>
        <button
          className={viewMode === 'tree' ? 'active' : ''}
          onClick={() => onViewChange('tree')}
          title="Xem sơ đồ cây phả hệ tương tác"
        >
          <Icon name="git-branch" size={13} style={{ marginRight: 5, verticalAlign: -1 }} />
          Sơ đồ
        </button>
      </nav>

      <div className="topbar-tools">
        {onOpenVanKhan && (
          <button 
            className="theme-toggle" 
            onClick={onOpenVanKhan}
            aria-label="Tủ Sách Văn Khấn Cổ Truyền"
            title="Tủ Sách Văn Khấn Cổ Truyền"
          >
            <Icon name="notebook-text" size={15} />
          </button>
        )}
        {onOpenRules && (
          <button 
            className="theme-toggle" 
            onClick={onOpenRules}
            aria-label="Quy ước Tộc phả & Xưng hô"
            title="Quy ước Tộc phả & Xưng hô"
          >
            <Icon name="book-open" size={15} />
          </button>
        )}
        <button 
          className="theme-toggle" 
          onClick={onOpenReminders}
          aria-label="Thông báo ngày giỗ sắp tới"
          title="Ngày giỗ sắp tới"
          style={{ position: 'relative' }}
        >
          <Icon name="bell-ring" size={15} />
          {remindersCount > 0 && (
            <span className="notif-badge-pulse" style={{
              position: 'absolute', top: -3, right: -3,
              background: 'linear-gradient(135deg, var(--red-mid), var(--red-light))',
              color: '#ffffff',
              fontSize: 9, fontWeight: 'bold',
              minWidth: 16, height: 16, borderRadius: 8,
              padding: '0 3px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(186,26,26,0.5)',
              border: '1px solid rgba(255,255,255,0.4)',
              lineHeight: 1
            }}>{remindersCount}</span>
          )}
        </button>
        <button 
          className={`theme-toggle${viewMode === 'manage' ? ' active' : ''}`}
          onClick={onOpenManage}
          aria-label="Quản lý thành viên (Bảo mật)"
          title="Quản lý Gia Phả (Cần mật khẩu)"
          style={{
            color: viewMode === 'manage' ? 'var(--gold-light)' : undefined,
            borderColor: viewMode === 'manage' ? 'var(--gold)' : undefined
          }}
        >
          <Icon name="lock" size={15} />
        </button>
        <button 
          className="theme-toggle" 
          onClick={onOpenSettings}
          aria-label="Cài đặt thông báo"
          title="Cài đặt"
        >
          <Icon name="settings" size={15} />
        </button>
        <button 
          className="theme-toggle" 
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          title={theme === 'dark' ? 'Chuyển Giao diện Sáng' : 'Chuyển Giao diện Tối'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
        </button>
      </div>
    </header>
  );
};