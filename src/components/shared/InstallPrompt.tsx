import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Kiểm tra đã cài chưa (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Kiểm tra đã từ chối trước đó chưa
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      // Hiện lại sau 7 ngày
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Phát hiện iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // iOS: hiện hướng dẫn thủ công sau 3 giây
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Desktop: bắt sự kiện beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  // iOS: hiện hướng dẫn
  if (isIOS) {
    return (
      <>
        <div className="install-banner" onClick={() => setShowIOSGuide(true)}>
          <div className="install-banner-icon">📱</div>
          <div className="install-banner-text">
            <strong>Cài Gia Phả lên điện thoại</strong>
            <span>Nhấn để xem hướng dẫn cài đặt</span>
          </div>
          <button className="install-banner-close" onClick={(e) => { e.stopPropagation(); handleDismiss(); }} aria-label="Đóng">
            ✕
          </button>
        </div>

        {showIOSGuide && (
          <div className="ios-guide-overlay" onClick={() => setShowIOSGuide(false)}>
            <div className="ios-guide-modal" onClick={e => e.stopPropagation()}>
              <h3>📱 Cài đặt trên iPhone / iPad</h3>
              <div className="ios-guide-steps">
                <div className="ios-step">
                  <span className="ios-step-num">1</span>
                  <span>Nhấn nút <strong>Chia sẻ</strong> <span className="ios-share-icon">⬆</span> ở thanh dưới Safari</span>
                </div>
                <div className="ios-step">
                  <span className="ios-step-num">2</span>
                  <span>Cuộn xuống và chọn <strong>"Thêm vào MH chính"</strong></span>
                </div>
                <div className="ios-step">
                  <span className="ios-step-num">3</span>
                  <span>Nhấn <strong>"Thêm"</strong> ở góc trên bên phải</span>
                </div>
              </div>
              <p className="ios-guide-note">Ứng dụng sẽ xuất hiện trên màn hình chính như app thật! 🎉</p>
              <button className="ios-guide-close-btn" onClick={() => setShowIOSGuide(false)}>Đã hiểu</button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Android / Desktop: nút cài đặt trực tiếp
  return (
    <div className="install-banner">
      <div className="install-banner-icon">📱</div>
      <div className="install-banner-text">
        <strong>Cài Gia Phả lên điện thoại</strong>
        <span>Xem offline, mở nhanh như app thật</span>
      </div>
      <button className="install-banner-btn" onClick={handleInstall}>
        Cài đặt
      </button>
      <button className="install-banner-close" onClick={handleDismiss} aria-label="Đóng">
        ✕
      </button>
    </div>
  );
};
