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
import { MemberEntry } from './types';
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
  const [vanKhanInitialTab, setVanKhanInitialTab] = useState<'gio' | 'taomo' | 'tet' | 'ram' | 'quychinh' | undefined>(undefined);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  const { treeData, memberEntries, birthdays, reminders, todayLunar, refreshFamilyData } = useFamilyData();
  const { settings, updateSettings, hasBeenNotified, markAsNotified, cleanOldHistory } = useNotificationSettings();

  // View Transitions API wrapper for smooth SPA transitions
  const handleViewChange = (mode: 'list' | 'tree' | 'lich' | 'stats' | 'manage') => {
    // @ts-ignore
    if (!document.startViewTransition || mode === 'manage' || viewMode === 'manage') {
      setViewMode(mode);
    } else {
      // @ts-ignore
      document.startViewTransition(() => {
        setViewMode(mode);
      });
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    cleanOldHistory();
  }, [cleanOldHistory]);

  // Auto open reminder modal if there are upcoming reminders
  useEffect(() => {
    if (reminders.length > 0) {
      setShowReminderModal(true);
    }
  }, [reminders]);

  // Set App Badge on PWA icon if supported
  useEffect(() => {
    const updateAppBadge = async () => {
      if ('setAppBadge' in navigator) {
        try {
          if (reminders.length > 0) {
            await navigator.setAppBadge(reminders.length);
          } else if ('clearAppBadge' in navigator) {
            await navigator.clearAppBadge();
          }
        } catch (e) {
          console.error('Error setting app badge:', e);
        }
      }
    };
    updateAppBadge();
  }, [reminders.length, settings.isEnabled]);

  // Handle scheduled Web Push notifications for death anniversaries & upcoming events
  useEffect(() => {
    if (!settings.isEnabled || reminders.length === 0) return;

    const checkPushNotification = () => {
      const now = new Date();
      const currentHoursStr = String(now.getHours()).padStart(2, '0');
      const currentMinutesStr = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHoursStr}:${currentMinutesStr}`;
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      if (currentTimeStr === settings.time) {
        reminders.forEach(reminder => {
          const notificationKey = `${todayStr}_${reminder.fullName}`;

          if (!hasBeenNotified(notificationKey)) {
            if ('Notification' in window && Notification.permission === 'granted') {
              const daysText = reminder.days === 0 ? 'Hôm nay' : `Còn ${reminder.days} ngày`;
              const solarText = reminder.solarDateStr ? ` (${reminder.solarDateStr})` : '';

              new Notification(`🔔 Giỗ/Nghi Lễ Sắp Tới: ${reminder.fullName}`, {
                body: `Ngày Âm lịch: ${reminder.date}${solarText} (${daysText}). Bấm vào đây để xem chi tiết gia phả & bài văn khấn.`,
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                tag: notificationKey,
                renotify: true,
              });

              markAsNotified(notificationKey);
            }
          }
        });
      }
    };

    checkPushNotification();
    const interval = setInterval(checkPushNotification, 30000);
    return () => clearInterval(interval);
  }, [settings.isEnabled, settings.time, reminders, hasBeenNotified, markAsNotified, cleanOldHistory]);

  const handleOpenVanKhan = (tab?: 'gio' | 'taomo' | 'tet' | 'ram' | 'quychinh') => {
    setVanKhanInitialTab(tab || 'gio');
    setShowVanKhanModal(true);
  };

  return (
    <div className="app-container">
      {splash && <SplashScreen onFinish={() => setSplash(false)} />}
      
      <TopBar 
        viewMode={viewMode}
        onViewChange={handleViewChange}
        lunarLabel={todayLunar}
        solarLabel={new Date().toLocaleDateString('vi-VN')}
        theme={theme}
        onThemeChange={toggleTheme}
        remindersCount={reminders.length}
        onOpenReminders={() => setShowReminderModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenManage={() => setShowAuthModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenVanKhan={() => handleOpenVanKhan('gio')}
      />

      <NoticeBar birthdays={birthdays} />

      <main className="main-content">
        {viewMode === 'list' && (
          <ListView 
            data={memberEntries} 
            onSelectPerson={(person) => setSelectedPerson(person)} 
          />
        )}
        
        <Suspense fallback={
          <div style={{ display: 'grid', placeItems: 'center', height: '60vh', color: 'var(--gold-mid)' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              <p>Đang tải dữ liệu gia phả...</p>
            </div>
          </div>
        }>
          {viewMode === 'tree' && (
            <TreeView 
              data={treeData} 
              onSelectPerson={(person) => setSelectedPerson(person)} 
            />
          )}

          {viewMode === 'lich' && (
            <LichView 
              data={memberEntries} 
              onSelectPerson={(person) => setSelectedPerson(person)} 
            />
          )}

          {viewMode === 'stats' && (
            <DashboardView 
              data={memberEntries} 
            />
          )}

          {viewMode === 'manage' && (
            <ManageView 
              data={treeData} 
              onDataChange={refreshFamilyData} 
            />
          )}
        </Suspense>
      </main>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="modal-backdrop" onClick={() => setShowReminderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-head" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 className="font-display" style={{
                fontSize: 22, fontWeight: 700,
                color: 'var(--gold-light)', textAlign: 'center',
                letterSpacing: '0.02em',
              }}>
                Ngày Giỗ & Nghi Lễ Sắp Tới
              </h2>
              <p style={{
                marginTop: 6, fontSize: 10, fontWeight: 600,
                color: 'var(--text-muted)', textAlign: 'center',
                letterSpacing: '0.05em',
              }}>
                {todayLunar} · Tháng {CURRENT_SOLAR_MONTH} dương lịch
              </p>
            </div>

            <div className="modal-list">
              {reminders.map((item, idx) => {
                const isWeekend = item.weekdayShort === 'CN' || item.weekdayShort === 'T7';
                const isEvent = item.type === 'event';
                return (
                  <div
                    className="reminder-row"
                    key={idx}
                    onClick={() => {
                      if (isEvent) {
                        setShowReminderModal(false);
                        handleOpenVanKhan(item.vanKhanTab);
                      } else if (item.person) {
                        setSelectedPerson(item.person);
                        setShowReminderModal(false);
                      }
                    }}
                    style={{ 
                      cursor: 'pointer',
                      borderLeft: isEvent ? '3px solid var(--gold)' : '3px solid transparent',
                      background: isEvent ? 'rgba(201,146,58,0.08)' : undefined
                    }}
                    title={isEvent ? 'Bấm để mở bài văn khấn' : 'Bấm để xem tiểu sử chi tiết'}
                  >
                    <div>
                      <p className="reminder-name font-serif" style={{ display: 'flex', alignItems: 'center', gap: 6, color: isEvent ? 'var(--gold-light)' : undefined }}>
                        <Icon name={isEvent ? "book-open" : "moon"} size={14} style={{ color: 'var(--gold-mid)' }} />
                        {item.fullName}
                      </p>

                      <p className="modal-date" style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3 }}>
                        <span>
                          Thời gian: <strong>{item.date}</strong>
                        </span>
                        {item.solarDateStr && (
                          <span style={{ fontSize: '11px', color: isWeekend ? 'var(--gold-light)' : 'var(--text-muted)', fontWeight: isWeekend ? 600 : 400 }}>
                            📅 Dương lịch: <strong>{item.solarDateStr}</strong>
                            {isWeekend && (
                              <span style={{ marginLeft: 6, fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(201,146,58,0.2)', color: 'var(--gold-mid)' }}>
                                Cuối tuần
                              </span>
                            )}
                          </span>
                        )}
                        {item.subtitle && (
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 1 }}>
                            {item.subtitle}
                          </span>
                        )}
                      </p>

                      {isEvent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReminderModal(false);
                            handleOpenVanKhan(item.vanKhanTab);
                          }}
                          style={{
                            marginTop: 6,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            background: 'rgba(201,146,58,0.2)',
                            border: '1px solid var(--border-gold)',
                            color: 'var(--gold-light)',
                            cursor: 'pointer'
                          }}
                        >
                          <Icon name="book-open" size={12} /> Xem bài văn khấn
                        </button>
                      )}
                    </div>

                    <span className={`days-pill${item.days === 0 ? ' today' : ''}`}>
                      {item.days === 0 ? 'Hôm nay' : `Còn ${item.days} ngày`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '10px 12px 14px' }}>
              <button
                className="action-button modal-close"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setShowReminderModal(false)}
              >
                <Icon name="x" size={13} /> Đóng
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
        <VanKhanModal initialTab={vanKhanInitialTab} onClose={() => setShowVanKhanModal(false)} />
      )}

      <ManageAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          handleViewChange('manage');
        }}
      />

      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      <InstallPrompt />
    </div>
  );
}

export default App;