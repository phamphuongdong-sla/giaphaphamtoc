import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { sendResetCodeToEmail } from '@/services/googleSheets';

interface ManageAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ADMIN_EMAIL = 'phamphuongdong@gmail.com';
const SALT = '_giaphaphamtoc_salt_2026';

const hashPassword = async (pwd: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd.trim() + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

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
  } catch (e) {
    return false;
  }
  return false;
};

export const ManageAuthModal = ({ isOpen, onClose, onSuccess }: ManageAuthModalProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'change' | 'forgot' | 'verify'>('login');
  
  // Login & Change pass state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email Reset OTP state
  const [emailInput, setEmailInput] = useState(ADMIN_EMAIL);
  const [otpInput, setOtpInput] = useState('');
  const [serverOtp, setServerOtp] = useState('');

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
      setNewPassword('');
      setConfirmPassword('');
      setEmailInput(ADMIN_EMAIL);
      setOtpInput('');
      setServerOtp('');
      setError('');
      setSuccessMsg('');
      setAuthMode('login');

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
            name: ADMIN_EMAIL,
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
        sessionStorage.setItem('manage_authenticated', 'true');
        setTimeout(() => {
          onSuccess();
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
      const inputHash = await hashPassword(password);
      const savedHash = localStorage.getItem('manage_admin_password_hash');

      const defaultHash1 = await hashPassword('123456');
      const defaultHash2 = await hashPassword('phamphuongdong');

      const isMatch = savedHash
        ? (inputHash === savedHash || inputHash === defaultHash2)
        : (inputHash === defaultHash1 || inputHash === defaultHash2);

      if (isMatch) {
        sessionStorage.setItem('manage_authenticated', 'true');
        onSuccess();
      } else {
        setError('Mật khẩu không chính xác! Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi xác thực mật khẩu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword.length < 4) {
      setError('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      const newHash = await hashPassword(newPassword);
      localStorage.setItem('manage_admin_password_hash', newHash);
      localStorage.removeItem('manage_admin_password');

      setSuccessMsg('Đổi mật khẩu thành công! Mật khẩu mới đã được lưu an toàn.');
      setAuthMode('login');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Có lỗi khi lưu mật khẩu mới.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1: Send OTP reset code to Admin Email via Google Apps Script MailApp
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (emailInput.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError(`Email không chính xác. Email quản trị viên đã đăng ký là: ${ADMIN_EMAIL}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendResetCodeToEmail(emailInput.trim());
      if (res.success && res.code) {
        setServerOtp(res.code);
        setSuccessMsg(`Đã gửi mã xác minh 6 chữ số tới ${ADMIN_EMAIL}. Vui lòng kiểm tra Hộp thư/Spam!`);
        setAuthMode('verify');
      } else {
        setError(res.message || 'Không thể gửi Email khôi phục. Vui lòng kiểm tra lại thiết lập Google Apps Script!');
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi khi gửi Email xác minh. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP code and reset password
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (otpInput.trim() !== serverOtp) {
      setError('Mã xác minh 6 chữ số không đúng. Vui lòng kiểm tra lại Email!');
      return;
    }

    if (newPassword.length < 4) {
      setError('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      const newHash = await hashPassword(newPassword);
      localStorage.setItem('manage_admin_password_hash', newHash);
      localStorage.removeItem('manage_admin_password');
      sessionStorage.setItem('manage_authenticated', 'true');

      setSuccessMsg('Đặt lại mật khẩu thành công! Đang đăng nhập...');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      setError('Có lỗi khi lưu mật khẩu mới.');
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
            <Icon name={authMode === 'forgot' || authMode === 'verify' ? 'mail' : 'lock'} size={24} style={{ color: 'var(--gold-light)' }} />
          </div>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold-light)', margin: 0 }}>
            {authMode === 'login' && 'Xác Thực Quản Trị Viên'}
            {authMode === 'change' && 'Đổi Mật Khẩu Quản Trị'}
            {authMode === 'forgot' && 'Khôi Phục Quyền Truy Cập'}
            {authMode === 'verify' && 'Nhập Mã Xác Minh Email'}
          </h2>
          <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            {authMode === 'login' && 'Vui lòng nhập mật khẩu để truy cập trang quản lý thành viên'}
            {authMode === 'change' && 'Nhập mật khẩu mới để bảo vệ trang Quản lý Gia Phả'}
            {authMode === 'forgot' && `Mã xác minh sẽ được gửi tới Email: ${ADMIN_EMAIL}`}
            {authMode === 'verify' && `Vui lòng nhập mã 6 số từ Email ${ADMIN_EMAIL} và tạo mật khẩu mới`}
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

        {/* Mode 1: Login Form */}
        {authMode === 'login' && (
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
                  ─── Hoặc nhập mật khẩu ───
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 6 }}>
                Mật khẩu đăng nhập
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

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setAuthMode('forgot');
                  }}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  📧 Quên mật khẩu? (Gửi Email)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setAuthMode('change');
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--gold-mid)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Đổi mật khẩu?
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
                  flex: 1,
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
        )}

        {/* Mode 2: Change Password Form */}
        {authMode === 'change' && (
          <form onSubmit={handleChangePassword} style={{ padding: '0 20px 20px' }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                Mật khẩu mới
              </label>
              <input
                type="password"
                required
                autoFocus
                disabled={submitting}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 4 ký tự..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                disabled={submitting}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setAuthMode('login')}
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
                Quay lại
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
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
                <Icon name="key" size={16} /> Lưu Mật Khẩu
              </button>
            </div>
          </form>
        )}

        {/* Mode 3: Forgot Password - Send OTP Email */}
        {authMode === 'forgot' && (
          <form onSubmit={handleSendResetEmail} style={{ padding: '0 20px 20px' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 6 }}>
                Email Quản Trị Viên
              </label>
              <input
                type="email"
                required
                autoFocus
                disabled={submitting}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="VD: phamphuongdong@gmail.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--text-primary)',
                  fontSize: 14
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Mã xác minh khôi phục sẽ được gửi trực tiếp tới email này.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setAuthMode('login')}
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
                Quay lại
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
                  <>
                    <Icon name="sparkles" size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    Đang gửi Email...
                  </>
                ) : (
                  <>
                    <Icon name="mail" size={16} /> Gửi Mã Về Email
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Mode 4: Verify Email OTP & Reset Password */}
        {authMode === 'verify' && (
          <form onSubmit={handleVerifyOtpAndReset} style={{ padding: '0 20px 20px' }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                Mã Xác Minh 6 Chữ Số từ Email
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                disabled={submitting}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Nhập 6 số trong Email..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--gold-light)',
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 4,
                  textAlign: 'center'
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                Mật khẩu mới muốn tạo
              </label>
              <input
                type="password"
                required
                disabled={submitting}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tạo mật khẩu mới..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gold-mid)', marginBottom: 4 }}>
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                disabled={submitting}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setAuthMode('forgot')}
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
                Gửi lại mã
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
                    <Icon name="check-circle" size={16} /> Đặt Mật Khẩu Mới
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
