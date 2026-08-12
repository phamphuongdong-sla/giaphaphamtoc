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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  const { treeData, memberEntries, birthdays, reminders, todayLunar, refreshFamilyData } = useFamilyData();
  const { settings, updateSettings, hasBeenNotified, markAsNotified, cleanOldHistory } = useNotificationSettings();

  // View Transitions API wrapper for smooth SPA transitions
  const handleViewChange = (mode: 'list' | 'tree' | 'lich' | 'stats' | 'manage') => {
    // @ts-ignore - Bypass View Transitions for manage view to prevent DOM screenshot freeze
    if (!document.startViewTransition || mode === 'manage' || viewMode === 'manage') {
      setViewMode(mode);
    } else {
      // @ts-ignore
      document.startViewTransition(() => {
        setViewMode(mode);
      });
    }
  };

  const handleOpenManage = () => {
    const isAuth = sessionStorage.getItem('manage_authenticated') === 'true';
    if (isAuth) {
      handleViewChange('manage');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogoutManage = () => {
    sessionStorage.removeItem('manage_authenticated');
    handleViewChange('list');
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

  // Auto open reminder modal if there are upcoming reminders
  useEffect(() => {
    if (reminders.length > 0) {
      setShowReminderModal(true);
    }
  }, [reminders]);

  // Handle App Badge separately
  useEffect(() => {
    const updateBadge = async () => {
      if ('setAppBadge' in navigator) {
        try {
          if (reminders.length > 0) {
            // @ts-ignore
            await navigator.setAppBadge(reminders.length);
          } else {
            // @ts-ignore
            await navigator.clearAppBadge();
          }
        } catch (error) {
          console.warn('App Badging API error:', error);
        }
      }
    };
    
    updateBadge();
  }, [reminders.length, settings.isEnabled]);

  // Push Notification logic check
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
                const title = `Sắp đến ngày giỗ: ${reminder.fullName}`;
                const solarText = reminder.solarDateStr ? ` · Dương: ${reminder.solarDateStr}` : '';
                const options = {
                  body: `${reminder.date}${solarText} (${daysText})`,
                  icon: '/giaphaphamtoc/icons/icon-192x192.png',
                  badge: '/giaphaphamtoc/icons/icon-192x192.png'
                };
                
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

      {/* Reminder modal */}
      {showReminderModal && (
        <div className="modal-backdrop" onClick={() => setShowReminderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(139,26,26,0.25)',
                  border: '1px solid rgba(201,146,58,0.25)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Icon name="bell-ring" size={26} style={{ color: 'var(--gold-mid)' }} />
                </div>
              </div>
              <h2 className="font-display" style={{
                fontSize: 22, fontWeight: 700,
                color: 'var(--gold-light)', textAlign: 'center',
                letterSpacing: '0.02em',
              }}>
                Ngày giỗ sắp tới
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
                return (
                  <div
                    className="reminder-row"
                    key={idx}
                    onClick={() => {
                      if (item.person) {
                        setSelectedPerson(item.person);
                        setShowReminderModal(false);
                      }
                    }}
                    style={{ cursor: item.person ? 'pointer' : 'default' }}
                    title={item.person ? 'Bấm để xem tiểu sử chi tiết' : undefined}
                  >
                    <div>
                      <p className="reminder-name font-serif">{item.fullName}</p>
                      <p className="modal-date" style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3 }}>
                        <span>
                          <Icon name="moon" size={10} style={{ marginRight: 4, verticalAlign: -1, color: 'var(--gold-mid)' }} />
                          Giỗ âm lịch: <strong>{item.date}</strong>
                        </span>
                        {item.solarDateStr && (
                          <span style={{ fontSize: '11px', color: isWeekend ? 'var(--gold-light)' : 'var(--text-muted)', fontWeight: isWeekend ? 600 : 400 }}>
                            📅 Dương: <strong>{item.solarDateStr}</strong>
                            {isWeekend && (
                              <span style={{ marginLeft: 6, fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(201,146,58,0.2)', color: 'var(--gold-mid)' }}>
                                Cuối tuần
                              </span>
                            )}
                          </span>
                        )}
                      </p>
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
        <VanKhanModal onClose={() => setShowVanKhanModal(false)} />
      )}

      <ManageAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
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
        onOpenVanKhan={() => setShowVanKhanModal(true)}
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