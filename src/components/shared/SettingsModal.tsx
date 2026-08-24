import React, { useState } from 'react';
import { Icon } from '../ui/Icon';
import { NotificationSettings } from '../../hooks/useNotificationSettings';
import { sendTestNotificationWithBadge, clearAppBadge } from '../../utils/badgeUtils';

interface SettingsModalProps {
  settings: NotificationSettings;
  onUpdate: (settings: Partial<NotificationSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdate, onClose }) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const handleToggle = async () => {
    if (!settings.isEnabled) {
      if (typeof Notification === 'undefined') {
        alert('Thiết bị hoặc trình duyệt của bạn không hỗ trợ thông báo (Notification API).');
        return;
      }
      if (permissionStatus !== 'granted') {
        const result = await Notification.requestPermission();
        setPermissionStatus(result);
        if (result === 'granted') {
          onUpdate({ isEnabled: true });
        } else {
          alert('Bạn cần cấp quyền thông báo trên trình duyệt để sử dụng tính năng này.');
        }
      } else {
        onUpdate({ isEnabled: true });
      }
    } else {
      onUpdate({ isEnabled: false });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ time: e.target.value });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(201, 146, 58, 0.15)',
              border: '1px solid var(--border-gold-md)',
              display: 'grid', placeItems: 'center',
            }}>
              <Icon name="settings" size={26} style={{ color: 'var(--gold-mid)' }} />
            </div>
          </div>
          <h2 className="font-display" style={{
            fontSize: 22, fontWeight: 700,
            color: 'var(--gold-light)', textAlign: 'center',
            letterSpacing: '0.02em',
          }}>
            Cài Đặt
          </h2>
        </div>

        <div style={{ padding: '20px 16px', color: 'var(--text-primary)' }}>
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-gold)',
            borderRadius: '14px',
            padding: '18px 16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)' }}>
              <Icon name="bell-ring" size={18} style={{ color: 'var(--gold-mid)' }} />
              Nhắc nhở ngày giỗ & Số đỏ Icon
            </h3>
            
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              Tự động gửi thông báo nhắc giỗ trước 7 ngày, 3 ngày, 1 ngày và hiển thị số đếm màu đỏ trên icon ứng dụng ở màn hình chính.
            </p>

            {/* Bật / Tắt */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: settings.isEnabled ? '16px' : '0' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Bật thông báo</span>
              <button 
                type="button"
                onClick={handleToggle}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: settings.isEnabled ? 'var(--gold-mid)' : 'rgba(128,128,128,0.25)',
                  position: 'relative',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: settings.isEnabled ? '22px' : '2px',
                  transition: 'left 0.3s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                }} />
              </button>
            </div>

            {settings.isEnabled && (
              <>
                {/* Chọn giờ */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  borderTop: '1px solid var(--border-gold)', 
                  paddingTop: '14px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Giờ nhắc nhở</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thời gian kiểm tra nhắc nhở hàng ngày</span>
                  </div>
                  <input 
                    type="time" 
                    value={settings.time}
                    onChange={handleTimeChange}
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-gold)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Nút kiểm tra thử */}
                <div style={{ 
                  borderTop: '1px solid var(--border-gold)', 
                  paddingTop: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-mid)' }}>Thử nghiệm trên máy:</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="action-button"
                      onClick={async () => {
                        await sendTestNotificationWithBadge(1);
                      }}
                      style={{ fontSize: '12px', padding: '6px 12px', flex: 1, justifyContent: 'center' }}
                      title="Gửi thông báo và hiện số đỏ 1 trên icon app"
                    >
                      <Icon name="bell-ring" size={14} /> Thử số đỏ trên Icon
                    </button>

                    <button
                      type="button"
                      className="action-button"
                      onClick={async () => {
                        await clearAppBadge();
                      }}
                      style={{ fontSize: '12px', padding: '6px 12px', background: 'rgba(255,255,255,0.06)' }}
                      title="Xóa số đỏ trên icon"
                    >
                      <Icon name="x" size={14} /> Xóa số đỏ
                    </button>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, margin: '2px 0 0' }}>
                    💡 <em>Lưu ý: Để thấy số đỏ trên icon, hãy cài đặt app ra Màn hình chính (PWA/Home Screen).</em>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '10px 12px 14px' }}>
          <button
            className="action-button modal-close"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onClose}
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};
