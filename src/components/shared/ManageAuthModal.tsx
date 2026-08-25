import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { loginUser, AuthUser } from '@/services/cloudflareApi';

interface ManageAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

// WebAuthn Biometric Helpers
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const isBiometricSupported = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
  try {
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch {
    return false;
  }
  return false;
};

export const ManageAuthModal = ({ isOpen, onClose, onSuccess }: ManageAuthModalProps) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Biometric FaceID/TouchID state
  const [isBioAvailable, setIsBioAvailable] = useState(false);
  const [hasBioRegistered, setHasBioRegistered] = useState(false);
  const [bioSubmitting, setBioSubmitting] = useState(false);

  // Status & Feedback state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setSuccessMsg('');

      let isMounted = true;
      isBiometricSupported().then((supported) => {
        if (isMounted) {
          setIsBioAvailable(supported);
          const savedCredId = localStorage.getItem('manage_biometric_credential_id');
          setHasBioRegistered(!!savedCredId);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen]);

  const handleRegisterBiometric = async () => {
    setError('');
    setSuccessMsg('');
    setBioSubmitting(true);

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: { name: 'Gia Phả Phạm Tộc' },
          user: {
            id: userId,
            name: 'phamphuongdong@gmail.com',
            displayName: 'Quản trị viên Gia Phả',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (credential) {
        const credIdBase64 = bufferToBase64(credential.rawId);
        localStorage.setItem('manage_biometric_credential_id', credIdBase64);
        setHasBioRegistered(true);
        setSuccessMsg('Kích hoạt FaceID / TouchID thành công cho thiết bị này!');
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        setError('Không thể kích hoạt sinh trắc học: ' + (err.message || 'Thiết bị không hỗ trợ'));
      }
    } finally {
      setBioSubmitting(false);
    }
  };

  const handleLoginWithBiometric = async () => {
    setError('');
    setSuccessMsg('');
    setBioSubmitting(true);

    try {
      const savedCredId = localStorage.getItem('manage_biometric_credential_id');
      if (!savedCredId) {
        setError('Chưa đăng ký FaceID / TouchID trên thiết bị này.');
        return;
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const credentialIdBuffer = base64ToBuffer(savedCredId);

      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          allowCredentials: [
            {
              id: credentialIdBuffer,
              type: 'public-key',
            },
          ],
          userVerification: 'preferred',
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (assertion) {
        setSuccessMsg('Xác thực FaceID / TouchID thành công! Đang đăng nhập...');
        
        // Auto sign in as super admin
        const superAdminUser: AuthUser = {
          id: 'USR001',
          username: 'admin',
          full_name: 'Phạm Phương Đông (Trưởng Tộc)',
          role: 'super_admin',
          branch: 'Trực hệ',
          status: 'active'
        };

        setTimeout(() => {
          onSuccess(superAdminUser);
        }, 500);
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        setError('Xác thực FaceID / TouchID thất bại: ' + (err.message || 'Lỗi thiết bị'));
      }
    } finally {
      setBioSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await loginUser(username.trim(), password);
      if (res.success && res.user) {
        setSuccessMsg(`Chào mừng ${res.user.full_name} (${res.user.role === 'super_admin' ? 'Trưởng Tộc' : 'Trưởng Chi / Biên Tập'})!`);
        setTimeout(() => {
          onSuccess(res.user!);
        }, 600);
      } else {
        setError(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
    } catch {
      setError('Có lỗi xảy ra khi xác thực mật khẩu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 430, width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head" style={{ textAlign: 'center', paddingBottom: 10 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(201,146,58,0.2)',
            border: '1px solid var(--border-gold)',
            display: 'grid', placeItems: 'center',
            margin: '0 auto 12px',
            boxShadow: 'var(--shadow-gold-glow)'
          }}>
            <Icon name="lock" size={24} style={{ color: 'var(--gold-light)' }} />
          </div>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold-light)', margin: 0 }}>
            Đăng Nhập Quản Trị Gia Phả
          </h2>
          <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            Hệ thống phân quyền Trưởng Tộc & Trưởng Chi
          </p>
        </div>

        {error && (
          <div style={{
            margin: '0 20px 12px',
            padding: '10px 12px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Icon name="alert-triangle" size={15} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div style={{
            margin: '0 20px 12px',
            padding: '10px 12px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#4ade80',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Icon name="check-circle" size={15} style={{ flexShrink: 0 }} />
            <div>{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ padding: '0 20px 20px' }}>
          {/* Biometric Quick Login Option */}
          {isBioAvailable && hasBioRegistered && (
            <div style={{ marginBottom: 16 }}>
              <button
                type="button"
                disabled={bioSubmitting || submitting}
                onClick={handleLoginWithBiometric}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--r-md)',
                  background: 'linear-gradient(135deg, rgba(201,146,58,0.25), rgba(139,26,26,0.3))',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--gold-light)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: 'var(--shadow-gold-glow)',
                  transition: 'all 0.2s ease',
                }}
              >
                {bioSubmitting ? (
                  <Icon name="sparkles" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <Icon name="shield-check" size={18} style={{ color: 'var(--gold)' }} />
                    Đăng Nhập bằng FaceID / TouchID
                  </>
                )}
              </button>
              <div style={{ textAlign: 'center', margin: '12px 0 8px', fontSize: 11, color: 'var(--text-muted)' }}>
                ─── Hoặc nhập tài khoản ───
              </div>
            </div>
          )}

          {isBioAvailable && !hasBioRegistered && (
            <div style={{ marginBottom: 14, textAlign: 'center' }}>
              <button
                type="button"
                disabled={bioSubmitting}
                onClick={handleRegisterBiometric}
                style={{
                  background: 'rgba(201,146,58,0.12)',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--gold-mid)',
                  padding: '6px 12px',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon name="sparkles" size={13} />
                {bioSubmitting ? 'Đang kích hoạt...' : '🔑 Kích hoạt FaceID / TouchID cho máy này'}
              </button>
            </div>
          )}

          {/* Username Input */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 6 }}>
              Tên tài khoản
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập (VD: admin)..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-gold)',
                color: 'var(--text-primary)',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 6 }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                disabled={submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 14px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                minHeight: 42
              }}
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1.5,
                padding: '10px 14px',
                borderRadius: 'var(--r-sm)',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))',
                border: 'none',
                color: '#000',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                minHeight: 42
              }}
            >
              {submitting ? (
                <Icon name="sparkles" size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  <Icon name="shield-check" size={16} /> Đăng Nhập
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
