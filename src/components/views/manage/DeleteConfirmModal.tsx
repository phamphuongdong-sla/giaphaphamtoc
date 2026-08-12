import React from 'react';
import { SheetRow } from '@/services/googleSheets';
import { Icon } from '@/components/ui/Icon';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  member: SheetRow | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  member,
  deleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !member) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 440, width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head" style={{ textAlign: 'center', paddingBottom: 10 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Icon name="trash-2" size={24} style={{ color: '#f87171' }} />
          </div>
          <h2
            className="font-display"
            style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold-light)', margin: 0 }}
          >
            Xác Nhận Xóa Thành Viên
          </h2>
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            Bạn có chắc chắn muốn xóa thành viên{' '}
            <strong style={{ color: '#f87171' }}>{member.name}</strong> (ID: {member.id}) không?
          </p>
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--r-sm)',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              minHeight: 42,
            }}
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            style={{
              flex: 1.2,
              padding: '10px 14px',
              borderRadius: 'var(--r-sm)',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              minHeight: 42,
            }}
          >
            {deleting ? (
              <Icon name="sparkles" size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <Icon name="trash-2" size={16} /> Đồng Ý Xóa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
