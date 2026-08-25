import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Icon } from '@/components/ui/Icon';
import { exportPersonQRCard, generateMemberUrl, PersonQRCardData } from '@/utils/qrExport';
import { cleanName } from '@/utils/genealogyUtils';

interface PersonQRModalProps {
  data: PersonQRCardData;
  onClose: () => void;
}

export const PersonQRModal = ({ data, onClose }: PersonQRModalProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayName = cleanName(data.name);
  const memberUrl = generateMemberUrl(data.id || data.name);

  useEffect(() => {
    QRCode.toDataURL(memberUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#1a1005',
        light: '#ffffff'
      }
    }).then(url => {
      setQrDataUrl(url);
    });
  }, [memberUrl]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportPersonQRCard(data);
    } catch (err) {
      console.error('Download QR failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(memberUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        style={{
          maxWidth: 420,
          width: '92%',
          textAlign: 'center',
          padding: '24px 20px',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, #160e07 100%)',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-gold-glow)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(201,146,58,0.2)', color: 'var(--gold-light)',
              display: 'grid', placeItems: 'center'
            }}>
              <Icon name="qr-code" size={18} />
            </div>
            <h3 className="font-display" style={{ margin: 0, fontSize: 17, color: 'var(--gold-light)', textAlign: 'left' }}>
              Mã QR Gia Phả
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 4
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Member Title */}
        <div style={{ marginBottom: 14 }}>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            {displayName}
          </h2>
          <div style={{ fontSize: 12, color: 'var(--gold-mid)', fontWeight: 600 }}>
            Đời thứ {data.displayGen} · {data.branch || 'Chi trực hệ'}
          </div>
        </div>

        {/* QR Code Container */}
        <div style={{
          background: '#fff',
          padding: 12,
          borderRadius: 16,
          display: 'inline-block',
          margin: '0 auto 16px',
          border: '3px solid var(--border-gold)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR Code ${displayName}`} style={{ width: 220, height: 220, display: 'block' }} />
          ) : (
            <div style={{ width: 220, height: 220, display: 'grid', placeItems: 'center', color: '#000' }}>
              <Icon name="sparkles" size={24} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          📱 Quét mã bằng camera điện thoại để xem trực tiếp hồ sơ & phả hệ của <strong>{displayName}</strong>.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--r-sm)',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
              border: 'none',
              color: '#000',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-gold-glow)'
            }}
          >
            {downloading ? (
              <Icon name="sparkles" size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <Icon name="download" size={16} /> Tải Ảnh Thẻ QR (.PNG)
              </>
            )}
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCopyLink}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-glass)',
                color: copied ? '#4ade80' : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Icon name={copied ? 'check' : 'copy'} size={14} />
              {copied ? 'Đã chép link!' : 'Chép liên kết'}
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-muted)',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
