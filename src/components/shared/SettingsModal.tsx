import React, { useState } from 'react';
import { Icon } from '../ui/Icon';
import { NotificationSettings } from '../../hooks/useNotificationSettings';

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
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Icon name="bell-ring" size={18} style={{ color: 'var(--gold-mid)' }} />
              Thông báo ngày giỗ
            </h3>
            
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              Nhận thông báo trên thiết bị trước 7 ngày, 3 ngày, 1 ngày và đúng ngày giỗ.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Bật thông báo</span>
              <button 
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-gold)', paddingTop: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Giờ nhắc nhở</span>
                <input 
                  type="time" 
                  value={settings.time}
                  onChange={handleTimeChange}
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-gold)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    fontSize: '14px'
                  }}
                />
              </div>
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
