import { useState, useEffect, lazy, Suspense } from 'react';
import { useFamilyData } from './hooks/useFamilyData';
import { SplashScreen } from './components/layout/SplashScreen';
import { TopBar } from './components/layout/TopBar';
import { NoticeBar } from './components/layout/NoticeBar';
import { ListView } from './components/views/ListView';
import { PersonDetailModal } from './components/members/PersonDetailModal';
import { SettingsModal } from './components/shared/SettingsModal';
import { RulesModal } from './RulesModal';
import { Icon } from './components/ui/Icon';
import { InstallPrompt } from './components/shared/InstallPrompt';
import { useNotificationSettings } from './hooks/useNotificationSettings';
import { ManageAuthModal } from './components/shared/ManageAuthModal';
import { VanKhanModal } from './components/shared/VanKhanModal';
import { MemberEntry, ReminderItem } from './types';
import { setAppBadge, clearAppBadge } from './utils/badgeUtils';
import { downloadCalendarEvent } from './utils/calendarUtils';
import { AuthUser } from './services/cloudflareApi';
import './styles/index.css';

// Dynamic imports for code-splitting heavy components
const TreeView = lazy(() => import('./components/views/TreeView').then(m => ({ default: m.TreeView })));
const LichView = lazy(() => import('./components/views/LichView').then(m => ({ default: m.LichView })));
const DashboardView = lazy(() => import('./components/views/DashboardView').then(m => ({ default: m.DashboardView })));
const ManageView = lazy(() => import('./components/views/ManageView').then(m => ({ default: m.ManageView })));

const CURRENT_SOLAR_MONTH = new Date().getMonth() + 1;

function App() {
  const [splash, setSplash] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'tree' | 'lich' | 'stats' | 'manage'>('list');
  const [selectedPerson, setSelectedPerson] = useState<MemberEntry | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showVanKhanModal, setShowVanKhanModal] = useState(false);
  const [vanKhanConfig, setVanKhanConfig] = useState<{
    tab?: string;
    deceasedName?: string;
    deceasedTitle?: string;
  }>({ tab: 'gio' });
  const [calendarDownloadedIdx, setCalendarDownloadedIdx] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('giapha_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  const { treeData, memberEntries, birthdays, reminders, todayLunar, refreshFamilyData } = useFamilyData();
  const { settings, updateSettings, hasBeenNotified, markAsNotified, cleanOldHistory } = useNotificationSettings();

  // View Transitions API wrapper for smooth SPA transitions
  const handleViewChange = (mode: 'list' | 'tree' | 'lich' | 'stats' | 'manage') => {
    // @ts-ignore - Bypass View Transitions for manage view to prevent DOM screenshot freeze
    if (mode === 'manage' || viewMode === 'manage' || !document.startViewTransition) {
      setViewMode(mode);
      return;
    }

    // @ts-ignore
    document.startViewTransition(() => {
      setViewMode(mode);
    });
  };

  const handleOpenManage = () => {
    if (authUser) {
      handleViewChange('manage');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogoutManage = () => {
    setAuthUser(null);
    localStorage.removeItem('giapha_auth_user');
    sessionStorage.removeItem('manage_authenticated');
    handleViewChange('list');
  };

  const handleOpenVanKhan = (tab: string = 'gio', deceasedName?: string, deceasedTitle?: string) => {
    setVanKhanConfig({ tab, deceasedName, deceasedTitle });
    setShowVanKhanModal(true);
  };

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K) for quick search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleViewChange('list');
        setTimeout(() => {
          const searchInput = document.getElementById('search-input');
          if (searchInput) searchInput.focus();
        }, 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle QR code scanning URL param (?person=...)
  useEffect(() => {
    if (memberEntries.length > 0 && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const personParam = params.get('person');
      if (personParam) {
        const decoded = decodeURIComponent(personParam).trim().toLowerCase();
        const found = memberEntries.find(m => 
          (m.id && m.id.toLowerCase() === decoded) ||
          (m.data.id && m.data.id.toLowerCase() === decoded) ||
          m.data.name.toLowerCase() === decoded ||
          m.data.name.toLowerCase().includes(decoded)
        );
        if (found) {
          setSelectedPerson(found);
          setSplash(false);
        }
      }
    }
  }, [memberEntries]);

  // Auto open reminder modal if there are upcoming reminders (unless personParam is active)
  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (reminders.length > 0 && (!params || !params.get('person'))) {
      setShowReminderModal(true);
    }
  }, [reminders]);

  // Handle App Badge and sync active notifications
  useEffect(() => {
    const updateBadgeAndSyncNotifications = async () => {
      if (reminders.length > 0) {
        await setAppBadge(reminders.length);
      } else {
        await clearAppBadge();
      }

      // Đảm bảo thông báo được ghim vào thanh trạng thái hệ thống qua Service Worker
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const activeNotifications = await registration.getNotifications();
          const activeTags = reminders.map(r => `giapha-reminder-${r.fullName}`);

          // 1. Đóng những thông báo của sự kiện đã kết thúc
          for (const notif of activeNotifications) {
            if (notif.tag && notif.tag.startsWith('giapha-reminder-') && !activeTags.includes(notif.tag)) {
              notif.close();
            }
          }

          // 2. Ghim các thông báo sự kiện còn hiệu lực lên thanh trạng thái với thông tin chi tiết, chuẩn mực
          const existingTags = new Set(activeNotifications.map(n => n.tag));
          for (const reminder of reminders) {
            const tag = `giapha-reminder-${reminder.fullName}`;
            if (!existingTags.has(tag)) {
              const daysText = reminder.days === 0 ? 'Hôm nay' : `Còn ${reminder.days} ngày`;
              const isSpecial = reminder.isSpecialDay;
              const title = isSpecial
                ? `🏮 ${reminder.honorificName || reminder.fullName}`
                : `🏮 Nhắc giỗ: ${reminder.honorificName || reminder.fullName}`;
              
              let bodyStr = '';
              if (!isSpecial) {
                const relStr = reminder.relationTitle ? `${reminder.relationTitle} · ` : '';
                bodyStr = `${relStr}Chính kỵ: ${reminder.chinhKyLunar || reminder.date} (${reminder.solarDateStr || ''}) · Tiên thường: ${reminder.tienThuongLunar || 'Chiều trước'} (${daysText})`;
              } else {
                bodyStr = `${reminder.date} · Dương: ${reminder.solarDateStr || ''} (${daysText})`;
              }
              
              await registration.showNotification(title, {
                body: bodyStr,
                icon: '/giaphaphamtoc/icons/icon-192.png',
                badge: '/giaphaphamtoc/icons/icon-192.png',
                tag: tag,
                renotify: false,
                requireInteraction: true,
                data: { url: '/giaphaphamtoc/', fullName: reminder.fullName }
              } as NotificationOptions & { renotify?: boolean });
            }
          }
        } catch (e) {
          console.warn('Error syncing active notifications with Service Worker:', e);
        }
      }
    };
    
    updateBadgeAndSyncNotifications();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateBadgeAndSyncNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [reminders, settings.isEnabled]);

  // Push Notification logic check (nhắc nhở định kỳ theo giờ đã cài đặt)
  useEffect(() => {
    if (!settings.isEnabled) return;

    const checkAndNotify = () => {
      const now = new Date();
      const currentHourStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      
      // Allow notifications if time has passed the configured time for today
      if (currentHourStr >= settings.time) {
        const todayDateStr = now.toISOString().split('T')[0];
        
        reminders.forEach(reminder => {
          // Only notify for 7, 3, 1, or 0 days away
          if ([7, 3, 1, 0].includes(reminder.days)) {
            const notifKey = `${todayDateStr}_${reminder.fullName}_${reminder.days}`;
            
            if (!hasBeenNotified(notifKey)) {
              if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                const daysText = reminder.days === 0 ? 'Hôm nay' : `Còn ${reminder.days} ngày`;
                const isSpecial = reminder.isSpecialDay;
                const title = isSpecial
                  ? `🏮 ${reminder.honorificName || reminder.fullName}`
                  : `🏮 Nhắc giỗ: ${reminder.honorificName || reminder.fullName}`;
                
                let bodyStr = '';
                if (!isSpecial) {
                  const relStr = reminder.relationTitle ? `${reminder.relationTitle} · ` : '';
                  bodyStr = `${relStr}Chính kỵ: ${reminder.chinhKyLunar || reminder.date} (${reminder.solarDateStr || ''}) · Tiên thường: ${reminder.tienThuongLunar || 'Chiều trước'} (${daysText})`;
                } else {
                  bodyStr = `${reminder.date} · Dương: ${reminder.solarDateStr || ''} (${daysText})`;
                }

                const options = {
                  body: bodyStr,
                  icon: '/giaphaphamtoc/icons/icon-192.png',
                  badge: '/giaphaphamtoc/icons/icon-192.png',
                  tag: `giapha-reminder-${reminder.fullName}`,
                  renotify: true,
                  requireInteraction: true
                };
                
                // Cập nhật số đỏ trên icon chính xác theo tổng số sự kiện chưa kết thúc
                setAppBadge(reminders.length || 1);

                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, options).catch(err => {
                      console.warn('SW showNotification error:', err);
                      try { new Notification(title, options); } catch(e) {}
                    });
                  });
                } else {
                  try { new Notification(title, options); } catch(e) {}
                }
                
                markAsNotified(notifKey);
              }
            }
          }
        });
        
        cleanOldHistory();
      }
    };

    // Check immediately on mount/update
    checkAndNotify();

    // Check every minute
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [settings.isEnabled, settings.time, reminders, hasBeenNotified, markAsNotified, cleanOldHistory]);

  const enterApp = () => {
    setSplash(false);
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (splash) {
    return <SplashScreen onEnter={enterApp} currentTheme={theme} onThemeChange={handleThemeChange} />;
  }


  return (
    <div className="shell">

      {/* Reminder modal - Hiển thị chi tiết theo phong tục cúng giỗ truyền thống Việt Nam */}
      {showReminderModal && (
        <div className="modal-backdrop" onClick={() => setShowReminderModal(false)}>
          <div className="modal memorial-reminder-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(139,26,26,0.3)',
                  border: '1px solid rgba(201,146,58,0.4)',
                  display: 'grid', placeItems: 'center',
                  boxShadow: '0 0 20px rgba(201,146,58,0.25)'
                }}>
                  <Icon name="bell-ring" size={26} style={{ color: 'var(--gold-mid)' }} />
                </div>
              </div>
              <h2 className="font-display" style={{
                fontSize: 22, fontWeight: 700,
                color: 'var(--gold-light)', textAlign: 'center',
                letterSpacing: '0.02em',
              }}>
                Giỗ &amp; Lễ Sắp Tới
              </h2>
              <p style={{
                marginTop: 5, fontSize: 11, fontWeight: 600,
                color: 'var(--gold-mid)', textAlign: 'center',
                letterSpacing: '0.03em',
              }}>
                {todayLunar} · Tháng {CURRENT_SOLAR_MONTH} Dương lịch
              </p>
              <p style={{
                marginTop: 4, fontSize: 10.5, color: 'var(--text-muted)',
                textAlign: 'center', fontStyle: 'italic'
              }}>
                Chi tiết nghi thức phong tục cổ truyền · Tiên Thường &amp; Chính Kỵ
              </p>
            </div>

            <div className="modal-list memorial-modal-list">
              {reminders.map((item, idx) => {
                const isSpecial = item.isSpecialDay;
                const isWeekend = item.weekdayShort === 'CN' || item.weekdayShort === 'T7';
                const daysLabel = item.days === 0 ? 'Hôm nay' : item.days === 1 ? 'Ngày mai' : `Còn ${item.days} ngày`;
                const isDownloaded = calendarDownloadedIdx === idx;

                if (isSpecial) {
                  return (
                    <div className="memorial-card special-day-card" key={idx}>
                      <div className="memorial-card-top">
                        <span className="memorial-badge special">
                          <Icon name="sparkles" size={12} />
                          {item.specialDayType === 'tet' ? 'Tết Cổ Truyền' : item.specialDayType === 'mung1' ? 'Lễ Sóc' : 'Lễ Vọng'}
                        </span>
                        <span className={`days-pill${item.days === 0 ? ' today' : ''}`}>
                          {daysLabel}
                        </span>
                      </div>

                      <h3 className="memorial-title font-serif">
                        {item.specialDayTitle || item.honorificName || item.fullName}
                      </h3>

                      <div className="memorial-dates">
                        <div className="date-line">
                          <span>🌙 Ngày âm lịch: <strong>{item.date}</strong></span>
                        </div>
                        {item.solarDateStr && (
                          <div className="date-line">
                            <span>📅 Dương lịch: <strong>{item.solarDateStr}</strong></span>
                            {isWeekend && <span className="weekend-tag">Cuối tuần</span>}
                          </div>
                        )}
                      </div>

                      {item.specialDayDesc && (
                        <p className="memorial-desc">
                          {item.specialDayDesc}
                        </p>
                      )}

                      <div className="memorial-card-actions">
                        <button
                          type="button"
                          className="memorial-btn vankhan"
                          onClick={() => {
                            handleOpenVanKhan(item.specialDayType === 'tet' ? 'tet' : 'ram');
                            setShowReminderModal(false);
                          }}
                        >
                          <Icon name="scroll" size={13} />
                          {item.specialDayType === 'tet' ? 'Văn khấn Tết' : 'Văn khấn Sóc Vọng'}
                        </button>
                      </div>
                    </div>
                  );
                }

                // Thẻ Lễ Giỗ Tiên Tổ theo đúng phong tục Việt Nam
                return (
                  <div className="memorial-card ancestor-card" key={idx}>
                    {/* Hàng trên cùng: Nhãn Lễ Giỗ & Huy hiệu ngày */}
                    <div className="memorial-card-top">
                      <span className="memorial-badge ancestor">
                        <Icon name="candle" size={13} />
                        Lễ Giỗ Tiên Tổ (Húy Nhật)
                      </span>
                      <span className={`days-pill${item.days === 0 ? ' today' : ''}`}>
                        {daysLabel}
                      </span>
                    </div>

                    {/* Danh xưng tôn kính người được giỗ */}
                    <div className="memorial-main-info">
                      <h3 className="memorial-name font-serif">
                        {item.honorificName || item.fullName}
                      </h3>

                      {/* Quan hệ trong gia tộc - Để con cháu đọc là hiểu ngay */}
                      {item.relationTitle && (
                        <div className="memorial-relation-line">
                          <span className="relation-label">Vai vế:</span>
                          <strong className="relation-value">{item.relationTitle}</strong>
                        </div>
                      )}

                      <div className="memorial-tags-row">
                        {item.generationLabel && (
                          <span className="memorial-subtag gen-tag">
                            🌳 {item.generationLabel}
                          </span>
                        )}
                        {item.branchLabel && (
                          <span className="memorial-subtag branch-tag">
                            🏮 {item.branchLabel}
                          </span>
                        )}
                        {item.ageLabel && (
                          <span className="memorial-subtag age-tag">
                            🕯 {item.ageLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Khung 2 mốc cúng theo đúng phong tục Việt Nam: Tiên Thường & Chính Kỵ */}
                    <div className="memorial-ceremony-grid">
                      {/* Lễ Chính Kỵ (Giỗ Chính) */}
                      <div className="ceremony-box chinh-ky-box">
                        <div className="ceremony-tag">
                          <span>🕯 LỄ CHÍNH KỴ (GIỖ CHÍNH)</span>
                        </div>
                        <div className="ceremony-lunar">
                          🌙 <strong>{item.chinhKyLunar || item.date}</strong>
                        </div>
                        <div className="ceremony-solar">
                          📅 Dương: <strong>{item.chinhKySolar || item.solarDateStr}</strong>
                        </div>
                        <div className="ceremony-timing">
                          ⏰ Cúng trưa (trước giờ Ngọ: 09h00 - 11h30)
                        </div>
                      </div>

                      {/* Lễ Tiên Thường (Cúng Chiều Trước Giỗ) */}
                      <div className="ceremony-box tien-thuong-box">
                        <div className="ceremony-tag">
                          <span>🏮 LỄ TIÊN THƯỜNG (CÚNG CHIỀU)</span>
                        </div>
                        <div className="ceremony-lunar">
                          🌙 <strong>{item.tienThuongLunar || 'Chiều trước giỗ'}</strong>
                        </div>
                        <div className="ceremony-solar">
                          📅 Dương: <strong>{item.tienThuongSolar || 'Ngày trước giỗ'}</strong>
                        </div>
                        <div className="ceremony-timing">
                          ⏰ Cáo thỉnh gia tiên (chiều: 14h00 - 16h30)
                        </div>
                      </div>
                    </div>

                    {/* Thông tin Sinh - Tạ thế & Tiểu sử */}
                    {(item.birthDisplay || item.deathDisplay || item.bio) && (
                      <div className="memorial-life-row">
                        <div className="life-timeline">
                          {item.birthDisplay && <span>🌅 Sinh: <strong>{item.birthDisplay}</strong></span>}
                          {item.birthDisplay && item.deathDisplay && <span className="dot-sep">&middot;</span>}
                          {item.deathDisplay && <span>🕯 Tạ thế: <strong>{item.deathDisplay}</strong></span>}
                        </div>
                        {item.bio && (
                          <p className="life-bio-snippet font-serif">
                            📝 {item.bio.length > 130 ? item.bio.slice(0, 130) + '...' : item.bio}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Lời dặn phong tục hiếu nghĩa */}
                    <div className="memorial-remind-note">
                      💬 <em>Kính mong con cháu sắp xếp thời gian tề tựu, chuẩn bị hương đăng trà quả thành tâm dâng cúng theo nghi lễ cổ truyền.</em>
                    </div>

                    {/* Các nút hành động trực tiếp */}
                    <div className="memorial-card-actions">
                      <button
                        type="button"
                        className="memorial-btn vankhan"
                        onClick={() => {
                          handleOpenVanKhan('gio', item.honorificName, item.relationTitle);
                          setShowReminderModal(false);
                        }}
                        title="Mở bài văn khấn cúng giỗ chuẩn nghi thức cổ truyền"
                      >
                        <Icon name="scroll" size={13} />
                        Văn khấn Cúng Giỗ
                      </button>

                      {item.person && (
                        <button
                          type="button"
                          className="memorial-btn profile"
                          onClick={() => {
                            setSelectedPerson(item.person!);
                            setShowReminderModal(false);
                          }}
                          title="Xem phả hệ, gia đình, con cháu và tiểu sử chi tiết"
                        >
                          <Icon name="user" size={13} />
                          Xem Phả Hệ
                        </button>
                      )}

                      <button
                        type="button"
                        className={`memorial-btn calendar${isDownloaded ? ' downloaded' : ''}`}
                        onClick={() => {
                          downloadCalendarEvent({
                            fullName: item.honorificName || item.fullName,
                            solarDay: item.solarDay!,
                            solarMonth: item.solarMonth!,
                            days: item.days,
                            type: 'gio',
                            lunarDay: item.lunarDay || item.solarDay,
                            lunarMonth: item.lunarMonth || item.solarMonth,
                            person: item.person
                          }, item.solarYear || new Date().getFullYear());
                          setCalendarDownloadedIdx(idx);
                          setTimeout(() => setCalendarDownloadedIdx(null), 2500);
                        }}
                        title="Tải tệp lịch (.ics) đồng bộ vào điện thoại để nhắc việc giỗ gia đình"
                      >
                        <Icon name={isDownloaded ? "check" : "calendar"} size={13} />
                        {isDownloaded ? 'Đã Lưu Lịch' : 'Lưu Vào Lịch'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '10px 14px 14px' }}>
              <button
                className="action-button modal-close"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setShowReminderModal(false)}
              >
                <Icon name="x" size={13} /> Đóng Thông Báo
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <SettingsModal 
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {showVanKhanModal && (
        <VanKhanModal
          onClose={() => setShowVanKhanModal(false)}
          initialTab={vanKhanConfig.tab}
          initialDeceasedName={vanKhanConfig.deceasedName}
          initialDeceasedTitle={vanKhanConfig.deceasedTitle}
        />
      )}

      <ManageAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setAuthUser(user);
          localStorage.setItem('giapha_auth_user', JSON.stringify(user));
          sessionStorage.setItem('manage_authenticated', 'true');
          setShowAuthModal(false);
          handleViewChange('manage');
        }}
      />

      <PersonDetailModal person={selectedPerson} onClose={() => setSelectedPerson(null)} />

      <TopBar
        viewMode={viewMode}
        onViewChange={handleViewChange}
        lunarLabel={todayLunar}
        theme={theme}
        onThemeChange={setTheme}
        remindersCount={reminders.length}
        onOpenReminders={() => setShowReminderModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenManage={handleOpenManage}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenVanKhan={() => handleOpenVanKhan('gio')}
      />

      <NoticeBar birthdays={birthdays} onSelectPerson={setSelectedPerson} />

      <main>
        <Suspense fallback={
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: 'var(--gold-mid)', gap: 8, fontSize: '13px', fontWeight: 600
          }}>
            <Icon name="sparkles" size={16} style={{ animation: 'spin 1.5s linear infinite' }} />
            Đang tải dữ liệu...
          </div>
        }>
          {viewMode === 'list' && (
            <ListView
              treeData={treeData}
              memberEntries={memberEntries}
              onSelectPerson={setSelectedPerson}
            />
          )}
          {viewMode === 'tree' && (
            <TreeView
              treeData={treeData}
              onSelectPerson={setSelectedPerson}
            />
          )}
          {viewMode === 'lich' && (
            <LichView
              treeData={treeData}
              onSelectPerson={setSelectedPerson}
            />
          )}
          {viewMode === 'stats' && (
            <DashboardView
              memberEntries={memberEntries}
              onSelectPerson={setSelectedPerson}
            />
          )}
          {viewMode === 'manage' && (
            <ManageView
              authUser={authUser}
              onRefreshData={refreshFamilyData}
              onLogout={handleLogoutManage}
            />
          )}
        </Suspense>
      </main>
      
      <InstallPrompt />
    </div>
  );
}

export default App;